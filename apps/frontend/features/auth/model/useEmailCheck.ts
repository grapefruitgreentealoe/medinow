import { useMutation } from '@tanstack/react-query';

export function useEmailCheck() {
  return useMutation({
    mutationFn: mockCheckEmail,
  });
}
