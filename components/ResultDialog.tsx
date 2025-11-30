import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  message: string;
  onClose: () => void;
}

export function ResultDialog({ open, message, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="text-center space-y-4">
        <h3 className="text-lg font-semibold">{message}</h3>
        <p className="text-muted-foreground">
          The Merchant will be notified accordingly.
        </p>
        <Button onClick={onClose}>Okay</Button>
      </DialogContent>
    </Dialog>
  );
}
