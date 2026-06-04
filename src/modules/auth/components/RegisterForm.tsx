import {
  Autocomplete,
  Button,
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
  const { data: specialties = [], isLoading: isLoadingSpecialties } =
    useGetSpecialtiesQuery();
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
      dni: '',
      phoneNumber: '',
      consultationCost: 0,
      appointmentType: 'Presencial' as 'Presencial' | 'Online' | 'Ambos',
      address: '',
      province: '',
      nationalLicense: '',
      provincialLicense: '',
      biography: '',
      careerId: null as number | null,
      specialtyIds: [] as number[],
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

        if (values.registrationKind === 'profesional') {
          const specialtyIds = [
            values.careerId,
            ...values.specialtyIds,
          ].filter((id): id is number => typeof id === 'number');

          try {
            const professionalPayload = {
              applicationUserId: registeredUser.userId,
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              dni: values.dni,
              phoneNumber: values.phoneNumber,
              consultationCost: Number(values.consultationCost),
              appointmentType: values.appointmentType,
              address: values.address || null,
              province: values.province,
              nationalLicense: values.nationalLicense,
              provincialLicense: values.provincialLicense,
              biography: values.biography || null,
              specialtyIds: Array.from(new Set(specialtyIds)),
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

            <TextField
              label="Direccion"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address}
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
          </>
        )}

        {formik.status && (
          <Typography color="error">{formik.status}</Typography>
        )}

        <Button
          sx={{ borderRadius: 1, width: '100%', height: 48 }}
          type="submit"
          variant="contained"
          disabled={isLoading || isCreatingProfessional || isLoggingIn}
        >
          Registrarme
        </Button>
      </Stack>
    </form>
  );
};
