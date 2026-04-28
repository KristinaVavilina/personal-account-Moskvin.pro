import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';

export const Dashboard = () => {
  return (
    <div className="page">
      <Sidebar />
      <Outlet />
    </div>
  );
};
