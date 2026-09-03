import { createApp } from "../server/app";

let appPromise: ReturnType<typeof createApp> | undefined;

function getApp() {
	appPromise ??= createApp();
	return appPromise;
}

export default async function handler(req: any, res: any) {
	try {
		const requestUrl = String(req.url || "/");
		if (!requestUrl.startsWith("/api/")) {
			req.url = `/api${requestUrl.startsWith("/") ? requestUrl : `/${requestUrl}`}`;
		}
		const app = await getApp();
		return app(req, res);
	} catch (error) {
		console.error("API request failed", error);
		return res.status(500).json({ error: "Internal server error" });
	}
}