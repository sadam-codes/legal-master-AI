import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import useUserStore from "@/store/useUserStore";
import { CardElement } from "@stripe/react-stripe-js";
import api from "@/services/api";

interface PaymentMethod {
  id: string;
  cardType: string;
  lastFourDigits: string;
  cardholderName: string;
  isDefault: boolean;
}

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentMethodSelect: (paymentMethodId: string) => void;
  onDirectPayment: (paymentResult: undefined) => void;
  amount: number;
  planId: string;
  processingPayment?: boolean;
}

export default function PaymentMethodModal({
  isOpen,
  onClose,
  onPaymentMethodSelect,
  onDirectPayment,
  amount,
  processingPayment = false,
}: PaymentMethodModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddNew, setShowAddNew] = useState(false);
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState("direct-payment");

  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    try {
      const response = await api.get(`/payment`);
      setPaymentMethods(response.data.data || []);
      if (response.data.data?.length === 0) {
        setShowAddNew(true);
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={processingPayment ? undefined : onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="direct-payment"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          {/* Stripe Card Payment Tab */}
          <TabsContent value="direct-payment" className="space-y-4">
            <div className="space-y-2">
              <Label>Card Details</Label>
              <div className="border p-4 rounded bg-white">
                <CardElement options={{ hidePostalCode: true }} />
              </div>
            </div>

            <DialogFooter>
              <Button
                className="w-full"
                onClick={() => onPaymentMethodSelect("card")}
                disabled={processingPayment}
              >
                {processingPayment ? "Processing..." : "Pay Now"}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Optional Saved Cards Section – Not used if only Stripe */}
          <TabsContent value="saved-cards">
            <div className="space-y-4">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded p-4 cursor-pointer hover:border-primary ${
                      processingPayment ? "opacity-50 pointer-events-none" : ""
                    }`}
                    onClick={() => !processingPayment && onPaymentMethodSelect(method.id)}
                  >
                    <p className="font-medium">
                      {method.cardType} ending in {method.lastFourDigits}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {method.cardholderName}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No saved payment methods.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
