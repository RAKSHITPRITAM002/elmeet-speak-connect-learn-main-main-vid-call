// List of premium/valid email domains
const validEmailDomains = [
  // Popular email providers - PREMIUM DOMAINS
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
  'email.com', // Added as per requirement
  
  // Educational domains
  'edu',
  'ac.uk',
  'edu.au',
  'edu.cn',
  'ac.jp',
  'edu.sg',
  'edu.in',
  'school.edu',
  'university.edu',
  'college.edu',
  'student.edu',

  // Business/corporate domains
  'company.com',
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
  'nz',
  
  // Additional common domains
  'pm.me',
  'mac.com',
  'googlemail.com',
  'hey.com',
  'skiff.com',
  'duck.com',
  'mailbox.org',
  'posteo.de',
  'posteo.net',
  'disroot.org',
  'riseup.net',
  'runbox.com',
  'tuta.io',
  'ctemplar.com',
  'startmail.com',
  'mailfence.com',
  'proton.me',
  'pm.me',
  'outlook.jp',
  'outlook.fr',
  'outlook.de',
  'outlook.it',
  'outlook.es',
  'outlook.dk',
  'outlook.com.ar',
  'outlook.com.au',
  'outlook.com.br',
  'outlook.cl',
  'outlook.co.id',
  'outlook.co.il',
  'outlook.co.jp',
  'outlook.co.nz',
  'outlook.co.th',
  'outlook.com.vn',
  'outlook.sg',
  'outlook.sa',
  'outlook.ae',
  'hotmail.co.uk',
  'hotmail.fr',
  'hotmail.de',
  'hotmail.it',
  'hotmail.es',
  'hotmail.com.ar',
  'hotmail.com.au',
  'hotmail.com.br',
  'hotmail.co.jp',
  'yahoo.co.uk',
  'yahoo.co.jp',
  'yahoo.fr',
  'yahoo.de',
  'yahoo.it',
  'yahoo.es',
  'yahoo.com.ar',
  'yahoo.com.au',
  'yahoo.com.br',
  'yahoo.co.id',
  'yahoo.co.in',
  'yahoo.co.kr',
  'yahoo.com.mx',
  'yahoo.com.sg',
  'yahoo.com.tw',
  'yahoo.com.vn'
];

/**
 * Validates if an email has a proper format and uses a premium domain
 * @param email The email address to validate
 * @returns An object with validation result and error message if applicable
 */
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  // More strict email format validation using regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
      message: 'Please use a premium email domain (Gmail, Outlook, Hotmail, etc.)' 
    };
  }

  // Check for disposable email patterns
  const disposablePatterns = [
    'temp', 'fake', 'mailinator', 'throwaway', 'tempmail', 'tmpmail', 'guerrilla',
    'yopmail', 'trashmail', 'sharklasers', 'mailnesia', 'discard', 'getnada', 'spam',
    'temporary', 'disposable', 'burner', 'trash', 'dump', 'junk', 'test', 'example'
  ];
  
  if (disposablePatterns.some(pattern => domain.includes(pattern))) {
    return { 
      isValid: false, 
      message: 'Disposable email addresses are not allowed' 
    };
  }

  // Check for suspicious patterns in local part (before @)
  const localPart = email.split('@')[0].toLowerCase();
  
  // Minimum length check
  if (localPart.length < 3) {
    return { 
      isValid: false, 
      message: 'Email username is too short (minimum 3 characters)' 
    };
  }

  // Check for random-looking usernames
  const consecutiveNumbersRegex = /\d{4,}/;
  const tooManySpecialCharsRegex = /[^a-zA-Z0-9]{3,}/;
  const randomPatternRegex = /^[a-z0-9]{8,}$/; // Likely random if just 8+ alphanumeric chars
  const keyboardPatternRegex = /qwerty|asdfg|zxcvb|12345|abcde/; // Common keyboard patterns
  
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
  
  // Check for random-looking patterns (e.g., "xeds@sjdjsd")
  if (randomPatternRegex.test(localPart) && !/^[a-z]+\.[a-z]+$/.test(localPart)) {
    return {
      isValid: false,
      message: 'Email username appears to be randomly generated'
    };
  }
  
  // Check for keyboard patterns
  if (keyboardPatternRegex.test(localPart)) {
    return {
      isValid: false,
      message: 'Email contains common keyboard patterns'
    };
  }
  
  // Check for excessive repeating characters
  const repeatingCharsRegex = /(.)\1{3,}/;
  if (repeatingCharsRegex.test(localPart)) {
    return {
      isValid: false,
      message: 'Email contains too many repeating characters'
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