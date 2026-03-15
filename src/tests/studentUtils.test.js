import { describe, it, expect } from "vitest"
import {
  buildStudentId,
  validateStudentForm,
  buildAuditDescription,
  buildLogId,
  DEGREE_PREFIXES
} from "../lib/studentUtils"

// ─── 1. DEGREE PREFIX MAPPING ───────────────────────────────────────────────
describe("DEGREE_PREFIXES", () => {
  it("should have correct prefix for Software Engineering", () => {
    expect(DEGREE_PREFIXES["Software Engineering"]).toBe("BSE")
  })

  it("should have correct prefix for Computer Engineering", () => {
    expect(DEGREE_PREFIXES["Computer Engineering"]).toBe("BCE")
  })

  it("should have correct prefix for Computer Science", () => {
    expect(DEGREE_PREFIXES["Computer Science"]).toBe("BCS")
  })
})

// ─── 2. STUDENT ID GENERATION ────────────────────────────────────────────────
describe("buildStudentId", () => {

  // First student — count 0 should produce number 0001
  it("should generate correct ID for first Software Engineering student", () => {
    expect(buildStudentId("Software Engineering", 0)).toBe("D/BSE/24/0001")
  })

  it("should generate correct ID for first Computer Science student", () => {
    expect(buildStudentId("Computer Science", 0)).toBe("D/BCS/24/0001")
  })

  // count 9 → next number is 10, padded to "0010"
  it("should pad number correctly for 10th student", () => {
    expect(buildStudentId("Software Engineering", 9)).toBe("D/BSE/24/0010")
  })

  // Unknown degree should fall back to the "STU" prefix
  it("should use STU prefix for unknown degree", () => {
    expect(buildStudentId("Unknown Degree", 0)).toBe("D/STU/24/0001")
  })
})

// ─── 3. FORM VALIDATION ──────────────────────────────────────────────────────
describe("validateStudentForm", () => {

  // Happy path — all three required fields provided
  it("should pass with all required fields filled", () => {
    const form = {
      first_name: "John",
      last_name: "Doe",
      degree_program: "Software Engineering"
    }
    expect(validateStudentForm(form).valid).toBe(true)
  })

  // Each test below removes exactly one required field to isolate the failure
  it("should fail when first name is missing", () => {
    const form = { first_name: "", last_name: "Doe", degree_program: "Software Engineering" }
    expect(validateStudentForm(form).valid).toBe(false)
  })

  it("should fail when last name is missing", () => {
    const form = { first_name: "John", last_name: "", degree_program: "Software Engineering" }
    expect(validateStudentForm(form).valid).toBe(false)
  })

  it("should fail when degree program is missing", () => {
    const form = { first_name: "John", last_name: "Doe", degree_program: "" }
    expect(validateStudentForm(form).valid).toBe(false)
  })
})


