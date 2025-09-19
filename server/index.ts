import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cron from "node-cron";
import { syncBlogPosts, syncCompositions, syncRecordings, syncMedia } from "./sync";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Shared mutex to prevent overlapping sync operations (shared with routes.ts)
  let syncMutex = (global as any).syncMutex || { isSyncing: false };
  (global as any).syncMutex = syncMutex;
  
  async function performSync() {
    if (syncMutex.isSyncing) {
      log('Sync already in progress, skipping...');
      return;
    }
    
    syncMutex.isSyncing = true;
    try {
      log('Starting Notion sync...');
      await syncBlogPosts();
      await syncCompositions();
      await syncRecordings();
      // Download images from blog posts and compositions
      const { downloadAllImages } = await import("./downloadImages");
      await downloadAllImages();
      log('Notion sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      syncMutex.isSyncing = false;
    }
  }
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // Perform initial sync on startup
    log('Performing initial sync on startup...');
    await performSync();
    
    // Set up cron job to sync from Notion every 15 minutes, 24/7
    cron.schedule('*/15 * * * *', async () => {
      await performSync();
    }, {
      timezone: 'UTC'
    });
    
    // Set up daily full sync at 3 AM UTC for reconciliation
    cron.schedule('0 3 * * *', async () => {
      log('Starting daily full sync...');
      await performSync();
    }, {
      timezone: 'UTC'
    });
    
    log('Notion sync scheduled: every 15 minutes + daily full sync at 3 AM UTC');
  });
})();
