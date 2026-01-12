import { PrismaClient, Prisma } from '@prisma/client'
import { getCurrentTenantId } from './tenant'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ============================================
// TENANT-SCOPED DATABASE OPERATIONS
// ============================================

/**
 * Helper para criar queries isoladas por tenant.
 * Uso: const db = await tenantDb(); const users = await db.user.findMany();
 */
export async function tenantDb() {
  const tenantId = await getCurrentTenantId()

  return {
    // User operations
    user: {
      findMany: (args?: Omit<Prisma.UserFindManyArgs, 'where'> & { where?: Prisma.UserWhereInput }) =>
        prisma.user.findMany({
          ...args,
          where: { ...args?.where, tenantId },
        }),
      findFirst: (args?: Omit<Prisma.UserFindFirstArgs, 'where'> & { where?: Prisma.UserWhereInput }) =>
        prisma.user.findFirst({
          ...args,
          where: { ...args?.where, tenantId },
        }),
      findUnique: (args: Prisma.UserFindUniqueArgs) =>
        prisma.user.findUnique(args).then(user => user?.tenantId === tenantId ? user : null),
      create: (args: Omit<Prisma.UserCreateArgs, 'data'> & { data: Omit<Prisma.UserCreateInput, 'tenant'> }) =>
        prisma.user.create({
          ...args,
          data: { ...args.data, tenant: { connect: { id: tenantId } } },
        }),
      update: (args: Prisma.UserUpdateArgs) =>
        prisma.user.update(args),
      delete: (args: Prisma.UserDeleteArgs) =>
        prisma.user.delete(args),
      count: (args?: Omit<Prisma.UserCountArgs, 'where'> & { where?: Prisma.UserWhereInput }) =>
        prisma.user.count({
          ...args,
          where: { ...args?.where, tenantId },
        }),
    },

    // Report operations
    report: {
      findMany: (args?: Omit<Prisma.ReportFindManyArgs, 'where'> & { where?: Prisma.ReportWhereInput }) =>
        prisma.report.findMany({
          ...args,
          where: { ...args?.where, tenantId },
        }),
      findFirst: (args?: Omit<Prisma.ReportFindFirstArgs, 'where'> & { where?: Prisma.ReportWhereInput }) =>
        prisma.report.findFirst({
          ...args,
          where: { ...args?.where, tenantId },
        }),
      findUnique: (args: Prisma.ReportFindUniqueArgs) =>
        prisma.report.findUnique(args).then(report => report?.tenantId === tenantId ? report : null),
      create: (args: Omit<Prisma.ReportCreateArgs, 'data'> & { data: Omit<Prisma.ReportCreateInput, 'tenant'> }) =>
        prisma.report.create({
          ...args,
          data: { ...args.data, tenant: { connect: { id: tenantId } } },
        }),
      update: (args: Prisma.ReportUpdateArgs) =>
        prisma.report.update(args),
      delete: (args: Prisma.ReportDeleteArgs) =>
        prisma.report.delete(args),
      count: (args?: Omit<Prisma.ReportCountArgs, 'where'> & { where?: Prisma.ReportWhereInput }) =>
        prisma.report.count({
          ...args,
          where: { ...args?.where, tenantId },
        }),
    },

    // Punishment operations
    punishment: {
      findMany: (args?: Omit<Prisma.PunishmentFindManyArgs, 'where'> & { where?: Prisma.PunishmentWhereInput }) =>
        prisma.punishment.findMany({
          ...args,
          where: { ...args?.where, tenantId },
        }),
      findFirst: (args?: Omit<Prisma.PunishmentFindFirstArgs, 'where'> & { where?: Prisma.PunishmentWhereInput }) =>
        prisma.punishment.findFirst({
          ...args,
          where: { ...args?.where, tenantId },
        }),
      findUnique: (args: Prisma.PunishmentFindUniqueArgs) =>
        prisma.punishment.findUnique(args).then(p => p?.tenantId === tenantId ? p : null),
      create: (args: Omit<Prisma.PunishmentCreateArgs, 'data'> & { data: Omit<Prisma.PunishmentCreateInput, 'tenant'> }) =>
        prisma.punishment.create({
          ...args,
          data: { ...args.data, tenant: { connect: { id: tenantId } } },
        }),
      update: (args: Prisma.PunishmentUpdateArgs) =>
        prisma.punishment.update(args),
      delete: (args: Prisma.PunishmentDeleteArgs) =>
        prisma.punishment.delete(args),
      count: (args?: Omit<Prisma.PunishmentCountArgs, 'where'> & { where?: Prisma.PunishmentWhereInput }) =>
        prisma.punishment.count({
          ...args,
          where: { ...args?.where, tenantId },
        }),
    },

    // Organization operations
    organization: {
      findMany: (args?: Omit<Prisma.OrganizationFindManyArgs, 'where'> & { where?: Prisma.OrganizationWhereInput }) =>
        prisma.organization.findMany({
          ...args,
          where: { ...args?.where, tenantId },
        }),
      create: (args: Omit<Prisma.OrganizationCreateArgs, 'data'> & { data: Omit<Prisma.OrganizationCreateInput, 'tenant'> }) =>
        prisma.organization.create({
          ...args,
          data: { ...args.data, tenant: { connect: { id: tenantId } } },
        }),
      delete: (args: Prisma.OrganizationDeleteArgs) =>
        prisma.organization.delete(args),
    },

    // ReportReason operations
    reportReason: {
      findMany: (args?: Omit<Prisma.ReportReasonFindManyArgs, 'where'> & { where?: Prisma.ReportReasonWhereInput }) =>
        prisma.reportReason.findMany({
          ...args,
          where: { ...args?.where, tenantId },
        }),
      create: (args: Omit<Prisma.ReportReasonCreateArgs, 'data'> & { data: Omit<Prisma.ReportReasonCreateInput, 'tenant'> }) =>
        prisma.reportReason.create({
          ...args,
          data: { ...args.data, tenant: { connect: { id: tenantId } } },
        }),
      delete: (args: Prisma.ReportReasonDeleteArgs) =>
        prisma.reportReason.delete(args),
    },

    // PunishmentDuration operations
    punishmentDuration: {
      findMany: (args?: Omit<Prisma.PunishmentDurationFindManyArgs, 'where'> & { where?: Prisma.PunishmentDurationWhereInput }) =>
        prisma.punishmentDuration.findMany({
          ...args,
          where: { ...args?.where, tenantId },
        }),
      create: (args: Omit<Prisma.PunishmentDurationCreateArgs, 'data'> & { data: Omit<Prisma.PunishmentDurationCreateInput, 'tenant'> }) =>
        prisma.punishmentDuration.create({
          ...args,
          data: { ...args.data, tenant: { connect: { id: tenantId } } },
        }),
      delete: (args: Prisma.PunishmentDurationDeleteArgs) =>
        prisma.punishmentDuration.delete(args),
    },

    // ArchivePeriod operations
    archivePeriod: {
      findMany: (args?: Omit<Prisma.ArchivePeriodFindManyArgs, 'where'> & { where?: Prisma.ArchivePeriodWhereInput }) =>
        prisma.archivePeriod.findMany({
          ...args,
          where: { ...args?.where, tenantId },
        }),
      findFirst: (args?: Omit<Prisma.ArchivePeriodFindFirstArgs, 'where'> & { where?: Prisma.ArchivePeriodWhereInput }) =>
        prisma.archivePeriod.findFirst({
          ...args,
          where: { ...args?.where, tenantId },
        }),
      create: (args: Omit<Prisma.ArchivePeriodCreateArgs, 'data'> & { data: Omit<Prisma.ArchivePeriodCreateInput, 'tenant'> }) =>
        prisma.archivePeriod.create({
          ...args,
          data: { ...args.data, tenant: { connect: { id: tenantId } } },
        }),
      update: (args: Prisma.ArchivePeriodUpdateArgs) =>
        prisma.archivePeriod.update(args),
      delete: (args: Prisma.ArchivePeriodDeleteArgs) =>
        prisma.archivePeriod.delete(args),
    },

    // SystemSetting operations
    systemSetting: {
      findMany: (args?: Omit<Prisma.SystemSettingFindManyArgs, 'where'> & { where?: Prisma.SystemSettingWhereInput }) =>
        prisma.systemSetting.findMany({
          ...args,
          where: { ...args?.where, tenantId },
        }),
      findFirst: (args?: Omit<Prisma.SystemSettingFindFirstArgs, 'where'> & { where?: Prisma.SystemSettingWhereInput }) =>
        prisma.systemSetting.findFirst({
          ...args,
          where: { ...args?.where, tenantId },
        }),
      upsert: (args: { where: { key: string }; update: Prisma.SystemSettingUpdateInput; create: Omit<Prisma.SystemSettingCreateInput, 'tenant'> }) =>
        prisma.systemSetting.upsert({
          where: { key_tenantId: { key: args.where.key, tenantId } },
          update: args.update,
          create: { ...args.create, tenant: { connect: { id: tenantId } } },
        }),
    },

    // Acesso direto ao tenantId
    tenantId,
  }
}

// Helper para transacoes com tenant scope
export async function tenantTransaction<T>(
  fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  const tenantId = await getCurrentTenantId()

  return prisma.$transaction(async (tx) => {
    // Injeta tenantId no contexto da transacao
    // A funcao recebe o tx e deve usar tenantId para filtrar
    return fn(tx)
  })
}
