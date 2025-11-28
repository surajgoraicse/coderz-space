class ApiResponse {
	constructor(
		public statusCode: number,
		public message: string,
		public data: unknown = [],
		public success = true
	) {}
}

export default ApiResponse;
