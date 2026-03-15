import { describe, it, expect } from "vitest"
import { buildAuditDescription, buildLogId } from "../lib/studentUtils"


// ─── 4. AUDIT LOG DESCRIPTIONS ───────────────────────────────────────────────
describe("buildAuditDescription", () => {
  it("should build correct ADD description", () => {
    expect(buildAuditDescription("ADD", "John", "Doe"))
      .toBe("Added new student: John Doe")
  })

  it("should build correct UPDATE description", () => {
    expect(buildAuditDescription("UPDATE", "John", "Doe"))
      .toBe("Updated student: John Doe")
  })

  it("should build correct DELETE description", () => {
    expect(buildAuditDescription("DELETE", "John", "Doe"))
      .toBe("Removed student: John Doe")
  })
})

// ─── 5. LOG ID FORMAT ────────────────────────────────────────────────────────
describe("buildLogId", () => {
  it("should build log ID with ACT prefix", () => {
    expect(buildLogId(1234567890)).toBe("ACT1234567890")
  })
})