import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#176B87',
      light: '#64CCC5',
      dark: '#124E66',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#E89B65',
      light: '#F4C19D',
      dark: '#B9673E',
      contrastText: '#172B35',
    },
    background: {
      default: '#F4F8F9',
      paper: '#ffffff',
    },
    text: {
      primary: '#172B35',
      secondary: '#60747D',
    },
    divider: '#DDE8EB',
    success: {
      main: '#2E8B70',
    },
    error: {
      main: '#C44545',
    },
    warning: {
      main: '#D98646',
    },
    info: {
      main: '#288CA8',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: ['Manrope', 'sans-serif'].join(','),
    h1: {
      fontSize: '2.25rem',
      fontWeight: 800,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 800,
      letterSpacing: '-0.035em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 700,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            'radial-gradient(circle at 8% 4%, rgba(100, 204, 197, 0.12), transparent 24rem), #F4F8F9',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#176B87',
          backgroundImage:
            'linear-gradient(110deg, #124E66 0%, #176B87 60%, #288CA8 100%)',
          boxShadow: '0 4px 18px rgba(18, 78, 102, 0.18)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 12,
          paddingInline: 20,
          transition:
            'transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          boxShadow: '0 7px 18px rgba(23, 107, 135, 0.2)',
          '&:hover': {
            boxShadow: '0 10px 24px rgba(23, 107, 135, 0.28)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          transition: 'box-shadow 160ms ease, background-color 160ms ease',
          '&:hover': {
            backgroundColor: '#FBFDFD',
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(100, 204, 197, 0.18)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #DDE8EB',
          borderRadius: 16,
          boxShadow: '0 8px 28px rgba(18, 78, 102, 0.07)',
          transition: 'transform 180ms ease, box-shadow 180ms ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 14px 34px rgba(18, 78, 102, 0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 9,
        },
        filled: {
          backgroundColor: '#EAF2F4',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: '1px solid #DDE8EB',
          boxShadow: '0 14px 38px rgba(18, 78, 102, 0.14)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
  },
});
