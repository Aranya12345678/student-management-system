import { useEffect, useState } from "react"
// import { useNavigate, NavLink } from "react-router-dom"
import { supabase } from "../supabase"
import "./Students.css"
import { getClientIP } from "../lib/getIP"
import { useNavigate, NavLink, useLocation } from "react-router-dom"
import { buildStudentId, validateStudentForm, buildAuditDescription, buildLogId } from "../lib/studentUtils"
import { BellSimpleIcon, BookOpenUserIcon, ChatTeardropTextIcon, ClipboardTextIcon, GearIcon, HouseIcon, MagnifyingGlassIcon, PencilSimpleIcon, SignOutIcon, StudentIcon, TrashIcon, UserCircleIcon, UsersIcon, UsersThreeIcon } from "@phosphor-icons/react"

export default function Students() {
  const navigate = useNavigate()
  //------state--------------------------------------------------
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortDegree, setSortDegree] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

   // Controlled form fields shared between Add and Edit modes
  const [form, setForm] = useState({
    first_name: "", last_name: "", address: "",
    dob: "", degree_program: "", student_id: "", photo: null
  })
  const location = useLocation()

  // ─── Sync Search from URL Param ───────────────────────────
  // Allows the topbar global search to pre-fill this page's search input
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get("search")
    if (q) 
      setSearch(q)
      setCurrentPage(1)// Reset to first page whenever the query changes
  }, [location.search])

  useEffect(() => { fetchStudents() }, [])

  // ─── Fetch All Students ───────────────────────────────────
  // Orders by newest first so recently added students appear at the top
  const fetchStudents = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false })
    setStudents(data || [])
    setLoading(false)
  }

// ─── Auto-generate Student ID ─────────────────────────────
  // Counts existing students in the same degree to produce a sequential ID
const generateStudentId = async (degree) => {
  const { count } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("degree_program", degree)

  return buildStudentId(degree, count || 0)
}

// ─── Add / Edit Submit ────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.degree_program) {
      alert("Please fill in all required fields")
      return
    }

    if (editStudent) {
       // ── UPDATE existing student ──
      const { error } = await supabase
        .from("students")
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          address: form.address,
          dob: form.dob,
          degree_program: form.degree_program,
        })
        .eq("id", editStudent.id)

      if (!error) {
        // Log the update action to the audit trail
        const ip = await getClientIP()
        await supabase.from("audit_log").insert({
          log_id: `ACT${Date.now()}`,
          description: `Updated student: ${form.first_name} ${form.last_name}`,
          activity_type: "UPDATE",
          performed_by: "admin@sms.com",
          ip_address: ip
        })
        fetchStudents()
        closeModal()
      }
    } else {
      // ── INSERT new student ──
        const studentId = await generateStudentId(form.degree_program)
        
        let photoUrl = null

        // Upload photo if selected
        if (form.photo) {
          const fileExt = form.photo.name.split(".").pop()
          const fileName = `${studentId}.${fileExt}`
          const { error: uploadError } = await supabase.storage
            .from("student-photos")
            .upload(fileName, form.photo)

          if (!uploadError) {
             // Retrieve the public URL to store alongside the student record
            const { data: urlData } = supabase.storage
              .from("student-photos")
              .getPublicUrl(fileName)
            photoUrl = urlData.publicUrl
          }
        }

        const { error } = await supabase.from("students").insert({
          student_id: studentId,
          first_name: form.first_name,
          last_name: form.last_name,
          address: form.address,
          dob: form.dob,
          degree_program: form.degree_program,
          photo_url: photoUrl,
        })

        if (!error) {
          const ip = await getClientIP()
          await supabase.from("audit_log").insert({
            log_id: `ACT${Date.now()}`,
            description: `Added new student: ${form.first_name} ${form.last_name}`,
            activity_type: "ADD",
            performed_by: "admin@sms.com",
            ip_address: ip
          })
          fetchStudents()
          closeModal()
        }
    }
  }

  // ─── Delete Student ───────────────────────────────────────
  // Confirms before deleting and always writes an audit log entry
  const handleDelete = async (student) => {
    if (!window.confirm(`Delete ${student.first_name} ${student.last_name}?`)) return
    await supabase.from("students").delete().eq("id", student.id)
    const ip = await getClientIP()
    await supabase.from("audit_log").insert({
      log_id: `ACT${Date.now()}`,
      description: `Removed student: ${student.first_name} ${student.last_name}`,
      activity_type: "DELETE",
      performed_by: "admin@sms.com",
      ip_address: ip
    })
    fetchStudents()
  }

  // ─── Open Edit Modal ──────────────────────────────────────
  // Pre-fills the form with the selected student's current values
  const handleEdit = (student) => {
    setEditStudent(student)
    setForm({
      first_name: student.first_name,
      last_name: student.last_name,
      address: student.address || "",
      dob: student.dob || "",
      degree_program: student.degree_program || "",
      student_id: student.student_id,
    })
    setShowModal(true)
  }

// ─── Close & Reset Modal ──────────────────────────────────
 const closeModal = () => {
  setShowModal(false)
  setEditStudent(null)
  setForm({ first_name: "", last_name: "", address: "", dob: "", degree_program: "", student_id: "", photo: null })
}

  // ─── Client-side Filtering ────────────────────────────────
  // Filters by search term (name or ID) then by degree program dropdown
  const filtered = students
    .filter(s =>
      s.student_id?.toLowerCase().includes(search.toLowerCase()) ||
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())
    )
    .filter(s => sortDegree ? s.degree_program === sortDegree : true)

  // ─── Pagination ───────────────────────────────────────────
  const itemsPerPage = 10
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="students-container">


      {/* MAIN */}
      <div className="students-main">

        {/* PAGE HEADER */}
        <div className="page-header">
          <div className="page-title">
            <h1>Student List</h1>
            <p>Home/ <span>Students</span></p>
          </div>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            + Add student
          </button>
        </div>

        {/* TABLE */}
        <div className="table-panel">
          <div className="table-toolbar">
            <h2>Student Information</h2>
            <div className="table-controls">
              <input
                className="search-input"
                placeholder=" Search by student number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="sort-select"
                value={sortDegree}
                onChange={(e) => setSortDegree(e.target.value)}
              >
                <option value="">Sort by degree</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="empty-state">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="empty-state">No students found</p>
          ) : (
            <table className="students-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Student ID</th>
                  <th>Student Full name</th>
                  <th>Address</th>
                  <th>DOB</th>
                  <th>Degree</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((student) => (
                  <tr key={student.id}>
                    <td><input type="checkbox" /></td>
                    <td>{student.student_id}</td>
                    <td>
                      <div className="student-name-cell">
                        {student.photo_url ? (
                          <img
                            src={student.photo_url}
                            alt={student.first_name}
                            className="student-avatar"
                          />
                        ) : (
                          <div className="avatar-placeholder">👤</div>
                        )}
                        {student.first_name} {student.last_name}
                     </div>
                    </td>
                    <td>{student.address}</td>
                    <td>{student.dob}</td>
                    <td>{student.degree_program}</td>
                    <td>
                      <div className="action-btns">
                        <button className="delete-btn" onClick={() => handleDelete(student)}><TrashIcon size={18} weight="bold" color="#3d3e71"/></button>
                        <button className="edit-btn" onClick={() => handleEdit(student)}><PencilSimpleIcon size={18} weight="bold" color="#3d3e71"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PAGINATION */}
          <div className="pagination">
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>{"<"}</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                if (currentPage <= 3) return page <= 5
                if (currentPage >= totalPages - 2) return page >= totalPages - 4
                return page >= currentPage - 2 && page <= currentPage + 2
              })
              .map(page => (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
    ))}
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>{">"}</button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editStudent ? "Edit Student" : "Add New Student"}</h2>

            <div className="form-group">
              <label>First Name *</label>
              <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Enter first name" />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Enter last name" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Enter address" />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Degree Program *</label>
              <select value={form.degree_program} onChange={(e) => setForm({ ...form, degree_program: e.target.value })}>
                <option value="">Select degree</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>

            <div className="form-group">
              <label>Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
              />
            </div>

            <div className="modal-btns">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button className="submit-btn" onClick={handleSubmit}>
                {editStudent ? "Update Student" : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}