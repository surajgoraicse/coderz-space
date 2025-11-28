import { z } from "zod";

const ipv4 = z.ipv4();
const ipv6 = z.ipv6();

const val1 = "216.198.79.1";
const val2 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";

const parse = ipv6.safeParse(val2);
if (!parse.success) {
	console.log(parse.error);
} else {
	console.log(parse.data);
}
