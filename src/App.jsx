import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/login.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Students from "./pages/Students.jsx"
import Courses from "./pages/Courses.jsx"
import Activities from "./pages/Activities.jsx"
import Profile from "./pages/Profile.jsx"
import Settings from "./pages/Settings.jsx"
import Layout from "./components/layout.jsx"

export default function App() {
  return (

     // BrowserRouter enables HTML5 history-based navigation
    <BrowserRouter>
      <Routes>

         {/* ── Public Route ──────────────────────────────────── */}
        {/* Login is standalone — no sidebar/topbar chrome     */}
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}