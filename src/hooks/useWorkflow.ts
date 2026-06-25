import { useWorkflow as useWorkflowFromContext } from '../context/WorkflowContext';

/**
 * Custom hook to access the central financial tracking system state and actions
 */
export function useWorkflow() {
  return useWorkflowFromContext();
}
