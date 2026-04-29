export function formatBirthDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium'
  }).format(new Date(value));
}

export function calculateAge(value: string) {
  const dob = new Date(value);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDelta = now.getMonth() - dob.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age;
}
