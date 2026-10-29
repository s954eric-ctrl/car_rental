import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/components/NotFound';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Explore from '@/pages/Explore';
import VehicleDetails from '@/pages/VehicleDetails';
import Booking from '@/pages/Booking';
import Handover from '@/pages/Handover';
import History from '@/pages/History';
import Agencies from '@/pages/Agencies';
import Onboarding from '@/pages/Onboarding';
import Settings from '@/pages/Settings';
import AgencyPortal from '@/pages/AgencyPortal';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicle/:id"
            element={
              <ProtectedRoute>
                <VehicleDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/handover"
            element={
              <ProtectedRoute>
                <Handover />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agencies"
            element={
              <ProtectedRoute>
                <Agencies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency-portal"
            element={
              <ProtectedRoute>
                <AgencyPortal />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
