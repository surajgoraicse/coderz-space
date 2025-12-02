import { db } from "@/db/db";
import { InsertVerificationRecord, verificationRecord } from "@/db/schema";
import { DB } from "better-auth/adapters/drizzle";

interface IVerification {
	createVerificationRecord(
		data: InsertVerificationRecord
	): Promise<InsertVerificationRecord | undefined>;
}

class VerificationRepository implements IVerification {
	db: DB;
	constructor(db: DB) {
		this.db = db;
	}
	async createVerificationRecord(data: InsertVerificationRecord) {
		const create = await db
			.insert(verificationRecord)
			.values(data)
			.returning();
		return create[0];
	}
}

export const verificationRepo = new VerificationRepository(db);
