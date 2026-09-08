import {migration001InitialSchema} from './001_initial_schema';
import type {Migration} from './types';

/**
 * Ordered migrations. Append new versions; never edit applied migrations in place.
 */
export const migrations: readonly Migration[] = [migration001InitialSchema];
