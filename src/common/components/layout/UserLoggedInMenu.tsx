import {
  Avatar,
  Box,
  Divider,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types/auth';
import { useLogoutMutation } from '../../../modules/auth/api/authApi';
import { clearCredentials } from '../../../modules/auth/store/authSlice';
import { useAppDispatch } from '../../../app/hooks';

type UserMenuProps = {
  loggedUser: User | null;
  anchorEl: HTMLElement | null;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
};

const UserLoggedInMenu: React.FC<UserMenuProps> = ({
  loggedUser,
  anchorEl,
  setAnchorEl,
}) => {
  const open = Boolean(anchorEl);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = (
  event: React.MouseEvent<HTMLLIElement>
  ) => {
  event.currentTarget.blur();
  handleClose();

  setTimeout(() => {
    navigate('/mi-perfil');
  }, 0);
  };

  

  const handleLogout = async (
  event: React.MouseEvent<HTMLLIElement>
) => {
  event.currentTarget.blur();
  handleClose();

  try {
    await logout().unwrap();
  } finally {
    dispatch(clearCredentials());

    setTimeout(() => {
      navigate('/');
    }, 0);
  }
};

  const initials = loggedUser
    ? `${loggedUser.firstName?.[0] ?? ''}${loggedUser.lastName?.[0] ?? ''}`
    : 'U';

  return (
    <Menu
      id="user-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      sx={{ mt: 1.5, mr: 0.75 }}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={2}
        width="100%"
        padding={1}
      >
        <Avatar
          sx={{
            bgcolor: 'primary.light',
            display: 'flex',
          }}
        >
          {initials}
        </Avatar>

        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          width="100%"
        >
          <Typography>
            {loggedUser
              ? `${loggedUser.firstName} ${loggedUser.lastName}`
              : 'Usuario'}
          </Typography>

          <Typography sx={{ fontSize: '0.9em', color: '#888' }}>
            {loggedUser?.email ?? ''}
          </Typography>
        </Box>
      </Box>

      <Divider />

      <MenuItem
        sx={{
          display: 'flex',
          gap: '5px',
          minWidth: '200px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onClick={handleProfile}
      >
        Perfil
        <ProfileIcon />
      </MenuItem>

      <Divider />

      <MenuItem
        sx={{
          display: 'flex',
          gap: '5px',
          minWidth: '200px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onClick={handleLogout}
      >
        Cerrar sesión
        <LogoutIcon />
      </MenuItem>
    </Menu>
  );
};

export default UserLoggedInMenu;
