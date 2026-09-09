/**
 * User-facing copy for task completion toggles.
 */
export function completionToastMessage(completed: boolean): string {
  return completed ? 'Task marked complete' : 'Task marked incomplete';
}
