import CloseIcon from '@mui/icons-material/Close';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  type ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  Grid,
  IconButton,
  styled,
  Typography,
} from '@mui/material';
import React from 'react';

type SoftyDialogProps = {
  title: string;
  onSave: () => void;
  onCancel: () => void;
  description?: string;
  mainButtonProps: ButtonProps & { label: string };
  isLoading: boolean;
} & DialogProps;

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const BootstrapDialogTitle = ({
  children,
  onClose,
  ...other
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) => {
  return (
    <DialogTitle
      {...other}
      sx={{
        m: 0,
        p: 2,
        fontWeight: 'bolder',
      }}
    >
      <Typography variant="h6" component="div" fontWeight="bolder">
        {children}
      </Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

const ConfirmationPopup: React.FC<SoftyDialogProps> = (props) => {
  return (
    <BootstrapDialog
      aria-labelledby="customized-dialog-title"
      open={props.open}
      maxWidth="sm"
    >
      <BootstrapDialogTitle onClose={props.onCancel}>
        {props.title}
      </BootstrapDialogTitle>
      {props.description && (
        <DialogContent dividers>
          <Typography variant="body2" gutterBottom>
            {props.description}
          </Typography>
        </DialogContent>
      )}
      <DialogActions>
        <Grid container spacing={1} p={1} justifyContent="flex-end">
          <Grid>
            <Button
              variant="contained"
              color="inherit"
              disableElevation
              autoFocus
              onClick={props.onCancel}
              sx={{ marginRight: 1 }}
            >
              Cancelar
            </Button>
            <LoadingButton
              variant="contained"
              disableElevation
              autoFocus
              loading={props.isLoading}
              onClick={props.onSave}
              {...props.mainButtonProps}
            >
              {props.mainButtonProps.label}
            </LoadingButton>
          </Grid>
        </Grid>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default ConfirmationPopup;
