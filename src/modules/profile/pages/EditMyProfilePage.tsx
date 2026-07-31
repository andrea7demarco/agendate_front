import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { ARGENTINA_PROVINCES } from '../../../common/constants/provinces';
import { useGetHealthInsurancesQuery } from '../../healthInsurances/api/healthInsurancesApi';
import { useGetSpecialtiesQuery } from '../../catalogo/api/professionalsApi';
import {
  useGetMyProfileQuery,
  useUpdatePatientProfileMutation,
  useUpdateProfessionalProfileMutation,
} from '../api/profileApi';
import type {
  PatientProfile,
  ProfessionalProfile,
} from '../types/profile.types';
import { AvailabilitySelector } from '../../../common/components/AvailabilitySelector';
import { PATIENT_GROUP_OPTIONS } from '../../../common/constants/professionalOptions';

type ApiError = {
  data?: {
    title?: string;
    detail?: string;
    errors?: Record<string, string[]>;
  };
};

const getErrorMessage = (error: unknown) => {
  const data = (error as ApiError)?.data;
  return (
    (data?.errors && Object.values(data.errors).flat()[0]) ||
    data?.detail ||
    data?.title ||
    'No se pudo actualizar el perfil.'
  );
};

const patientSchema = Yup.object({
  firstName: Yup.string().required('El nombre es obligatorio'),
  lastName: Yup.string().required('El apellido es obligatorio'),
  birthDate: Yup.date()
    .max(new Date(), 'La fecha debe ser anterior a hoy')
    .required('La fecha de nacimiento es obligatoria'),
  gender: Yup.number()
    .oneOf([1, 2, 3], 'Selecciona un genero')
    .required('El genero es obligatorio'),
  hasCud: Yup.boolean().required(),
  healthInsurances: Yup.array()
    .of(
      Yup.object({
        healthInsuranceId: Yup.number().required(),
        affiliateNumber: Yup.string().nullable().optional(),
        planName: Yup.string().nullable().optional(),
      }),
    )
    .optional(),
});

const professionalSchema = Yup.object({
  firstName: Yup.string().required('El nombre es obligatorio'),
  lastName: Yup.string().required('El apellido es obligatorio'),
  phoneNumber: Yup.string().required('El telefono es obligatorio'),
  consultationCost: Yup.number()
    .min(0, 'El costo no puede ser negativo')
    .required('El costo es obligatorio'),
  appointmentType: Yup.string()
    .oneOf(['Presencial', 'Online', 'Ambos'])
    .required('La modalidad es obligatoria'),
  province: Yup.string().required('La provincia es obligatoria'),
  nationalLicense: Yup.string().required('La matricula nacional es obligatoria'),
  provincialLicense: Yup.string()
    .matches(/^\d+$/, 'La matricula provincial debe ser numerica')
    .required('La matricula provincial es obligatoria'),
  specialtyIds: Yup.array()
    .of(Yup.number().required())
    .min(1, 'Selecciona al menos una especialidad'),
  healthInsuranceIds: Yup.array().of(Yup.number().required()).optional(),
  biography: Yup.string().max(200, 'La biografia admite hasta 200 caracteres'),
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
          .min(1900, 'El año del curso no es valido')
          .max(new Date().getFullYear(), 'El año del curso no puede ser futuro')
          .optional(),
        description: Yup.string().optional(),
      }),
    )
    .optional(),
});

const genderToNumber = (gender: string) => {
  if (gender === 'Masculino') return 1;
  if (gender === 'Femenino') return 2;
  return 3;
};

const PatientEditForm = ({ profile }: { profile: PatientProfile }) => {
  const [updatePatient, { isLoading }] = useUpdatePatientProfileMutation();
  const { data: healthInsurances = [], isLoading: loadingHealthInsurances } =
    useGetHealthInsurancesQuery();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      birthDate: profile.birthDate,
      gender: genderToNumber(profile.gender),
      hasCud: profile.hasCud,
      healthInsurances: profile.healthInsurances.map((healthInsurance) => ({
        healthInsuranceId: healthInsurance.id,
        affiliateNumber: healthInsurance.affiliateNumber ?? '',
        planName: healthInsurance.planName ?? '',
      })),
    },
    validationSchema: patientSchema,
    onSubmit: async (values, helpers) => {
      try {
        helpers.setStatus(undefined);

        await updatePatient({
          id: profile.id,
          body: {
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            birthDate: values.birthDate,
            gender: Number(values.gender),
            hasCud: Boolean(values.hasCud),
            healthInsurances: values.healthInsurances.map((item) => ({
              healthInsuranceId: Number(item.healthInsuranceId),
              affiliateNumber: item.affiliateNumber?.trim() || null,
              planName: item.planName?.trim() || null,
            })),
          },
        }).unwrap();
        enqueueSnackbar('Perfil actualizado', { variant: 'success' });
        navigate('/mi-perfil');
      } catch (error) {
        const message = getErrorMessage(error);
        helpers.setStatus(message);
        enqueueSnackbar(message, { variant: 'error' });
      }
    },
  });

  const selectedHealthInsurances = healthInsurances.filter((healthInsurance) =>
    formik.values.healthInsurances.some(
      (item) => item.healthInsuranceId === healthInsurance.id,
    ),
  );

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Stack spacing={2.5}>
        <TextField
          label="Nombre"
          name="firstName"
          value={formik.values.firstName}
          onChange={formik.handleChange}
          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
          helperText={formik.touched.firstName && formik.errors.firstName}
        />
        <TextField
          label="Apellido"
          name="lastName"
          value={formik.values.lastName}
          onChange={formik.handleChange}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName && formik.errors.lastName}
        />
        <TextField label="Email" value={profile.email} disabled />
        <TextField
          label="Fecha de nacimiento"
          name="birthDate"
          type="date"
          value={formik.values.birthDate}
          onChange={formik.handleChange}
          slotProps={{ inputLabel: { shrink: true } }}
          error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
          helperText={formik.touched.birthDate && formik.errors.birthDate}
        />
        <TextField
          select
          label="Género"
          name="gender"
          value={formik.values.gender}
          onChange={formik.handleChange}
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
          label="Tiene Certificado Único de Discapacidad (CUD)"
        />
        <Autocomplete
          multiple
          options={healthInsurances}
          value={selectedHealthInsurances}
          getOptionLabel={(option) =>
            option.acronym ? `${option.acronym} - ${option.name}` : option.name
          }
          isOptionEqualToValue={(option, value) => option.id === value.id}
          loading={loadingHealthInsurances}
          noOptionsText={
            loadingHealthInsurances
              ? 'Cargando obras sociales...'
              : 'No hay obras sociales cargadas'
          }
          onChange={(_, values) => {
            const next = values.map((value) => {
              const existing = formik.values.healthInsurances.find(
                (item) => item.healthInsuranceId === value.id,
              );

              return {
                healthInsuranceId: value.id,
                affiliateNumber: existing?.affiliateNumber ?? '',
                planName: existing?.planName ?? '',
              };
            });

            void formik.setFieldValue('healthInsurances', next);
          }}
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
        {formik.values.healthInsurances.map((item, index) => {
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
              <Typography fontWeight={700} mb={1.5}>
                {healthInsurance
                  ? `${healthInsurance.acronym} - ${healthInsurance.name}`
                  : 'Obra social'}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Número de afiliado"
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
                  fullWidth
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
        {formik.status && (
          <Alert severity="error">{formik.status}</Alert>
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button fullWidth variant="outlined" onClick={() => navigate('/mi-perfil')}>
            Cancelar
          </Button>
          <Button fullWidth type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

const ProfessionalEditForm = ({
  profile,
}: {
  profile: ProfessionalProfile;
}) => {
  const [updateProfessional, { isLoading }] =
    useUpdateProfessionalProfileMutation();
  const { data: specialties = [], isLoading: loadingSpecialties } =
    useGetSpecialtiesQuery();
  const { data: healthInsurances = [], isLoading: loadingHealthInsurances } =
    useGetHealthInsurancesQuery();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      dni: profile.dni ?? '',
      phoneNumber: profile.phoneNumber ?? '',
      consultationCost: profile.consultationCost,
      appointmentType: profile.appointmentType as
        | 'Presencial'
        | 'Online'
        | 'Ambos',
      address: profile.address ?? '',
      province: profile.province ?? '',
      nationalLicense: profile.nationalLicense ?? '',
      provincialLicense: profile.provincialLicense ?? '',
      biography: profile.biography ?? '',
      degreeTitle: profile.degreeTitle ?? '',
      university: profile.university ?? '',
      graduationYear: profile.graduationYear?.toString() ?? '',
      specialtyIds: profile.specialties.map((specialty) => specialty.id),
      healthInsuranceIds: profile.healthInsurances.map(
        (healthInsurance) => healthInsurance.id,
      ),
      availabilities: (profile.availabilities ?? []).map((availability) => ({
        dayOfWeek: availability.dayOfWeek,
        timeSlot: availability.timeSlot,
      })),
      patientGroups: (profile.patientGroups ?? []).map(
        (patientGroup) => patientGroup.id,
      ),
      trainings: (profile.trainings ?? []).map((training) => ({
        title: training.title,
        institution: training.institution ?? '',
        year: training.year?.toString() ?? '',
        description: training.description ?? '',
      })),
    },
    validationSchema: professionalSchema,
    onSubmit: async (values) => {
      try {
        await updateProfessional({
          id: profile.id,
          body: {
            ...values,
            email: profile.email,
            graduationYear: values.graduationYear
              ? Number(values.graduationYear)
              : null,
            trainings: values.trainings.map((training) => ({
              title: training.title,
              institution: training.institution || null,
              year: training.year ? Number(training.year) : null,
              description: training.description || null,
            })),
          },
        }).unwrap();
        enqueueSnackbar('Perfil actualizado', { variant: 'success' });
        navigate('/mi-perfil');
      } catch (error) {
        enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
      }
    },
  });

  const selectedSpecialties = specialties.filter((specialty) =>
    formik.values.specialtyIds.includes(specialty.id),
  );

  const selectedHealthInsurances = healthInsurances.filter((healthInsurance) =>
    formik.values.healthInsuranceIds.includes(healthInsurance.id),
  );

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Nombre"
            name="firstName"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
          />
          <TextField
            fullWidth
            label="Apellido"
            name="lastName"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
          />
        </Stack>
        <TextField label="Email" value={profile.email} disabled />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="DNI"
            name="dni"
            value={formik.values.dni}
            onChange={formik.handleChange}
          />
          <TextField
            fullWidth
            label="Teléfono"
            name="phoneNumber"
            value={formik.values.phoneNumber}
            onChange={formik.handleChange}
            error={
              formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)
            }
            helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            type="number"
            label="Costo de consulta"
            name="consultationCost"
            value={formik.values.consultationCost}
            onChange={formik.handleChange}
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
            fullWidth
            select
            label="Modalidad"
            name="appointmentType"
            value={formik.values.appointmentType}
            onChange={formik.handleChange}
          >
            <MenuItem value="Presencial">Presencial</MenuItem>
            <MenuItem value="Online">Online</MenuItem>
            <MenuItem value="Ambos">Presencial y online</MenuItem>
          </TextField>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            select
            label="Provincia"
            name="province"
            value={formik.values.province}
            onChange={formik.handleChange}
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
            fullWidth
            label="Direccion"
            name="address"
            value={formik.values.address}
            onChange={formik.handleChange}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Matrícula nacional"
            name="nationalLicense"
            value={formik.values.nationalLicense}
            onChange={formik.handleChange}
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
            fullWidth
            label="Matrícula provincial"
            name="provincialLicense"
            value={formik.values.provincialLicense}
            onChange={formik.handleChange}
            error={
              formik.touched.provincialLicense &&
              Boolean(formik.errors.provincialLicense)
            }
            helperText={
              formik.touched.provincialLicense &&
              formik.errors.provincialLicense
            }
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Título profesional"
            name="degreeTitle"
            value={formik.values.degreeTitle}
            onChange={formik.handleChange}
            error={
              formik.touched.degreeTitle && Boolean(formik.errors.degreeTitle)
            }
            helperText={formik.touched.degreeTitle && formik.errors.degreeTitle}
          />
          <TextField
            fullWidth
            label="Universidad"
            name="university"
            value={formik.values.university}
            onChange={formik.handleChange}
            error={formik.touched.university && Boolean(formik.errors.university)}
            helperText={formik.touched.university && formik.errors.university}
          />
        </Stack>
        <TextField
          type="number"
          label="Año de recibido"
          name="graduationYear"
          value={formik.values.graduationYear}
          onChange={formik.handleChange}
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
          options={specialties}
          value={selectedSpecialties}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          loading={loadingSpecialties}
          onChange={(_, values) =>
            formik.setFieldValue(
              'specialtyIds',
              values.map((value) => value.id),
            )
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Especialidades"
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
          onChange={(_, values) =>
            formik.setFieldValue(
              'patientGroups',
              values.map((value) => value.id),
            )
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tipos de pacientes que atiende"
              placeholder="Bebes, niños, adultos..."
            />
          )}
        />
        <AvailabilitySelector
          value={formik.values.availabilities}
          onChange={(value) => formik.setFieldValue('availabilities', value)}
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
                    label="Año"
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
        <Autocomplete
          multiple
          options={healthInsurances}
          value={selectedHealthInsurances}
          getOptionLabel={(option) =>
            option.acronym ? `${option.acronym} - ${option.name}` : option.name
          }
          isOptionEqualToValue={(option, value) => option.id === value.id}
          loading={loadingHealthInsurances}
          noOptionsText={
            loadingHealthInsurances
              ? 'Cargando obras sociales...'
              : 'No hay obras sociales cargadas'
          }
          onChange={(_, values) =>
            formik.setFieldValue(
              'healthInsuranceIds',
              values.map((value) => value.id),
            )
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
        <TextField
          multiline
          minRows={4}
          label="Biografía"
          name="biography"
          value={formik.values.biography}
          onChange={formik.handleChange}
          error={formik.touched.biography && Boolean(formik.errors.biography)}
          helperText={formik.touched.biography && formik.errors.biography}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button fullWidth variant="outlined" onClick={() => navigate('/mi-perfil')}>
            Cancelar
          </Button>
          <Button fullWidth type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export const EditMyProfilePage = () => {
  const { data, isLoading, isError } = useGetMyProfileQuery();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error">No se pudo cargar tu perfil.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          Editar mi perfil
        </Typography>
        {data.profileType === 'paciente' ? (
          <PatientEditForm profile={data.profile} />
        ) : (
          <ProfessionalEditForm profile={data.profile} />
        )}
      </Paper>
    </Container>
  );
};
