import { createServer } from "http";
import { createApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";

async function main() {
  const app = await createApp();
  const server = createServer(app);

  if (process.env.NODE_ENV === "development") {
    console.log("Setting up Vite for development...");
    await setupVite(app, server);
    console.log("Vite setup complete");
  } else {
    try {
      serveStatic(app);
    } catch (err) {
      console.warn(
        "Could not serve static build (likely not built yet). Falling back to Vite middleware.",
        err,
      );
      await setupVite(app, server);
      console.log("Vite setup complete (fallback)");
    }
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port http://localhost:${port}`);
    },
  );
}

main().catch((err) => {
  console.error("Server startup failed", err);
  process.exit(1);
});