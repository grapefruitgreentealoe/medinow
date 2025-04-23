// lib/react-query.ts
import { QueryClient } from '@tanstack/react-query';

export function getQueryClient() {
  return new QueryClient();
}
