import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import Places from "./pages/Places";
import Capacity from "./pages/Capacity";
import Supplies from "./pages/Supplies";
import Dispatch from "./pages/Dispatch";
import Inspection from "./pages/Inspection";
import Public from "./pages/Public";
import Drills from "./pages/Drills";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/places" element={<Places />} />
          <Route path="/capacity" element={<Capacity />} />
          <Route path="/supplies" element={<Supplies />} />
          <Route path="/dispatch" element={<Dispatch />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/public" element={<Public />} />
          <Route path="/drills" element={<Drills />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}
