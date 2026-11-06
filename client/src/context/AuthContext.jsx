import { useAuth } from './AuthProvider';

export function useAuthUser() {
  return useAuth().user;
}
