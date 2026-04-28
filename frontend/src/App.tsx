import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { DashboardTabsPage } from './pages/Dashboard/DashboardTabsPage';
import { ProfilePage } from './pages/Dashboard/ProfilePage';
import { LoginPage } from './pages/Login/LoginPage';
import { FirstLoginPage } from './pages/Login/FirstLoginPage';
import { KnowledgeBasePage } from './pages/KnowledgeBase/KnowledgeBasePage';
import { ROUTE } from './constants';
import { useUserStore } from './store/useUserStore';

/** Редирект неаутентифицированных пользователей на страницу входа */
const ProtectedRoute = () => {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to={ROUTE.LOGIN} replace />;
  return <Dashboard />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Первичная авторизация — доступна по ссылке-приглашению */}
        <Route path={ROUTE.FIRST_LOGIN} element={<FirstLoginPage />} />

        {/* Обычный вход */}
        <Route path={ROUTE.LOGIN} element={<LoginPage />} />

        {/* Защищённые страницы кабинета */}
        <Route path={ROUTE.HOME} element={<ProtectedRoute />}>
          <Route index element={<Navigate to={ROUTE.PROGRESS} replace />} />
          <Route path={ROUTE.PROGRESS.slice(1)} element={<DashboardTabsPage />} />
          <Route path={ROUTE.REPORTING.slice(1)} element={<DashboardTabsPage />} />
          <Route path={ROUTE.CALENDAR.slice(1)} element={<DashboardTabsPage />} />
          <Route path={ROUTE.KNOWLEDGE_BASE.slice(1)} element={<KnowledgeBasePage />} />
          <Route path={ROUTE.PROFILE.slice(1)} element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTE.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
