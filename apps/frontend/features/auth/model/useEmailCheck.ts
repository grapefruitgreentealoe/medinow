// features/auth/model/useEmailCheck.ts
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export function useEmailCheck() {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await axios.post('/api/auth/check-email', { email });
      return res.data.exists; // true/false 반환
    },
  });
}
