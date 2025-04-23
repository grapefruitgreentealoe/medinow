// routes.ts

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGN_UP: '/signup',
  ADMIN_SIGN_UP: '/signup/admin',
  USER: {
    FAVORITES: '/user/favorites',
    ROOT: '/user',
    REVIEWS: '/user/reviews',
    THANKS: '/user/thanks',
    WRITE_REVIEW: (id: string | number) => `/review/${id}`,
  },

  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    REVIEWS: '/admin/reviews',
    THANKS: '/admin/thanks',
  },
};
