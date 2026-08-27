import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialUsers, initialResources, initialExchanges, initialRequests, initialDisputes } from '../data/mockDb';

function applyTheme(theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
  document.documentElement.setAttribute('data-theme', resolved);
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ─── Auth ───────────────────────────────────────────────
      currentUser: initialUsers[0],
      users: initialUsers,

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
        }));
      },
    }),
    {
      name: 'campus-circular-state',
      partialize: (state) => ({
        exchanges: state.exchanges,
        communityRequests: state.communityRequests,
        disputes: state.disputes,
        resources: state.resources,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyTheme(state.theme);
      },
    }
  )
);
