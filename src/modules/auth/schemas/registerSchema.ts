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

  birthDate: Yup.string().when('registrationKind', {
    is: 'paciente',
    then: (schema) => schema.required('La fecha de nacimiento es obligatoria'),
    otherwise: (schema) => schema.optional(),
  }),

  gender: Yup.number()
    .transform((value, originalValue) =>
      originalValue === '' ? undefined : value,
    )
    .when('registrationKind', {
      is: 'paciente',
      then: (schema) =>
        schema
          .oneOf([1, 2], 'Género inválido')
          .required('El genero es obligatorio'),
      otherwise: (schema) => schema.optional(),
    }),

  dni: Yup.string().when('registrationKind', {
    is: 'profesional',
    then: (schema) => schema.required('El DNI es obligatorio'),
    otherwise: (schema) => schema.optional(),
  }),

  phonePrefix: Yup.string().when('registrationKind', {
    is: 'profesional',
    then: (schema) => schema.required('El prefijo de país es obligatorio'),
    otherwise: (schema) => schema.optional(),
  }),

  phoneNumber: Yup.string().when('registrationKind', {
    is: 'profesional',
    then: (schema) => schema
      .matches(/^\d+$/, 'Solo ingresa números, sin espacios ni guiones')
      .required('El teléfono es obligatorio'),
    otherwise: (schema) => schema.optional(),
  }),

  consultationCost: Yup.number()
    .transform((value, originalValue) =>
      originalValue === '' ? undefined : value,
    )
    .when('registrationKind', {
      is: 'profesional',
      then: (schema) =>
        schema
          .typeError('El costo debe ser un número')
          .min(0, 'El costo no puede ser negativo')
          .required('El costo de consulta es obligatorio'),
      otherwise: (schema) => schema.optional(),
    }),

  appointmentType: Yup.string().when('registrationKind', {
    is: 'profesional',
    then: (schema) =>
      schema
        .oneOf(['Presencial', 'Online', 'Ambos'], 'Tipo de atencion inválido')
        .required('El tipo de atención es obligatorio'),
    otherwise: (schema) => schema.optional(),
  }),

  address: Yup.string().optional(),
  location: Yup.mixed().nullable().optional(),
  locationName: Yup.string().optional(),
  locationInstructions: Yup.string().optional(),

  province: Yup.string().when('registrationKind', {
    is: 'profesional',
    then: (schema) => schema.required('La provincia es obligatoria'),
    otherwise: (schema) => schema.optional(),
  }),

  city: Yup.string().when('registrationKind', {
    is: 'profesional',
    then: (schema) =>
      schema.trim().required('La ciudad es obligatoria'),
    otherwise: (schema) => schema.optional(),
  }),

  nationalLicense: Yup.string().when('registrationKind', {
    is: 'profesional',
    then: (schema) => 
      schema
        .matches(/^\d+$/, 'La matrícula nacional debe ser numérica')
        .required('La matrícula nacional es obligatoria'),
    otherwise: (schema) => schema.optional(),
  }),

  provincialLicense: Yup.string().when('registrationKind', {
    is: 'profesional',
    then: (schema) =>
      schema
        .matches(/^\d+$/, 'La matrícula provincial debe ser numérica')
        .required('La matrícula provincial es obligatoria'),
    otherwise: (schema) => schema.optional(),
  }),

  biography: Yup.string().optional(),

  degreeTitle: Yup.string().max(100, 'El título admite hasta 100 caracteres').optional(),

  university: Yup.string()
    .max(100, 'La institución admite hasta 100 caracteres')
    .optional(),

  graduationYear: Yup.number()
    .transform((value, originalValue) =>
      originalValue === '' ? undefined : value,
    )
    .min(1900, 'El año de recibido no es valido')
    .max(new Date().getFullYear(), 'El año de recibido no puede ser futuro')
    .optional(),

  careerId: Yup.number()
    .nullable()
    .when('registrationKind', {
      is: 'profesional',
      then: (schema) =>
        schema
          .typeError('Selecciona una carrera')
          .required('Selecciona una carrera'),
      otherwise: (schema) => schema.nullable().optional(),
    }),

  specialtyIds: Yup.array().when('registrationKind', {
    is: 'profesional',
    then: (schema) => schema.of(Yup.number().required()).optional(),
    otherwise: (schema) => schema.optional(),
  }),

  hasNoHealthInsurance: Yup.boolean().optional(),
  hasNoAcceptedHealthInsurances: Yup.boolean().optional(),

  healthInsuranceIds: Yup.array().of(Yup.number().required()).optional(),

  healthInsurances: Yup.array()
    .of(
      Yup.object({
        healthInsuranceId: Yup.number().required(),
        affiliateNumber: Yup.string().optional(),
        planName: Yup.string().optional(),
      }),
    )
    .optional(),

  availabilities: Yup.array()
    .of(
      Yup.object({
        dayOfWeek: Yup.number().min(0).max(6).required(),
        timeSlot: Yup.number().min(1).max(4).required(),
      }),
    )
    .optional(),

  patientGroups: Yup.array().of(Yup.number().min(1).max(5).required()).optional(),

  trainings: Yup.array()
    .of(
      Yup.object({
        title: Yup.string().required('El nombre del curso es obligatorio'),
        institution: Yup.string().optional(),
        year: Yup.number()
          .transform((value, originalValue) =>
            originalValue === '' ? undefined : value,
          )
          .min(1900, 'El año del curso no es valido')
          .max(new Date().getFullYear(), 'El año del curso no puede ser futuro')
          .optional(),
        description: Yup.string().optional(),
      }),
    )
    .optional(),
});
