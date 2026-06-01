import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { fetchCurrentUserProfile } from '../../api/profile';
import { useUserStore } from '../../store/useUserStore';

export const Dashboard = () => {
  const roleLoaded = useUserStore((s) => s.roleLoaded);
  const setApiRole = useUserStore((s) => s.setApiRole);

  useEffect(() => {
    if (roleLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const profile = await fetchCurrentUserProfile();
        if (!cancelled) setApiRole(profile?.role ?? null);
      } catch {
        if (!cancelled) setApiRole(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roleLoaded, setApiRole]);

  return (
    <div className="page">
      <Sidebar />
      <Outlet />
    </div>
  );
};
