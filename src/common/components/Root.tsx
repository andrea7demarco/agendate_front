import { Box, Toolbar } from '@mui/material';
import type React from 'react';
import Header from './layout/Header';
import Content from './layout/Content';

const Root: React.FC = () => {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Header />
      <Toolbar />
      <Content />
    </Box>
  );
};

export default Root;
