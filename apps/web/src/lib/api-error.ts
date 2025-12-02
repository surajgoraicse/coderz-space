import { NextResponse } from "next/server";
import { treeifyError, z } from "zod";

export class ApiError extends Error {
	success = false;

	constructor(
		public statusCode: number,
		public override message: string = "Something went wrong",
		public errors: unknown = [],
		public data: any = []
	) {
		super(message);
		// Capture stack trace at the point where an object is created from this class
		// if (!this.stack) {
		// 	Error.captureStackTrace(this, this.constructor);
		// }
	}
}
// Define a type for the error that Drizzle/Neon wraps
interface DrizzleWrappedError extends Error {
	cause?: PostgresError; // The actual Postgres error is here
	code?: string; // Only checked if not a Drizzle wrap
}

// Define a type for the Postgres Error structure (The inner error)
interface PostgresError extends Error {
	code?: string;
	detail?: string;
	constraint?: string;
}

export default function handleError(error: unknown) {
	// 1. Zod Validation Errors (This is fine)
	if (error instanceof z.ZodError) {
		const zodError = treeifyError(error);

		return NextResponse.json(
			new ApiError(400, "Validation Error", zodError),
			{
				status: 400,
			}
		);
	}

	// 2. Determine the source of the Postgres Error Code
	const wrappedError = error as DrizzleWrappedError;
	// Check if the error has a 'cause' (common for Drizzle wrapping Neon/Postgres.js errors)
	const pgError = (wrappedError.cause || wrappedError) as PostgresError;

	// 3. Handle Drizzle/Postgres Database Errors
	if (pgError.code) {
		switch (pgError.code) {
			case "23505": {
				// Unique constraint violation (e.g., duplicate name)
				// Try to extract the field name from the detail (e.g., Key (name)=(world) already exists.)
				const match = pgError.detail?.match(/\((.*?)\)/);
				const field = match ? match[1] : "field";

				return NextResponse.json(
					new ApiError(
						409,
						`A record with this ${field} already exists.`,
						error
					),
					{ status: 409 } // 409 Conflict
				);
			}

			case "23503": // Foreign key violation (e.g., invalid relation ID)
				return NextResponse.json(
					new ApiError(
						400,
						"The referenced record does not exist.",
						error
					),
					{ status: 400 }
				);

			case "22P02": // Invalid text representation
				return NextResponse.json(
					new ApiError(
						400,
						"Invalid input syntax (e.g., wrong UUID format or number).",
						error
					),
					{ status: 400 }
				);
		}
	}

	// 4. Handle Standard JS Errors (Manual throws)
	if (error instanceof Error) {
		console.log(JSON.stringify(error));
		return NextResponse.json(
			new ApiError(500, "Application Error", error.message),
			{ status: 500 }
		);
	}

	// 5. Catch-all for unknown errors
	return NextResponse.json(
		new ApiError(
			500,
			"An unexpected error occurred. Please try again later."
		),
		{ status: 500 }
	);
}
