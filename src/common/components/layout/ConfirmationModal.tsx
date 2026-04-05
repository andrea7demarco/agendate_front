import Button, { type ButtonTypeMap } from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import type { PropsWithChildren } from 'react';

type ConfirmationModalProps = PropsWithChildren<{
  onConfirm: () => void;
  onCancel?: () => void;
  open: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel?: string;
  mainButtonType: ButtonTypeMap['props']['color'];
  mainButtonVariant?: 'text' | 'outlined' | 'contained';
  defaultAction?: 'confirm' | 'cancel';
}>;

const ConfirmationModal: React.FC<ConfirmationModalProps> = (props) => {
  const {
    onConfirm,
    onCancel,
    open,
    title,
    confirmLabel,
    cancelLabel,
    mainButtonType,
    mainButtonVariant = 'contained',
    defaultAction = 'confirm',
    children,
  } = props;

  return (
    <div>
      <Dialog open={open} fullWidth maxWidth="sm">
        <DialogTitle id="customized-dialog-title">{title}</DialogTitle>
        <DialogContent dividers>{children}</DialogContent>
        <DialogActions>
          {cancelLabel && (
            <Button
              autoFocus={defaultAction === 'cancel'}
              onClick={onCancel}
              size="small"
              variant="text"
              color="inherit"
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            autoFocus={defaultAction === 'confirm'}
            onClick={onConfirm}
            variant={mainButtonVariant}
            color={mainButtonType}
            size="small"
            disableElevation
          >
            {confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConfirmationModal;
