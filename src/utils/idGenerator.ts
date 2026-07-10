export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.toUpperCase();
}

export function generateAdmissionNo(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ADM${year}${random}`;
}

export function generateReceiptNo(): string {
  const timestamp = Date.now().toString().slice(-6);
  return `REC-${timestamp}`;
}

export function generateStudentId(): string {
  const count = Math.floor(Math.random() * 10000);
  return `STU${String(count).padStart(4, '0')}`;
}

export function generateTeacherId(): string {
  const count = Math.floor(Math.random() * 1000);
  return `TCH${String(count).padStart(3, '0')}`;
}