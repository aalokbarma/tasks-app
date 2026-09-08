/**
 * Dependency composition root for feature services.
 * Concrete adapters are registered here in later implementation phases.
 */

export interface AppDependencies {
  // Populated when infrastructure adapters are implemented.
  readonly ready: boolean;
}

export const appDependencies: AppDependencies = {
  ready: false,
};
