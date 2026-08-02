export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function canAccessOwnerPanel(role?: string) {
  return role === ROLES.OWNER || role === ROLES.ADMIN;
}

export function canUseFeature(plan: string, feature: 'image' | 'video' | 'audio' | 'chat') {
  const map: Record<string, string[]> = {
    Free: ['chat', 'image'],
    Gift: ['chat', 'image', 'audio'],
    Pro: ['chat', 'image', 'audio', 'video'],
    Business: ['chat', 'image', 'audio', 'video'],
    VIP: ['chat', 'image', 'audio', 'video'],
  };
  return (map[plan] || map.Free).includes(feature);
}
