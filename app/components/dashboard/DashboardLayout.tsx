"use client";

import { useRouter } from "next/navigation";
import { Bell, ChevronDown, UserCircle } from "lucide-react";
import Sidebar from "../sidebar/sidebar";

interface User {
  name: string;
  email: string;
  role: string;
}

export default function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("stronghub_user");
    router.push("/login");
  };

  const roleName =
    {
      admin: "Administrador",
      trainer: "Entrenador",
      receptionist: "Recepcionista",
    }[user.role] ?? user.role;

  return (
    <div className="app-layout">
      <Sidebar role={user.role} />

      <main className="main-content">
        <header className="topbar">
          <div />

          <div className="topbar-actions">
            <button className="notification-button">
              <Bell size={18} />
              <span />
            </button>

            <button className="user-menu">
              <UserCircle size={32} />

              <div>
                <strong>{user.name}</strong>
                <small>{roleName}</small>
              </div>

              <ChevronDown size={15} />
            </button>

            <button className="logout-top" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
