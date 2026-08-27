import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useAppStore } from './store';
import { Discover }         from '../pages/student/Discover';
import { NeedDiscovery }    from '../pages/student/NeedDiscovery';
import { ResourceDetail }   from '../pages/student/ResourceDetail';
import { ExchangeLifecycle } from '../pages/student/ExchangeLifecycle';
import { MyExchanges }      from '../pages/student/MyExchanges';
import { Community }        from '../pages/student/Community';
import { Profile }          from '../pages/student/Profile';
import { Impact }           from '../pages/student/Impact';
import { AdminDashboard }   from '../pages/admin/AdminDashboard';
import { Login }            from '../pages/auth/Login';

const RequireAuth = ({ children }) => {
  const currentUser = useAppStore(s => s.currentUser);
  return currentUser ? children : <Navigate to="/login" replace />;
};

export const AppRoutes = () => {
  const location = useLocation();
  return (
    <Routes location={location}>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route index                          element={<Discover />} />
        <Route path="needs"                   element={<NeedDiscovery />} />
        <Route path="resource/:id"            element={<ResourceDetail />} />
        <Route path="borrow/:resourceId"      element={<ExchangeLifecycle />} />
        <Route path="exchange/:exchangeId"    element={<ExchangeLifecycle />} />
        <Route path="exchanges"               element={<MyExchanges />} />
        <Route path="community"               element={<Community />} />
        <Route path="profile"                 element={<Profile />} />
        <Route path="impact"                  element={<Impact />} />
        <Route path="admin"                   element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
};
