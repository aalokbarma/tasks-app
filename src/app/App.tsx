import {StatusBar} from 'react-native';

import {RootNavigator} from '@navigation/RootNavigator';
import {useTheme} from '@theme/ThemeProvider';

import {AppProviders} from './AppProviders';

function AppChrome() {
  const {theme} = useTheme();

  return (
    <>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
      />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppChrome />
    </AppProviders>
  );
}
