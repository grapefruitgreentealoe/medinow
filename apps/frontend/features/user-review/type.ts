export interface PaginatedReviewResponse {
  reviews: ReviewData[];
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
  departmentId?: string | null;
}

export interface ReviewData {
  reviewId: string;
  content: string;
  thankMessage: string;
  rating: number;
  isPublic: boolean;
  careUnitId: string;
  careUnitName: string;
  departmentName: string;
  departmentId: string;
  createdAt: string;
  nickname: string;
}

export interface UpdateReviewInput {
  content: string;
  thankMessage?: string;
  departmentId: string;
  rating: number;
  isPublic: boolean;
}
