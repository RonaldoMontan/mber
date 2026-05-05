import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Admin from './pages/Admin/Admin';
import Dashboard from './pages/Admin/pages/Dashboard';
import MenuItems from './pages/Admin/pages/MenuItems';
import Categories from './pages/Admin/pages/Categories';
import Agenda from './pages/Admin/pages/Agenda';
import Users from './pages/Admin/pages/Users';
import { AppErrorBoundary, PrivateRoute } from './components';
import { clearAll } from './utils/storage';

function App() {
  // Validate and cleanup corrupted localStorage on mount
  useEffect(() => {
    try {
      const userKey = 'mber_user';
      const userStr = localStorage.getItem(userKey);
      
      if (userStr) {
        const parsed = JSON.parse(userStr);
        if (!parsed || typeof parsed !== 'object') {
          console.warn('Corrupted localStorage detected, clearing cache');
          clearAll();
        }
      }
    } catch (error) {
      console.warn('Failed to validate localStorage, clearing cache:', error);
      clearAll();
    }
  }, []);
  return (
    <AppErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="menu" element={<MenuItems />} />
            <Route path="schedule" element={<Agenda />} />
            <Route path="categories" element={<Categories />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </Router>
    </AppErrorBoundary>
  );
}

export default App;
