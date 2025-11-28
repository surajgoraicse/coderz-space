import {
	AUDIT_ACTIONS,
	AUDIT_RESOURCE_TYPE,
	PLATFORM,
	RECORD_TYPES,
	ROLES,
	STATUS,
	VERIFICATION_STATUS,
} from "@/types/constants";
import { pgEnum } from "drizzle-orm/pg-core";

// auth
export const role = pgEnum("role", ROLES);

// record :
export const recordTypeEnum = pgEnum("record_type", RECORD_TYPES);

// subdomain
export const status = pgEnum("status", STATUS);

// verification
export const platformEnum = pgEnum("platform", PLATFORM);
export const verificationTypeEnum = pgEnum("verification_type", [
	"TXT",
	"HTTP",
]);
export const verificationStatus = pgEnum(
	"verfication_status",
	VERIFICATION_STATUS
);

// audit

export const auditActions = pgEnum("audit_actions", AUDIT_ACTIONS);

export const auditResourceType = pgEnum(
	"audit_resource_type",
	AUDIT_RESOURCE_TYPE
);
