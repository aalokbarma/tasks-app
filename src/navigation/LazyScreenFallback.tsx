import {LoadingState} from '@components/ui/LoadingState';
import {useTheme} from '@theme/ThemeProvider';
import {View} from 'react-native';

export function LazyScreenFallback() {
  const {theme} = useTheme();

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <LoadingState label="Loading…" />
    </View>
  );
}
