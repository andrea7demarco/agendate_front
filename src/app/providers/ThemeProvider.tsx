import type { PropsWithChildren } from 'react';
import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material';
import { appTheme } from '../../common/theme/getDesignTokens';


export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <MuiThemeProvider theme={appTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};