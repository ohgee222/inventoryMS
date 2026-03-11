export const isValidUniversityEmail = (email) => {
  if (!email) return false;
  
  const lowerEmail = email.toLowerCase().trim();
  
  return lowerEmail.endsWith('@hull.ac.uk');
};

export const getEmailError = (email) => {
  if (!email) return 'Email is required';
  
  if (!email.includes('@')) return 'Invalid email format';
  
  if (!isValidUniversityEmail(email)) {
    return 'Only University of Hull email addresses are allowed';
  }
  
  return null;
};