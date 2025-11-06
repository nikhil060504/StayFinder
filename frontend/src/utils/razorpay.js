/**
 * Razorpay Payment Integration Utility
 * Handles payment initiation and verification
 */

export const initiateRazorpayPayment = async ({
  keyId,
  orderId,
  amount,
  currency = "INR",
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onError,
}) => {
  try {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      const options = {
        key: keyId,
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency,
        order_id: orderId,
        name: "StayFinder",
        description: "Property Booking Payment",
        image: "https://stayfinder.com/logo.png",
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: "#2563eb", // Blue color
        },
        handler: async (response) => {
          try {
            // Payment successful
            if (onSuccess) {
              await onSuccess({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
            }
          } catch (error) {
            if (onError) {
              onError(error.message || "Payment verification failed");
            }
          }
        },
        modal: {
          ondismiss: () => {
            if (onError) {
              onError("Payment cancelled by user");
            }
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    };

    script.onerror = () => {
      if (onError) {
        onError("Failed to load Razorpay script");
      }
    };

    document.body.appendChild(script);
  } catch (error) {
    if (onError) {
      onError(error.message || "Failed to initiate payment");
    }
  }
};

/**
 * Verify payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} - True if signature is valid
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    // This should be done on the backend for security
    // This is just a placeholder for frontend validation
    return !!(orderId && paymentId && signature);
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
};

/**
 * Format amount for display
 * @param {number} amount - Amount in rupees
 * @returns {string} - Formatted amount
 */
export const formatAmount = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

/**
 * Calculate total amount including taxes
 * @param {number} baseAmount - Base amount
 * @param {number} taxRate - Tax rate (default 18%)
 * @returns {number} - Total amount with tax
 */
export const calculateTotalWithTax = (baseAmount, taxRate = 0.18) => {
  const tax = baseAmount * taxRate;
  return baseAmount + tax;
};

/**
 * Create payment order
 * @param {object} api - Axios API instance
 * @param {string} bookingId - Booking ID
 * @param {number} amount - Amount to charge
 * @returns {object} - Order details
 */
export const createPaymentOrder = async (api, bookingId, amount) => {
  try {
    const response = await api.post("/payments/create-order", {
      bookingId,
      amount,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create order");
  }
};

/**
 * Verify payment on backend
 * @param {object} api - Axios API instance
 * @param {object} paymentData - Payment data from Razorpay
 * @returns {object} - Verification response
 */
export const verifyPaymentOnBackend = async (api, paymentData) => {
  try {
    const response = await api.post("/payments/verify", {
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_signature: paymentData.razorpay_signature,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Payment verification failed"
    );
  }
};

/**
 * Handle payment error
 * @param {string} errorCode - Error code from Razorpay
 * @returns {string} - User-friendly error message
 */
export const getPaymentErrorMessage = (errorCode) => {
  const errorMessages = {
    BAD_REQUEST_ERROR: "Invalid payment details. Please try again.",
    GATEWAY_ERROR: "Payment gateway error. Please try again later.",
    SERVER_ERROR: "Server error. Please try again later.",
    TIMEOUT_ERROR: "Payment request timed out. Please try again.",
    NETWORK_ERROR: "Network error. Please check your connection.",
    CANCELLED: "Payment cancelled by user.",
  };

  return errorMessages[errorCode] || "Payment failed. Please try again.";
};

export default {
  initiateRazorpayPayment,
  verifyPaymentSignature,
  formatAmount,
  calculateTotalWithTax,
  createPaymentOrder,
  verifyPaymentOnBackend,
  getPaymentErrorMessage,
};

