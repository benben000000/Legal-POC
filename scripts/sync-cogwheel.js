const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function run() {
  console.log('--- Synchronizing Firm Members & Cogwheel Task Pipeline ---');

  const users = await prisma.user.findMany({ where: { isActive: true } });
  const matters = await prisma.matter.findMany({ where: { status: { not: 'ARCHIVED' } } });

  console.log(`Found ${users.length} users and ${matters.length} active matters.`);

  // 1. Enroll every team member into all active firm matters
  for (const m of matters) {
    for (const u of users) {
      const roleInMatter =
        u.role === 'LEAD_ATTORNEY'
          ? 'Lead Counsel'
          : u.role === 'ASSOCIATE'
          ? 'Associate Counsel'
          : 'Legal Assistant';

      await prisma.matterMember.upsert({
        where: { matterId_userId: { matterId: m.id, userId: u.id } },
        update: { role: roleInMatter },
        create: { matterId: m.id, userId: u.id, role: roleInMatter },
      });
    }
  }
  console.log('Enrolled all members in all firm matters.');

  const findUser = (email) =>
    users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  const uAdminPh = findUser('admin@legalsuite.ph');
  const uAdminCom = findUser('admin@legal.com');
  const uBmGarcia = findUser('bmgarcia0121@gmail.com');
  const uAssoc1 = findUser('associate1@legal.com');
  const uAssoc2 = findUser('associate2@legal.com');
  const uStaff = findUser('staff@legal.com');

  const m1 = matters[0];
  const m2 = matters[1] || m1;
  const m3 = matters[2] || m1;
  const m4 = matters[3] || m1;

  // Clear existing tasks to rebuild a pristine, cogwheel-aligned task board
  await prisma.task.deleteMany({});
  console.log('Cleared old tasks.');

  const tasksToCreate = [
    // Lead Attorney Tasks
    {
      title: 'Review & Sign Retainer Agreement - Mabuhay Holdings',
      description: 'Review corporate retainer terms and approve billing milestones.',
      status: 'FOR_ATTORNEY_REVIEW',
      priority: 'HIGH',
      matterId: m1.id,
      assigneeId: uAdminPh ? uAdminPh.id : (uAdminCom ? uAdminCom.id : null),
      assignedById: uAdminPh ? uAdminPh.id : null,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Prepare Direct Examination Outline - RTC Branch 148',
      description: 'Prepare cross & direct examination questions for key financial witness.',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      matterId: m2.id,
      assigneeId: uAdminPh ? uAdminPh.id : (uAdminCom ? uAdminCom.id : null),
      assignedById: uAdminPh ? uAdminPh.id : null,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Client Settlement Conference Strategy - Ayala Land Dispute',
      description: 'Evaluate counter-settlement proposal submitted by opposing counsel.',
      status: 'TODO',
      priority: 'NORMAL',
      matterId: m3.id,
      assigneeId: uAdminCom ? uAdminCom.id : (uAdminPh ? uAdminPh.id : null),
      assignedById: uAdminPh ? uAdminPh.id : null,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },

    // Senior Associate (bmgarcia0121@gmail.com) Tasks
    {
      title: 'Case Briefing & Trial Evidence Audit - Intestate Estate',
      description: 'Collate real property certificates and tax declarations into digital case binder.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      matterId: m1.id,
      assigneeId: uBmGarcia ? uBmGarcia.id : (uAssoc1 ? uAssoc1.id : null),
      assignedById: uAdminPh ? uAdminPh.id : null,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Draft Opposition to Motion to Dismiss under Rule 16',
      description: 'Prepare legal memorandum addressing alleged lack of jurisdiction.',
      status: 'TODO',
      priority: 'CRITICAL',
      matterId: m2.id,
      assigneeId: uBmGarcia ? uBmGarcia.id : (uAssoc1 ? uAssoc1.id : null),
      assignedById: uAdminPh ? uAdminPh.id : null,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Appellate Brief Outline for Court of Appeals',
      description: 'Summarize errors of law cited in lower court decision.',
      status: 'FOR_ATTORNEY_REVIEW',
      priority: 'NORMAL',
      matterId: m3.id,
      assigneeId: uBmGarcia ? uBmGarcia.id : (uAssoc1 ? uAssoc1.id : null),
      assignedById: uAdminPh ? uAdminPh.id : null,
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },

    // Associate 1 (Maria Santos) Tasks
    {
      title: 'Draft Rule 37 Motion for Reconsideration',
      description: 'Review dispositive portion of adverse order and formulate legal grounds.',
      status: 'FOR_ATTORNEY_REVIEW',
      priority: 'CRITICAL',
      matterId: m1.id,
      assigneeId: uAssoc1 ? uAssoc1.id : null,
      assignedById: uAdminPh ? uAdminPh.id : null,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Draft Pre-Trial Brief & Judicial Affidavits of Plaintiff Witnesses',
      description: 'Prepare witness sworn statements in accordance with Judicial Affidavit Rule (A.M. No. 12-8-8-SC).',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      matterId: m2.id,
      assigneeId: uAssoc1 ? uAssoc1.id : null,
      assignedById: uAdminPh ? uAdminPh.id : null,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Formal Offer of Documentary Evidence and Exhibits',
      description: 'Mark and index bank statements, deeds of sale, and board resolutions.',
      status: 'TODO',
      priority: 'NORMAL',
      matterId: m4.id,
      assigneeId: uAssoc1 ? uAssoc1.id : null,
      assignedById: uAdminPh ? uAdminPh.id : null,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },

    // Associate 2 (Jose Reyes) Tasks
    {
      title: 'Draft Rule 11 Verified Answer with Compulsory Counterclaim',
      description: 'Formulate specific denials and affirmative defenses with verified affidavit.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      matterId: m3.id,
      assigneeId: uAssoc2 ? uAssoc2.id : null,
      assignedById: uAdminPh ? uAdminPh.id : null,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Legal Research: Jurisdictional Grounds under Batas Pambansa Blg. 129',
      description: 'Prepare research memo with Supreme Court jurisprudence on RTC subject-matter jurisdiction.',
      status: 'TODO',
      priority: 'NORMAL',
      matterId: m1.id,
      assigneeId: uAssoc2 ? uAssoc2.id : null,
      assignedById: uAdminPh ? uAdminPh.id : null,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Draft Annual SEC General Information Sheet (GIS) Compliance',
      description: 'Complete GIS regulatory submission for Apex Logistics Philippines.',
      status: 'FOR_ATTORNEY_REVIEW',
      priority: 'NORMAL',
      matterId: m4.id,
      assigneeId: uAssoc2 ? uAssoc2.id : null,
      assignedById: uAdminPh ? uAdminPh.id : null,
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    },

    // Staff / Paralegal (Elena Torres) Tasks
    {
      title: 'Pay Court Filing Fees & Secure Official Receipts at RTC Pasig',
      description: 'Present assessed docket fees to Clerk of Court and upload scanned official receipt.',
      status: 'TODO',
      priority: 'HIGH',
      matterId: m2.id,
      assigneeId: uStaff ? uStaff.id : null,
      assignedById: uAdminPh ? uAdminPh.id : null,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Serve Copy of Pleadings to Opposing Counsel via Registered Mail',
      description: 'Post copy with post office registry receipt and prepare Affidavit of Service under Rule 13.',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      matterId: m1.id,
      assigneeId: uStaff ? uStaff.id : null,
      assignedById: uAdminPh ? uAdminPh.id : null,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Obtain Certified True Copy of TCT No. 129845 from Registry of Deeds',
      description: 'Follow up requested title copy at Pasig City Registry of Deeds.',
      status: 'COMPLETED_FILED',
      priority: 'NORMAL',
      matterId: m3.id,
      assigneeId: uStaff ? uStaff.id : null,
      assignedById: uAdminPh ? uAdminPh.id : null,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const t of tasksToCreate) {
    await prisma.task.create({ data: t });
  }

  console.log(`Successfully seeded ${tasksToCreate.length} cogwheel tasks across all legal team roles!`);
  await prisma.$disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
