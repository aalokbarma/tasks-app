export interface TypographyScale {
  title: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '600' | '700';
  };
  body: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '500';
  };
  caption: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400';
  };
}

export const typography: TypographyScale = {
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
};
