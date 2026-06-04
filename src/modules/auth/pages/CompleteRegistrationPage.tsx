import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { Navigate, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAppDispatch } from '../../../app/hooks';
import { getHomePathByRole } from '../../../common/utils/auth';
import {
  useCompleteRegistrationMutation,
} from '../api/authApi';
import { setCredentials } from '../store/authSlice';
import { useAuth } from '../../../common/hooks/useAuth';
import {
  useGetSpecialtiesQuery,
} from '../../catalogo/api/professionalsApi';
import type { Specialty } from '../../catalogo/types/professional.types';

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
  careerId: Yup.number().when('registrationKind', {
    is: 'profesional',
    then: (schema) =>
      schema
        .typeError('Selecciona una carrera')
        .required('Selecciona una carrera'),
    otherwise: (schema) => schema.optional(),
  }),
});

export const CompleteRegistrationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [completeRegistration, { isLoading }] =
    useCompleteRegistrationMutation();
  const { data: specialties = [], isLoading: isLoadingSpecialties } =
    useGetSpecialtiesQuery();

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
    validationSchema: completeRegistrationSchema,
    onSubmit: async (values, helpers) => {
      try {
        const specialtyIds = [
          values.careerId,
          ...values.specialtyIds,
        ].filter((id): id is number => typeof id === 'number');

        const response = await completeRegistration({
          registrationKind: values.registrationKind,
          dni: values.dni || null,
          phoneNumber: values.phoneNumber || null,
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
          nationalLicense: values.nationalLicense || null,
          provincialLicense: values.provincialLicense || null,
          biography: values.biography || null,
          specialtyIds:
            values.registrationKind === 'profesional'
              ? Array.from(new Set(specialtyIds))
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

        navigate(getHomePathByRole(response.user.role));
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

  if (!user) return <Navigate to="/login" replace />;
  if (user.registrationCompleted) {
    return <Navigate to={getHomePathByRole(user.role)} replace />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
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
                      formik.touched.appointmentType &&
                      formik.errors.appointmentType
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

                  <TextField
                    label="Biografia"
                    name="biography"
                    multiline
                    minRows={3}
                    value={formik.values.biography}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
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
