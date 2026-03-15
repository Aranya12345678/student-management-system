import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { getClientIP } from "../lib/getIP"
import "./Courses.css"
import { useLocation } from "react-router-dom"
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react"

// ─── Card Color Palette ────────────────────────────────────────
// Cycles through these colors for cards that have no banner image
const cardColors = [
  "#fef08a", "#fdba74", "#86efac",
  "#c4b5fd", "#5eead4", "#fda4af",
  "#93c5fd", "#fcd34d", "#a5f3fc"
]

export default function Courses() {
// ─── State ──────────────────────────────────────────────────
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editCourse, setEditCourse] = useState(null)
  const [openMenu, setOpenMenu] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Controlled form shared between Add and Edit modes
  const [form, setForm] = useState({
    course_id: "", course_name: "",
    course_details: "", semester: "", banner: null
  })
  const location = useLocation()


  // ─── Sync Search from URL Param ─────────────────────────────
  // Allows the topbar global search to pre-fill this page's search input
    useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get("search")
    if (q) 
        setSearch(q)
        setCurrentPage(1)
    }, [location.search])

  // ─── Initial Data Load ───────────────────────────────────────
  useEffect(() => { fetchCourses() }, [])

  // ─── Fetch All Courses ───────────────────────────────────────
  // Ordered newest first so recently added courses appear at the top
  const fetchCourses = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }

   // ─── Add / Edit Submit ───────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.course_id || !form.course_name || !form.semester) {
      alert("Please fill in all required fields")
      return
    }

    // Retain the existing banner URL unless a new file was selected
    let bannerUrl = editCourse?.banner_url || null

    // Upload new banner to Supabase Storage if one was chosen
    if (form.banner) {
    const fileExt = form.banner.name.split(".").pop()
    const fileName = `${form.course_id}_${Date.now()}.${fileExt}`//Unique filename avoids collisions
    const { error: uploadError } = await supabase.storage
      .from("course-banners")
      .upload(fileName, form.banner)

    if (!uploadError) {
      // Retrieve and store the public URL alongside the course record
      const { data: urlData } = supabase.storage
        .from("course-banners")
        .getPublicUrl(fileName)
      bannerUrl = urlData.publicUrl
    }
  }

    if (editCourse) {
      // ── UPDATE existing course ──
      // course_id is immutable, so it's excluded from the update payload
      const { error } = await supabase
        .from("courses")
        .update({
          course_name: form.course_name,
          course_details: form.course_details,
          semester: parseInt(form.semester),
          banner_url: bannerUrl,
        })
        .eq("id", editCourse.id)

      if (!error) {
        const ip = await getClientIP()
        await supabase.from("audit_log").insert({
          log_id: `ACT${Date.now()}`,
          description: `Updated course: ${form.course_name}`,
          activity_type: "UPDATE",
          performed_by: "admin@sms.com",
          ip_address: ip
        })
        fetchCourses()
        closeModal()
      }
    } else {
      // ── INSERT new course ──
      const { error } = await supabase.from("courses").insert({
        course_id: form.course_id,
        course_name: form.course_name,
        course_details: form.course_details,
        semester: parseInt(form.semester),
        banner_url: bannerUrl,
      })

      if (!error) {
          const ip = await getClientIP()
          await supabase.from("audit_log").insert({
            log_id: `ACT${Date.now()}`,
            description: `Added new course: ${form.course_name}`,
            activity_type: "ADD",
            performed_by: "admin@sms.com",
            ip_address: ip
          })
          fetchCourses()
          closeModal()
        }
    }
  }

  // ─── Delete Course ───────────────────────────────────────────
  // Confirms before deleting and always writes an audit log entry
  const handleDelete = async (course) => {
    if (!window.confirm(`Delete ${course.course_name}?`)) return
    await supabase.from("courses").delete().eq("id", course.id)
    const ip = await getClientIP()
    await supabase.from("audit_log").insert({
      log_id: `ACT${Date.now()}`,
      description: `Removed course: ${course.course_name}`,
      activity_type: "DELETE",
      performed_by: "admin@sms.com",
      ip_address: ip
    })
    fetchCourses()
  }


  // ─── Open Edit Modal ─────────────────────────────────────────
  // Pre-fills the form with the selected course's current values
  const handleEdit = (course) => {
    setEditCourse(course)
    setForm({
      course_id: course.course_id,
      course_name: course.course_name,
      course_details: course.course_details || "",
      semester: course.semester,
      banner: null
    })
    setShowModal(true)
    setOpenMenu(null)
  }

  // ─── Close & Reset Modal ─────────────────────────────────────
  const closeModal = () => {
    setShowModal(false)
    setEditCourse(null)
    setForm({ course_id: "", course_name: "", course_details: "", semester: "", banner: null })
  }

  // ─── Client-side Filtering & Sorting ────────────────────────
  // 1. Filter by search term (name or ID)
  // 2. Filter by semester if a semester value is selected
  // 3. Sort alphabetically if "name" sort is active
  const filtered = courses
  .filter(c =>
    c.course_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.course_id?.toLowerCase().includes(search.toLowerCase())
  )
  .filter(c => {
    if (sortBy === "4" || sortBy === "5" || sortBy === "6" || sortBy === "7") {
      return c.semester === parseInt(sortBy)
    }
    return true
  })
  .sort((a, b) => {
    if (sortBy === "name") return a.course_name.localeCompare(b.course_name)
    return 0
  })

  // ─── Pagination ──────────────────────────────────────────────
  const itemsPerPage = 6
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="courses-main">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-title">
          <h1>Course details</h1>
          <p>Home/ <span>Courses</span></p>
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add Course
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <select
            className="filter-select"
            value={sortBy === "4" || sortBy === "5" || sortBy === "6" || sortBy === "7" ? sortBy : ""}
            onChange={(e) => setSortBy(e.target.value)}
            >
            <option value="">All</option>
            <option value="4">Semester 04</option>
            <option value="5">Semester 05</option>
            <option value="6">Semester 06</option>
            <option value="7">Semester 07</option>
        </select>

        {/* Text search input */}
        <div className="search-bar">
          
          <input
            placeholder="Search by course name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* A-Z name sort */}
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Sort by name</option>
          <option value="name">A - Z</option>
        </select>
      </div>

      {/* COURSES GRID */}
      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : paginated.length === 0 ? (
        <p className="empty-state">No courses found</p>
      ) : (
        <div className="courses-grid">
          {paginated.map((course, index) => (
            <div className="course-card" key={course.id}>

              {/* BANNER */}
              {course.banner_url ? (
                <img
                  src={course.banner_url}
                  alt={course.course_name}
                  className="course-banner"
                />
              ) : (
                <div
                  className="course-banner-placeholder"
                  style={{ backgroundColor: cardColors[index % cardColors.length] }}
                >
                  📚
                </div>
              )}

              {/* COURSE INFO */}
              <div className="course-info">
                <div>
                  <h3>{course.course_id} {course.course_name}</h3>
                  <p>Semester {course.semester}</p>
                </div>
                <div style={{ position: "relative" }}>
                  <button
                    className="course-menu-btn"
                    onClick={() => setOpenMenu(openMenu === course.id ? null : course.id)}
                  >
                    ⋮
                  </button>
                  {openMenu === course.id && (
                    <div className="course-dropdown">
                      <button onClick={() => handleEdit(course)}>
                        <PencilSimpleIcon size={15} weight="bold" color="#3d3e71"/>Edit</button>
                      <button className="delete-option" onClick={() => handleDelete(course)}>
                        <TrashIcon size={15} weight="bold" color="#3d3e71"/> Delete</button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
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

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editCourse ? "Edit Course" : "Add New Course"}</h2>

            <div className="form-group">
              <label>Course ID *</label>
              <input
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                placeholder="e.g. COE31032"
                disabled={!!editCourse}
              />
            </div>
            <div className="form-group">
              <label>Course Name *</label>
              <input
                value={form.course_name}
                onChange={(e) => setForm({ ...form, course_name: e.target.value })}
                placeholder="e.g. Research Methodology"
              />
            </div>
            <div className="form-group">
              <label>Course Details</label>
              <textarea
                value={form.course_details}
                onChange={(e) => setForm({ ...form, course_details: e.target.value })}
                placeholder="Enter course description"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Semester *</label>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
              >
                <option value="">Select semester</option>
                {[1,2,3,4,5,6,7,8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, banner: e.target.files[0] })}
              />
            </div>

            <div className="modal-btns">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button className="submit-btn" onClick={handleSubmit}>
                {editCourse ? "Update Course" : "Add Course"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}