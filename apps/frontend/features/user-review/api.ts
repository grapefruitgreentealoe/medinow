import axiosInstance from '@/lib/axios';
import { CareUnit } from '@/shared/type';
import {
  PaginatedReviewResponse,
  Review,
  ReviewData,
  SubmitReviewPayload,
  UpdateReviewInput,
} from './type';

export const getCareUnitById = async (id: string): Promise<CareUnit> => {
  const res = await axiosInstance.get(`/care-units/${id}`);
  return res.data;
};

export async function submitReview(payload: SubmitReviewPayload) {
  return axiosInstance.post('/reviews', payload);
}

export async function getReviewsByCareUnit(
  careUnitId: string,
  page = 1
): Promise<PaginatedReviewResponse> {
  const res = await axiosInstance.get(`/care-units/reviews/${careUnitId}`, {
    params: { page, limit: 10 },
  });
  return res.data;
}

export const getReviews = async ({
  pageParam,
  limit,
}: {
  pageParam: number;
  limit: number;
}): Promise<PaginatedReviewResponse> => {
  const res = await axiosInstance.get('/reviews', {
    params: { page: pageParam, limit },
  });

  return res.data;
};

export async function getReviewById(id: string): Promise<Review> {
  const res = await axiosInstance.get(`/reviews/${id}`);
  return res.data;
}

export async function updateReview(id: string, data: UpdateReviewInput) {
  await axiosInstance.patch(`/reviews/${id}`, data);
}
export async function deleteReview(id: string) {
  await axiosInstance.delete(`/reviews/${id}`);
}
