import handleError, { ApiError } from "@/lib/api-error";
import ApiResponse from "@/lib/api-response";
import { cloudflareClient } from "@/lib/cloudflare";
import { createRecordSchema } from "@/types/zodSchemas";
import { NextRequest } from "next/server";

export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = (await params).id;
		if (!id) {
			return Response.json(new ApiError(400, "Record ID not found"), {
				status: 400,
				statusText: "Bad Request",
			});
		}
		const body = await req.json();
		const parsedBody = createRecordSchema.safeParse(body);
		if (!parsedBody.success) {
			return handleError(parsedBody.error);
		}
		const { content, proxied, ttl, type, name, comment } = parsedBody.data;
		if (!name) {
			return Response.json(new ApiError(400, "Record Name not found"), {
				status: 400,
				statusText: "Bad Request",
			});
		}

		const recordResponse = await cloudflareClient.dns.records.edit(id, {
			zone_id: process.env.ZONE_ID!,
			name,
			ttl,
			type,
			proxied,
			content,
			comment,
		});
		console.log(
			".......................record Respose ......................"
		);
		console.log(recordResponse);
		console.log(
			".......................record Respose ......................"
		);
		return Response.json(
			new ApiResponse(200, "Successfully Updated", recordResponse),
			{
				status: 200,
				statusText: "success",
			}
		);
	} catch (error) {
		return handleError(error);
	}
}
