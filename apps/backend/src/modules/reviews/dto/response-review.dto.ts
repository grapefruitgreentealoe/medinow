export class ResponseReviewDto {
  message: string;
  reviewId: string;
  content: string;
  thankMessage: string;
  rating: number;
  isPublic: boolean;
  careUnitId: string;
  departmentId: string | null;
}
