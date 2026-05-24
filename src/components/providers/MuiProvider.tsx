'use client';

import { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { getMuiTheme } from '@/core/theme/muiTheme';
import { useAppSelector } from '@/core/store/hooks';

export default function MuiProvider({ children }: { children: React.ReactNode }) {
  const mode = useAppSelector((s) => s.theme.mode);
  const theme = useMemo(() => getMuiTheme(mode), [mode]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
