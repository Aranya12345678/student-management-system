import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import "./Profile.css"

export default function Profile() {
  // ─── State ────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [adminPhoto, setAdminPhoto] = useState(null)

  // Controlled form — pre-filled from Supabase auth metadata on mount
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "Admin",
    newPhoto: null
  })

  useEffect(() => { fetchAdmin() }, [])

  // ─── Fetch Logged-in Admin ────────────────────────────────
  // Pulls name, email, phone, and avatar from Supabase Auth user metadata
  const fetchAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setForm(f => ({
        ...f,
        full_name: user.user_metadata?.full_name || "GARM Perera",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
      }))
      setAdminPhoto(user.user_metadata?.avatar_url || null)
    }
    setLoading(false)
  }

  // ─── Save Profile Changes ─────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    let photoUrl = adminPhoto

    // Upload a new avatar to Supabase Storage if one was selected
    if (form.newPhoto) {
      const fileExt = form.newPhoto.name.split(".").pop()
      const fileName = `admin_${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from("student-photos")
        .upload(fileName, form.newPhoto)

      if (!uploadError) {
        // Get the public URL and use it as the new avatar
        const { data: urlData } = supabase.storage
          .from("student-photos")
          .getPublicUrl(fileName)
        photoUrl = urlData.publicUrl
      }
    }

    // Persist updated metadata back to Supabase Auth
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: form.full_name,
        phone: form.phone,
        avatar_url: photoUrl
      }
    })

    if (!error) {
      setAdminPhoto(photoUrl)
      alert("Profile updated successfully!")
    }
    setSaving(false)
  }

  // Show a simple loading state while auth data is being fetched
  if (loading) return <p style={{ padding: "40px" }}>Loading...</p>

  return (
    <div className="profile-main">

      {/* ── PAGE HEADER ───────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-title">
          <h1>Profile</h1>
          <p>Home/ <span>Profile</span></p>
        </div>
      </div>

      <div className="profile-card">

        {/* PHOTO SECTION */}
        <div className="profile-photo-section">
          {adminPhoto ? (
            <img src={adminPhoto} alt="Admin" className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">👤</div>
          )}
          <div>
            <h2>{form.full_name}</h2>
            <span className="role-badge">Admin</span>
          </div>
        </div>

        <hr className="profile-divider" />

        {/* FORM */}
        <div className="profile-form">

          <div className="profile-form-group">
            <label>Full Name:</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>

          <div className="profile-form-group">
            <label>Email:</label>
            <input
              value={form.email}
              disabled
              className="disabled-input"
            />
          </div>

          <div className="profile-form-group">
            <label>Phone:</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>

          <div className="profile-form-group">
            <label>Role:</label>
            <input value="Admin" disabled className="disabled-input" />
          </div>

          <div className="profile-form-group">
            <label>Update Profile Photo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, newPhoto: e.target.files[0] })}
            />
          </div>

          <button
            className="save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>
      </div>
    </div>
  )
}