import React from 'react';
import { Box } from '@mui/material';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useLoginWithGoogleMutation } from '../api/authApi';
import {
  getHomePathByRole,
  getSafeRedirectPath,
} from '../../../common/utils/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAppDispatch } from '../../../app/hooks';
import { setCredentials } from '../store/authSlice';

export const GoogleButton: React.FC = () => {
  const [googleLogin] = useLoginWithGoogleMutation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const idToken = credentialResponse.credential;

      if (!idToken) {
        enqueueSnackbar('No se pudo obtener el token de Google', {
          variant: 'error',
        });
        return;
      }

      const response = await googleLogin({ idToken }).unwrap();

      enqueueSnackbar('Inicio de sesión exitoso', {
        variant: 'success',
      });

      dispatch(
        setCredentials({
          user: response.user,
          accessToken: response.accessToken,
        }),
      );

      if (!response.user.registrationCompleted) {
        const redirect = searchParams.get('redirect');
        navigate(
          redirect
            ? `/complete-registration?redirect=${encodeURIComponent(redirect)}`
            : '/complete-registration',
        );
        return;
      }

      navigate(
        getSafeRedirectPath(
          searchParams.get('redirect'),
          getHomePathByRole(response.user.role),
        ),
        { replace: true },
      );
    } catch (error) {
      enqueueSnackbar('No se pudo iniciar sesión con Google', {
        variant: 'error',
      });
    }
  };

  const handleError = () => {
    enqueueSnackbar('Error al autenticarse con Google', {
      variant: 'error',
    });
  };

  return (
    <Box
      sx={{
        width: '100%',
        '& > div': {
          width: '100% !important',
        },
        '& .nsm7Bb-HzV7m-LgbsSe': {
          width: '100% !important',
          height: '48px !important',
          borderRadius: '12px !important',
        },
        '& .nsm7Bb-HzV7m-LgbsSe-bN97Pc-sM5MNb': {
          height: '48px !important',
        },
        '& .nsm7Bb-HzV7m-LgbsSe-BPrWId': {
          fontSize: '14px',
          lineHeight: '48px',
        },
      }}
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
      />
    </Box>
  );
};

export default GoogleButton;
