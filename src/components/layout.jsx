    import { useEffect, useState } from "react"
    import { useNavigate, NavLink } from "react-router-dom"
    import { supabase } from "../supabase"
    import logo from "../pages/assets/logo.png"
    import { BellSimpleIcon, BookOpenUserIcon, ChatTeardropTextIcon, ClipboardTextIcon, GearIcon, HouseIcon, MagnifyingGlassIcon, SignOutIcon, UserCircleIcon, UsersIcon } from "@phosphor-icons/react"
    import "./Layout.css"
    import { Outlet } from "react-router-dom"

    export default function Layout({ children }) {
    // ─── Navigation ───────────────────────────────────────────
    const navigate = useNavigate()

    // ─── Logout ───────────────────────────────────────────────
    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/")
    }

    // ─── State ────────────────────────────────────────────────
        const [adminPhoto, setAdminPhoto] = useState(null)
        const [sidebarOpen, setSidebarOpen] = useState(false)
        const [globalSearch, setGlobalSearch] = useState("")
        const [searchResults, setSearchResults] = useState([])
        const [showResults, setShowResults] = useState(false)
        


    // ─── Global Search Handler ────────────────────────────────
    // Queries both students and courses in parallel; hides dropdown
    // if the input is shorter than 2 characters to avoid noisy results
        const handleGlobalSearch = async (query) => {
        setGlobalSearch(query)
        if (query.length < 2) { setSearchResults([]); setShowResults(false); return }

        const [{ data: students }, { data: courses }] = await Promise.all([
            supabase.from("students").select("student_id, first_name, last_name, degree_program")
            .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,student_id.ilike.%${query}%`)
            .limit(5),
            supabase.from("courses").select("course_id, course_name, semester")
            .or(`course_name.ilike.%${query}%,course_id.ilike.%${query}%`)
            .limit(5)
        ])

        const results = [
            ...(students || []).map(s => ({ type: "student", label: `${s.first_name} ${s.last_name}`, sub: s.student_id, path: "/students" })),
            ...(courses || []).map(c => ({ type: "course", label: c.course_name, sub: `Semester ${c.semester}`, path: "/courses" }))
        ]
        setSearchResults(results)
        setShowResults(true)
        }

         // ─── Fetch Admin Avatar ───────────────────────────────────
        useEffect(() => {
        const getAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.user_metadata?.avatar_url) {
            setAdminPhoto(user.user_metadata.avatar_url)
            }
        }
        getAdmin()
        }, [])

    return (
        <div className="layout-container">

        {sidebarOpen && (
  <div
    className="sidebar-overlay"
    onClick={() => setSidebarOpen(false)}
  />
)}

{/* SIDEBAR */}
<div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
  <img
    src={logo}
    alt="Logo"
    className="login-logo"
  />

  <p className="sidebar-section-title">Menu</p>

  {/* Primary navigation links */}
  <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)} className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
    <HouseIcon size={24} weight="bold" color="#3d3e71" />Dashboard
  </NavLink>
  <NavLink to="/students" onClick={() => setSidebarOpen(false)} className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
    <UsersIcon size={24} weight="bold" color="#3d3e71" />Students
  </NavLink>
  <NavLink to="/courses" onClick={() => setSidebarOpen(false)} className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
    <BookOpenUserIcon size={24} weight="bold" color="#3d3e71" />Courses
  </NavLink>
  <NavLink to="/activities" onClick={() => setSidebarOpen(false)} className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
    <ClipboardTextIcon size={24} weight="bold" color="#3d3e71" />Activities
  </NavLink>

  {/* Secondary / utility links pinned to the bottom */}
  <div className="sidebar-bottom">
    <p className="sidebar-section-title">Other</p>
    <NavLink to="/profile" onClick={() => setSidebarOpen(false)} className="sidebar-link">
      <UserCircleIcon size={24} weight="bold" color="#3d3e71" />Profile
    </NavLink>
    <NavLink to="/settings" onClick={() => setSidebarOpen(false)} className="sidebar-link">
      <GearIcon size={24} weight="bold" color="#3d3e71" />Settings
    </NavLink>
    <button onClick={handleLogout} className="logout-btn">
      <SignOutIcon size={24} weight="bold" color="#3d3e71" />Log Out
    </button>
  </div>
</div>

        {/* RIGHT SIDE */}
        <div className="layout-main">

            {/* TOPBAR */}
            <div className="topbar">
                    <button
                    className="hamburger-btn"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                    ☰
                    </button>
            <div className="topbar-search" style={{ position: "relative" }}>
                <input
                    className="topbar-search-input"
                    placeholder="What do you want to find?"
                    value={globalSearch}
                    onChange={(e) => handleGlobalSearch(e.target.value)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    onFocus={() => globalSearch.length >= 2 && setShowResults(true)}
                />
                <MagnifyingGlassIcon size={19} weight="bold" color="#3d3e71" />
                {showResults && searchResults.length > 0 && (
                    <div className="search-dropdown">
                    {searchResults.map((result, i) => (
                        <div
                        key={i}
                        className="search-result-item"
                        onClick={() => { 
                            navigate(`${result.path}?search=${encodeURIComponent(result.type === "student" ? result.sub : result.label)}`)
                            setGlobalSearch("")
                            setShowResults(false) 
                            }}
                        >
                        <span className={`result-type ${result.type}`}>
                            {result.type === "student" ? "👤" : "📚"}
                        </span>
                        <div>
                            <p>{result.label}</p>
                            <span>{result.sub}</span>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>

            {/* Topbar right — notifications, messages, and admin badge */}
            <div className="topbar-right">
                <span><BellSimpleIcon size={24} weight="bold" color="#3d3e71" /></span>
                <span><ChatTeardropTextIcon size={24} weight="bold" color="#3d3e71" /></span>
                <div className="admin-badge">
                    {adminPhoto ? (
                        <img src={adminPhoto} alt="Admin" className="admin-avatar" />
                    ) : (
                        <span>👤</span>
                    )}
                    <div>
                        GARM Perera
                        <span>Admin</span>
                    </div>
                </div>
            </div>
            </div>

            {/* PAGE CONTENT */}
            <div className="page-content">
                <Outlet />
            </div>

        </div>
        </div>
    )
}