import { adminSignOutPath, hasConfiguredAdmin, isAdminEmail, isCloudflareAccessMode, requireAdminUser } from "../../lib/admin-auth";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdminUser("/admin");
  const configured = hasConfiguredAdmin();
  const authorized = Boolean(user && configured && isAdminEmail(user.email));

  if (!authorized) {
    const cloudflareMode = isCloudflareAccessMode();
    const title = !configured
      ? "管理账号尚未配置。"
      : !user && cloudflareMode
        ? "Cloudflare Access 尚未完成验证。"
        : "此账号没有管理权限。";
    const detail = !configured
      ? "部署前需要设置 ADMIN_EMAILS，只有指定账号可以保存网站内容。"
      : user
        ? `当前登录账号：${user.email}`
        : "请确认 /admin 与 /api/admin/* 已由 Cloudflare Access 保护，并使用允许的邮箱登录。";

    return (
      <main className="admin-denied">
        <div className="admin-denied-card">
          <span>LIUHAN / ACCESS CONTROL</span>
          <h1>{title}</h1>
          <p>{detail}</p>
          <div><a href="/">返回网站</a>{user ? <a href={adminSignOutPath(user, "/admin")}>切换账号</a> : null}</div>
        </div>
      </main>
    );
  }

  return <AdminDashboard displayName={user!.displayName} email={user!.email} signOutPath={adminSignOutPath(user!, "/")} />;
}
