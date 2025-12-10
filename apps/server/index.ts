import express from "express";

const app = express();

app.get("/health", (req, res) => {
	res.status(200).json({
		health: "ok",
	});
});

app.listen(8005, () => {
	console.log('server is listening at port 8005');
})