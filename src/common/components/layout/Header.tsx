import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
} from '@mui/material';
import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { useLocation, useNavigate } from 'react-router-dom';
import UserLoggedInMenu from './UserLoggedInMenu';
import { useAuth } from '../../hooks/useAuth';
import { ProfessionalSearchBar } from './ProfessionalSearchBar';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const loggedUser = useAuth().user;

  const isLoggedIn = Boolean(loggedUser);
  const hasCompletedRegistration = Boolean(loggedUser?.registrationCompleted);
  const isAdmin = loggedUser?.role === 'admin';
  const showProfessionalSearch =
    isLoggedIn &&
    hasCompletedRegistration &&
    location.pathname !== '/complete-registration';

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        width: '100%',
        bgcolor: 'background.default',
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ borderRadius: 0, boxShadow: 'none' }}
      >
        <Toolbar sx={{ minHeight: 65, px: { xs: 1, sm: 2 } }}>
          {/* Bloque izquierdo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              minWidth: { xs: 'auto', sm: 220 },
            }}
          >
            {isAdmin && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                sx={{ mr: 1 }}
                disableRipple
              >
                <MenuIcon />
              </IconButton>
            )}

            {isLoggedIn && hasCompletedRegistration && (
              <Button
                color="inherit"
                startIcon={<HomeRoundedIcon />}
                onClick={() => navigate('/')}
                sx={{
                  minWidth: { xs: 40, sm: 'auto' },
                  px: { xs: 1, sm: 2 },
                  '& .MuiButton-startIcon': {
                    mr: { xs: 0, sm: 1 },
                  },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Inicio
                </Box>
              </Button>
            )}
          </Box>

          {/* Bloque central */}
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'center',
              px: { xs: 0.5, sm: 2 },
            }}
          >
            {showProfessionalSearch && <ProfessionalSearchBar />}
          </Box>

          {/* Bloque derecho */}
          <Box
            sx={{
              minWidth: { xs: 'auto', sm: 220 },
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            {!isLoggedIn ? (
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => navigate('/login')}
                >
                  Iniciar sesión
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate('/register')}
                >
                  Registrarse
                </Button>
              </Stack>
            ) : hasCompletedRegistration ? (
              <Avatar
                sx={{
                  bgcolor: 'primary.light',
                  cursor: 'pointer',
                  height: 40,
                  width: 40,
                  objectFit: 'contain',
                  fontSize: '1rem',
                  ml: 2,
                }}
                onClick={handleAvatarClick}
              >
                {`${loggedUser?.firstName[0]}${loggedUser?.lastName[0]}`}
              </Avatar>
            ) : null}
          </Box>

          {isLoggedIn && hasCompletedRegistration && (
            <UserLoggedInMenu
              loggedUser={loggedUser}
              anchorEl={anchorEl}
              setAnchorEl={setAnchorEl}
            />
          )}
        </Toolbar>
      </AppBar>
    </Container>
  );
};

export default Header;
