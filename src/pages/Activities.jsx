import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import "./Activities.css"
// import { MagnifyingGlassIcon } from "@phosphor-icons/react"

export default function Activities() {
  // ─── State ────────────────────────────────────────────────
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => { fetchLogs() }, [])

  // ─── Fetch All Audit Logs ─────────────────────────────────
  // Ordered newest first; client-side sort will re-order if user changes sortBy
  const fetchLogs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
    setLogs(data || [])
    setLoading(false)
  }

  // ─── CSV Report Generator ─────────────────────────────────
  // Converts the full logs array (not just the current page) into a
  // downloadable CSV file and triggers a browser download
  const handleGenerateReport = () => {
    const headers = ["Log ID", "Description", "Activity Type", "Performed By", "IP Address", "Timestamp"]
    const rows = logs.map(log => [
      log.log_id,
      log.description,
      log.activity_type,
      log.performed_by || "-",
      log.ip_address || "-",
      new Date(log.created_at).toLocaleString()
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${val}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit_report_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Client-side Filter & Sort ────────────────────────────
  // Filters by log ID or description, then sorts by the selected option
  const filtered = logs
    .filter(log =>
      log.log_id?.toLowerCase().includes(search.toLowerCase()) ||
      log.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at)
      if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at)
      if (sortBy === "id") return a.log_id?.localeCompare(b.log_id)
      return 0
    })

      // ─── Pagination ───────────────────────────────────────────
    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const formatTimestamp = (ts) => {
      const d = new Date(ts)
      return (
        <>
          {d.toLocaleDateString("en-GB")}<br />
          {d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </>
      )
    }

  return (
    <div className="activities-main">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-title">
          <h1>Activity list</h1>
          <p>Home/ <span>Activities</span></p>
        </div>
        <button className="generate-btn" onClick={handleGenerateReport}>
          Generate Report
        </button>
      </div>

      {/* TABLE PANEL */}
      <div className="table-panel">
        <div className="table-toolbar">
          <h2>Audit Logs</h2>
          <div className="table-controls">
            <div className="search-wrapper">
                
                <input
                    className="search-input"
                    placeholder="Search by activity number"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                />
                {/* <MagnifyingGlassIcon size={16} weight="bold" color="#3d3e71" /> */}
            </div>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort by: Newest</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="id">Sort by: ID</option>
            </select>
          </div>
        </div>

        {/* Loading / empty / data states */}
        {loading ? (
          <p className="empty-state">Loading...</p>
        ) : paginated.length === 0 ? (
          <p className="empty-state">No activity logs found</p>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th></th>
                <th>Log ID</th>
                <th>Description</th>
                <th>Timestamp</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((log) => (
                <tr key={log.id}>
                  <td><input type="checkbox" /></td>
                  <td className="log-id">{log.log_id}</td>
                  <td>{log.description}</td>
                  <td className="timestamp">{formatTimestamp(log.created_at)}</td>
                  <td className="ip-address">{log.ip_address || "192.168.1.45"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* PAGINATION */}
        <div className="pagination">
          <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>{"<"}</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>{">"}</button>
        </div>

      </div>
    </div>
  )
}