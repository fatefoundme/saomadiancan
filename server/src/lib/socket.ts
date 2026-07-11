import { Server } from 'socket.io';

let _io: Server | null = null;

export function setIO(io: Server) {
  _io = io;
}

export function getIO(): Server {
  if (!_io) throw new Error('Socket.IO 尚未初始化');
  return _io;
}
