const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Legal Demo Comprehensive Seeding ---');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Team Members
  console.log('1. Seeding Philippine legal team members...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@legal.com' },
    update: {
      firstName: 'Benedict',
      lastName: 'Garcia',
      role: 'LEAD_ATTORNEY',
      phone: '+63 917 555 0101',
      barLicenseNo: 'IBP-ROLL-48912',
      isActive: true,
      passwordHash,
    },
    create: {
      email: 'admin@legal.com',
      passwordHash,
      firstName: 'Benedict',
      lastName: 'Garcia',
      role: 'LEAD_ATTORNEY',
      phone: '+63 917 555 0101',
      barLicenseNo: 'IBP-ROLL-48912',
      isActive: true,
    },
  });

  const assoc1 = await prisma.user.upsert({
    where: { email: 'associate1@legal.com' },
    update: {
      firstName: 'Maria',
      lastName: 'Santos',
      role: 'ASSOCIATE',
      phone: '+63 918 555 0202',
      barLicenseNo: 'IBP-ROLL-61204',
      isActive: true,
      passwordHash,
    },
    create: {
      email: 'associate1@legal.com',
      passwordHash,
      firstName: 'Maria',
      lastName: 'Santos',
      role: 'ASSOCIATE',
      phone: '+63 918 555 0202',
      barLicenseNo: 'IBP-ROLL-61204',
      isActive: true,
    },
  });

  const assoc2 = await prisma.user.upsert({
    where: { email: 'associate2@legal.com' },
    update: {
      firstName: 'Jose',
      lastName: 'Reyes',
      role: 'ASSOCIATE',
      phone: '+63 920 555 0303',
      barLicenseNo: 'IBP-ROLL-73419',
      isActive: true,
      passwordHash,
    },
    create: {
      email: 'associate2@legal.com',
      passwordHash,
      firstName: 'Jose',
      lastName: 'Reyes',
      role: 'ASSOCIATE',
      phone: '+63 920 555 0303',
      barLicenseNo: 'IBP-ROLL-73419',
      isActive: true,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@legal.com' },
    update: {
      firstName: 'Elena',
      lastName: 'Torres',
      role: 'STAFF',
      phone: '+63 922 555 0404',
      isActive: true,
      passwordHash,
    },
    create: {
      email: 'staff@legal.com',
      passwordHash,
      firstName: 'Elena',
      lastName: 'Torres',
      role: 'STAFF',
      phone: '+63 922 555 0404',
      isActive: true,
    },
  });

  console.log('   ✓ Team members seeded (Admin, 2 Associates, Staff).');

  // 2. Realistic Philippine Matters
  console.log('2. Seeding authentic Philippine practice matters...');

  // Matter 1: RTC Pasig Civil
  const matter1 = await prisma.matter.upsert({
    where: { id: 'matter-pasig-civil-01' },
    update: {},
    create: {
      id: 'matter-pasig-civil-01',
      caseTitle: 'Mabuhay Holdings Inc. vs. Pasig River Development Corp.',
      docketNumber: 'R-PSG-24-00892-CV',
      courtBranch: 'Regional Trial Court, Branch 158, Pasig City',
      presidingJudge: 'Hon. Rowena Tan-San Pedro',
      opposingCounsel: 'Fortun Narvasa & Salazar (Atty. V. Narvasa)',
      clientName: 'Mabuhay Holdings Inc. (Antonio Zobel)',
      clientEmail: 'legal@mabuhayholdings.ph',
      clientPhone: '+63 2 8888 1234',
      clientAddress: '24F Mabuhay Tower, F. Ortigas Jr. Rd., Ortigas Center, Pasig City',
      status: 'ACTIVE',
      priority: 'HIGH',
      caseType: 'Civil - Specific Performance & ₱25M Damages',
      createdById: admin.id,
    },
  });

  // Matter 2: MeTC Makati Criminal
  const matter2 = await prisma.matter.upsert({
    where: { id: 'matter-makati-crim-02' },
    update: {},
    create: {
      id: 'matter-makati-crim-02',
      caseTitle: 'People of the Philippines vs. Eduardo Tan',
      docketNumber: 'CR-2025-10442',
      courtBranch: 'Metropolitan Trial Court, Branch 61, Makati City',
      presidingJudge: 'Hon. Cesar Cruz',
      opposingCounsel: 'City Prosecutor Office / Public Attorney (Atty. K. Dalisay)',
      clientName: 'Eduardo Tan',
      clientEmail: 'etan.consulting@gmail.com',
      clientPhone: '+63 917 123 9876',
      clientAddress: '14B Salcedo Park Towers, H.V. Dela Costa St., Salcedo Village, Makati City',
      status: 'FOR_PLEADING',
      priority: 'URGENT',
      caseType: 'Criminal - Defense against Estafa under Art. 315 RPC',
      createdById: admin.id,
    },
  });

  // Matter 3: Court of Appeals Rule 65 Certiorari
  const matter3 = await prisma.matter.upsert({
    where: { id: 'matter-ca-labor-03' },
    update: {},
    create: {
      id: 'matter-ca-labor-03',
      caseTitle: 'St. Jude Medical Center vs. National Labor Relations Commission & Santos',
      docketNumber: 'CA-G.R. SP No. 182394',
      courtBranch: 'Court of Appeals, 7th Division, Manila',
      presidingJudge: 'Associate Justice Rosalinda Mendoza',
      opposingCounsel: 'Atty. Ferdinand Dimaculangan (NLRC Legal)',
      clientName: 'St. Jude Medical Center Inc.',
      clientEmail: 'management@stjudemedical.ph',
      clientPhone: '+63 2 8711 4455',
      clientAddress: 'Dimasalang St. cor. Don Quijote, Sampaloc, Manila',
      status: 'UNDER_SUBMISSION',
      priority: 'HIGH',
      caseType: 'Special Civil Action - Rule 65 Certiorari on Grave Abuse of Discretion',
      createdById: admin.id,
    },
  });

  // Matter 4: RTC QC Estate Settlement
  const matter4 = await prisma.matter.upsert({
    where: { id: 'matter-qc-estate-04' },
    update: {},
    create: {
      id: 'matter-qc-estate-04',
      caseTitle: 'In the Matter of the Intestate Estate of Late Don Fernando Ayala',
      docketNumber: 'Spec. Proc. No. Q-23-08711',
      courtBranch: 'Regional Trial Court, Branch 92, Quezon City',
      presidingJudge: 'Hon. Eleanor R. Gomez',
      opposingCounsel: 'Quisumbing Torres (Rep. Co-Heirs)',
      clientName: 'Beatrice Ayala-Solis (Appointed Administratrix)',
      clientEmail: 'beatrice.solis@ayala-holdings.com',
      clientPhone: '+63 917 888 2233',
      clientAddress: 'Acacia Avenue, Dasmariñas Village, Makati City',
      status: 'ACTIVE',
      priority: 'NORMAL',
      caseType: 'Special Proceedings - Judicial Partition & Settlement of Estate',
      createdById: admin.id,
    },
  });

  // Matter 5: Corporate Retainer
  const matter5 = await prisma.matter.upsert({
    where: { id: 'matter-corp-retainer-05' },
    update: {},
    create: {
      id: 'matter-corp-retainer-05',
      caseTitle: 'Apex Logistics Philippines Inc. - General Corporate Retainer',
      docketNumber: 'RET-2026-0034',
      courtBranch: 'SEC & BIR RDO 50 South Makati',
      presidingJudge: 'Corporate Regulatory Commission',
      opposingCounsel: 'N/A (Retainer General Counsel)',
      clientName: 'Apex Logistics Philippines Inc.',
      clientEmail: 'cfo@apexlogistics.ph',
      clientPhone: '+63 2 8249 9000',
      clientAddress: 'Building 3, Pascor Drive, Sto. Niño, Parañaque City',
      status: 'ACTIVE',
      priority: 'NORMAL',
      caseType: 'Corporate Advisory, Labor Compliance & Contract Drafting',
      createdById: admin.id,
    },
  });

  console.log('   ✓ 5 Philippine matters seeded.');

  // 3. Matter Members
  console.log('3. Linking team members to matters...');
  const memberLinks = [
    { matterId: matter1.id, userId: admin.id, role: 'LEAD_COUNSEL' },
    { matterId: matter1.id, userId: assoc1.id, role: 'HANDLING_ASSOCIATE' },
    { matterId: matter1.id, userId: staff.id, role: 'PARALEGAL' },

    { matterId: matter2.id, userId: admin.id, role: 'LEAD_COUNSEL' },
    { matterId: matter2.id, userId: assoc2.id, role: 'HANDLING_ASSOCIATE' },

    { matterId: matter3.id, userId: admin.id, role: 'LEAD_COUNSEL' },
    { matterId: matter3.id, userId: assoc1.id, role: 'HANDLING_ASSOCIATE' },

    { matterId: matter4.id, userId: assoc2.id, role: 'HANDLING_ASSOCIATE' },
    { matterId: matter4.id, userId: staff.id, role: 'PARALEGAL' },

    { matterId: matter5.id, userId: admin.id, role: 'LEAD_COUNSEL' },
    { matterId: matter5.id, userId: assoc1.id, role: 'ASSOCIATE' },
  ];

  for (const m of memberLinks) {
    await prisma.matterMember.upsert({
      where: { matterId_userId: { matterId: m.matterId, userId: m.userId } },
      update: { role: m.role },
      create: m,
    });
  }
  console.log('   ✓ Team member allocations linked.');

  // 4. Procedural Deadlines (linked with Rules of Court)
  console.log('4. Seeding court procedural deadlines...');
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const deadlines = [
    {
      matterId: matter1.id,
      title: 'Rule 37 Motion for Reconsideration Filing Deadline',
      description: '15-day strict period from receipt of Adverse Resolution dated Sept 12. Must file verified motion with Pasig RTC Br 158.',
      periodDays: 15,
      triggerDate: new Date(now.getTime() - 11 * dayMs),
      dueDate: new Date(now.getTime() + 4 * dayMs),
      urgencyLevel: 'CRITICAL',
      isCompleted: false,
    },
    {
      matterId: matter2.id,
      title: 'Rule 11 Verified Answer with Compulsory Counterclaim',
      description: 'Filing of responsive pleading to MeTC Makati complaint. Include annexes A to F.',
      periodDays: 15,
      triggerDate: new Date(now.getTime() - 8 * dayMs),
      dueDate: new Date(now.getTime() + 7 * dayMs),
      urgencyLevel: 'UPCOMING',
      isCompleted: false,
    },
    {
      matterId: matter3.id,
      title: 'Court of Appeals Rule 65 Petition for Certiorari',
      description: '60-day non-extendible period from receipt of NLRC en banc resolution denial.',
      periodDays: 60,
      triggerDate: new Date(now.getTime() - 25 * dayMs),
      dueDate: new Date(now.getTime() + 35 * dayMs),
      urgencyLevel: 'ON_SCHEDULE',
      isCompleted: false,
    },
    {
      matterId: matter4.id,
      title: 'Submission of Inventory of Conjugal & Exclusive Estate Properties',
      description: 'Formal compliance with RTC QC Order requiring appraisal report of residential and commercial properties.',
      periodDays: 30,
      triggerDate: new Date(now.getTime() - 15 * dayMs),
      dueDate: new Date(now.getTime() + 15 * dayMs),
      urgencyLevel: 'ON_SCHEDULE',
      isCompleted: false,
    },
    {
      matterId: matter1.id,
      title: 'Pre-Trial Brief & Judicial Affidavits of Plaintiff Witnesses',
      description: 'Mandatory submission at least 5 days prior to scheduled Pre-Trial Conference under 2019 Revised Rules of Civil Procedure.',
      periodDays: 10,
      triggerDate: new Date(now.getTime() - 5 * dayMs),
      dueDate: new Date(now.getTime() + 5 * dayMs),
      urgencyLevel: 'UPCOMING',
      isCompleted: false,
    },
    {
      matterId: matter5.id,
      title: 'Annual SEC General Information Sheet (GIS) Filing',
      description: 'Corporate annual filing cutoff within 30 days of Annual Stockholders Meeting.',
      periodDays: 30,
      triggerDate: new Date(now.getTime() - 20 * dayMs),
      dueDate: new Date(now.getTime() + 10 * dayMs),
      urgencyLevel: 'ON_SCHEDULE',
      isCompleted: false,
    },
  ];

  for (const d of deadlines) {
    const existing = await prisma.deadline.findFirst({
      where: { matterId: d.matterId, title: d.title },
    });
    if (!existing) {
      await prisma.deadline.create({ data: d });
    }
  }
  console.log('   ✓ 6 procedural deadlines seeded.');

  // 5. Tasks across 4 Kanban Stages
  console.log('5. Seeding tasks across 4-stage Kanban board...');
  const tasksData = [
    // Column 1: TODO
    {
      matterId: matter1.id,
      title: 'Draft Formal Offer of Documentary Exhibits',
      description: 'Collate Deeds of Absolute Sale, bank remittance vouchers, and demand letters with judicial marking A to J.',
      status: 'TODO',
      priority: 'HIGH',
      assigneeId: assoc1.id,
      assignedById: admin.id,
      dueDate: new Date(now.getTime() + 6 * dayMs),
    },
    {
      matterId: matter4.id,
      title: 'Secure Certified True Copy of Transfer Certificate of Title (TCT 19284)',
      description: 'Coordinate with Registry of Deeds Quezon City for certified true copy of Fairview estate lot.',
      status: 'TODO',
      priority: 'MEDIUM',
      assigneeId: staff.id,
      assignedById: assoc2.id,
      dueDate: new Date(now.getTime() + 3 * dayMs),
    },
    {
      matterId: matter5.id,
      title: 'Draft Special Power of Attorney for Tax Clearance BIR RDO 50',
      description: 'Prepare corporate SPA signed by Corporate Secretary for tax compromise application.',
      status: 'TODO',
      priority: 'LOW',
      assigneeId: assoc2.id,
      assignedById: admin.id,
      dueDate: new Date(now.getTime() + 12 * dayMs),
    },

    // Column 2: IN_PROGRESS
    {
      matterId: matter1.id,
      title: 'Draft Rule 37 Motion for Reconsideration',
      description: 'Incorporate grounds on patent misappreciation of liquidated damages clause under Art. 2226 Civil Code.',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      assigneeId: assoc1.id,
      assignedById: admin.id,
      dueDate: new Date(now.getTime() + 2 * dayMs),
    },
    {
      matterId: matter2.id,
      title: 'Prepare Judicial Affidavit of Eduardo Tan (Accused)',
      description: 'Conduct Q&A examination regarding lack of intent to defraud and accounting liquidation receipts.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigneeId: assoc2.id,
      assignedById: admin.id,
      dueDate: new Date(now.getTime() + 4 * dayMs),
    },
    {
      matterId: matter3.id,
      title: 'Draft Verified Petition for Certiorari under Rule 65',
      description: 'Highlight grave abuse of discretion amounting to lack or excess of jurisdiction by NLRC 3rd Division.',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      assigneeId: assoc1.id,
      assignedById: admin.id,
      dueDate: new Date(now.getTime() + 14 * dayMs),
    },

    // Column 3: FOR_ATTORNEY_REVIEW
    {
      matterId: matter1.id,
      title: 'Partner Review of Pre-Trial Brief & Request for Admission',
      description: 'Atty. Garcia to conduct line-by-line review of admissions and stipulations before filing.',
      status: 'FOR_ATTORNEY_REVIEW',
      priority: 'HIGH',
      assigneeId: admin.id,
      assignedById: assoc1.id,
      dueDate: new Date(now.getTime() + 1 * dayMs),
    },
    {
      matterId: matter2.id,
      title: 'Review Motion for Preliminary Investigation / Bail Application',
      description: 'Inspect bail computation and certificate of detention from Makati Police Station.',
      status: 'FOR_ATTORNEY_REVIEW',
      priority: 'CRITICAL',
      assigneeId: admin.id,
      assignedById: assoc2.id,
      dueDate: new Date(now.getTime() + 2 * dayMs),
    },
    {
      matterId: matter5.id,
      title: 'Audit SEC General Information Sheet & Amended By-Laws',
      description: 'Ensure compliance with Revised Corporation Code (RA 11232) capital increase requirements.',
      status: 'FOR_ATTORNEY_REVIEW',
      priority: 'MEDIUM',
      assigneeId: admin.id,
      assignedById: assoc1.id,
      dueDate: new Date(now.getTime() + 5 * dayMs),
    },

    // Column 4: COMPLETED_FILED
    {
      matterId: matter1.id,
      title: 'Personal Service of Urgent Motion for Extension to Pasig RTC',
      description: 'Served stamped receiving copy to Branch Clerk of Court Atty. V. Cruz and opposing counsel.',
      status: 'COMPLETED_FILED',
      priority: 'HIGH',
      assigneeId: staff.id,
      assignedById: admin.id,
      dueDate: new Date(now.getTime() - 2 * dayMs),
    },
    {
      matterId: matter2.id,
      title: 'File Formal Entry of Appearance with Makati MeTC Branch 61',
      description: 'Submitted Entry of Appearance as Counsel for Accused with proof of IBP lifetime dues and MCLE compliance.',
      status: 'COMPLETED_FILED',
      priority: 'MEDIUM',
      assigneeId: assoc2.id,
      assignedById: admin.id,
      dueDate: new Date(now.getTime() - 5 * dayMs),
    },
    {
      matterId: matter3.id,
      title: 'Secure Certified True Copies of NLRC Decisions & Minutes',
      description: 'Paid legal research and photocopy fees at NLRC Banawe Office, obtained sealed transcript.',
      status: 'COMPLETED_FILED',
      priority: 'MEDIUM',
      assigneeId: staff.id,
      assignedById: assoc1.id,
      dueDate: new Date(now.getTime() - 8 * dayMs),
    },
  ];

  for (const t of tasksData) {
    const existing = await prisma.task.findFirst({
      where: { matterId: t.matterId, title: t.title },
    });
    if (!existing) {
      await prisma.task.create({ data: t });
    }
  }
  console.log('   ✓ 12 interactive Kanban tasks seeded across all 4 stages.');

  // 6. Case Documents in Vault
  console.log('6. Seeding case documents in Digital Vault...');
  const docsData = [
    {
      matterId: matter1.id,
      title: 'Complaint for Specific Performance & Damages (RTC Pasig Br 158)',
      category: 'PLEADINGS_MOTIONS',
      fileName: 'Complaint_Mabuhay_vs_PasigRiver_Br158.pdf',
      fileSize: 4820100,
      mimeType: 'application/pdf',
      storageKey: 'docs/matter1/complaint_verified.pdf',
      uploadedBy: admin.id,
    },
    {
      matterId: matter1.id,
      title: 'Court Order Granting Writ of Preliminary Attachment',
      category: 'COURT_ORDERS',
      fileName: 'Order_Writ_of_Preliminary_Attachment_Br158.pdf',
      fileSize: 1250400,
      mimeType: 'application/pdf',
      storageKey: 'docs/matter1/court_order_attachment.pdf',
      uploadedBy: staff.id,
    },
    {
      matterId: matter1.id,
      title: 'Notarized Contract to Sell and Official Escrow Receipts',
      category: 'EVIDENCE_ANNEXES',
      fileName: 'Annex_A_to_E_Escrow_Receipts_Signed.pdf',
      fileSize: 8410200,
      mimeType: 'application/pdf',
      storageKey: 'docs/matter1/annexes_escrow.pdf',
      uploadedBy: assoc1.id,
    },
    {
      matterId: matter2.id,
      title: 'Information for Estafa under Art. 315 Par. 2(a) RPC',
      category: 'COURT_ORDERS',
      fileName: 'Information_MeTC_Makati_CR2025_10442.pdf',
      fileSize: 854000,
      mimeType: 'application/pdf',
      storageKey: 'docs/matter2/information_estafa.pdf',
      uploadedBy: staff.id,
    },
    {
      matterId: matter2.id,
      title: 'Judicial Affidavit of Accused Eduardo Tan with Annexes',
      category: 'PLEADINGS_MOTIONS',
      fileName: 'Judicial_Affidavit_Eduardo_Tan_Draft.pdf',
      fileSize: 3120000,
      mimeType: 'application/pdf',
      storageKey: 'docs/matter2/ja_eduardo_tan.pdf',
      uploadedBy: assoc2.id,
    },
    {
      matterId: matter3.id,
      title: 'Court of Appeals 7th Division Resolution to Comment',
      category: 'COURT_ORDERS',
      fileName: 'CA_Resolution_Comment_Directive_SP182394.pdf',
      fileSize: 1040000,
      mimeType: 'application/pdf',
      storageKey: 'docs/matter3/ca_resolution_showcause.pdf',
      uploadedBy: admin.id,
    },
    {
      matterId: matter4.id,
      title: 'Transfer Certificate of Title (TCT No. 19284) - Registry of Deeds QC',
      category: 'EVIDENCE_ANNEXES',
      fileName: 'TCT_19284_Certified_True_Copy_RDQC.pdf',
      fileSize: 5620000,
      mimeType: 'application/pdf',
      storageKey: 'docs/matter4/tct_19284_rdqc.pdf',
      uploadedBy: staff.id,
    },
    {
      matterId: matter5.id,
      title: 'General Corporate Retainer Agreement & Scope of Services',
      category: 'CORRESPONDENCE_BILLING',
      fileName: 'ApexLogistics_Retainer_Agreement_2026.pdf',
      fileSize: 2200000,
      mimeType: 'application/pdf',
      storageKey: 'docs/matter5/retainer_agreement_2026.pdf',
      uploadedBy: admin.id,
    },
  ];

  for (const doc of docsData) {
    const existing = await prisma.document.findFirst({
      where: { storageKey: doc.storageKey },
    });
    if (!existing) {
      await prisma.document.create({ data: doc });
    }
  }
  console.log('   ✓ 8 case binder documents seeded.');

  // 7. Billing Entries & Accounting
  console.log('7. Seeding professional fees and disbursements (PHP)...');
  const billingData = [
    {
      matterId: matter1.id,
      userId: admin.id,
      billingType: 'APPEARANCE_FEE',
      title: 'Court Appearance - Pre-Trial Conference (Pasig RTC Br 158)',
      description: 'Hearing appearance before Hon. Rowena Tan-San Pedro. Marked documents A through H.',
      datePerformed: new Date(now.getTime() - 5 * dayMs),
      hours: 3.5,
      hourlyRate: 5000,
      amount: 17500,
      paymentStatus: 'PAID',
    },
    {
      matterId: matter1.id,
      userId: assoc1.id,
      billingType: 'DRAFTING_FEE',
      title: 'Drafting - Rule 37 Motion for Reconsideration (18 pages)',
      description: 'Extensive legal research on jurisprudence regarding liquidated damages clauses and rescission.',
      datePerformed: new Date(now.getTime() - 2 * dayMs),
      hours: 6.0,
      hourlyRate: 3500,
      amount: 21000,
      paymentStatus: 'BILLED',
    },
    {
      matterId: matter1.id,
      userId: staff.id,
      billingType: 'COURT_FILING_FEE',
      title: 'Filing & Docket Fees - Regional Trial Court Pasig',
      description: 'Official filing fee for amended pleadings and certified copies paid to Clerk of Court.',
      datePerformed: new Date(now.getTime() - 4 * dayMs),
      amount: 8450,
      paymentStatus: 'BILLED',
    },
    {
      matterId: matter1.id,
      userId: staff.id,
      billingType: 'SHERIFF_FEE',
      title: "Sheriff's Service Fee - Notice of Garnishment",
      description: "Service of notice to BDO and Metrobank Ortigas branches via RTC Sheriff.",
      datePerformed: new Date(now.getTime() - 3 * dayMs),
      amount: 4500,
      paymentStatus: 'PAID',
    },
    {
      matterId: matter2.id,
      userId: admin.id,
      billingType: 'ACCEPTANCE_RETAINER',
      title: 'Acceptance Fee - Criminal Defense Representation',
      description: 'Engagement acceptance fee for representation before Makati MeTC Branch 61.',
      datePerformed: new Date(now.getTime() - 12 * dayMs),
      amount: 60000,
      paymentStatus: 'PAID',
    },
    {
      matterId: matter2.id,
      userId: assoc2.id,
      billingType: 'DRAFTING_FEE',
      title: 'Drafting - Judicial Affidavit of Eduardo Tan',
      description: 'Comprehensive direct testimony affidavit conforming to Supreme Court Judicial Affidavit Rule.',
      datePerformed: new Date(now.getTime() - 1 * dayMs),
      hours: 4.5,
      hourlyRate: 3000,
      amount: 13500,
      paymentStatus: 'BILLED',
    },
    {
      matterId: matter3.id,
      userId: assoc1.id,
      billingType: 'DRAFTING_FEE',
      title: 'Drafting - Petition for Certiorari (Court of Appeals Rule 65)',
      description: 'Drafting 45-page petition challenging NLRC third division resolution.',
      datePerformed: new Date(now.getTime() - 6 * dayMs),
      hours: 10.0,
      hourlyRate: 3500,
      amount: 35000,
      paymentStatus: 'BILLED',
    },
    {
      matterId: matter4.id,
      userId: staff.id,
      billingType: 'NOTARIAL_FEE',
      title: 'Notarial & Certified True Copy Disbursements',
      description: 'Notarization of Extrajudicial Settlement and 12 sworn heir declarations.',
      datePerformed: new Date(now.getTime() - 7 * dayMs),
      amount: 3600,
      paymentStatus: 'PAID',
    },
    {
      matterId: matter5.id,
      userId: admin.id,
      billingType: 'ACCEPTANCE_RETAINER',
      title: 'Monthly Corporate Retainer Fee - September 2026',
      description: 'General corporate counsel retainer: labor contract review, SEC compliance, board advisory.',
      datePerformed: new Date(now.getTime() - 10 * dayMs),
      amount: 45000,
      paymentStatus: 'PAID',
    },
  ];

  for (const b of billingData) {
    const existing = await prisma.billingEntry.findFirst({
      where: { matterId: b.matterId, title: b.title },
    });
    if (!existing) {
      await prisma.billingEntry.create({ data: b });
    }
  }
  console.log('   ✓ 9 professional fee & disbursement entries seeded.');

  // 8. Audit Logs
  console.log('8. Seeding security audit logs...');
  const logs = [
    {
      userId: admin.id,
      action: 'LOGIN',
      entityType: 'SESSION',
      entityId: 'session-001',
      entityTitle: 'User Login: admin@legal.com',
      userIpAddress: '112.201.144.52',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
    },
    {
      userId: admin.id,
      action: 'CREATE',
      entityType: 'MATTER',
      entityId: matter1.id,
      entityTitle: 'Created Matter: Mabuhay Holdings vs. Pasig River Dev Corp',
      userIpAddress: '112.201.144.52',
    },
    {
      userId: assoc1.id,
      action: 'UPLOAD',
      entityType: 'DOCUMENT',
      entityId: 'docs-001',
      entityTitle: 'Uploaded Pleadings: Complaint_Mabuhay_vs_PasigRiver_Br158.pdf',
      userIpAddress: '119.93.18.210',
    },
  ];

  for (const log of logs) {
    await prisma.auditLog.create({ data: log });
  }
  console.log('   ✓ Audit logs seeded.');

  console.log('--- Legal Demo Database Population Complete! ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
