import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ApproveDialog({ open, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="text-center space-y-4">
        <h3 className="font-semibold text-lg">Proceeding with Approval?</h3>
        <p className="text-muted-foreground">
          This action will mark the request as approved and notify the Merchant.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Yes, Proceed</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
