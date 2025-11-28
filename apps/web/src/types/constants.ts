export const ROLES = ["ADMIN", "USERS"] as const;
export type Roles = (typeof ROLES)[number];

export const RECORD_TYPES = ["A", "AAAA", "CNAME", "TXT"] as const;
export type RecordTypes = (typeof RECORD_TYPES)[number];

export const STATUS = [
	"PENDING",
	"PROVISIONING",
	"ACTIVE",
	"ERROR",
	"DELETING",
	"DELETED",
	"BLOCKED",
] as const;
export type Status = (typeof STATUS)[number];

export const PLATFORM = ["VERCEL"] as const;
export type Platform = (typeof PLATFORM)[number];

export const VERIFICATION_STATUS = ["PENDING", "VERIFIED", "FAILED"] as const;
export type verificationStatus = (typeof VERIFICATION_STATUS)[number];

export const AUDIT_ACTIONS = [
	"CREATE-SUBDOMAIN",
	"DELETE-SUBDOMAIN",
	"UPDATE-SUBDOMAIN",
	"CREATE-RECORD",
	"UPDATE-RECORD",
	"DELETE-RECORD",
	"VERIFICATION-START",
	"VERIFICATION-FAILED",
	"VERIFICATION-SUCCESS",
	// CLOUDFLARE
	"CLOUDFLARE-ERROR",
	// USER
	"USER-CREATED",
	"USER-DELETED",
	"USER-UPDATE",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_RESOURCE_TYPE = ["SUBDOMAIN", "RECORD", "USER"] as const;
export type AuditResourceType = (typeof AUDIT_RESOURCE_TYPE)[number];
