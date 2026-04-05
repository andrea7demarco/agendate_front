import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { registerSchema } from '../schemas/registerSchema';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../api/authApi';
import { useSnackbar } from 'notistack';

export const RegisterForm = () => {
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      registrationKind: 'paciente' as 'paciente' | 'profesional',
    },
    validationSchema: registerSchema,
    onSubmit: async (values, helpers) => {
      try {
        await register(values).unwrap();

        enqueueSnackbar('Registro completado exitosamente', {
          variant: 'success',
        });

        // After register, redirect to login
        navigate('/login');
      } catch (error) {
        helpers.setStatus('No se pudo completar el registro');
        enqueueSnackbar('No se pudo completar el registro', {
          variant: 'error',
        });
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={3}>
        <Typography variant="h4">Crear cuenta</Typography>

        <TextField
          label="Nombre"
          name="firstName"
          value={formik.values.firstName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
          helperText={formik.touched.firstName && formik.errors.firstName}
        />

        <TextField
          label="Apellido"
          name="lastName"
          value={formik.values.lastName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName && formik.errors.lastName}
        />

        <TextField
          label="Email"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
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
        />

        <TextField
          select
          label="Tipo de usuario"
          name="role"
          value={formik.values.registrationKind}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.registrationKind &&
            Boolean(formik.errors.registrationKind)
          }
          helperText={
            formik.touched.registrationKind && formik.errors.registrationKind
          }
        >
          <MenuItem value="paciente">Paciente</MenuItem>
          <MenuItem value="profesional">Profesional</MenuItem>
        </TextField>

        {formik.status && (
          <Typography color="error">{formik.status}</Typography>
        )}

        <Button
          sx={{ borderRadius: 1, width: '100%', height: 48 }}
          type="submit"
          variant="contained"
          disabled={isLoading}
        >
          Registrarme
        </Button>
      </Stack>
    </form>
  );
};
