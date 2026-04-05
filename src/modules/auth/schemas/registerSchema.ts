import * as Yup from 'yup';

export const registerSchema = Yup.object({
  firstName: Yup.string().required('El nombre es obligatorio'),
  lastName: Yup.string().required('El apellido es obligatorio'),
  email: Yup.string()
    .email('Email inválido')
    .required('El email es obligatorio'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
  role: Yup.string()
    .oneOf(['paciente', 'profesional'], 'Rol inválido')
    .required('El rol es obligatorio'),
});
