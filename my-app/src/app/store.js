import { create } from 'zustand';
import { initialUsers, initialResources, initialExchanges, initialRequests } from '../data/mockDb';

export const useAppStore = create((set, get) => ({
  currentUser: initialUsers[0],
  users: initialUsers,
  resources: initialResources,
  exchanges: initialExchanges,
  communityRequests: initialRequests,

  // Actions
  requestBorrow: (resourceId, days) => {
    const resource = get().resources.find(r => r.id === resourceId);
    if (!resource) return;

    const newExchange = {
      id: `EXC-${Date.now()}`,
      resourceId,
      borrowerId: get().currentUser.id,
      ownerId: resource.ownerId,
      status: 'REQUESTED',
      borrowingFee: resource.borrowingFee * days,
      platformFee: Math.round(resource.borrowingFee * days * 0.05),
      securityDeposit: resource.securityDeposit,
      days,
      createdAt: new Date().toISOString()
    };

    set(state => ({
      exchanges: [...state.exchanges, newExchange]
    }));
    
    return newExchange.id;
  },
  
  updateExchangeStatus: (exchangeId, status) => {
    set(state => ({
      exchanges: state.exchanges.map(exc => 
        exc.id === exchangeId ? { ...exc, status } : exc
      )
    }));
  },

  postCommunityRequest: (request) => {
    const newReq = {
      id: `REQ-${Date.now()}`,
      authorId: get().currentUser.id,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      ...request
    };
    set(state => ({
      communityRequests: [newReq, ...state.communityRequests]
    }));
  }
}));
