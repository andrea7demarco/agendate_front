import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import UserLoggedInMenu from './UserLoggedInMenu';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const loggedUser = useAuth().user;

  const isLoggedIn = Boolean(loggedUser);
  const isAdmin = loggedUser?.role === 'admin';
  const isPatient = loggedUser?.role === 'paciente';

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
              minWidth: 120,
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
          </Box>

          {/* Bloque central */}
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'center',
              px: 2,
            }}
          >
            {isPatient && (
              <TextField
                variant="outlined"
                size="small"
                placeholder="Buscar profesional..."
                sx={{
                  width: '100%',
                  maxWidth: 420,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                }}
              />
            )}
          </Box>

          {/* Bloque derecho */}
          <Box
            sx={{
              minWidth: 220,
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
            ) : (
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
            )}
          </Box>

          {isLoggedIn && (
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
