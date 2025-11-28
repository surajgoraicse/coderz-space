import { cloudflareClient } from "@/lib/cloudflare";

export async function createCloudflareRecord() {
	const recordResponse = await cloudflareClient.dns.records.create({
		zone_id: "023e105f4ecef8ad9ca31a8372d0c353",
		name: "example.com",
		ttl: 3600,
		type: "A",
	});
}
