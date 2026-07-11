import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { setupSocket } from './socket.js';
import { setIO } from './lib/socket.js';
import { categoriesRouter } from './routes/categories.js';
import { dishesRouter } from './routes/dishes.js';
import { tablesRouter } from './routes/tables.js';
import { ordersRouter } from './routes/orders.js';
import { authRouter } from './routes/auth.js';
import { recommendationsRouter } from './routes/recommendations.js';
import { uploadRouter } from './routes/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});
setIO(io);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// 路由挂载
app.use('/api/categories', categoriesRouter);
app.use('/api/dishes', dishesRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/upload', uploadRouter);

// 全局错误处理
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || '服务器内部错误' });
});

// WebSocket
setupSocket(io);

const PORT = 3000;
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`服务已启动: http://localhost:${PORT}`);
  console.log(`局域网访问: http://<你的IP>:${PORT}`);
});
