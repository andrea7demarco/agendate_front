import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { store } from '../store';
import { ThemeProvider } from './ThemeProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <ThemeProvider>
          <SnackbarProvider
            maxSnack={3}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {children}
          </SnackbarProvider>
        </ThemeProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
};
