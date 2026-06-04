import * as Yup from 'yup';

export const registerSchema = Yup.object({
  firstName: Yup.string().required('El nombre es obligatorio'),
  lastName: Yup.string().required('El apellido es obligatorio'),
  email: Yup.string()
    .email('Email invalido')
    .required('El email es obligatorio'),
  password: Yup.string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres')
    .matches(/[A-Z]/, 'La contrasena debe tener al menos una mayuscula')
    .matches(/[a-z]/, 'La contrasena debe tener al menos una minuscula')
    .matches(/[0-9]/, 'La contrasena debe tener al menos un numero')
    .required('La contrasena es obligatoria'),
  registrationKind: Yup.string()
    .oneOf(['paciente', 'profesional'], 'Rol invalido')
    .required('El rol es obligatorio'),
  dni: Yup.string().when('registrationKind', {
    is: 'profesional',
    then: (schema) => schema.required('El DNI es obligatorio'),
    otherwise: (schema) => schema.optional(),
  }),
  phoneNumber: Yup.string().when('registrationKind', {
    is: 'profesional',
    then: (schema) => schema.required('El telefono es obligatorio'),
    otherwise: (schema) => schema.optional(),
  }),
  consultationCost: Yup.number().when('registrationKind', {
    is: 'profesional',
    then: (schema) =>
      schema
        .typeError('El costo debe ser un numero')
        .min(0, 'El costo no puede ser negativo')
        .required('El costo de consulta es obligatorio'),
    otherwise: (schema) => schema.optional(),
  }),
  appointmentType: Yup.string().when('registrationKind', {
    is: 'profesional',
    then: (schema) =>
      schema
        .oneOf(['Presencial', 'Online', 'Ambos'], 'Tipo de atencion invalido')
        .required('El tipo de atencion es obligatorio'),
    otherwise: (schema) => schema.optional(),
  }),
  address: Yup.string().optional(),
  province: Yup.string().when('registrationKind', {
    is: 'profesional',
    then: (schema) => schema.required('La provincia es obligatoria'),
    otherwise: (schema) => schema.optional(),
  }),
  nationalLicense: Yup.string().when('registrationKind', {
    is: 'profesional',
    then: (schema) => schema.required('La matricula nacional es obligatoria'),
    otherwise: (schema) => schema.optional(),
  }),
  provincialLicense: Yup.string().when('registrationKind', {
    is: 'profesional',
    then: (schema) =>
      schema
        .matches(/^\d+$/, 'La matricula provincial debe ser numerica')
        .required('La matricula provincial es obligatoria'),
    otherwise: (schema) => schema.optional(),
  }),
  biography: Yup.string().optional(),
  careerId: Yup.number().when('registrationKind', {
    is: 'profesional',
    then: (schema) =>
      schema
        .typeError('Selecciona una carrera')
        .required('Selecciona una carrera'),
    otherwise: (schema) => schema.optional(),
  }),
  specialtyIds: Yup.array().when('registrationKind', {
    is: 'profesional',
    then: (schema) =>
      schema
        .of(Yup.number().required())
        .optional(),
    otherwise: (schema) => schema.optional(),
  }),
});
