import fs from "node:fs";
import path from "node:path";

function readTopLevelAtoms(buffer) {
  const atoms = [];
  let offset = 0;
  while (offset + 8 <= buffer.length) {
    let size = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    let headerSize = 8;
    if (size === 1) {
      size = Number(buffer.readBigUInt64BE(offset + 8));
      headerSize = 16;
    } else if (size === 0) {
      size = buffer.length - offset;
    }
    if (!Number.isSafeInteger(size) || size < headerSize || offset + size > buffer.length) {
      throw new Error(`Invalid MP4 atom ${type} at byte ${offset}`);
    }
    atoms.push({ type, start: offset, end: offset + size, size });
    offset += size;
  }
  if (offset !== buffer.length) throw new Error(`Unparsed MP4 bytes after ${offset}`);
  return atoms;
}

function adjustChunkOffsets(moov, delta) {
  const adjusted = Buffer.from(moov);
  for (let typeOffset = 4; typeOffset + 12 <= adjusted.length; typeOffset += 1) {
    const type = adjusted.toString("ascii", typeOffset, typeOffset + 4);
    if (type !== "stco" && type !== "co64") continue;
    const atomStart = typeOffset - 4;
    const atomSize = adjusted.readUInt32BE(atomStart);
    const entryCount = adjusted.readUInt32BE(typeOffset + 8);
    const entryWidth = type === "stco" ? 4 : 8;
    const entriesStart = typeOffset + 12;
    const entriesEnd = entriesStart + entryCount * entryWidth;
    if (atomSize < 16 || entriesEnd > atomStart + atomSize || entriesEnd > adjusted.length) continue;
    for (let index = 0; index < entryCount; index += 1) {
      const entryOffset = entriesStart + index * entryWidth;
      if (entryWidth === 4) {
        adjusted.writeUInt32BE(adjusted.readUInt32BE(entryOffset) + delta, entryOffset);
      } else {
        adjusted.writeBigUInt64BE(adjusted.readBigUInt64BE(entryOffset) + BigInt(delta), entryOffset);
      }
    }
    typeOffset = entriesEnd - 1;
  }
  return adjusted;
}

for (const input of process.argv.slice(2)) {
  const filePath = path.resolve(input);
  const source = fs.readFileSync(filePath);
  const atoms = readTopLevelAtoms(source);
  const moov = atoms.find((atom) => atom.type === "moov");
  const mdat = atoms.find((atom) => atom.type === "mdat");
  if (!moov || !mdat) throw new Error(`${input} is missing a moov or mdat atom`);
  if (moov.start < mdat.start) {
    process.stdout.write(`${input}: already optimized\n`);
    continue;
  }
  const relocatedMoov = adjustChunkOffsets(source.subarray(moov.start, moov.end), moov.size);
  const output = [];
  for (const atom of atoms) {
    if (atom === moov) continue;
    if (atom === mdat) output.push(relocatedMoov);
    output.push(source.subarray(atom.start, atom.end));
  }
  fs.writeFileSync(filePath, Buffer.concat(output));
  process.stdout.write(`${input}: moved moov before mdat (${moov.size} bytes)\n`);
}
