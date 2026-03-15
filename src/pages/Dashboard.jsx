  import { useEffect, useState } from "react"
  import { useNavigate, NavLink } from "react-router-dom"
  import { supabase } from "../supabase"
  import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
  } from "recharts"
  import "./Dashboard.css"
  import logo  from "./assets/logo.png"
  import { BellSimpleIcon, BookOpenUserIcon, ChatTeardropTextIcon, ClipboardTextIcon, GearIcon, HouseIcon, MagnifyingGlassIcon, SignOutIcon, StudentIcon, UserCircleIcon, UsersIcon, UsersThreeIcon } from "@phosphor-icons/react"

  // ─── Static Chart Data ─────────────────────────────────────────
 // Hardcoded weekly attendance percentages for the bar chart
  const attendanceData = [
    { day: "Mon", present: 80, absent: 20 },
    { day: "Tue", present: 88, absent: 12 },
    { day: "Wed", present: 76, absent: 24 },
    { day: "Thur", present: 70, absent: 30 },
    { day: "Fri", present: 72, absent: 28 },
  ]

  // Male / Female split used by both donut rings
  const genderData = [
    { name: "Male", value: 150 },
    { name: "Female", value: 100 },
  ]

  const COLORS = ["#93c5fd", "#fde68a"]

  export default function Dashboard() {
    // ─── State ──────────────────────────────────────────────────
    const navigate = useNavigate()
    const [studentCount, setStudentCount] = useState(0)
    const [courseCount, setCourseCount] = useState(0)
    const [recentLogs, setRecentLogs] = useState([])

    useEffect(() => {
      fetchStats()
    }, [])

    const fetchStats = async () => {
      // ─── Fetch Dashboard Stats ───────────────────────────────────
      const { count: students } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })// head: true = count only, no rows

      const { count: courses } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })

      const { data: logs } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(2)// Only the 2 most recent entries for the "Recent Activities" panel

      setStudentCount(students || 0)
      setCourseCount(courses || 0)
      setRecentLogs(logs || [])
    }


    return (
      <div className="dashboard-container">


        {/* MAIN CONTENT */}
        <div className="main-content">

          

          {/* STAT CARDS */}
          <div className="stats-row">
            <div style={{ width: "100%" }}>
              <h1 className="dashboard-title">Admin Dashboard</h1>
              <div style={{ display: "flex", gap: "20px" }}>
                <div className="stat-card purple">
                  <div className="stat-info">
                    <h3>Students</h3>
                    <p>{studentCount}</p>
                  </div>
                  <span className="stat-icon"><StudentIcon size={50} weight="fill" color="#A43FAB" /></span>
                </div>
                <div className="stat-card blue">
                  <div className="stat-info">
                    <h3>Courses</h3>
                    <p>{courseCount}</p>
                  </div>
                  <span className="stat-icon"><BookOpenUserIcon size={50} weight="fill" color="#7A92D3"/></span>
                </div>
                <div className="stat-card green">
                  <div className="stat-info">
                    <h3>Pending Registrations</h3>
                    <p>0</p>
                  </div>
                  <span className="stat-icon"><UsersThreeIcon size={50} weight="fill" color="#62CBA9"/></span>
                </div>
              </div>
            </div>
          </div>

          {/* CHARTS ROW */}
          <div className="charts-row">

            {/* ATTENDANCE BAR CHART */}
            <div className="chart-panel wide">
              <div className="panel-header">
                <h2 className="panel-title">Attendance</h2>
              </div>
              <div className="chart-legend">
                <span><span className="legend-dot" style={{ backgroundColor: "#89A9F1" }}></span>Total present</span>
                <span><span className="legend-dot" style={{ backgroundColor: "#F7DB07" }}></span>Total absent</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={attendanceData}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="present" fill="#89A9F1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="#F7DB07" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* GENDER DONUT CHART */}
            <div className="chart-panel narrow">
              <div className="panel-header">
                <h2 className="panel-title">Students</h2>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>

                  {/* Outer blue donut */}
                  <Pie
                    data={genderData}
                    cx="55%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={95}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    legendType="none"
                  >
                    <Cell fill="#89A9F1" />
                    <Cell fill="#e0f2fe" />
                  </Pie>
                  {/* Inner yellow donut */}
                  <Pie
                    data={genderData}
                    cx="55%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    legendType="none"
                  >
                    <Cell fill="#F7DB07" />
                    <Cell fill="#fef9c3" />
                  </Pie>

                  {/* Center text */}
                  <text x="55%" y="46%" textAnchor="middle" dominantBaseline="middle" fontSize={13} fill="#6b7280">
                    Total
                  </text>
                  <text x="55%" y="56%" textAnchor="middle" dominantBaseline="middle" fontSize={22} fontWeight="bold" fill="#3d3e71">
                    250
                  </text>
                </PieChart>
              </ResponsiveContainer>

  {/* Manual legend */}
  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#3d3e71", fontWeight: "650" }}>
      <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#89A9F1", display: "inline-block" }}></span> Male
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#3d3e71", fontWeight: "650" }}>
      <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#F7DB07", display: "inline-block" }}></span> Female
    </div>
  </div>
</div>
</div>

          {/* BOTTOM PANELS */}
          <div className="panels-row">

            {/* AGENDA */}
            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Agenda</h2>
              </div>
              <div className="agenda-item green-bg">
                <span className="agenda-date">12/02/2026</span>
                <span>Complete pending student registrations.</span>
              </div>
              <div className="agenda-item yellow-bg">
                <span className="agenda-date">13/02/2026</span>
                <span>Update enrollments</span>
              </div>
              <div className="agenda-item gray-bg">
                <span className="agenda-date">10/03/2026</span>
                <span>Update course details</span>
              </div>
            </div>

            {/* RECENT ACTIVITIES */}
            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Recent Activities</h2>
              </div>
              <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Today</p>
              {recentLogs.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#9ca3af" }}>No recent activities</p>
              ) : (
                recentLogs.map((log) => (
                  <div className="activity-item" key={log.id}>
                    <div>
                      <p style={{ fontWeight: "600", marginBottom: "2px" }}>{log.description}</p>
                      <p style={{ fontSize: "12px", color: "#9ca3af" }}>{log.activity_type}</p>
                    </div>
                    <span className="activity-time">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
              <button className="view-all-btn" onClick={() => navigate("/activities")}>
                View All
              </button>
            </div>

          </div>
        </div>
      </div>
    )
}