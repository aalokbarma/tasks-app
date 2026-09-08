import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {selectAuthStatus} from '@store/selectors';
import {useAppSelector} from '@store/hooks';
import {useTheme} from '@theme/ThemeProvider';

import {AppStack} from './AppStack';
import {AuthStack} from './AuthStack';
import type {RootStackParamList} from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

function BootstrapScreen() {
  const {theme} = useTheme();

  return (
    <View
      accessibilityLabel="Restoring your session"
      accessibilityRole="progressbar"
      style={[
        styles.bootstrap,
        {backgroundColor: theme.colors.background},
      ]}>
      <Text
        style={[
          styles.brand,
          theme.typography.caption,
          {color: theme.colors.primary},
        ]}>
        TasksApp
      </Text>
      <ActivityIndicator
        color={theme.colors.primary}
        accessibilityLabel="Loading"
      />
      <Text
        style={[
          styles.caption,
          theme.typography.caption,
          {color: theme.colors.textSecondary},
        ]}>
        Restoring your session…
      </Text>
    </View>
  );
}

export function RootNavigator() {
  const authStatus = useAppSelector(selectAuthStatus);
  const {theme} = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: theme.mode === 'dark',
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.textPrimary,
          border: theme.colors.border,
          notification: theme.colors.warning,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '800',
          },
        },
      }}>
      <RootStack.Navigator screenOptions={{headerShown: false}}>
        {authStatus === 'unknown' ? (
          <RootStack.Screen name="Bootstrap" component={BootstrapScreen} />
        ) : authStatus === 'authenticated' ? (
          <RootStack.Screen name="App" component={AppStack} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  bootstrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  brand: {
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  caption: {
    textAlign: 'center',
  },
});
