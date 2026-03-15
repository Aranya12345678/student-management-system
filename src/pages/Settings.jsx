import { useState } from "react"
import { supabase } from "../supabase"
import "./Settings.css"

export default function Settings() {
  // ─── State ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("account")
  const [saving, setSaving] = useState(false)

  // ─── Account Tab — Password Fields ────────────────────────
  const [passwords, setPasswords] = useState({
    current: "", newPass: "", confirm: ""
  })

  // ─── Notifications Tab — Toggle Preferences ───────────────
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    studentAdded: true,
    studentDeleted: true,
    courseUpdated: false,
    auditLog: true,
  })

  // ─── Appearance Tab — Localisation Settings ───────────────
  const [appearance, setAppearance] = useState({
    language: "English",
    timezone: "Asia/Colombo",
    dateFormat: "DD/MM/YYYY",
  })

  // ─── Change Password Handler ──────────────────────────────
  // Validates all three fields before calling Supabase Auth
  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      alert("Please fill in all password fields")
      return
    }
    if (passwords.newPass !== passwords.confirm) {
      alert("New passwords do not match!")
      return
    }
    if (passwords.newPass.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: passwords.newPass })// Clear fields on success
    if (!error) {
      alert("Password updated successfully!")
      setPasswords({ current: "", newPass: "", confirm: "" })
    } else {
      alert("Failed to update password: " + error.message)
    }
    setSaving(false)
  }

  // ─── Notification & Appearance Save Handlers ──────────────
  // Currently client-side only — extend with Supabase persistence as needed
  const handleSaveNotifications = () => {
    alert("Notification preferences saved!")
  }

  const handleSaveAppearance = () => {
    alert("Appearance settings saved!")
  }

  return (
    <div className="settings-main">

      {/* ── PAGE HEADER ───────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-title">
          <h1>Settings</h1>
          <p>Home/ <span>Settings</span></p>
        </div>
      </div>

      {/* TABS */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === "account" ? "active" : ""}`}
          onClick={() => setActiveTab("account")}
        >
          Account & Security
        </button>
        <button
          className={`settings-tab ${activeTab === "notifications" ? "active" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>
        <button
          className={`settings-tab ${activeTab === "appearance" ? "active" : ""}`}
          onClick={() => setActiveTab("appearance")}
        >
          Appearance
        </button>
      </div>

      {/* ACCOUNT TAB */}
      {activeTab === "account" && (
        <div className="settings-card">
          <h2>Change Password</h2>
          <p className="settings-subtitle">Update your admin password here</p>

          <div className="settings-form">
            <div className="settings-form-group">
              <label>Current Password:</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div className="settings-form-group">
              <label>New Password:</label>
              <input
                type="password"
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div className="settings-form-group">
              <label>Confirm New Password:</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
            <button
              className="save-btn"
              onClick={handleChangePassword}
              disabled={saving}
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === "notifications" && (
        <div className="settings-card">
          <h2>Notification Preferences</h2>
          <p className="settings-subtitle">Choose what you want to be notified about</p>

          <div className="toggle-list">
            <div className="toggle-item">
              <div>
                <p>Email Alerts</p>
                <span>Receive alerts via email</span>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={notifications.emailAlerts}
                  onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div>
                <p>Student Added</p>
                <span>Notify when a new student is registered</span>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={notifications.studentAdded}
                  onChange={(e) => setNotifications({ ...notifications, studentAdded: e.target.checked })} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div>
                <p>Student Deleted</p>
                <span>Notify when a student is removed</span>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={notifications.studentDeleted}
                  onChange={(e) => setNotifications({ ...notifications, studentDeleted: e.target.checked })} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div>
                <p>Course Updated</p>
                <span>Notify when a course is modified</span>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={notifications.courseUpdated}
                  onChange={(e) => setNotifications({ ...notifications, courseUpdated: e.target.checked })} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div>
                <p>Audit Log Activity</p>
                <span>Notify on new audit log entries</span>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={notifications.auditLog}
                  onChange={(e) => setNotifications({ ...notifications, auditLog: e.target.checked })} />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <button className="save-btn" onClick={handleSaveNotifications}>
            Save Preferences
          </button>
        </div>
      )}

      {/* APPEARANCE TAB */}
      {activeTab === "appearance" && (
        <div className="settings-card">
          <h2>Appearance & Localization</h2>
          <p className="settings-subtitle">Customize your system preferences</p>

          <div className="settings-form">
            <div className="settings-form-group">
              <label>Language</label>
              <select
                value={appearance.language}
                onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
              >
                <option value="English">English</option>
                <option value="Sinhala">Sinhala</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>
            <div className="settings-form-group">
              <label>Timezone</label>
              <select
                value={appearance.timezone}
                onChange={(e) => setAppearance({ ...appearance, timezone: e.target.value })}
              >
                <option value="Asia/Colombo">Asia/Colombo (GMT+5:30)</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
              </select>
            </div>
            <div className="settings-form-group">
              <label>Date Format</label>
              <select
                value={appearance.dateFormat}
                onChange={(e) => setAppearance({ ...appearance, dateFormat: e.target.value })}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <button className="save-btn" onClick={handleSaveAppearance}>
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  )
}