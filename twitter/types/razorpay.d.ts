export {};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }

  interface RazorpayOptions {
    key: string;
    subscription_id: string;

    name: string;
    description: string;

    handler: (
      response: RazorpayPaymentResponse
    ) => void | Promise<void>;
  }

  interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }

  interface RazorpayInstance {
    open(): void;
  }
}