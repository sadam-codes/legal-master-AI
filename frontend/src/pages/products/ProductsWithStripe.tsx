import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Products from "./index";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

export default function ProductsWithStripe() {
  return (
    <Elements stripe={stripePromise}>
      <Products />
    </Elements>
  );
}
