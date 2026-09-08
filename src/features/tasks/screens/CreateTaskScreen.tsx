import {ScreenContainer} from '@components/layout/ScreenContainer';
import {ScreenPlaceholder} from '@components/ui/ScreenPlaceholder';

/**
 * Placeholder — full create-task form ships in the tasks UI phase.
 */
export function CreateTaskScreen() {
  return (
    <ScreenContainer>
      <ScreenPlaceholder
        title="New task"
        description="Create task UI will be implemented in a later phase."
      />
    </ScreenContainer>
  );
}
