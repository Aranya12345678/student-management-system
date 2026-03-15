// ─── Degree → ID Prefix Map ───────────────────────────────────
// Maps each degree program to its 3-letter student ID prefix
export const DEGREE_PREFIXES = {
  "Software Engineering": "BSE",
  "Computer Engineering": "BCE",
  "Computer Science": "BCS",
}

// ─── Student ID Builder ───────────────────────────────────────
// Generates a formatted ID like "D/BSE/24/0001"
// count = existing students in the same degree (used to derive the next number)
export function buildStudentId(degree, count) {
  const prefix = DEGREE_PREFIXES[degree] || "STU" // Fallback prefix for unknown degrees
  const nextNumber = String(count + 1).padStart(4, "0") // Zero-pads to 4 digits
  return `D/${prefix}/24/${nextNumber}`
}

// ─── Student Form Validator ───────────────────────────────────
// Returns { valid, message } so the caller decides how to surface the error
export function validateStudentForm(form) {
  if (!form.first_name || !form.last_name || !form.degree_program) {
    return { valid: false, message: "Please fill in all required fields" }
  }
  return { valid: true, message: "" }
}

// ─── Audit Description Builder ────────────────────────────────
// Produces a human-readable log description based on the action type
export function buildAuditDescription(action, firstName, lastName) {
  if (action === "ADD") return `Added new student: ${firstName} ${lastName}`
  if (action === "UPDATE") return `Updated student: ${firstName} ${lastName}`
  if (action === "DELETE") return `Removed student: ${firstName} ${lastName}`
  return ""
}

// ─── Audit Log ID Builder ─────────────────────────────────────
// Creates a unique log ID by prefixing a timestamp
export function buildLogId(timestamp) {
  return `ACT${timestamp}`
}