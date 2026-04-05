import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GuestGuard } from './guards/GuestGuard';
import { LoginPage } from '../../modules/auth/pages/LoginPage';
import { RegisterPage } from '../../modules/auth/pages/RegisterPage';
import { UnauthorizedPage } from '../../modules/auth/pages/UnauthorizedPage';
import { HomeRedirect } from './guards/HomeRedirect';
import { AuthGuard } from './guards/AuthGuard';
import { ProfessionalsCatalogPage } from '../../modules/catalogo/pages/ProfessionalCatalogPage';
import Root from '../../common/components/Root';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Root />}>
          <Route index element={<ProfessionalsCatalogPage />} />
          <Route path="catalog" element={<ProfessionalsCatalogPage />} />
          <Route path="unauthorized" element={<UnauthorizedPage />} />

          <Route element={<GuestGuard />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          <Route element={<AuthGuard />}>
            <Route path="home" element={<HomeRedirect />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
