export interface Review {
  reviewId: string;
  content: string;
  thankMessage: string;
  rating: number;
  isPublic: boolean;
  careUnitId: string;
  departmentId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedReviewResponse {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface SubmitReviewPayload {
  content: string;
  thankMessage?: string;
  rating: number;
  isPublic: boolean;
  careUnitId: string;
  departmentId: string;
}

export interface ReviewData {
  reviewId: string;
  content: string;
  thankMessage: string;
  rating: number;
  isPublic: boolean;
  careUnitId: string;
  careUnitName: string;
  departmentId: string;
  departmentName: string;
  createdAt: string;
}
