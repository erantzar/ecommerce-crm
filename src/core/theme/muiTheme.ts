import { createTheme, type Theme } from '@mui/material/styles';
import '@mui/x-data-grid/themeAugmentation';

export function getMuiTheme(mode: 'light' | 'dark'): Theme {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#3b82f6' : '#2563eb' },
      secondary: { main: '#7c3aed' },
      background: {
        default: isDark ? '#0a0a0a' : '#f8fafc',
        paper: isDark ? '#171717' : '#ffffff',
      },
      error: { main: isDark ? '#ef4444' : '#dc2626' },
      success: { main: isDark ? '#22c55e' : '#16a34a' },
      warning: { main: isDark ? '#f59e0b' : '#d97706' },
      info: { main: isDark ? '#0ea5e9' : '#0284c7' },
      text: {
        primary: isDark ? '#fafafa' : '#0a0a0a',
        secondary: isDark ? '#a3a3a3' : '#525252',
      },
      divider: isDark ? '#262626' : '#e5e7eb',
    },
    typography: {
      fontFamily: 'inherit',
    },
    components: {
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: isDark ? '#171717' : '#f8fafc',
              fontWeight: 600,
            },
            '& .MuiDataGrid-cell': {
              borderColor: isDark ? '#262626' : '#e5e7eb',
            },
            '& .MuiDataGrid-footerContainer': {
              borderColor: isDark ? '#262626' : '#e5e7eb',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
    },
  });
}
