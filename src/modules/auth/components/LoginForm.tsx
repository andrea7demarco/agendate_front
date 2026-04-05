import { Button, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { loginSchema } from '../schemas/loginSchema';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../api/authApi';
import { useAppDispatch } from '../../../app/hooks';
import { setCredentials } from '../store/authSlice';
import { getHomePathByRole } from '../../../common/utils/auth';
import { useSnackbar } from 'notistack';

export const LoginForm = () => {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, helpers) => {
      try {
        const response = await login(values).unwrap();

        const token = response.accessToken;
        const user = response.user;

        dispatch(setCredentials({ user: user, accessToken: token }));

        enqueueSnackbar('Inicio de sesión exitoso', {
          variant: 'success',
        });

        navigate(getHomePathByRole(user.role));
      } catch (error) {
        helpers.setStatus('Credenciales inválidas');

        enqueueSnackbar('Email o contraseña incorrectos', {
          variant: 'error',
        });
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={3}>
        <Typography variant="h4">Iniciar sesión</Typography>

        <TextField
          label="Email"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          fullWidth
        />

        <TextField
          label="Contraseña"
          name="password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          fullWidth
        />

        {formik.status && (
          <Typography color="error">{formik.status}</Typography>
        )}

        <Button sx={{ borderRadius: 1, width: '100%', height: 48 }} type="submit" variant="contained" disabled={isLoading}>
          Ingresar
        </Button>
      </Stack>
    </form>
  );
};
