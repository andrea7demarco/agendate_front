import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';
import { useAppDispatch } from '../../../app/hooks';
import {
  getHomePathByRole,
  getSafeRedirectPath,
} from '../../../common/utils/auth';
import {
  useCompleteRegistrationMutation,
} from '../api/authApi';
import { setCredentials } from '../store/authSlice';
import { useAuth } from '../../../common/hooks/useAuth';
import {
  useGetSpecialtiesQuery,
} from '../../catalogo/api/professionalsApi';
import type { Specialty } from '../../catalogo/types/professional.types';
import { useGetHealthInsurancesQuery } from '../../healthInsurances/api/healthInsurancesApi';
import { AddressAutocomplete } from '../../locations/components/AdressAutocomplete';
import type { AddressSuggestion } from '../../locations/types/location.types';
import { normalizePhoneForWhatsApp } from '../../../common/utils/phone';
import { AvailabilitySelector } from '../../../common/components/AvailabilitySelector';
import { PATIENT_GROUP_OPTIONS } from '../../../common/constants/professionalOptions';

const ARGENTINA_PROVINCES = [
  'Buenos Aires',
  'Ciudad Autonoma de Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Cordoba',
  'Corrientes',
  'Entre Rios',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquen',
  'Rio Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucuman',
];

type ApiErrorData = {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
  message?: string;
};

type ApiError = {
  data?: ApiErrorData | string;
  error?: string;
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'string') return error;
  if (typeof error !== 'object' || error === null) {
    return 'No se pudo completar el registro';
  }

  const apiError = error as ApiError;
  const data = apiError.data;

  if (typeof data === 'string') return data;

  const firstValidationError = data?.errors
    ? Object.values(data.errors).flat()[0]
    : undefined;

  return (
    firstValidationError ||
    data?.detail ||
    data?.message ||
    data?.title ||
    apiError.error ||
    'No se pudo completar el registro'
  );
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const isDisabilityRoot = (specialty: Specialty) => {
  const name = normalizeText(specialty.name);

  return name.includes('discapacidad') && name.includes('rehabilitacion');
};

const hasChildren = (specialty: Specialty, specialties: Specialty[]) =>
  specialties.some((item) => item.parentSpecialtyId === specialty.id);

const isDescendantOf = (
  specialty: Specialty,
  parentId: number,
  specialties: Specialty[],
) => {
  let currentParentId = specialty.parentSpecialtyId;

  while (currentParentId) {
    if (currentParentId === parentId) return true;

    const parent = specialties.find((item) => item.id === currentParentId);
    if (!parent) return false;

    currentParentId = parent.parentSpecialtyId;
  }

  return false;
};

const getSpecialtyOptions = (
  careerId: number | null,
  specialties: Specialty[],
) => {
  if (!careerId) return [];

  return specialties.filter((specialty) =>
    isDescendantOf(specialty, careerId, specialties),
  );
};

const completeRegistrationSchema = Yup.object({
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
          .oneOf([1, 2, 3], 'Genero invalido')
          .required('El genero es obligatorio'),
      otherwise: (schema) => schema.optional(),
    }),
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
  consultationCost: Yup.number()
    .transform((value, originalValue) =>
      originalValue === '' ? undefined : value,
    )
    .when('registrationKind', {
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
  hasNoHealthInsurance: Yup.boolean().optional(),
  hasNoAcceptedHealthInsurances: Yup.boolean().optional(),
  healthInsuranceIds: Yup.array().of(Yup.number().required()).optional(),
  degreeTitle: Yup.string().max(150, 'El titulo admite hasta 150 caracteres').optional(),
  university: Yup.string()
    .max(150, 'La institucion admite hasta 150 caracteres')
    .optional(),
  graduationYear: Yup.number()
    .transform((value, originalValue) =>
      originalValue === '' ? undefined : value,
    )
    .min(1900, 'El anio de recibido no es valido')
    .max(new Date().getFullYear(), 'El anio de recibido no puede ser futuro')
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
          .min(1900, 'El anio del curso no es valido')
          .max(new Date().getFullYear(), 'El anio del curso no puede ser futuro')
          .optional(),
        description: Yup.string().optional(),
      }),
    )
    .optional(),
  healthInsurances: Yup.array()
    .of(
      Yup.object({
        healthInsuranceId: Yup.number().required(),
        affiliateNumber: Yup.string().optional(),
        planName: Yup.string().optional(),
      }),
    )
    .optional(),
});

export const CompleteRegistrationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [completeRegistration, { isLoading }] =
    useCompleteRegistrationMutation();
  const { data: specialties = [], isLoading: isLoadingSpecialties } =
    useGetSpecialtiesQuery();
  const { data: healthInsurances = [], isLoading: isLoadingHealthInsurances } =
    useGetHealthInsurancesQuery();

  const normalizedDisabilityRoot = specialties.find(isDisabilityRoot);
  const rootCareerOptions = normalizedDisabilityRoot
    ? specialties.filter(
        (specialty) =>
          specialty.parentSpecialtyId === normalizedDisabilityRoot.id,
      )
    : [];
  const careerOptionsWithChildren = specialties.filter(
    (specialty) =>
      hasChildren(specialty, specialties) && !isDisabilityRoot(specialty),
  );
  const effectiveCareerOptions =
    rootCareerOptions.length > 0 ? rootCareerOptions : careerOptionsWithChildren;

  const formik = useFormik({
    initialValues: {
      registrationKind: 'paciente' as 'paciente' | 'profesional',
      birthDate: '',
      gender: '' as '' | 1 | 2 | 3,
      hasCud: false,
      hasNoHealthInsurance: false,
      dni: '',
      phonePrefix: '549',
      phoneNumber: '',
      consultationCost: 0,
      appointmentType: 'Presencial' as 'Presencial' | 'Online' | 'Ambos',
      address: '',
      location: null as AddressSuggestion | null,
      locationName: 'Consultorio principal',
      locationInstructions: '',
      province: '',
      city: '',
      nationalLicense: '',
      provincialLicense: '',
      biography: '',
      degreeTitle: '',
      university: '',
      graduationYear: '',
      careerId: null as number | null,
      specialtyIds: [] as number[],
      hasNoAcceptedHealthInsurances: false,
      healthInsuranceIds: [] as number[],
      availabilities: [] as { dayOfWeek: number; timeSlot: number }[],
      patientGroups: [] as number[],
      trainings: [] as {
        title: string;
        institution: string;
        year: string;
        description: string;
      }[],
      healthInsurances: [] as {
        healthInsuranceId: number;
        affiliateNumber: string;
        planName: string;
      }[],
    },
    validationSchema: completeRegistrationSchema,
    onSubmit: async (values, helpers) => {
      try {
        const specialtyIds = [
          values.careerId,
          ...values.specialtyIds,
        ].filter((id): id is number => typeof id === 'number');

        const finalPhoneNumber =
          values.registrationKind === 'profesional'
            ? normalizePhoneForWhatsApp(values.phoneNumber, values.phonePrefix)
            : null;
        const response = await completeRegistration({
          registrationKind: values.registrationKind,
          birthDate:
            values.registrationKind === 'paciente'
              ? values.birthDate
              : null,
          gender:
            values.registrationKind === 'paciente'
              ? Number(values.gender)
              : null,
          hasCud:
            values.registrationKind === 'paciente'
              ? values.hasCud
              : null,
          dni: values.dni || null,
          phoneNumber: finalPhoneNumber,
          consultationCost:
            values.registrationKind === 'profesional'
              ? Number(values.consultationCost)
              : null,
          appointmentType:
            values.registrationKind === 'profesional'
              ? values.appointmentType
              : null,
          address: values.address || null,
          province: values.province || null,
          city:
            values.registrationKind === 'profesional'
              ? values.city || null
              : null,
          nationalLicense: values.nationalLicense || null,
          provincialLicense: values.provincialLicense || null,
          biography: values.biography || null,
          degreeTitle:
            values.registrationKind === 'profesional'
              ? values.degreeTitle || null
              : null,
          university:
            values.registrationKind === 'profesional'
              ? values.university || null
              : null,
          graduationYear:
            values.registrationKind === 'profesional' && values.graduationYear
              ? Number(values.graduationYear)
              : null,
          specialtyIds:
            values.registrationKind === 'profesional'
              ? Array.from(new Set(specialtyIds))
              : null,
          healthInsuranceIds:
            values.registrationKind === 'profesional'
              ? values.healthInsuranceIds
              : null,
          availabilities:
            values.registrationKind === 'profesional'
              ? values.availabilities
              : null,
          patientGroups:
            values.registrationKind === 'profesional'
              ? values.patientGroups
              : null,
          trainings:
            values.registrationKind === 'profesional'
              ? values.trainings.map((training) => ({
                  title: training.title,
                  institution: training.institution || null,
                  year: training.year ? Number(training.year) : null,
                  description: training.description || null,
                }))
              : null,
          healthInsurances:
            values.registrationKind === 'paciente'
              ? values.healthInsurances.map((item) => ({
                  healthInsuranceId: item.healthInsuranceId,
                  affiliateNumber: item.affiliateNumber || null,
                  planName: item.planName || null,
                }))
              : null,
          locations:
            values.registrationKind === 'profesional' && values.location
              ? [
                  {
                    name: values.locationName || 'Consultorio principal',
                    formattedAddress: values.location.formattedAddress,
                    street: values.location.street ?? null,
                    streetNumber: values.location.streetNumber ?? null,
                    city: values.location.city ?? values.city,
                    province: values.location.province ?? values.province,
                    postalCode: values.location.postalCode ?? null,
                    latitude: values.location.latitude,
                    longitude: values.location.longitude,
                    externalPlaceId: values.location.externalPlaceId ?? null,
                    externalProvider: values.location.externalProvider,
                    instructions: values.locationInstructions || null,
                  },
                ]
              : null,
        }).unwrap();

        dispatch(
          setCredentials({
            user: response.user,
            accessToken: response.accessToken,
          }),
        );

        enqueueSnackbar('Registro completado exitosamente', {
          variant: 'success',
        });

        navigate(
          getSafeRedirectPath(
            searchParams.get('redirect'),
            getHomePathByRole(response.user.role),
          ),
          { replace: true },
        );
      } catch (error) {
        const message = getErrorMessage(error);
        helpers.setStatus(message);
        enqueueSnackbar(message, { variant: 'error' });
      }
    },
  });

  const specialtyOptions = getSpecialtyOptions(
    formik.values.careerId,
    specialties,
  );

  const selectedPatientHealthInsurances = healthInsurances.filter((item) =>
    formik.values.healthInsurances.some(
      (selected) => selected.healthInsuranceId === item.id,
    ),
  );

  const selectedProfessionalHealthInsurances = healthInsurances.filter((item) =>
    formik.values.healthInsuranceIds.includes(item.id),
  );

  if (!user) return <Navigate to="/login" replace />;
  if (user.registrationCompleted) {
    return (
      <Navigate
        to={getSafeRedirectPath(
          searchParams.get('redirect'),
          getHomePathByRole(user.role),
        )}
        replace
      />
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card
        sx={{
          '&:hover': {
            transform: 'none',
            boxShadow: '0 8px 28px rgba(18, 78, 102, 0.07)',
          },
        }}
      >
        <CardContent>
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Completar registro
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Elegi como queres usar Agendate con tu cuenta de Google.
                </Typography>
              </Box>

              <TextField
                select
                label="Tipo de usuario"
                name="registrationKind"
                value={formik.values.registrationKind}
                onChange={(event) => {
                  formik.handleChange(event);
                  void formik.setFieldValue('careerId', null);
                  void formik.setFieldValue('specialtyIds', []);
                }}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.registrationKind &&
                  Boolean(formik.errors.registrationKind)
                }
                helperText={
                  formik.touched.registrationKind &&
                  formik.errors.registrationKind
                }
              >
                <MenuItem value="paciente">Paciente</MenuItem>
                <MenuItem value="profesional">Profesional</MenuItem>
              </TextField>

              {formik.values.registrationKind === 'paciente' && (
                <>
                  <TextField
                    label="Fecha de nacimiento"
                    name="birthDate"
                    type="date"
                    value={formik.values.birthDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.birthDate &&
                      Boolean(formik.errors.birthDate)
                    }
                    helperText={
                      formik.touched.birthDate && formik.errors.birthDate
                    }
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    select
                    label="Genero"
                    name="gender"
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.gender && Boolean(formik.errors.gender)
                    }
                    helperText={formik.touched.gender && formik.errors.gender}
                  >
                    <MenuItem value={1}>Masculino</MenuItem>
                    <MenuItem value={2}>Femenino</MenuItem>
                  </TextField>

                  <FormControlLabel
                    control={
                      <Checkbox
                        name="hasCud"
                        checked={formik.values.hasCud}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Tiene Certificado Único de Discapacidad (CUD)"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        name="hasNoHealthInsurance"
                        checked={formik.values.hasNoHealthInsurance}
                        onChange={(event) => {
                          formik.handleChange(event);
                          if (event.target.checked) {
                            void formik.setFieldValue('healthInsurances', []);
                          }
                        }}
                      />
                    }
                    label="No tengo obra social"
                  />

                  <Autocomplete
                    multiple
                    options={healthInsurances}
                    loading={isLoadingHealthInsurances}
                    disabled={formik.values.hasNoHealthInsurance}
                    value={selectedPatientHealthInsurances}
                    noOptionsText={
                      isLoadingHealthInsurances
                        ? 'Cargando obras sociales...'
                        : 'No hay obras sociales cargadas'
                    }
                    getOptionLabel={(option) =>
                      option.acronym
                        ? `${option.acronym} - ${option.name}`
                        : option.name
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    onChange={(_, values) => {
                      const nextHealthInsurances = values.map((value) => {
                        const existing = formik.values.healthInsurances.find(
                          (item) => item.healthInsuranceId === value.id,
                        );

                        return (
                          existing ?? {
                            healthInsuranceId: value.id,
                            affiliateNumber: '',
                            planName: '',
                          }
                        );
                      });

                      void formik.setFieldValue(
                        'healthInsurances',
                        nextHealthInsurances,
                      );
                    }}
                    onBlur={() =>
                      formik.setFieldTouched('healthInsurances', true)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Obras sociales"
                        placeholder="Buscar obra social"
                        error={
                          formik.touched.healthInsurances &&
                          Boolean(formik.errors.healthInsurances)
                        }
                        helperText={
                          formik.touched.healthInsurances &&
                          (formik.errors.healthInsurances as string)
                        }
                      />
                    )}
                  />

                  {!formik.values.hasNoHealthInsurance &&
                    formik.values.healthInsurances.map((item, index) => {
                    const healthInsurance = healthInsurances.find(
                      (option) => option.id === item.healthInsuranceId,
                    );

                    return (
                      <Box
                        key={item.healthInsuranceId}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                        }}
                      >
                        <Typography fontWeight={700} sx={{ mb: 1.5 }}>
                          {healthInsurance?.acronym || 'Obra social'}
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <TextField
                            label="Numero de afiliado"
                            value={item.affiliateNumber}
                            onChange={(event) => {
                              const next = [...formik.values.healthInsurances];
                              next[index] = {
                                ...next[index],
                                affiliateNumber: event.target.value,
                              };
                              void formik.setFieldValue('healthInsurances', next);
                            }}
                          />

                          <TextField
                            label="Plan"
                            value={item.planName}
                            onChange={(event) => {
                              const next = [...formik.values.healthInsurances];
                              next[index] = {
                                ...next[index],
                                planName: event.target.value,
                              };
                              void formik.setFieldValue('healthInsurances', next);
                            }}
                          />
                        </Stack>
                      </Box>
                    );
                  })}
                </>
              )}

              {formik.values.registrationKind === 'profesional' && (
                <>
                  <TextField
                    label="DNI"
                    name="dni"
                    value={formik.values.dni}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.dni && Boolean(formik.errors.dni)}
                    helperText={formik.touched.dni && formik.errors.dni}
                  />

                  <TextField
                    label="Telefono"
                    name="phoneNumber"
                    value={formik.values.phoneNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.phoneNumber &&
                      Boolean(formik.errors.phoneNumber)
                    }
                    helperText={
                      formik.touched.phoneNumber && formik.errors.phoneNumber
                    }
                  />

                  <TextField
                    label="Costo de consulta"
                    name="consultationCost"
                    type="number"
                    value={formik.values.consultationCost}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.consultationCost &&
                      Boolean(formik.errors.consultationCost)
                    }
                    helperText={
                      formik.touched.consultationCost &&
                      formik.errors.consultationCost
                    }
                  />

                  <TextField
                    select
                    label="Tipo de atención"
                    name="appointmentType"
                    value={formik.values.appointmentType}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.appointmentType &&
                      Boolean(formik.errors.appointmentType)
                    }
                    helperText={
                      formik.touched.appointmentType &&
                      formik.errors.appointmentType
                    }
                  >
                    <MenuItem value="Presencial">Presencial</MenuItem>
                    <MenuItem value="Online">Online</MenuItem>
                    <MenuItem value="Ambos">Ambos</MenuItem>
                  </TextField>

                  <AddressAutocomplete
                    label="Dirección del consultorio"
                    value={formik.values.location}
                    error={
                      formik.touched.location &&
                      Boolean(formik.errors.location)
                    }
                    helperText={
                      formik.touched.location &&
                      typeof formik.errors.location === 'string'
                        ? formik.errors.location
                        : undefined
                    }
                    onChange={(location) => {
                      void formik.setFieldValue('location', location);

                      if (!location) return;

                      void formik.setFieldValue('address', location.formattedAddress);
                      void formik.setFieldValue('city', location.city ?? '');
                      void formik.setFieldValue('province', location.province ?? '');
                    }}
                  />

                  <TextField
                    label="Nombre del lugar"
                    name="locationName"
                    value={formik.values.locationName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />

                  <TextField
                    label="Indicaciones para llegar"
                    name="locationInstructions"
                    value={formik.values.locationInstructions}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    multiline
                    minRows={2}
                  />

                  <TextField
                    select
                    label="Provincia"
                    name="province"
                    value={formik.values.province}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.province &&
                      Boolean(formik.errors.province)
                    }
                    helperText={
                      formik.touched.province && formik.errors.province
                    }
                  >
                    {ARGENTINA_PROVINCES.map((province) => (
                      <MenuItem key={province} value={province}>
                        {province}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Ciudad"
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.city &&
                      Boolean(formik.errors.city)
                    }
                    helperText={
                      formik.touched.city && formik.errors.city
                    }
                  />

                  <TextField
                    label="Matrícula nacional"
                    name="nationalLicense"
                    value={formik.values.nationalLicense}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.nationalLicense &&
                      Boolean(formik.errors.nationalLicense)
                    }
                    helperText={
                      formik.touched.nationalLicense &&
                      formik.errors.nationalLicense
                    }
                  />

                  <TextField
                    label="Matrícula provincial"
                    name="provincialLicense"
                    value={formik.values.provincialLicense}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.provincialLicense &&
                      Boolean(formik.errors.provincialLicense)
                    }
                    helperText={
                      formik.touched.provincialLicense &&
                      formik.errors.provincialLicense
                    }
                  />

                  <Autocomplete
                    options={effectiveCareerOptions}
                    noOptionsText={
                      isLoadingSpecialties
                        ? 'Cargando carreras...'
                        : 'No hay carreras cargadas'
                    }
                    loading={isLoadingSpecialties}
                    value={
                      effectiveCareerOptions.find(
                        (specialty) =>
                          specialty.id === formik.values.careerId,
                      ) ?? null
                    }
                    getOptionLabel={(specialty) => specialty.name}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    onChange={(_, value) => {
                      void formik.setFieldValue('careerId', value?.id ?? null);
                      void formik.setFieldValue('specialtyIds', []);
                    }}
                    onBlur={() => formik.setFieldTouched('careerId', true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Carrera"
                        placeholder="Buscar carrera"
                        error={
                          formik.touched.careerId &&
                          Boolean(formik.errors.careerId)
                        }
                        helperText={
                          formik.touched.careerId &&
                          (formik.errors.careerId as string)
                        }
                      />
                    )}
                  />

                  <Autocomplete
                    multiple
                    options={specialtyOptions}
                    noOptionsText={
                      formik.values.careerId
                        ? 'No hay especialidades cargadas para esta carrera'
                        : 'Primero selecciona una carrera'
                    }
                    loading={isLoadingSpecialties}
                    value={specialties.filter((specialty) =>
                      formik.values.specialtyIds.includes(specialty.id),
                    )}
                    getOptionLabel={(specialty) => specialty.name}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    onChange={(_, value) => {
                      void formik.setFieldValue(
                        'specialtyIds',
                        value.map((specialty) => specialty.id),
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Especialidades"
                        placeholder="Buscar especialidad"
                      />
                    )}
                  />

                  <Autocomplete
                    multiple
                    options={healthInsurances}
                    loading={isLoadingHealthInsurances}
                    disabled={formik.values.hasNoAcceptedHealthInsurances}
                    value={selectedProfessionalHealthInsurances}
                    noOptionsText={
                      isLoadingHealthInsurances
                        ? 'Cargando obras sociales...'
                        : 'No hay obras sociales cargadas'
                    }
                    getOptionLabel={(option) =>
                      option.acronym
                        ? `${option.acronym} - ${option.name}`
                        : option.name
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    onChange={(_, values) => {
                      void formik.setFieldValue(
                        'healthInsuranceIds',
                        values.map((value) => value.id),
                      );
                    }}
                    onBlur={() =>
                      formik.setFieldTouched('healthInsuranceIds', true)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Obras sociales que atiende"
                        placeholder="Buscar obra social"
                        error={
                          formik.touched.healthInsuranceIds &&
                          Boolean(formik.errors.healthInsuranceIds)
                        }
                        helperText={
                          formik.touched.healthInsuranceIds &&
                          (formik.errors.healthInsuranceIds as string)
                        }
                      />
                    )}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        name="hasNoAcceptedHealthInsurances"
                        checked={formik.values.hasNoAcceptedHealthInsurances}
                        onChange={(event) => {
                          formik.handleChange(event);
                          if (event.target.checked) {
                            void formik.setFieldValue('healthInsuranceIds', []);
                          }
                        }}
                      />
                    }
                    label="No atiendo obras sociales"
                  />

                  <TextField
                    label="Biografía"
                    name="biography"
                    multiline
                    minRows={3}
                    value={formik.values.biography}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Título profesional"
                      name="degreeTitle"
                      value={formik.values.degreeTitle}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />

                    <TextField
                      fullWidth
                      label="Universidad"
                      name="university"
                      value={formik.values.university}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </Stack>

                  <TextField
                    label="Año de recibido"
                    name="graduationYear"
                    type="number"
                    value={formik.values.graduationYear}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />

                  <Autocomplete
                    multiple
                    options={PATIENT_GROUP_OPTIONS}
                    value={PATIENT_GROUP_OPTIONS.filter((option) =>
                      formik.values.patientGroups.includes(option.id),
                    )}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    onChange={(_, value) => {
                      void formik.setFieldValue(
                        'patientGroups',
                        value.map((option) => option.id),
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tipos de pacientes que atiende"
                        placeholder="Bebés, niños, adultos..."
                      />
                    )}
                  />

                  <AvailabilitySelector
                    value={formik.values.availabilities}
                    onChange={(value) =>
                      void formik.setFieldValue('availabilities', value)
                    }
                  />

                  <Stack spacing={1.5}>
                    <Typography fontWeight={700}>Cursos y capacitaciones</Typography>
                    {formik.values.trainings.map((training, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                        }}
                      >
                        <Stack spacing={1.5}>
                          <TextField
                            label="Curso"
                            value={training.title}
                            onChange={(event) => {
                              const next = [...formik.values.trainings];
                              next[index] = {
                                ...next[index],
                                title: event.target.value,
                              };
                              void formik.setFieldValue('trainings', next);
                            }}
                          />
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                          >
                            <TextField
                              fullWidth
                              label="Emitido por"
                              value={training.institution}
                              onChange={(event) => {
                                const next = [...formik.values.trainings];
                                next[index] = {
                                  ...next[index],
                                  institution: event.target.value,
                                };
                                void formik.setFieldValue('trainings', next);
                              }}
                            />
                            <TextField
                              fullWidth
                              type="number"
                              label="Año"
                              value={training.year}
                              onChange={(event) => {
                                const next = [...formik.values.trainings];
                                next[index] = {
                                  ...next[index],
                                  year: event.target.value,
                                };
                                void formik.setFieldValue('trainings', next);
                              }}
                            />
                          </Stack>
                          <TextField
                            multiline
                            minRows={2}
                            label="Descripción opcional"
                            value={training.description}
                            onChange={(event) => {
                              const next = [...formik.values.trainings];
                              next[index] = {
                                ...next[index],
                                description: event.target.value,
                              };
                              void formik.setFieldValue('trainings', next);
                            }}
                          />
                          <Button
                            type="button"
                            variant="text"
                            color="error"
                            onClick={() => {
                              const next = formik.values.trainings.filter(
                                (_, itemIndex) => itemIndex !== index,
                              );
                              void formik.setFieldValue('trainings', next);
                            }}
                          >
                            Quitar curso
                          </Button>
                        </Stack>
                      </Box>
                    ))}
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() =>
                        void formik.setFieldValue('trainings', [
                          ...formik.values.trainings,
                          {
                            title: '',
                            institution: '',
                            year: '',
                            description: '',
                          },
                        ])
                      }
                    >
                      Agregar curso
                    </Button>
                  </Stack>
                </>
              )}

              {formik.status && (
                <Typography color="error">{formik.status}</Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{ height: 48 }}
              >
                {isLoading ? 'Guardando...' : 'Finalizar registro'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};
