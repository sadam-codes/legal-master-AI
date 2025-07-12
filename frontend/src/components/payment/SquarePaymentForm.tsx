
import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import api from "@/services/api";
import useUserStore from "@/store/useUserStore";

interface StripePaymentFormProps {
  amount: number;
  planId?: string;
  creditAmount?: number;
  onPaymentSuccess: (paymentResult: any) => void;
  onPaymentError: (error: any) => void;
  disabled?: boolean;
}

export default function StripePaymentForm({
  amount,
  planId,
  creditAmount,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUserStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePaymentSubmit = async () => {
    if (!stripe || !elements) {
      toast({
        title: "Stripe Not Ready",
        description: "Please wait for Stripe to load.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const intentRes: any = await api.post("/payments/process", {
        amount,
        currency: "usd",
        creditAmount,
        planId,
      });

      const clientSecret = intentRes.data.clientSecret;

      // Step 2: Confirm Card Payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: user?.name || "Unknown User",
            email: user?.email || "",
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent?.status === "succeeded") {
        // Step 3: Confirm credits/subscription on backend
        const confirmRes = await api.post("/payment/confirm", {
          
          paymentIntentId: result.paymentIntent.id,
          planId,
          creditAmount,
        });

        onPaymentSuccess(confirmRes.data.data);
      } else {
        throw new Error("Payment not successful.");
      }
    } catch (error: any) {
      console.error("Stripe payment error:", error);
      onPaymentError(error);
      toast({
        title: "Payment Failed",
        description:
          error.message || "There was an error processing your payment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label>Card Information</Label>
          <div
            className={`border p-3 rounded-md min-h-[40px] ${
              disabled ? "opacity-70 pointer-events-none" : ""
            }`}
          >
            <CardElement />
          </div>
        </div>

        <Button
          onClick={handlePaymentSubmit}
          disabled={loading || disabled}
          className="w-full"
        >
          {loading ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
        </Button>
      </CardContent>
    </Card>
  );
}
