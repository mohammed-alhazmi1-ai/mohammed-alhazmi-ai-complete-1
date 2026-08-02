export type PlanLimits = {
  chatLimit: number | null;
  codeLimit: number | null;
  monthlyCredits: number;
  allowImage: boolean;
  allowVideo: boolean;
  allowAudio: boolean;
};

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  Free: { chatLimit: 30, codeLimit: 15, monthlyCredits: 50, allowImage: true, allowVideo: false, allowAudio: true },
  Gift: { chatLimit: 50, codeLimit: 25, monthlyCredits: 100, allowImage: true, allowVideo: false, allowAudio: true },
  Pro: { chatLimit: null, codeLimit: null, monthlyCredits: 500, allowImage: true, allowVideo: true, allowAudio: true },
  Business: { chatLimit: null, codeLimit: null, monthlyCredits: 2000, allowImage: true, allowVideo: true, allowAudio: true },
  VIP: { chatLimit: null, codeLimit: null, monthlyCredits: 5000, allowImage: true, allowVideo: true, allowAudio: true },
};

export function isPaidPlan(planType: string) {
  const p = (planType || 'Free').toLowerCase();
  return ['pro', 'business', 'vip', 'paid'].includes(p);
}

export function getPlanLimits(planType: string): PlanLimits {
  const key = Object.keys(PLAN_LIMITS).find(
    (k) => k.toLowerCase() === (planType || 'Free').toLowerCase()
  );
  return PLAN_LIMITS[key || 'Free'];
}

export const MEDIA_COST: Record<string, number> = {
  chat: 0, code: 0, text: 0,
  images: 20, image: 20, video: 120, music: 30, audio: 30,
};

export function isMessageService(service: string) {
  return ['chat', 'code', 'text'].includes((service || '').toLowerCase());
}
