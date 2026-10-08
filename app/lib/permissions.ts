const common=['dashboard.view','members.view','memberships.view','payments.view','plans.view'];
export const rolePermissions:Record<string,string[]>={admin:[...common,'users.view','roles.view'],receptionist:common};
export const hasPermission=(role:string,permission:string)=>rolePermissions[role]?.includes(permission)??false;
export const getPermissions=(role:string)=>rolePermissions[role]??[];
