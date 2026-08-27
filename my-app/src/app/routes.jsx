import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Discover } from '../pages/student/Discover';
import { NeedDiscovery } from '../pages/student/NeedDiscovery';
import { ResourceDetail } from '../pages/student/ResourceDetail';
import { ExchangeLifecycle } from '../pages/student/ExchangeLifecycle';
import { AdminDashboard } from '../pages/admin/AdminDashboard';

// Placeholder Pages
const Profile = () => <div className="p-6"><h2>Profile</h2></div>;

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Discover />} />
        <Route path="needs" element={<NeedDiscovery />} />
        <Route path="resource/:id" element={<ResourceDetail />} />
        <Route path="borrow/:id" element={<ExchangeLifecycle />} />
        <Route path="exchange/:id" element={<ExchangeLifecycle />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
};
