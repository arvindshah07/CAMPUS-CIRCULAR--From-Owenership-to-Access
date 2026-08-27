import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialUsers, initialResources, initialExchanges, initialRequests, initialDisputes } from '../data/mockDb';

// ─── Trust-adaptive deposit formula ──────────────────────────────────────────
export function computeDeposit(baseDeposit, trustScore) {
  // Trust 95-100 → 50% of base  |  Trust 80-94 → 70%  |  Trust 65-79 → 90%  |  <65 → 110%
  let factor;
  if (trustScore >= 95)      factor = 0.50;
  else if (trustScore >= 85) factor = 0.65;
  else if (trustScore >= 75) factor = 0.80;
  else if (trustScore >= 65) factor = 0.95;
  else                       factor = 1.10;
  const adjusted = Math.round((baseDeposit * factor) / 50) * 50; // round to nearest ₹50
  const saving = baseDeposit - adjusted;
  return { adjusted, saving, factor, label: trustScore >= 85 ? 'Trusted Discount' : trustScore >= 65 ? 'Standard' : 'New Member Rate' };
}

// ─── Live trust score formula ────────────────────────────────────────────
export function computeTrustScore(user, exchanges) {
  const userExchanges = exchanges.filter(
    e => (e.borrowerId === user.id || e.ownerId === user.id) && e.status === 'RATED'
  );
  const total = userExchanges.length;
  const late  = userExchanges.filter(e => e.isLate).length;
  const damaged = userExchanges.filter(e => e.isDamaged && e.borrowerId === user.id).length;
  const disputes = exchanges.filter(
    e => (e.borrowerId === user.id || e.ownerId === user.id) && e.disputeId
  ).length;

  const onTimePct  = total > 0 ? ((total - late) / total) * 100 : (user.onTimeReturns ?? 100);
  const expScore   = Math.min(total || user.successfulExchanges, 60) / 60 * 25;
  const ratingScore = ((user.rating ?? 4) / 5) * 20;
  const verifiedBonus = user.verified ? 10 : 0;
  const latePenalty   = (late || user.lateReturns || 0) * 2;
  const damagePenalty = damaged * 3;
  const disputePenalty = (disputes || user.activeDisputes || 0) * 5;

  const score = Math.round(
    (onTimePct * 0.35) + expScore + ratingScore + verifiedBonus
    - latePenalty - damagePenalty - disputePenalty
  );
  return Math.max(0, Math.min(100, score));
}

let mediaQueryListener = null;

function applyTheme(theme) {
  if (typeof window === 'undefined') return;
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const resolved = theme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : theme;
  document.documentElement.setAttribute('data-theme', resolved);

  if (mediaQueryListener) {
    mediaQuery.removeEventListener('change', mediaQueryListener);
    mediaQueryListener = null;
  }

  if (theme === 'system') {
    mediaQueryListener = (e) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', mediaQueryListener);
  }
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ─── Auth ───────────────────────────────────────────────────────
      currentUser: null,
      users: initialUsers,

      login: (userId) => {
        const user = get().users.find(u => u.id === userId);
        if (!user) return;
        const liveScore = computeTrustScore(user, get().exchanges);
        set({ currentUser: { ...user, trustScore: liveScore } });
      },

      logout: () => set({ currentUser: null }),

      // ─── Data ───────────────────────────────────────────────
      resources: initialResources,
      exchanges: initialExchanges,
      communityRequests: initialRequests,
      disputes: initialDisputes,

      // ─── Theme ──────────────────────────────────────────────
      theme: 'system',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      // ─── Borrow ─────────────────────────────────────────────
      requestBorrow: (resourceId, days) => {
        const resource = get().resources.find(r => r.id === resourceId);
        if (!resource) return null;
        const borrowingFee = resource.borrowingFee * days;
        const platformFee = Math.round(borrowingFee * 0.05);
        const now = new Date();
        const returnDate = new Date(now);
        returnDate.setDate(returnDate.getDate() + days);

        const newExchange = {
          id: `EXC-${Date.now()}`,
          resourceId,
          borrowerId: get().currentUser.id,
          ownerId: resource.ownerId,
          status: 'REQUESTED',
          days,
          borrowingFee,
          platformFee,
          securityDeposit: resource.securityDeposit,
          startDate: now.toISOString(),
          returnDate: returnDate.toISOString(),
          conditionBefore: null,
          conditionAfter: null,
          isDamaged: false,
          damageAmount: 0,
          damageReason: '',
          settlement: null,
          rating: null,
          disputeId: null,
          createdAt: now.toISOString(),
        };

        set(state => ({ exchanges: [...state.exchanges, newExchange] }));
        return newExchange.id;
      },

      // ─── Immutable patch ────────────────────────────────────
      updateExchange: (exchangeId, patch) => {
        set(state => ({
          exchanges: state.exchanges.map(exc =>
            exc.id === exchangeId ? { ...exc, ...patch } : exc
          ),
        }));
      },

      // ─── Convenience status-only update ─────────────────────
      updateExchangeStatus: (exchangeId, status) => {
        get().updateExchange(exchangeId, { status });
      },

      // ─── Rating ─────────────────────────────────────────────
      rateExchange: (exchangeId, rating) => {
        get().updateExchange(exchangeId, { rating, status: 'RATED' });
      },

      // ─── Community ──────────────────────────────────────────
      postCommunityRequest: (request) => {
        const newReq = {
          id: `REQ-${Date.now()}`,
          authorId: get().currentUser.id,
          createdAt: new Date().toISOString(),
          status: 'ACTIVE',
          views: 0,
          responses: 0,
          ...request,
        };
        set(state => ({ communityRequests: [newReq, ...state.communityRequests] }));
        return newReq.id;
      },

      // ─── Disputes ───────────────────────────────────────────
      postDispute: (exchangeId, issue) => {
        const newDispute = {
          id: `DSP-${Date.now()}`,
          exchangeId,
          reporterId: get().currentUser.id,
          issue,
          status: 'UNDER_REVIEW',
          createdAt: new Date().toISOString(),
        };
        set(state => ({
          disputes: [...state.disputes, newDispute],
        }));
        get().updateExchange(exchangeId, { disputeId: newDispute.id });
        return newDispute.id;
      },

      resolveDispute: (disputeId, resolution) => {
        set(state => ({
          disputes: state.disputes.map(d =>
            d.id === disputeId ? { ...d, status: 'RESOLVED', resolution } : d
          ),
        }));
      },

      // ─── Admin ──────────────────────────────────────────────
      approveResource: (resourceId) => {
        set(state => ({
          resources: state.resources.map(r =>
            r.id === resourceId ? { ...r, adminStatus: 'APPROVED' } : r
          ),
        }));
      },

      rejectResource: (resourceId) => {
        set(state => ({
          resources: state.resources.map(r =>
            r.id === resourceId ? { ...r, adminStatus: 'REJECTED' } : r
          ),
        }));
      },

      flagUser: (userId) => {
        set(state => ({
          users: state.users.map(u =>
            u.id === userId ? { ...u, status: 'FLAGGED' } : u
          ),
          currentUser: state.currentUser.id === userId ? { ...state.currentUser, status: 'FLAGGED' } : state.currentUser,
        }));
      },
    }),
    {
      name: 'campus-circular-state',
      partialize: (state) => ({
        currentUser: state.currentUser,
        exchanges: state.exchanges,
        communityRequests: state.communityRequests,
        disputes: state.disputes,
        resources: state.resources,
        users: state.users,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyTheme(state.theme);
      },
    }
  )
);
