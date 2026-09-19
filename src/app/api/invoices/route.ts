import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError } from '@/lib/utils';
import { createAuditLog, getClientIp } from '@/lib/audit';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role !== 'LEAD_ATTORNEY') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // In v0.1, basic required fields for creating an invoice
    if (!body.matterId || !body.amount || !body.dueDate) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const matter = await prisma.matter.findUnique({
      where: { id: body.matterId },
    });

    if (!matter) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 });
    }

    // Generate a simple invoice number
    const invoiceNumber = `INV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo: invoiceNumber,
        matterId: body.matterId,
        amountPaid: 0,
        totalAmount: body.amount,
        balance: body.amount,
        dueDate: new Date(body.dueDate),
        paymentStatus: 'UNBILLED',
        clientName: matter.clientName,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entityType: 'INVOICE',
      entityId: invoice.id,
      entityTitle: invoice.invoiceNo,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
