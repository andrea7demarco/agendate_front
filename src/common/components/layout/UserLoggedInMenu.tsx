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
import type { User } from '../../types/auth';
import { useLogoutMutation } from '../../../modules/auth/api/authApi';
import { clearCredentials } from '../../../modules/auth/store/authSlice';
import { useAppDispatch } from '../../../app/hooks';

type UserMenuProps = {
  loggedUser: User | null;
  anchorEl: null | HTMLElement;
  setAnchorEl: (anchorEl: null | HTMLElement) => void;
};

const UserLoggedInMenu: React.FC<UserMenuProps> = (props) => {
  const { loggedUser, anchorEl, setAnchorEl } = props;
  const open = Boolean(anchorEl);

  const [logout] = useLogoutMutation();
  const dispatch = useAppDispatch();

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout().unwrap();
    dispatch(clearCredentials());
    handleClose();
  };

  return (
    <Menu
      id="user-menu"
      aria-labelledby="user-menu"
      style={{ marginTop: 12, marginRight: 6 }}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
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
          {loggedUser
            ? `${loggedUser.firstName[0]}${loggedUser.lastName[0]}`
            : 'U'}
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
          <Typography style={{ fontSize: '0.9em', color: '#888' }}>
            {loggedUser ? loggedUser.email : ''}
          </Typography>
        </Box>
      </Box>

      <Divider orientation="horizontal" />
      <MenuItem
        sx={{
          display: 'flex',
          gap: '5px',
          minWidth: '200px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onClick={() => console.log('Profile clicked')}
      >
        Perfil
        <ProfileIcon />
      </MenuItem>

      <Divider orientation="horizontal" />
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
        Cerrar Sesion
        <LogoutIcon />
      </MenuItem>
    </Menu>
  );
};

export default UserLoggedInMenu;
