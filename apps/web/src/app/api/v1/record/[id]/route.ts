import handleError, { ApiError } from "@/lib/api-error";
import ApiResponse from "@/lib/api-response";
import { checkOwnershipFromSubDomainId } from "@/lib/auth";
import { recordRepo } from "@/repository/record-repo";
import { getSubDomainFromId } from "@/repository/subdomain-repo";
import cloudflareService from "@/service/cloudflare-service";
import { createRecordReqBody } from "@/types/zod-schema";
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
		const parsedResult = createRecordReqBody.safeParse(body);
		if (!parsedResult.success) {
			return handleError(parsedResult.error);
		}
		console.log(1);
		const { subDomainId, type, ttl, proxied, content, comment, name } =
			parsedResult.data;
		const find = await getSubDomainFromId(subDomainId);
		if (!find) {
			return Response.json(
				new ApiError(404, `Sub Domain Not Found : ${subDomainId} `),
				{
					status: 404,
					statusText: "Not Found",
				}
			);
		}
		console.log(2);

		const isTypeValid = await recordRepo.validateRecordType(
			type,
			subDomainId
		);
		// TODO: fix this write isType validation here type is alredy there in the db so it is clashing with the prev one.
		// console.log(2.5, isTypeValid);

		// if (!isTypeValid.success) {
		// 	return Response.json(new ApiError(400, isTypeValid.message), {
		// 		status: 400,
		// 		statusText: "BAD REQUEST",
		// 	});
		// }
		console.log(3);

		const isValidContent = recordRepo.validateRecordContext(content, type);
		if (!isValidContent.success) {
			return (
				Response.json(
					new ApiError(
						400,
						isValidContent.message || "Content Validation Failed"
					)
				),
				{
					status: 400,
					statusText: "BAD REQUEST",
				}
			);
		}
		console.log(4);

		const isNameValid = await recordRepo.validateRecordName(name);
		if (!isNameValid.success) {
			return (
				Response.json(
					new ApiError(
						400,
						isNameValid.message || "Name Validation Failed"
					)
				),
				{
					status: 400,
					statusText: "BAD REQUEST",
				}
			);
		}
		console.log(5);

		const fqdn = `${name}.${process.env.DOMAIN}`;
		const record = await cloudflareService.updateCFRecord(
			{
				name: fqdn,
				content,
				type,
				ttl,
				proxied,
				comment,
			},
			id
		);
		if (!record) {
			return Response.json(
				new ApiError(500, "Failed to create record in Cloudflare"),
				{
					status: 500,
					statusText: "Internal Server Error",
				}
			);
		}
		console.log(6);

		const dbRecord = await recordRepo.updateRecordDb(
			{
				comment,
				content,
				proxied,
				ttl,
				type,
				name,
				
			},
			id
		);
		if (!dbRecord) {
			// TODO: Rollback to prev version
		}

		console.log(
			".......................record update Respose ......................"
		);
		console.log(record);
		console.log(dbRecord);
		console.log(
			".......................record update Respose ......................"
		);
		return Response.json(
			new ApiResponse(200, "Successfully Updated", record),
			{
				status: 200,
				statusText: "success",
			}
		);
	} catch (error) {
		return handleError(error);
	}
}

export async function DELETE(
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
		console.log(1);
		const subDomainId = await recordRepo.getSubDomainIdFromRecordId(id);
		if (!subDomainId) {
			return Response.json(
				new ApiError(404, `Sub Domain Not Found : ${subDomainId} `),
				{
					status: 404,
					statusText: "Not Found",
				}
			);
		}
		console.log(2);

		const checkOwnership = await checkOwnershipFromSubDomainId(subDomainId);
		if (!checkOwnership) {
			return Response.json(
				new ApiError(403, "You are not the owner of this subdomain"),
				{
					status: 403,
					statusText: "Forbidden",
				}
			);
		}
		console.log(3);

		const dbRecord = await recordRepo.deleteRecordDb(id);

		if (!dbRecord) {
			return Response.json(
				new ApiError(404, `Record with ID ${id} not found in DB`),
				{
					status: 404,
					statusText: "Not Found",
				}
			);
		}
		console.log(4);

		const cfRecord = await cloudflareService.deleteCFRecord(
			dbRecord.providerRecordId
		);

		if (!cfRecord) {
			// If CF deletion fails, consider re-inserting into DB or marking as failed
			console.error(
				`Failed to delete Cloudflare record for providerRecordId: ${dbRecord.providerRecordId}`
			);
			return Response.json(
				new ApiError(
					500,
					"Failed to delete record from Cloudflare, DB record deleted."
				),
				{
					status: 500,
					statusText: "Internal Server Error",
				}
			);
		}

		console.log(
			".......................record delete Response ......................"
		);
		console.log("DB Record Deleted:", dbRecord);
		console.log("CF Record Deleted:", cfRecord);
		console.log(
			".......................record delete Response ......................"
		);

		return Response.json(
			new ApiResponse(200, "Record Deleted Successfully", {
				dbRecord,
				cfRecord,
			}),
			{
				status: 200,
				statusText: "Success",
			}
		);
	} catch (error) {
		return handleError(error);
	}
}
