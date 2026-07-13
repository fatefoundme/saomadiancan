# 扫码点餐系统

TypeScript 全栈项目：模拟餐厅扫码点餐，顾客手机点餐下单 + 后厨实时接单 + DeepSeek AI 智能推荐。

**在线演示**：手机扫码 → 浏览菜单 → 加购 → 下单支付 → 后厨实时接单 → 出餐上菜。

## 技术栈

| 层       | 技术                          |
|----------|-------------------------------|
| 前端     | React 18 + TypeScript + Vite  |
| 状态管理 | Zustand                       |
| 后端     | Express + TypeScript          |
| 数据库   | Prisma 5 + SQLite             |
| 实时通信 | Socket.IO                     |
| 参数校验 | Zod                           |
| 认证     | JWT + bcrypt                  |
| AI      | DeepSeek API（OpenAI SDK）    |

## 功能演示

### 顾客端（手机浏览器）
- 扫码选桌 → 进入菜单页
- 按分类浏览菜品，查看图片和描述
- 加入购物车，调整数量
- AI 推荐：根据已点菜品智能推荐
- 提交订单 → 微信扫码支付 → 实时查看订单状态

### 后厨管理端（电脑）
- JWT 登录认证
- 实时订单看板：WebSocket 推送新订单，无需手动刷新
- 订单状态流转：已支付 → 制作中 → 已完成 → 已上菜
- 菜品管理：新增/编辑/上下架，支持图片上传
- 桌台二维码生成，可打印张贴

## 项目结构

```
扫码点餐/
├── server/
│   ├── src/
│   │   ├── index.ts              # Express + WebSocket 入口
│   │   ├── socket.ts             # Socket.IO 事件
│   │   ├── lib/                  # 工具（Prisma、Socket 单例）
│   │   ├── routes/               # 7 组 API 路由
│   │   ├── middleware/           # JWT 鉴权 + Zod 校验
│   │   └── services/            # DeepSeek AI 封装
│   └── prisma/
│       ├── schema.prisma         # 6 张表数据模型
│       └── seed.ts               # 种子数据（12道菜 + 分类 + 桌台）
│
├── web/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── customer/         # MenuPage / OrderConfirm / PaymentPage / OrderStatus
│   │   │   ├── admin/           # LoginPage / OrderBoard / MenuManage / QRCodePage
│   │   │   └── ScanEntry.tsx    # 模拟扫码入口
│   │   ├── components/          # DishCard / CartDrawer / AIRecommend 等
│   │   ├── stores/              # Zustand（cartStore）
│   │   ├── api/                 # axios 实例 + API 函数
│   │   └── types/               # 通用类型定义
│   └── vite.config.ts
│
└── package.json                  # 根目录一键启动脚本
```

## 快速启动

**环境要求**：Node.js >= 18

```bash
# 1. 安装依赖
cd server && npm install && npx prisma migrate dev --name init && npx prisma db seed
cd ../web && npm install

# 2. 返回根目录，一键启动前后端
cd .. && npm run dev
```

后端运行在 `http://localhost:3000`，前端运行在 `http://localhost:5173`。

**访问地址**：
| 端         | 地址                                  | 说明               |
|------------|---------------------------------------|--------------------|
| 扫码入口   | http://localhost:5173/                | 选桌 → 进入菜单     |
| 管理端     | http://localhost:5173/admin/login     | 账号 admin / admin123 |
| 二维码页   | http://localhost:5173/qrcodes         | 生成桌台二维码       |

### 手机扫码点餐

1. 打开 `http://localhost:5173/qrcodes`，输入电脑的局域网 IP（`ipconfig` 查看）
2. 生成二维码，手机扫码即可点餐
3. 手机和电脑需在同一 WiFi 下

## 主要 API

```
GET    /api/categories              # 分类列表
POST   /api/dishes                  # 新增菜品（需登录）
GET    /api/dishes?categoryId=&kw=  # 菜品搜索
GET    /api/tables                  # 桌台列表
POST   /api/orders                  # 提交订单
PATCH  /api/orders/:id/status       # 更新订单状态（需登录）
POST   /api/orders/:id/pay          # 支付确认（需登录）
POST   /api/recommendations         # AI 推荐
POST   /api/upload                  # 图片上传（需登录）
POST   /api/auth/login              # 管理员登录
```

## WebSocket 事件

| 事件                  | 方向             | 说明            |
|-----------------------|------------------|-----------------|
| `order:new`           | Server → Kitchen | 新订单实时推送  |
| `order:status-update` | Server → All     | 订单状态变更广播 |

## 设计亮点

- **AI 降级**：DeepSeek API 不可用时自动切换为随机推荐，不影响用户体验
- **价格快照**：OrderItem 记录下单时价格，后续改价不影响历史订单
- **图片上传**：后台支持本地上传菜品图片，Multer 处理 + 静态服务
- **支付流程**：模拟微信支付，下单 → 扫码 → 确认 → 后厨接单
- **实时推送**：Socket.IO 双向通信，后厨无需刷新页面
- **手机适配**：顾客端适配移动端，H5 响应式布局
- **Token 管理**：axios 拦截器自动携带 JWT，401 自动清除

## PS

微信支付的自动跳转（JSAPI /H5支付）需要微信商户号，商户号需要营业执照。
只能同一局域网扫码。

