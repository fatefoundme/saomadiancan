import { Routes, Route } from 'react-router-dom';
import ScanEntry from './pages/ScanEntry';
import MenuPage from './pages/customer/MenuPage';
import OrderConfirm from './pages/customer/OrderConfirm';
import OrderStatus from './pages/customer/OrderStatus';
import PaymentPage from './pages/customer/PaymentPage';
import QRCodePage from './pages/QRCodePage';
import LoginPage from './pages/admin/LoginPage';
import OrderBoard from './pages/admin/OrderBoard';
import MenuManage from './pages/admin/MenuManage';

export default function App() {
  return (
    <Routes>
      {/* 顾客端 */}
      <Route path="/" element={<ScanEntry />} />
      <Route path="/menu/:tableId" element={<MenuPage />} />
      <Route path="/order-confirm" element={<OrderConfirm />} />
      <Route path="/order/:id" element={<OrderStatus />} />
      <Route path="/payment/:id" element={<PaymentPage />} />

      {/* 二维码 */}
      <Route path="/qrcodes" element={<QRCodePage />} />

      {/* 后台管理 */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/orders" element={<OrderBoard />} />
      <Route path="/admin/menu" element={<MenuManage />} />
    </Routes>
  );
}
