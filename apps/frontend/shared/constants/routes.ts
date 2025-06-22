export const ROUTES = {
  HOME: '/',
  MAP: '/map',
  LOGIN: '/login',

  SIGN_UP: {
    USER: '/signup',
    ADMIN: '/signup/admin',
  },

  USER: {
    ROOT: '/user',
    FAVORITES: '/user/favorites',
    REVIEWS: '/user/reviews',
    REVIEW_DETAIL: (id: string | number) => `/user/reviews/${id}`,
    WRITE_REVIEW: '/user/reviews/post',
    EDIT_REVIEW: (id: string | number) => `/user/reviews/edit/${id}`,
    CHAT_LIST: `/user/chat`,
    CHAT: (id?: string) => `/user/chat${id ? '?careUnitId=' + id : ''}`,
  },

  ADMIN: {
    DASHBOARD: '/admin',
    REVIEWS: '/admin/reviews',
    CHAT: '/admin/chat',
  },

  CHAT: {
    ROOT: '/chat',
    ROOM: (id: string | number) => `/chat/${id}`,
    NEW: '/chat/new',
  },
};
