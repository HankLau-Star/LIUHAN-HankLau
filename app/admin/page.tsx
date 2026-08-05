import { requireChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";
import { hasConfiguredAdmin, isAdminEmail } from "../../lib/admin-auth";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const configured = hasConfiguredAdmin();
  const authorized = configured && isAdminEmail(user.email);

  if (!authorized) {
    return (
      <main className="admin-denied">
        <div className="admin-denied-card">
          <span>LIUHAN / ACCESS CONTROL</span>
          <h1>{configured ? "此账号没有管理权限。" : "管理账号尚未配置。"}</h1>
          <p>{configured ? `当前登录账号：${user.email}` : "部署前需要为站点设置 ADMIN_EMAILS，只有指定账号可以保存网站内容。"}</p>
          <div><a href="/">返回网站</a><a href={chatGPTSignOutPath("/admin")}>切换账号</a></div>
        </div>
      </main>
    );
  }

  return <AdminDashboard displayName={user.displayName} email={user.email} signOutPath={chatGPTSignOutPath("/")} />;
}
