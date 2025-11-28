import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { user } from "./auth";
import { auditActions, auditResourceType, role } from "./enums";

export const auditLogs = pgTable("audit_logs", {
	id: uuid("id").defaultRandom().primaryKey(),
	actorType: role("actor_type").notNull(),
	actorId: text("actor_id").references(() => user.id, {
		onDelete: "no action",
	}),
	actionActions: auditActions("action").notNull(),
	resourceType: auditResourceType("resource_type").notNull(),
	oldValue: text("old_value"),
	newValue: text("new_value"),
	meta: text("meta"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const SelectAuditLogSchema = createSelectSchema(auditLogs);
export type SelectAuditLog = z.infer<typeof SelectAuditLogSchema>;
export const InsertAuditLogSchema = createInsertSchema(auditLogs);
export type InsertAuditLog = z.infer<typeof InsertAuditLogSchema>;
