"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Dumbbell,
  Home,
  Settings,
  ShieldCheck,
  Users,
  UserRound,
} from "lucide-react";
import { hasPermission } from "@/app/lib/permissions";

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const items = [
    { label: "Membresías", href: "/membresias", icon: CreditCard, permission: "memberships.view" },
    {
      label: "Inicio",
      href: "/dashboard",
      icon: Home,
      permission: "dashboard.view",
    },
    {
      label: "Usuarios",
      href: "/usuarios",
      icon: UserRound,
      permission: "users.view",
    },
    {
      label: "Roles y Permisos",
      href: "/roles",
      icon: ShieldCheck,
      permission: "roles.view",
    },
    {
      label: "Miembros",
      href: "/miembros",
      icon: Users,
      permission: "members.view",
    },
    {
      label: "Entrenamientos",
      href: "/entrenamientos",
      icon: Dumbbell,
      permission: "training.view",
    },
    {
      label: "Planes",
      href: "/planes",
      icon: CalendarDays,
      permission: "plans.view",
    },
    {
      label: "Pagos",
      href: "/pagos",
      icon: CreditCard,
      permission: "payments.view",
    },
    {
      label: "Reportes",
      href: "/reportes",
      icon: BarChart3,
      permission: "reports.view",
    },
    {
      label: "Configuración",
      href: "/configuracion",
      icon: Settings,
      permission: "settings.view",
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-shield">SH</div>

        <div>
          <strong>
            STRONG<span>HUB</span>
          </strong>

          <small>GYM</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items
          .filter((item) => hasPermission(role, item.permission))
          .map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${active ? "active" : ""}`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-status">
          <span />
          Sistema operativo
        </div>

        <p>
          StrongHub Gym
          <br />
          <small>Aplicación local</small>
        </p>
      </div>
    </aside>
  );
}
