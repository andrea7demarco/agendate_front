import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

const Content = () => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        overflow: 'auto',
        width: '100%',
      }}
    >
      <Outlet />
    </Box>
  );
};

export default Content;
