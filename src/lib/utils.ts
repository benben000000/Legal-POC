import { NextResponse } from 'next/server';
import { z } from 'zod';

export function handleApiError(error: any) {
  if (error instanceof z.ZodError || error.name === 'ZodError') {
    return NextResponse.json(
      { error: 'Validation failed', details: (error as any).errors },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    if (error.name === 'AuthError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', error);
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

export function calculateUrgencyLevel(
  dueDate: Date
): 'CRITICAL' | 'UPCOMING' | 'ON_SCHEDULE' {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) return 'CRITICAL';
  if (diffDays <= 7) return 'UPCOMING';
  return 'ON_SCHEDULE';
}
