// List of premium/valid email domains
const validEmailDomains = [
  // Popular email providers
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'mail.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'tutanota.com',
  'fastmail.com',
  'me.com',
  'live.com',
  'msn.com',

  // Educational domains
  'edu',
  'ac.uk',
  'edu.au',
  'edu.cn',
  'ac.jp',
  'edu.sg',
  'edu.in',

  // Business/corporate domains
  'company.com', // Example placeholder
  'org',
  'gov',
  'mil',
  'net',
  'int',
  'co.uk',
  'co.jp',
  'com.au',
  'co.nz',
  'ca',
  'de',
  'fr',
  'it',
  'es',
  'nl',
  'be',
  'ch',
  'at',
  'dk',
  'se',
  'no',
  'fi',
  'pt',
  'gr',
  'pl',
  'ru',
  'cn',
  'jp',
  'kr',
  'in',
  'br',
  'mx',
  'za',
  'au',
  'nz'
];

/**
 * Validates if an email has a proper format and uses a premium domain
 * @param email The email address to validate
 * @returns An object with validation result and error message if applicable
 */
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  // Basic email format validation using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { 
      isValid: false, 
      message: 'Please enter a valid email address format (example@domain.com)' 
    };
  }

  // Extract domain from email
  const domain = email.split('@')[1].toLowerCase();

  // Check if the domain or TLD is in our list of valid domains
  const isDomainValid = validEmailDomains.some(validDomain => {
    // Check for exact match
    if (domain === validDomain) {
      return true;
    }
    
    // Check if domain ends with the valid domain (for TLDs and subdomains)
    if (domain.endsWith('.' + validDomain)) {
      return true;
    }
    
    return false;
  });

  if (!isDomainValid) {
    return { 
      isValid: false, 
      message: 'Please use a valid email domain (Gmail, Outlook, Hotmail, etc.)' 
    };
  }

  // Check for disposable email patterns
  const disposablePatterns = ['temp', 'fake', 'mailinator', 'throwaway', 'tempmail', 'tmpmail', 'guerrilla'];
  if (disposablePatterns.some(pattern => domain.includes(pattern))) {
    return { 
      isValid: false, 
      message: 'Disposable email addresses are not allowed' 
    };
  }

  // Check for suspicious patterns in local part (before @)
  const localPart = email.split('@')[0].toLowerCase();
  if (localPart.length < 3) {
    return { 
      isValid: false, 
      message: 'Email username is too short' 
    };
  }

  // Check for random-looking usernames (too many consecutive numbers or special chars)
  const consecutiveNumbersRegex = /\d{5,}/;
  const tooManySpecialCharsRegex = /[^a-zA-Z0-9]{3,}/;
  
  if (consecutiveNumbersRegex.test(localPart)) {
    return { 
      isValid: false, 
      message: 'Email contains too many consecutive numbers' 
    };
  }
  
  if (tooManySpecialCharsRegex.test(localPart)) {
    return { 
      isValid: false, 
      message: 'Email contains too many consecutive special characters' 
    };
  }

  // All checks passed
  return { isValid: true };
};

/**
 * Adds a custom domain to the list of valid domains
 * @param domain The domain to add
 */
export const addValidDomain = (domain: string): void => {
  if (!validEmailDomains.includes(domain.toLowerCase())) {
    validEmailDomains.push(domain.toLowerCase());
  }
};

/**
 * Gets the list of all valid domains
 * @returns Array of valid domains
 */
export const getValidDomains = (): string[] => {
  return [...validEmailDomains];
};

/**
 * Suggests a valid email domain based on partial input
 * @param partialDomain Partial domain input
 * @returns Array of suggested domains
 */
export const suggestDomains = (partialDomain: string): string[] => {
  if (!partialDomain) return [];
  
  const lowerPartial = partialDomain.toLowerCase();
  return validEmailDomains
    .filter(domain => domain.includes(lowerPartial))
    .slice(0, 5); // Limit to 5 suggestions
};