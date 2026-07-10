import { SchoolConfig, RegisteredUser, PrincipalRecord } from '../types';

export const defaultSchoolConfig: SchoolConfig = {
  name: 'My School',
  location: 'Your School Address, City, Country',
  phone: '+1 (555) 123-4567',
  email: 'info@myschool.edu',
  heroTitle: 'Welcome to Our School',
  heroSubtitle: 'Excellence in Education - Nurturing the Leaders of Tomorrow',
  principalLetterTitle: "Principal's Welcome Message",
  principalLetterBody: "Welcome to our school community. We are committed to providing quality education.",
  vicePrincipalLetterTitle: "Vice Principal's Message",
  vicePrincipalLetterBody: "Together with our dedicated faculty, we strive for excellence.",
  heroImageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
  secondaryImageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
  latestAnnouncement: 'Welcome to the new academic year!',
};

// ONLY the Super Admin exists initially - all other users must be created by Admin
export const defaultRegisteredUsers: RegisteredUser[] = [
  {
    id: 'USR-ADMIN',
    name: 'System Administrator',
    email: 'admin@myschool.edu',
    password: 'admin123',
    role: 'super_admin',
  },
];

export const defaultPrincipals: PrincipalRecord[] = [
  {
    id: 'PRN-001',
    name: 'Dr. Principal Name',
    email: 'principal@myschool.edu',
    campus: 'Main Campus',
    letterTitle: "Principal's Welcome - Main Campus",
    letterBody: "Welcome to our Main Campus. We are dedicated to providing an exceptional educational experience.",
    status: 'Active',
  },
];

export const defaultAllowedRoles: string[] = ['registrar', 'finance', 'librarian', 'clinic', 'counselor'];