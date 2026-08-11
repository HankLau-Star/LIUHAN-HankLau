import Link from "next/link";
import { adminSignInPath, adminSignOutPath, getAdminUser, hasConfiguredAdmin, isAdminEmail, isCloudflareAccessMode, isGitHubOAuthMode } from "../../lib/admin-auth";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams?: Promise<{ auth?: string | string[] }> }) {
  const user = await getAdminUser();
  const params = searchParams ? await searchParams : undefined;
  const authState = Array.isArray(params?.auth) ? params?.auth[0] : params?.auth;
  const configured = hasConfiguredAdmin();
  const authorized = Boolean(user && configured && isAdminEmail(user.email));

  if (!authorized) {
    const cloudflareMode = isCloudflareAccessMode();
    const githubMode = isGitHubOAuthMode();
    const title = !configured
      ? "管理账号尚未配置。"
      : !user && githubMode
        ? "登录个人后台"
      : !user && cloudflareMode
        ? "Cloudflare Access 尚未完成验证。"
        : "此账号没有管理权限。";
    const detail = !configured
      ? "部署前需要设置 ADMIN_EMAILS，只有指定账号可以保存网站内容。"
      : user
        ? `当前登录账号：${user.email}`
        : githubMode && authState === "denied"
          ? "当前 GitHub 账号不是授权账号。请切换到 HankLau-Star 后重新验证。"
          : githubMode && authState === "invalid"
            ? "本次登录验证已过期、被取消或未能通过安全校验，请重新登录。"
            : githubMode && authState === "unavailable"
              ? "安全会话暂时无法建立，请重新登录；如果仍然失败，请检查浏览器是否允许必要 Cookie。"
              : githubMode
                ? "请使用 GitHub 账号 HankLau-Star 完成官方身份验证。电脑和手机浏览器均支持，密码只会提交给 GitHub。"
        : "请确认 /admin 与 /api/admin/* 已由 Cloudflare Access 保护，并使用允许的邮箱登录。";

    return (
      <main className="admin-denied">
        <div className="admin-denied-card">
          <span>LIUHAN / ACCESS CONTROL</span>
          <h1>{title}</h1>
          <p>{detail}</p>
          {githubMode && !user && configured ? <div className="admin-login-identity"><small>AUTHORIZED GITHUB ACCOUNT</small><strong>HankLau-Star</strong><em>veritasrensheng@gmail.com</em></div> : null}
          <div>
            <Link href="/">返回网站</Link>
            {user ? <a href={adminSignOutPath(user, "/admin")}>切换账号</a> : githubMode && configured ? <a className="is-primary" href={adminSignInPath("/admin")}>使用 GitHub 安全登录</a> : null}
          </div>
        </div>
      </main>
    );
  }

  return <AdminDashboard displayName={user!.displayName} email={user!.email} signOutPath={adminSignOutPath(user!, "/")} />;
}
