export const rolePermissions: Record<string, string[]> = {
  admin: [
    "dashboard.view",

    "users.view",
    "users.create",
    "users.edit",
    "users.delete",

    "roles.view",
    "roles.create",
    "roles.edit",
    "roles.delete",

    "members.view",
    "members.create",
    "members.edit",
    "members.delete",

    "training.view",
    "training.create",
    "training.edit",
    "training.delete",

    "plans.view",
    "plans.create",
    "plans.edit",

    "payments.view",
    "payments.create",

    "reports.view",
    "reports.export",

    "settings.view",
  ],

  trainer: [
    "dashboard.view",

    "members.view",
    "members.edit",

    "training.view",
    "training.create",
    "training.edit",

    "plans.view",
  ],

  receptionist: [
    "dashboard.view",

    "members.view",
    "members.create",
    "members.edit",

    "payments.view",
    "payments.create",

    "plans.view",
  ],
};

export function hasPermission(role: string, permission: string) {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function getPermissions(role: string) {
  return rolePermissions[role] ?? [];
}
