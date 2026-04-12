import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

type ToastProps = {
  open: boolean;
  title: string;
  description?: string;
};

const Toast = ({ open, title, description }: ToastProps) => {
  if (!open) return null;

  return (
    <Alert className="max-w-md fixed bottom-4 right-4 z-50">
      <AlertTitle>{title}</AlertTitle>

      <div className="flex items-center gap-2 mt-2">
        <Spinner className="size-5" />

        {description && (
          <AlertDescription>
            {description}
          </AlertDescription>
        )}
      </div>
    </Alert>
  );
};

export default Toast;