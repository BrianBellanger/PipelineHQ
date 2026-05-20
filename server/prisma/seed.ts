import {
  PrismaClient,
  UserRole,
  ProjectStatus,
  Priority,
  ReviewDecision,
  AuditAction,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ── Guard: skip if already seeded ──────────────────────────────────────────
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('Database already has data. Run `npm run db:reset` to re-seed from scratch.');
    return;
  }

  const passwordHash = await bcrypt.hash('password123', 12);

  // ── Users ──────────────────────────────────────────────────────────────────
  const [admin, approver, submitter] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@pipelinehq.demo',
        name: 'Admin User',
        password: passwordHash,
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        email: 'approver@pipelinehq.demo',
        name: 'Alex Reviewer',
        password: passwordHash,
        role: UserRole.REVIEWER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'submitter@pipelinehq.demo',
        name: 'Sam Submitter',
        password: passwordHash,
        role: UserRole.SUBMITTER,
      },
    }),
  ]);
  console.log('✅ Users created');

  // ── Departments ────────────────────────────────────────────────────────────
  const [deptIT, , deptOps, , deptLegal, deptSecurity] = await Promise.all([
    prisma.department.create({ data: { name: 'IT' } }),
    prisma.department.create({ data: { name: 'Finance' } }),
    prisma.department.create({ data: { name: 'Operations' } }),
    prisma.department.create({ data: { name: 'HR' } }),
    prisma.department.create({ data: { name: 'Legal' } }),
    prisma.department.create({ data: { name: 'Security' } }),
  ]);
  console.log('✅ Departments created');

  // ── Categories ─────────────────────────────────────────────────────────────
  const [catSoftware, catInfra, catVendor, , catSecurity] = await Promise.all([
    prisma.category.create({ data: { name: 'Software' } }),
    prisma.category.create({ data: { name: 'Infrastructure' } }),
    prisma.category.create({ data: { name: 'Vendor' } }),
    prisma.category.create({ data: { name: 'Other' } }),
    prisma.category.create({ data: { name: 'Security' } }),
  ]);
  console.log('✅ Categories created');

  // ── Projects ───────────────────────────────────────────────────────────────

  // 1. Legacy VPN Upgrade — UNDER_REVIEW, HIGH, IT, Infrastructure
  const vpnProject = await prisma.project.create({
    data: {
      title: 'Legacy VPN Upgrade',
      description:
        'Replace the aging Cisco AnyConnect VPN infrastructure with a modern zero-trust solution to support our growing remote workforce.',
      businessJustification:
        'Current VPN capacity is at 94% utilization during peak hours and the hardware reaches end-of-support in Q1. A zero-trust approach will also reduce lateral movement risk.',
      priority: Priority.HIGH,
      status: ProjectStatus.UNDER_REVIEW,
      requestedById: submitter.id,
      ownerId: approver.id,
      categoryId: catInfra.id,
      departmentId: deptIT.id,
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
  });

  // 2. Resident Portal Modernization — SUBMITTED, MEDIUM, Operations, Software
  const portalProject = await prisma.project.create({
    data: {
      title: 'Resident Portal Modernization',
      description:
        'Rebuild the resident-facing web portal to modernize the UX, improve mobile responsiveness, and integrate with the new CRM system.',
      businessJustification:
        'The current portal was built in 2014 and has a 38% mobile bounce rate. Resident satisfaction scores for digital services have declined three quarters in a row.',
      priority: Priority.MEDIUM,
      status: ProjectStatus.SUBMITTED,
      requestedById: submitter.id,
      ownerId: approver.id,
      categoryId: catSoftware.id,
      departmentId: deptOps.id,
      dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
    },
  });

  // 3. Security Audit Remediation — APPROVED, CRITICAL, Security, Security
  const auditProject = await prisma.project.create({
    data: {
      title: 'Security Audit Remediation',
      description:
        'Address all Critical and High findings from the Q3 external penetration test. Includes patching, configuration hardening, and documentation updates.',
      businessJustification:
        'Regulatory compliance requires Critical findings to be remediated within 30 days of discovery. Three of the seven Critical findings are now past due.',
      priority: Priority.CRITICAL,
      status: ProjectStatus.APPROVED,
      requestedById: submitter.id,
      ownerId: approver.id,
      categoryId: catSecurity.id,
      departmentId: deptSecurity.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
  });

  // 4. Vendor Contract Workflow — DRAFT, LOW, Legal, Vendor
  const vendorProject = await prisma.project.create({
    data: {
      title: 'Vendor Contract Workflow',
      description:
        'Implement a digital workflow for vendor contract initiation, review, approval, and renewal tracking to replace the current manual email-based process.',
      businessJustification:
        'Contract renewals are currently tracked in spreadsheets. Two contracts lapsed unnoticed last year resulting in service interruptions and emergency renewal costs.',
      priority: Priority.LOW,
      status: ProjectStatus.DRAFT,
      requestedById: submitter.id,
      categoryId: catVendor.id,
      departmentId: deptLegal.id,
    },
  });

  // 5. Infrastructure Monitoring Upgrade — UNDER_REVIEW, HIGH, IT, Infrastructure
  const monitoringProject = await prisma.project.create({
    data: {
      title: 'Infrastructure Monitoring Upgrade',
      description:
        'Migrate from Nagios to a modern observability stack (Prometheus + Grafana) to gain real-time metrics, better alerting, and historical trend analysis.',
      businessJustification:
        'Current monitoring has a 15-minute polling interval and no distributed tracing. Two outages this year went undetected for over an hour due to monitoring gaps.',
      priority: Priority.HIGH,
      status: ProjectStatus.UNDER_REVIEW,
      requestedById: submitter.id,
      ownerId: approver.id,
      categoryId: catInfra.id,
      departmentId: deptIT.id,
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    },
  });

  console.log('✅ Projects created');

  // ── Reviews ────────────────────────────────────────────────────────────────

  // Security Audit Remediation → APPROVED (has a completed review)
  await prisma.projectReview.create({
    data: {
      projectId: auditProject.id,
      reviewerId: approver.id,
      decision: ReviewDecision.APPROVED,
      notes:
        'All remediation steps are clearly documented and the timeline is aggressive but feasible given the compliance deadline. Approved.',
    },
  });

  // Legacy VPN Upgrade → UNDER_REVIEW (review submitted, needs_info)
  await prisma.projectReview.create({
    data: {
      projectId: vpnProject.id,
      reviewerId: approver.id,
      decision: ReviewDecision.NEEDS_INFO,
      notes:
        'Please provide a comparison of at least two zero-trust vendors with TCO analysis before I can approve.',
    },
  });

  console.log('✅ Reviews created');

  // ── Comments ───────────────────────────────────────────────────────────────

  await prisma.comment.createMany({
    data: [
      // Security Audit project
      {
        projectId: auditProject.id,
        authorId: submitter.id,
        body: 'I have coordinated with the infrastructure team and they have confirmed availability for the patching windows in the proposed schedule.',
      },
      {
        projectId: auditProject.id,
        authorId: approver.id,
        body: 'Great. Please make sure the change management tickets are raised in ServiceNow before any patching begins.',
      },
      // VPN project
      {
        projectId: vpnProject.id,
        authorId: submitter.id,
        body: 'Working on the vendor comparison now. We are evaluating Zscaler and Cloudflare Access. Should have the TCO analysis ready by end of week.',
      },
      // Portal project
      {
        projectId: portalProject.id,
        authorId: submitter.id,
        body: 'The UX research report from last quarter is attached to the project documentation in SharePoint. Happy to walk anyone through the findings.',
      },
      // Monitoring project
      {
        projectId: monitoringProject.id,
        authorId: submitter.id,
        body: 'The Prometheus proof-of-concept we ran in the staging environment last month showed a 40% reduction in alert noise compared to Nagios.',
      },
    ],
  });

  console.log('✅ Comments created');

  // ── Audit Logs ─────────────────────────────────────────────────────────────

  await prisma.auditLog.createMany({
    data: [
      // VPN Project lifecycle
      {
        projectId: vpnProject.id,
        actorId: submitter.id,
        action: AuditAction.PROJECT_CREATED,
        toStatus: ProjectStatus.DRAFT,
      },
      {
        projectId: vpnProject.id,
        actorId: submitter.id,
        action: AuditAction.PROJECT_SUBMITTED,
        fromStatus: ProjectStatus.DRAFT,
        toStatus: ProjectStatus.SUBMITTED,
      },
      {
        projectId: vpnProject.id,
        actorId: admin.id,
        action: AuditAction.STATUS_CHANGED,
        fromStatus: ProjectStatus.SUBMITTED,
        toStatus: ProjectStatus.UNDER_REVIEW,
      },
      {
        projectId: vpnProject.id,
        actorId: approver.id,
        action: AuditAction.REVIEW_SUBMITTED,
        metadata: { decision: 'NEEDS_INFO' },
      },
      // Portal Project lifecycle
      {
        projectId: portalProject.id,
        actorId: submitter.id,
        action: AuditAction.PROJECT_CREATED,
        toStatus: ProjectStatus.DRAFT,
      },
      {
        projectId: portalProject.id,
        actorId: submitter.id,
        action: AuditAction.PROJECT_SUBMITTED,
        fromStatus: ProjectStatus.DRAFT,
        toStatus: ProjectStatus.SUBMITTED,
      },
      // Security Audit Project lifecycle
      {
        projectId: auditProject.id,
        actorId: submitter.id,
        action: AuditAction.PROJECT_CREATED,
        toStatus: ProjectStatus.DRAFT,
      },
      {
        projectId: auditProject.id,
        actorId: submitter.id,
        action: AuditAction.PROJECT_SUBMITTED,
        fromStatus: ProjectStatus.DRAFT,
        toStatus: ProjectStatus.SUBMITTED,
      },
      {
        projectId: auditProject.id,
        actorId: admin.id,
        action: AuditAction.STATUS_CHANGED,
        fromStatus: ProjectStatus.SUBMITTED,
        toStatus: ProjectStatus.UNDER_REVIEW,
      },
      {
        projectId: auditProject.id,
        actorId: approver.id,
        action: AuditAction.REVIEW_SUBMITTED,
        metadata: { decision: 'APPROVED' },
      },
      {
        projectId: auditProject.id,
        actorId: approver.id,
        action: AuditAction.STATUS_CHANGED,
        fromStatus: ProjectStatus.UNDER_REVIEW,
        toStatus: ProjectStatus.APPROVED,
      },
      // Vendor Project lifecycle
      {
        projectId: vendorProject.id,
        actorId: submitter.id,
        action: AuditAction.PROJECT_CREATED,
        toStatus: ProjectStatus.DRAFT,
      },
      // Monitoring Project lifecycle
      {
        projectId: monitoringProject.id,
        actorId: submitter.id,
        action: AuditAction.PROJECT_CREATED,
        toStatus: ProjectStatus.DRAFT,
      },
      {
        projectId: monitoringProject.id,
        actorId: submitter.id,
        action: AuditAction.PROJECT_SUBMITTED,
        fromStatus: ProjectStatus.DRAFT,
        toStatus: ProjectStatus.SUBMITTED,
      },
      {
        projectId: monitoringProject.id,
        actorId: admin.id,
        action: AuditAction.STATUS_CHANGED,
        fromStatus: ProjectStatus.SUBMITTED,
        toStatus: ProjectStatus.UNDER_REVIEW,
      },
    ],
  });

  console.log('✅ Audit logs created');
  console.log('');
  console.log('🎉 Seed complete!');
  console.log('');
  console.log('Demo credentials (password: password123):');
  console.log('  Admin:    admin@pipelinehq.demo');
  console.log('  Reviewer: approver@pipelinehq.demo');
  console.log('  Submitter: submitter@pipelinehq.demo');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
