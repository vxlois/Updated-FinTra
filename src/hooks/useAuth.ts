import { useAuth as useAuthFromContext } from '../context/WorkflowContext';

/**
 * Custom hook to access auth-specific functions and state
 */
export function useAuth() {
  return useAuthFromContext();
}
