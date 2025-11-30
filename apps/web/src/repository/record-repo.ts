import { db } from "@/db/db";
import { InsertRecord, record, SelectRecord } from "@/db/schema";
import { RecordTypes } from "@/types/constants";
import { DB } from "@/types/types";
import {
	cnameContentSchema,
	ipv4Schema,
	ipv6Schema,
	txtSchema,
} from "@/types/zod-schema";

interface IRecordRepository {
	getAllRecordsFromSubDomainId(id: string): Promise<SelectRecord[]>;
	getAllRecordsIdFromSubDomainId(id: string): Promise<{ id: string }[]>;
	createRecordDb(record: InsertRecord): Promise<SelectRecord | undefined>;
	validateRecordType(
		type: RecordTypes,
		subDomainId: string
	): Promise<{ success: boolean; message: string | undefined }>;
	validateRecordName(
		name: string
	): Promise<{ success: boolean; message: string | undefined }>;
	validateRecordContext(
		content: string,
		type: RecordTypes
	): { success: boolean; message: string | undefined };
}

class RecordRepo implements IRecordRepository {
	db: DB;
	constructor(db: DB) {
		this.db = db;
	}
	async getAllRecordsFromSubDomainId(id: string) {
		return await db.query.record.findMany({
			where: (records, { eq }) => eq(records.subDomainId, id),
		});
	}
	async getAllRecordsIdFromSubDomainId(
		id: string
	): Promise<{ id: string }[]> {
		return await db.query.record.findMany({
			where: (records, { eq }) => eq(records.subDomainId, id),
			columns: {
				id: true,
			},
		});
	}
	async createRecordDb(
		recordValues: InsertRecord
	): Promise<SelectRecord | undefined> {
		const create = await this.db
			.insert(record)
			.values(recordValues)
			.returning();
		console.log(".................create record in db...............");
		console.log(create);
		console.log(".................create record in db...............");
		return create[0];
	}
	async validateRecordType(type: RecordTypes, subDomainId: string) {
		// this function validates a new record type : return true if all good otherwise false
		// checks if a record already exists : if 'A' already exist then it wont allow to create an another one
		// checks if 'cname' already exists : if exist then it wont allow to create any other record on the name
		// allows multiple txt record.

		const records = await this.getAllRecordsFromSubDomainId(subDomainId);
		const exist = records.some(
			(record) =>
				(record.type === type && record.type !== "TXT") ||
				record.type === "CNAME"
		);
		if (!exist) {
			return { success: false, message: "Type Validation Failed" };
		}
		return {
			success: true,
			message: undefined,
		};
	}

	async validateRecordName(
		name: string
	): Promise<{ success: boolean; message: string | undefined }> {
		// 1. Basic format validation (must end with coderz.space)
		if (!name.endsWith(".coderz.space")) {
			return {
				success: false,
				message: "Invalid record name. Must end with .coderz.space",
			};
		}

		// 2. Ensure there's something before coderz.space
		const parts = name.replace(".coderz.space", "").split(".");
		if (parts.some((p) => p.trim().length === 0)) {
			return {
				success: false,
				message: "Invalid subdomain structure",
			};
		}

		// 3. Check if already exists in DB
		const existing = await this.db.query.subDomain.findFirst({
			where: (tbl, { eq }) => eq(tbl.name, name),
		});

		if (existing) {
			return {
				success: false,
				message: "Name already exists in the database",
			};
		}

		// 4. All good
		return {
			success: true,
			message: "Valid record name",
		};
	}

	validateRecordContext(
		content: string,
		type: RecordTypes
	): { success: boolean; message: string | undefined } {
		// validate record content :
		// CNAME : should be a url
		// A : ipv4
		// AAAA : ipv6
		// TXT : string

		let parseResult: { success: boolean; error?: any } | undefined;

		switch (type) {
			case "A":
				parseResult = ipv4Schema.safeParse(content);
				break;
			case "AAAA":
				parseResult = ipv6Schema.safeParse(content);
				break;
			case "CNAME":
				parseResult = cnameContentSchema.safeParse(content);
				break;
			case "TXT":
				parseResult = txtSchema.safeParse(content);
				break;
			default:
				return { success: false, message: undefined };
		}

		if (!parseResult) {
			return { success: false, message: undefined };
		}

		if (parseResult.success) {
			return { success: true, message: undefined };
		}

		// try to extract a useful error message from the parser, fallback to generic message
		const errMessage =
			(parseResult.error &&
				(parseResult.error.message ||
					(Array.isArray(parseResult.error.issues) &&
						parseResult.error.issues[0]?.message))) ||
			"Invalid record content";
		return { success: false, message: String(errMessage) };
	}
}

export const recordRepo = new RecordRepo(db);
