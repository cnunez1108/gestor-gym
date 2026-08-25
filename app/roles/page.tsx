"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Shield } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getPermissions, rolePermissions } from "../lib/permissions";

interface User {
  name: string;
  email: string;
  role: string;
}

const roles = [
  {
    id: "admin",
    name: "Administrador",
    description: "Acceso completo al sistema",
  },
  {
    id: "trainer",
    name: "Entrenador",
    description: "Gestiona entrenamientos y miembros",
  },
  {
    id: "receptionist",
    name: "Recepcionista",
    description: "Gestiona miembros y pagos",
  },
];

export default function RolesPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [selectedRole, setSelectedRole] = useState("admin");

  useEffect(() => {
    const storedUser = localStorage.getItem("stronghub_user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(storedUser);

    if (parsed.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(parsed);
  }, [router]);

  if (!user) {
    return null;
  }

  const selected = roles.find((role) => role.id === selectedRole)!;

  const permissions = getPermissions(selectedRole);

  const permissionGroups = [
    {
      title: "Dashboard",
      items: ["dashboard.view"],
    },
    {
      title: "Usuarios",
      items: ["users.view", "users.create", "users.edit", "users.delete"],
    },
    {
      title: "Miembros",
      items: [
        "members.view",
        "members.create",
        "members.edit",
        "members.delete",
      ],
    },
    {
      title: "Entrenamientos",
      items: [
        "training.view",
        "training.create",
        "training.edit",
        "training.delete",
      ],
    },
    {
      title: "Pagos",
      items: ["payments.view", "payments.create"],
    },
    {
      title: "Reportes",
      items: ["reports.view", "reports.export"],
    },
    {
      title: "Configuración",
      items: ["settings.view"],
    },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="dashboard-header">
        <div>
          <h1>Roles y Permisos</h1>
          <p>Controla el acceso de los usuarios al sistema.</p>
        </div>

        <button className="primary-button">+ Nuevo rol</button>
      </div>

      <div className="roles-layout">
        <div className="dashboard-card roles-list-card">
          <div className="card-header">
            <div>
              <h2>Roles</h2>
              <span>Selecciona un rol para editar</span>
            </div>
          </div>

          <div className="role-list">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`role-item ${
                  selectedRole === role.id ? "selected" : ""
                }`}
              >
                <div className="role-icon">
                  <Shield size={19} />
                </div>

                <div>
                  <strong>{role.name}</strong>
                  <span>{role.description}</span>
                </div>

                <div className="role-count">
                  {rolePermissions[role.id]?.length ?? 0}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-card permissions-card">
          <div className="permissions-header">
            <div>
              <h2>{selected.name}</h2>
              <p>{selected.description}</p>
            </div>

            <button className="save-button">Guardar cambios</button>
          </div>

          <div className="permission-summary">
            <Shield size={18} />

            <span>{permissions.length} permisos asignados</span>
          </div>

          <div className="permission-groups">
            {permissionGroups.map((group) => (
              <div className="permission-group" key={group.title}>
                <div className="permission-group-title">
                  <strong>{group.title}</strong>

                  <ChevronDown size={16} />
                </div>

                <div className="permission-items">
                  {group.items.map((permission) => {
                    const enabled = permissions.includes(permission);

                    return (
                      <label key={permission} className="permission-item">
                        <input type="checkbox" checked={enabled} readOnly />

                        <span className="custom-checkbox">
                          {enabled && <Check size={13} />}
                        </span>

                        <span>{formatPermission(permission)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function formatPermission(permission: string) {
  const [, action] = permission.split(".");

  const labels: Record<string, string> = {
    view: "Ver",
    create: "Crear",
    edit: "Editar",
    delete: "Eliminar",
    export: "Exportar",
  };

  return labels[action] ?? action;
}
