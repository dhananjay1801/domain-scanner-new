import { Routes, Route } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";

import Landing from "./pages/LandingPage";
import Auth from "./pages/AuthPage";
import Scan from "./pages/AuditDomain";
import MalwareScan from "./pages/MalwareScan";
import ScanDashboard from "./pages/ScanDashboard";
import ScanDetails from "./pages/ScanDetails";
import ScanHistory from "./pages/ScanHistory";
import AdminUsers from "./pages/AdminUsers";
import AdminSubscription from "./pages/AdminSubscription";
import Assessment from "./pages/Assessment";
import MalwareScanHistory from "./pages/MalwareScanHistory";
import MalwareDashboard from "./pages/MalwareDashboard";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Landing />} />
      </Route>

      <Route path="/auth" element={<PublicLayout />}>
        <Route index element={<Auth />} />
      </Route>

      <Route path="/" element={<DashboardLayout />}>
        <Route path="scan-dashboard" element={<ScanDashboard />} />
        <Route path="scan-details" element={<ScanDetails />} />
        <Route path="scan" element={<Scan />} />
        <Route path="history" element={<ScanHistory />} />
        <Route path="malware" element={<MalwareScan />} />
        <Route path="malware-history" element={<MalwareScanHistory />} />
        <Route path="malware-dashboard" element={<MalwareDashboard />} />
        <Route path="assessment" element={<Assessment />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin area uses its own layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminUsers />} />
        <Route path="subscription" element={<AdminSubscription />} />
      </Route>
    </Routes>
  );
}

export default App;
