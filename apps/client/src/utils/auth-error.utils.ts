export interface IAuthErrorInfo {
  title: string;
  description: string;
}

export function formatAuthErrorMessage(
  rawError: unknown,
  mode: 'login' | 'register'
): IAuthErrorInfo {
  let rawMessage = '';

  const errorObj = rawError as {
    response?: { data?: { message?: string | string[] } };
    message?: string;
  };

  if (errorObj?.response?.data?.message) {
    rawMessage = Array.isArray(errorObj.response.data.message)
      ? errorObj.response.data.message.join(', ')
      : errorObj.response.data.message;
  } else if (errorObj?.message) {
    rawMessage = errorObj.message;
  }

  const msg = rawMessage.toLowerCase();

  // Incorrect Credentials (Login)
  if (
    msg.includes('invalid login credentials') ||
    msg.includes('invalid credentials') ||
    msg.includes('wrong password')
  ) {
    return {
      title: 'Incorrect Email or Password',
      description:
        'The email address or password you entered is incorrect. Please check your details and try again.',
    };
  }

  // Account Already Exists (Register)
  if (
    msg.includes('already registered') ||
    msg.includes('already been registered') ||
    msg.includes('user_already_exists') ||
    msg.includes('already exists')
  ) {
    return {
      title: 'Account Already Exists',
      description:
        'An account with this email address already exists. Please log in instead or use a different email.',
    };
  }

  // Email Not Confirmed
  if (msg.includes('email not confirmed')) {
    return {
      title: 'Email Not Verified',
      description:
        'Your email address has not been verified yet. Please check your inbox for a confirmation email.',
    };
  }

  // Rate Limit / Too Many Requests
  if (
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('throttled')
  ) {
    return {
      title: 'Too Many Attempts',
      description:
        'You have made too many attempts in a short period. Please wait a minute before trying again.',
    };
  }

  // Invalid Email Format
  if (msg.includes('email') && (msg.includes('invalid') || msg.includes('format'))) {
    return {
      title: 'Invalid Email Address',
      description: 'Please enter a valid email address (e.g. name@example.com).',
    };
  }

  // Weak Password
  if (msg.includes('password') && (msg.includes('short') || msg.includes('weak') || msg.includes('at least'))) {
    return {
      title: 'Password Too Short',
      description: 'Your password must be at least 6 characters long.',
    };
  }

  // Default Fallbacks
  if (mode === 'login') {
    return {
      title: 'Sign In Failed',
      description:
        rawMessage || 'Unable to sign in right now. Please check your internet connection and try again.',
    };
  }

  return {
    title: 'Registration Failed',
    description:
      rawMessage || 'Unable to create your account right now. Please check your details and try again.',
  };
}
