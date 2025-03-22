import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import createMemoryStore from "memorystore";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// セッション設定の強化
const MemoryStore = createMemoryStore(session);
app.use(session({
  cookie: { 
    maxAge: 86400000, // 24時間
    secure: process.env.NODE_ENV === 'production', // 本番環境ではHTTPSを強制
    httpOnly: true, // XSS対策
    sameSite: 'strict' // CSRF対策
  },
  store: new MemoryStore({
    checkPeriod: 86400000 // 24時間ごとに期限切れエントリを削除
  }),
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET || 'run-tracker-session-secret'
}));

// リクエストログの改善
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
      let logLine = `[${new Date().toISOString()}] ${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        // 機密情報をマスク
        const maskedResponse = maskSensitiveData(capturedJsonResponse);
        logLine += ` :: ${JSON.stringify(maskedResponse)}`;
      }

      if (logLine.length > 200) {
        logLine = logLine.slice(0, 199) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// 機密情報をマスクする関数
function maskSensitiveData(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = ['password', 'token', 'secret'];
  const masked = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in masked) {
      masked[field] = '***MASKED***';
    }
  }
  
  return masked;
}

(async () => {
  try {
    const server = await registerRoutes(app);

    // エラーハンドリングの改善
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = process.env.NODE_ENV === 'production' 
        ? "Internal Server Error"
        : err.message || "Internal Server Error";

      // エラーログの出力
      log(`[ERROR] ${err.stack || err.message}`);
      
      res.status(status).json({ 
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });

    // 開発環境と本番環境の設定
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // サーバー起動設定
    const port = process.env.PORT || 5000;
    const host = process.env.HOST || 'localhost';

    server.listen({
      port,
      host,
      reusePort: true,
    }, () => {
      log(`[INFO] Server running on http://${host}:${port} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    log(`[FATAL] Server failed to start: ${error}`);
    process.exit(1);
  }
})();
