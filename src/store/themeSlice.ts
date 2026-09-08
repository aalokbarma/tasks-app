import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

import type {ThemeMode} from '@app-types/common';

export interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: 'system',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
    resetThemeState() {
      return initialState;
    },
  },
});

export const {setThemeMode, resetThemeState} = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
