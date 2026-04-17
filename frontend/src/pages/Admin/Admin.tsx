import { Outlet } from 'react-router-dom';
import { Sidebar } from './components';

const Admin = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Admin;
