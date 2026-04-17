import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Admin from './pages/Admin/Admin';
import Dashboard from './pages/Admin/pages/Dashboard';
import MenuItems from './pages/Admin/pages/MenuItems';
import Categories from './pages/Admin/pages/Categories';
import Users from './pages/Admin/pages/Users';
import { PrivateRoute } from './components';

function App() {
  return (
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
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
