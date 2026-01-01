export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public userMessage: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Unable to connect. Check your internet connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class PaymentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PaymentError';
  }
}

export const getUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof NetworkError) return error.message;
  if (error instanceof PaymentError) return 'Payment processing failed. Please try again.';
  if (error instanceof ApiError) return error.userMessage;
  
  if (error instanceof Error) {
      if (error.message.toLowerCase().includes('fetch') || error.message.toLowerCase().includes('network')) {
        return 'Connection lost. Please check your internet connection.';
      }
      return error.message; 
  }

  return 'Something went wrong. We\'ve been notified.';
};
