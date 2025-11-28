import { db } from "@/db/db";

export const getSubdomainName = async (id: string) => {
	const subdomain = await db.query.subDomain.findFirst({
		where: (subDomain, { eq }) => eq(subDomain.id, id),
	});
	console.log(subdomain);
	return subdomain?.name;
};
export const getSubdomainFqdn = async (id: string) => {
	const subdomain = await db.query.subDomain.findFirst({
		where: (subDomain, { eq }) => eq(subDomain.id, id),
	});
	return subdomain?.fqdn;
};
