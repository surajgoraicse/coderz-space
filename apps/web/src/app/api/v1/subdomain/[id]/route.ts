import handleError from "@/lib/api-error";
import ApiResponse from "@/lib/api-response";
import { cloudflareClient } from "@/lib/cloudflare";
import { NextRequest } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const recordId = (await params)?.id;
		if (!recordId) {
			return Response.json(
				new ApiResponse(400, "Record ID not found", false),
				{
					status: 404,
					statusText: "Bad Request",
				}
			);
		}

		const recordResponse = await cloudflareClient.dns.records.get(
			recordId,
			{
				zone_id: process.env.ZONE_ID!,
			}
		);
		return Response.json(new ApiResponse(200, "success", recordResponse));
	} catch (error) {
		handleError(error);
	}
}


