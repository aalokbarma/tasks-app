import {
  Component,
  type ErrorInfo,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {reportError} from '@utils/errors';

type Props = PropsWithChildren<{
  fallbackTitle?: string;
  fallbackMessage?: string;
}>;

type State = {
  hasError: boolean;
};

/**
 * Catches unexpected render errors so the app can recover without a white screen.
 * Uses plain RN primitives (no theme) so recovery UI still works if theming fails.
 */
export class AppErrorBoundary extends Component<Props, State> {
  override state: State = {hasError: false};

  static getDerivedStateFromError(): State {
    return {hasError: true};
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError('app/error-boundary', error, {
      componentStack: info.componentStack?.slice(0, 500),
    });
  }

  private handleRetry = (): void => {
    this.setState({hasError: false});
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container} accessibilityRole="alert">
          <Text style={styles.title}>
            {this.props.fallbackTitle ?? 'Something went wrong'}
          </Text>
          <Text style={styles.message}>
            {this.props.fallbackMessage ??
              'The app hit an unexpected problem. You can try again — your local tasks are still on this device.'}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={this.handleRetry}
            style={styles.button}>
            <Text style={styles.buttonLabel}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
    backgroundColor: '#F7F7F8',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    color: '#4B5563',
    marginBottom: 8,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
