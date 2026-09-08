import {ScreenContainer} from '@components/layout/ScreenContainer';
import {ScreenPlaceholder} from '@components/ui/ScreenPlaceholder';
import {useAppRoute} from '@navigation/hooks';

/**
 * Placeholder — task details / edit UI ships in the tasks UI phase.
 * Route params are typed today so list → details navigation is ready.
 */
export function TaskDetailsScreen() {
  const route = useAppRoute<'TaskDetails'>();
  const {taskId} = route.params;

  return (
    <ScreenContainer>
      <ScreenPlaceholder
        title="Task details"
        description={`Edit/details UI for task ${taskId} will be implemented in a later phase.`}
      />
    </ScreenContainer>
  );
}
