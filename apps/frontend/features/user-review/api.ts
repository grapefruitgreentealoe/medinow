import axiosInstance from '@/lib/axios';
import { CareUnit } from '@/shared/type';
import { PaginatedReviewResponse, SubmitReviewPayload } from './type';

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
    params: { page, limit: 1 },
  });
  return res.data;
}
