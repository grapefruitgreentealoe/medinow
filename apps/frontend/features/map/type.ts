import { CareUnit } from '@/shared/type';
import { useInfiniteQuery } from '@tanstack/react-query';

export interface UseCareUnitsQueryResult {
  data: CareUnit[];
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isFetching: boolean;
  isLoading: boolean;
  raw: ReturnType<typeof useInfiniteQuery>;
}
