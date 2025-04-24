export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',

  SIGN_UP: {
    USER: '/signup/user',
    ADMIN: '/signup/admin',
  },

  USER: {
    ROOT: '/user',
    FAVORITES: '/user/favorites',
    REVIEWS: '/user/reviews',
    REVIEW_DETAIL: (id: string | number) => `/user/reviews/${id}`,
    WRITE_REVIEW: '/user/reviews/post',
    EDIT_REVIEW: (id: string | number) => `/user/reviews/${id}/edit`,
    THANKS: '/user/thanks',
  },

  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    REVIEWS: '/admin/reviews',
    THANKS: '/admin/thanks',
  },

  CHAT: {
    ROOT: '/chat',
    ROOM: (id: string | number) => `/chat/${id}`,
    NEW: '/chat/new',
  },
};
