import { Server, Socket } from 'socket.io';

export function setupSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket 连接: ${socket.id}`);

    // 后厨加入实时监听
    socket.on('join:kitchen', () => {
      socket.join('kitchen');
      console.log(`后厨已加入: ${socket.id}`);
    });

    // 顾客跟踪特定订单
    socket.on('join:order', (orderId: number) => {
      const room = `order:${orderId}`;
      socket.join(room);
      console.log(`顾客加入订单房间 ${room}: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket 断开: ${socket.id}`);
    });
  });
}
