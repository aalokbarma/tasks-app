import {v4 as uuidv4} from 'uuid';

import type {UniqueId} from '@app-types/common';

export function createId(): UniqueId {
  return uuidv4();
}
