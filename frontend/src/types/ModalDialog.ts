export interface ModalDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: "alert" | "confirm";
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}
