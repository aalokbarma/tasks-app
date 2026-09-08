export interface ColorPalette {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryContrast: string;
  danger: string;
  success: string;
  warning: string;
}

export const lightColors: ColorPalette = {
  background: '#F7F4EF',
  surface: '#FFFFFF',
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  border: '#E7E5E4',
  primary: '#0F766E',
  primaryContrast: '#FFFFFF',
  danger: '#B91C1C',
  success: '#15803D',
  warning: '#C2410C',
};

export const darkColors: ColorPalette = {
  background: '#0C0A09',
  surface: '#1C1917',
  textPrimary: '#FAFAF9',
  textSecondary: '#A8A29E',
  border: '#292524',
  primary: '#2DD4BF',
  primaryContrast: '#042F2E',
  danger: '#F87171',
  success: '#4ADE80',
  warning: '#FB923C',
};
