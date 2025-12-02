import { db } from "@/db/db"; // your drizzle instance
import * as schema from "@/db/schema/auth";
import { ApiError } from "@/lib/api-error";
import { subDomainRepo } from "@/repository/subdomain-repo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { headers } from "next/headers";

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	database: drizzleAdapter(db, {
		provider: "pg", // or "mysql", "sqlite"
		schema: schema,
	}),
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
		},
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "USER",
				input: false,
			},
		},
	},
});

export async function getUserSession() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	return session;
}
export async function checkUserType() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		return Response.json(new ApiError(401, "Unauthorized Login first"));
	}
	return session.user.role;
}
export async function getUserIdFromSession() {
	const session = await getUserSession();
	return session?.user?.id;
}

export async function checkOwnershipFromSubDomainId(subDomainId: string) {
	const ownerId = await getUserIdFromSession();
	const subDomain = await subDomainRepo.getSubDomainFromIdUnsafe(subDomainId);
	if (subDomain?.ownerId === ownerId) {
		return ownerId;
	} else return null;
}
