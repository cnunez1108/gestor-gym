"use client";

import { useRouter } from "next/navigation";
import { useState } from 'react';
import { Bell, ChevronDown, UserCircle } from "lucide-react";
import { api } from "@/lib/api";
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
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    try {
      await api('auth/logout','POST',{});
      router.push('/login');
      router.refresh();
    } catch (error) { setLogoutError((error as Error).message); }
  };

  const roleName =
    {
      admin: "Administrador",
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

        <div className="page-content">{logoutError && <p role="alert">{logoutError}</p>}{children}</div>
      </main>
    </div>
  );
}
