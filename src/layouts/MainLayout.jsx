import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      {/* placeholder for nested routes */}
      <ToastContainer />
      {/* toast notifications appear */}
    </>
  );
};
export default MainLayout;
