import { io } from 'socket.io-client';

// ใช้ hostname เดียวกับที่เปิดหน้าเว็บ ทำให้ทำงานได้ทั้ง localhost และ IP เครือข่าย
const BACKEND_URL = `${window.location.protocol}//${window.location.hostname}:3001`;

export const socket = io(BACKEND_URL, {
  autoConnect: false,
});
