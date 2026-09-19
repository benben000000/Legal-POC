import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ASSOCIATE', 'STAFF']),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(12),
});

export const matterSchema = z.object({
  caseTitle: z.string().min(3),
  docketNumber: z.string().optional(),
  courtBranch: z.string().min(3),
  clientName: z.string().min(3),
  clientContact: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  status: z.enum(['ACTIVE', 'FOR_PLEADING', 'UNDER_SUBMISSION', 'PROMULGATED', 'ARCHIVED']),
  assignedToId: z.string().optional(),
});

export const deadlineSchema = z.object({
  title: z.string().min(3),
  type: z.string().min(3).optional(),
  dueDate: z.string().or(z.date()),
  status: z.enum(['PENDING', 'COMPLETED', 'MISSED']).optional(), // Deadline doesn't use this enum in Prisma, it uses isCompleted
  matterId: z.string().min(1),
});

export const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  dueDate: z.string().or(z.date()).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'FOR_ATTORNEY_REVIEW', 'COMPLETED_FILED']),
  matterId: z.string().min(1),
  assignedToId: z.string().optional(),
});

export const documentSchema = z.object({
  title: z.string().min(1),
  matterId: z.string().min(1),
  fileUrl: z.string().url(),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
});

export const billingEntrySchema = z.object({
  matterId: z.string().min(1, 'Matter is required'),
  datePerformed: z.string().or(z.date()),
  description: z.string().min(1, 'Description is required'),
  title: z.string().optional(),
  billingType: z.enum([
    'APPEARANCE_FEE',
    'DRAFTING_FEE',
    'ACCEPTANCE_RETAINER',
    'COURT_FILING_FEE',
    'NOTARIAL_FEE',
    'TRANSPORT_FEE',
    'SHERIFF_FEE',
    'OTHER_DISBURSEMENT',
  ]),
  hours: z.number().optional(),
  hourlyRate: z.number().optional(),
  amount: z.number().min(0, 'Amount must be non-negative'),
  isBillable: z.boolean().default(true),
});

