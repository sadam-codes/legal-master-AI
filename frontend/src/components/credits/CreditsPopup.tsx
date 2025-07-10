import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CreditsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditsPopup({ isOpen, onClose }: CreditsPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px]">
        <DialogHeader>
          <DialogTitle>Purchase Credits</DialogTitle>
        </DialogHeader>
        <div className="relative overflow-hidden h-[500px] w-full">
          <iframe
            title="Donation form powered by Zeffy"
            style={{
              position: "absolute",
              border: 0,
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              width: "100%",
              height: "100%",
            }}
            src="https://www.zeffy.com/embed/ticketing/subscriptions"
            allow="payments"
            allowTransparency={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 