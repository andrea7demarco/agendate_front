import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GuestGuard } from './guards/GuestGuard';
import { LoginPage } from '../../modules/auth/pages/LoginPage';
import { RegisterPage } from '../../modules/auth/pages/RegisterPage';
import { CompleteRegistrationPage } from '../../modules/auth/pages/CompleteRegistrationPage';
import { UnauthorizedPage } from '../../modules/auth/pages/UnauthorizedPage';
import { HomeRedirect } from './guards/HomeRedirect';
import { AuthGuard } from './guards/AuthGuard';
import { CompletedRegistrationGuard } from './guards/CompletedRegistrationGuard';
import { ProfessionalsCatalogPage } from '../../modules/catalogo/pages/ProfessionalCatalogPage';
import { ProfessionalDetailPage } from '../../modules/catalogo/pages/ProfessionalDetailPage'; // <-- agregar
import Root from '../../common/components/Root';
import { MyProfilePage } from '../../modules/profile/pages/MyProfilePage';
import { EditMyProfilePage } from '../../modules/profile/pages/EditMyProfilePage';


export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Root />}>
          <Route element={<CompletedRegistrationGuard />}>
            <Route index element={<ProfessionalsCatalogPage />} />
            <Route path="catalog" element={<ProfessionalsCatalogPage />} />
            <Route path="profesionales/:id" element={<ProfessionalDetailPage />} /> {/* <-- agregar */}
          </Route>
          <Route path="unauthorized" element={<UnauthorizedPage />} />
          <Route element={<GuestGuard />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          <Route element={<AuthGuard />}>
            <Route path="home" element={<HomeRedirect />} />
            <Route path="complete-registration" element={<CompleteRegistrationPage />} />
            <Route path="mi-perfil" element={<MyProfilePage />} />
            <Route path="mi-perfil/editar" element={<EditMyProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
