import React from "react";
import { ModalDialogProps } from "@/types";
import { Button } from "../ui/button";

const ModalDialog: React.FC<ModalDialogProps> = ({
  isOpen,
  title,
  message,
  type = "alert",
  onConfirm,
  onCancel,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (type === "alert") {
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-card rounded-xl p-6 md:p-8 w-[90%] max-w-md shadow-xl animate-fadeIn">
        {title && (
          <h3 className="text-xl font-bold mb-4 text-center text-foreground">
            {title}
          </h3>
        )}
        <p className="mb-6 text-center text-muted-foreground text-base">
          {message}
        </p>
        <div className="flex justify-center gap-4">
          {type === "confirm" ? (
            <>
              <Button
                onClick={onCancel}
                variant="outline"
                className="px-6 py-2 min-w-[100px]"
              >
                No
              </Button>
              <Button
                onClick={onConfirm}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 min-w-[100px]"
              >
                Yes
              </Button>
            </>
          ) : (
            <Button
              onClick={handleClose}
              className="px-8 py-2 bg-blue-600 text-white hover:bg-blue-700 min-w-[120px]"
            >
              OK
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalDialog;
