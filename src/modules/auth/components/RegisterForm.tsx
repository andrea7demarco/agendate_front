import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { registerSchema } from '../schemas/registerSchema';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation, useRegisterMutation } from '../api/authApi';
import { useAppDispatch } from '../../../app/hooks';
import { setCredentials } from '../store/authSlice';
import { getHomePathByRole } from '../../../common/utils/auth';
import { useSnackbar } from 'notistack';
import {
  useCreateProfessionalMutation,
  useGetSpecialtiesQuery,
} from '../../catalogo/api/professionalsApi';
import type { Specialty } from '../../catalogo/types/professional.types';
import { useCreatePatientMutation } from '../../patients/api/patientsApi';
import { useGetHealthInsurancesQuery } from '../../healthInsurances/api/healthInsurancesApi';
import { AddressAutocomplete } from '../../locations/components/AdressAutocomplete';
import type { AddressSuggestion } from '../../locations/types/location.types';
import { normalizePhoneForWhatsApp } from '../../../common/utils/phone';
import { AvailabilitySelector } from '../../../common/components/AvailabilitySelector';
import { PATIENT_GROUP_OPTIONS } from '../../../common/constants/professionalOptions';

type ApiErrorData = {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
  message?: string;
};

type ApiError = {
  data?: ApiErrorData;
  error?: string;
};

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

const getRegisterErrorMessage = (error: unknown) => {
  if (typeof error === 'string') {
    return error;
  }

  if (typeof error !== 'object' || error === null) {
    return 'No se pudo completar el registro';
  }

  const apiError = error as ApiError;
  const data = apiError.data;

  if (typeof data === 'string') {
    return data;
  }

  const firstValidationError = data?.errors
    ? Object.values(data.errors).flat()[0]
    : undefined;

  return (
    firstValidationError ||
    data?.detail ||
    data?.message ||
    data?.title ||
    apiError.error ||
    JSON.stringify(error) ||
    'No se pudo completar el registro'
  );
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const hasChildren = (specialty: Specialty, specialties: Specialty[]) =>
  specialties.some((item) => item.parentSpecialtyId === specialty.id);

const isDisabilityRoot = (specialty: Specialty) => {
  const name = normalizeText(specialty.name);

  return name.includes('discapacidad') && name.includes('rehabilitacion');
};

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

export const RegisterForm = () => {
  const [register, { isLoading }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const [createProfessional, { isLoading: isCreatingProfessional }] =
    useCreateProfessionalMutation();
  const [createPatient, { isLoading: isCreatingPatient }] =
    useCreatePatientMutation();
  const { data: specialties = [], isLoading: isLoadingSpecialties } =
    useGetSpecialtiesQuery();
  const { data: healthInsurances = [], isLoading: isLoadingHealthInsurances } =
    useGetHealthInsurancesQuery();
  const disabilityRoot = specialties.find(
    (specialty) =>
      specialty.name.toLowerCase() === 'discapacidad y rehabilitación' ||
      specialty.name.toLowerCase() === 'discapacidad y rehabilitacion',
  );
  const careerOptions = disabilityRoot
    ? specialties.filter(
        (specialty) => specialty.parentSpecialtyId === disabilityRoot.id,
      )
    : specialties.filter((specialty) => !specialty.parentSpecialtyId);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const normalizedDisabilityRoot = specialties.find(isDisabilityRoot);
  const careerOptionsWithChildren = specialties.filter(
    (specialty) =>
      hasChildren(specialty, specialties) && !isDisabilityRoot(specialty),
  );
  const rootCareerOptions = normalizedDisabilityRoot
    ? specialties.filter(
        (specialty) => specialty.parentSpecialtyId === normalizedDisabilityRoot.id,
      )
    : [];
  const effectiveCareerOptions =
    rootCareerOptions.length > 0
      ? rootCareerOptions
      : careerOptionsWithChildren.length > 0
        ? careerOptionsWithChildren
        : careerOptions;

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
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
    validationSchema: registerSchema,
    onSubmit: async (values, helpers) => {
      try {
        const registeredUser = await register({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          registrationKind: values.registrationKind,
        }).unwrap();

        if (values.registrationKind === 'paciente') {
          try {
            await createPatient({
              applicationUserId: registeredUser.userId,
              birthDate: values.birthDate,
              gender: Number(values.gender),
              hasCud: values.hasCud,
              email: values.email,
              firstName: values.firstName,
              lastName: values.lastName,
              healthInsurances: values.healthInsurances.map((item) => ({
                healthInsuranceId: item.healthInsuranceId,
                affiliateNumber: item.affiliateNumber || null,
                planName: item.planName || null,
              })),
            }).unwrap();
          } catch (error) {
            throw new Error(
              `No se pudo crear el perfil de paciente: ${getRegisterErrorMessage(error)}`,
            );
          }
        }

        if (values.registrationKind === 'profesional') {
          const specialtyIds = [
            values.careerId,
            ...values.specialtyIds,
          ].filter((id): id is number => typeof id === 'number');

          const finalPhone = normalizePhoneForWhatsApp(
            values.phoneNumber,
            values.phonePrefix,
          );

          try {
            const professionalPayload = {
              applicationUserId: registeredUser.userId,
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              dni: values.dni,
              phoneNumber: finalPhone,
              consultationCost: Number(values.consultationCost),
              appointmentType: values.appointmentType,
              address: values.address || null,
              province: values.province,
              city: values.city,
              nationalLicense: values.nationalLicense,
              provincialLicense: values.provincialLicense,
              biography: values.biography || null,
              degreeTitle: values.degreeTitle || null,
              university: values.university || null,
              graduationYear: values.graduationYear
                ? Number(values.graduationYear)
                : null,
              specialtyIds: Array.from(new Set(specialtyIds)),
              healthInsuranceIds: values.healthInsuranceIds,
              availabilities: values.availabilities,
              patientGroups: values.patientGroups,
              trainings: values.trainings.map((training) => ({
                title: training.title,
                institution: training.institution || null,
                year: training.year ? Number(training.year) : null,
                description: training.description || null,
              })),
              locations: values.location
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
            };

            console.log('Professional payload', professionalPayload);

            await createProfessional({
              ...professionalPayload,
            }).unwrap();
          } catch (error) {
            console.error('Create professional failed', error);
            throw new Error(
              `No se pudo crear el perfil profesional: ${getRegisterErrorMessage(error)}`,
            );
          }
        }

        const loginResponse = await login({
          email: values.email,
          password: values.password,
        }).unwrap();

        dispatch(
          setCredentials({
            user: loginResponse.user,
            accessToken: loginResponse.accessToken,
          })
        );

        enqueueSnackbar('Registro completado exitosamente', {
          variant: 'success',
        });

navigate(getHomePathByRole(loginResponse.user.role));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : getRegisterErrorMessage(error);
        helpers.setStatus(message);
        enqueueSnackbar(message, {
          variant: 'error',
        });
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
          name="registrationKind"
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
                formik.touched.birthDate && Boolean(formik.errors.birthDate)
              }
              helperText={formik.touched.birthDate && formik.errors.birthDate}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              select
              label="Genero"
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.gender && Boolean(formik.errors.gender)}
              helperText={formik.touched.gender && formik.errors.gender}
            >
              <MenuItem value={1}>Masculino</MenuItem>
              <MenuItem value={2}>Femenino</MenuItem>
              <MenuItem value={3}>Otro</MenuItem>
            </TextField>

            <FormControlLabel
              control={
                <Checkbox
                  name="hasCud"
                  checked={formik.values.hasCud}
                  onChange={formik.handleChange}
                />
              }
              label="Tiene Certificado Unico de Discapacidad (CUD)"
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
                option.acronym ? `${option.acronym} - ${option.name}` : option.name
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
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
              onBlur={() => formik.setFieldTouched('healthInsurances', true)}
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

            <Box>
              <Stack direction="row" spacing={1}>
                <TextField
                  select
                  label="País"
                  name="phonePrefix"
                  value={formik.values.phonePrefix}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  sx={{ width: 140 }}
                >
                  <MenuItem value="549">🇦🇷 +54 9</MenuItem>
                  <MenuItem value="591">🇧🇴 +591</MenuItem>
                  <MenuItem value="569">🇨🇱 +56 9</MenuItem>
                  <MenuItem value="595">🇵🇾 +595</MenuItem>
                  <MenuItem value="598">🇺🇾 +598</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  label="Teléfono (WhatsApp)"
                  name="phoneNumber"
                  placeholder="Ej: 3812345678"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.phoneNumber &&
                    Boolean(formik.errors.phoneNumber)
                  }
                />
              </Stack>
              
              <Box sx={{ mt: 0.5, px: 1.5 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Ingresa el código de área <strong>sin el 0</strong> y el número <strong>sin el 15</strong>.
                </Typography>
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <Typography variant="caption" color="error" display="block">
                    {formik.errors.phoneNumber as string}
                  </Typography>
                )}
              </Box>
            </Box>
         

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
              label="Tipo de atencion"
              name="appointmentType"
              value={formik.values.appointmentType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.appointmentType &&
                Boolean(formik.errors.appointmentType)
              }
              helperText={
                formik.touched.appointmentType && formik.errors.appointmentType
              }
            >
              <MenuItem value="Presencial">Presencial</MenuItem>
              <MenuItem value="Online">Online</MenuItem>
              <MenuItem value="Ambos">Ambos</MenuItem>
            </TextField>

            <AddressAutocomplete
              label="Direccion del consultorio"
              value={formik.values.location}
              error={formik.touched.location && Boolean(formik.errors.location)}
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
              error={formik.touched.province && Boolean(formik.errors.province)}
              helperText={formik.touched.province && formik.errors.province}
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
              error={formik.touched.city && Boolean(formik.errors.city)}
              helperText={formik.touched.city && formik.errors.city}
            />

            <TextField
              label="Matricula nacional"
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
              label="Matricula provincial"
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
                  (specialty) => specialty.id === formik.values.careerId,
                ) ?? null
              }
              getOptionLabel={(specialty) => specialty.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
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

            <TextField
              label="Biografia"
              name="biography"
              multiline
              minRows={3}
              value={formik.values.biography}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.biography && Boolean(formik.errors.biography)
              }
              helperText={formik.touched.biography && formik.errors.biography}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Titulo profesional"
                name="degreeTitle"
                value={formik.values.degreeTitle}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.degreeTitle &&
                  Boolean(formik.errors.degreeTitle)
                }
                helperText={
                  formik.touched.degreeTitle && formik.errors.degreeTitle
                }
              />

              <TextField
                fullWidth
                label="Donde estudiaste"
                name="university"
                value={formik.values.university}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.university && Boolean(formik.errors.university)
                }
                helperText={formik.touched.university && formik.errors.university}
              />
            </Stack>

            <TextField
              label="Anio de recibido"
              name="graduationYear"
              type="number"
              value={formik.values.graduationYear}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.graduationYear &&
                Boolean(formik.errors.graduationYear)
              }
              helperText={
                formik.touched.graduationYear && formik.errors.graduationYear
              }
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
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => {
                void formik.setFieldValue(
                  'specialtyIds',
                  value.map((specialty) => specialty.id),
                );
              }}
              onBlur={() => formik.setFieldTouched('specialtyIds', true)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Especialidades"
                  placeholder={
                    formik.values.careerId
                      ? 'Buscar especialidad'
                      : 'Primero selecciona una carrera'
                  }
                  error={
                    formik.touched.specialtyIds &&
                    Boolean(formik.errors.specialtyIds)
                  }
                  helperText={
                    formik.touched.specialtyIds &&
                    (formik.errors.specialtyIds as string)
                  }
                />
              )}
            />

            <Autocomplete
              multiple
              options={PATIENT_GROUP_OPTIONS}
              value={PATIENT_GROUP_OPTIONS.filter((option) =>
                formik.values.patientGroups.includes(option.id),
              )}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
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
                  placeholder="Bebes, ninios, adultos..."
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
                        next[index] = { ...next[index], title: event.target.value };
                        void formik.setFieldValue('trainings', next);
                      }}
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                        label="Anio"
                        value={training.year}
                        onChange={(event) => {
                          const next = [...formik.values.trainings];
                          next[index] = { ...next[index], year: event.target.value };
                          void formik.setFieldValue('trainings', next);
                        }}
                      />
                    </Stack>
                    <TextField
                      multiline
                      minRows={2}
                      label="Descripcion opcional"
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
                option.acronym ? `${option.acronym} - ${option.name}` : option.name
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => {
                void formik.setFieldValue(
                  'healthInsuranceIds',
                  value.map((healthInsurance) => healthInsurance.id),
                );
              }}
              onBlur={() => formik.setFieldTouched('healthInsuranceIds', true)}
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
          </>
        )}

        {formik.status && (
          <Typography color="error">{formik.status}</Typography>
        )}

        <Button
          sx={{ borderRadius: 1, width: '100%', height: 48 }}
          type="submit"
          variant="contained"
          disabled={
            isLoading ||
            isCreatingProfessional ||
            isCreatingPatient ||
            isLoggingIn
          }
        >
          Registrarme
        </Button>
      </Stack>
    </form>
  );
};
