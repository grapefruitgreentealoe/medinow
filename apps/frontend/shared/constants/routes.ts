// routes.ts

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGN_UP: '/signup',
  ADMIN_SIGN_UP: '/admin/signup',
  USER: {
    ROOT: '/',
    MYPAGE: '/my',
    FAVORITES: '/my/favorites',
    PROFILE: '/my/profile',
    REVIEWS: '/my/reviews',
    THANKS: '/my/thanks',
    WRITE_REVIEW: (id: string | number) => `/review/${id}`,
  },

  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    REVIEWS: '/admin/reviews',
    THANKS: '/admin/thanks',
  },
};
