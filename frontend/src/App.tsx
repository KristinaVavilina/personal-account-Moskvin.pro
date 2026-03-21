import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { DashboardTabsPage } from './pages/Dashboard/DashboardTabsPage';
import { ProfilePage } from './pages/Dashboard/ProfilePage';
import { LoginPage } from './pages/Login/LoginPage';
import { FirstLoginPage } from './pages/Login/FirstLoginPage';
import { useUserStore } from './store/useUserStore';

/** Редирект неаутентифицированных пользователей на /login */
const ProtectedRoute = () => {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Dashboard />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Первичная авторизация — доступна по ссылке-приглашению */}
        <Route path="/first-login" element={<FirstLoginPage />} />

        {/* Обычный вход */}
        <Route path="/login" element={<LoginPage />} />

        {/* Защищённые страницы кабинета */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/statistics" replace />} />
          <Route path="statistics" element={<DashboardTabsPage />} />
          <Route path="reporting"  element={<DashboardTabsPage />} />
          <Route path="calendar"   element={<DashboardTabsPage />} />
          <Route path="profile"    element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
