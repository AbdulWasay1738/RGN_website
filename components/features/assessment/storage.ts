/**
 * The assessment keeps its state in sessionStorage between the start form,
 * the question flow and the submit. Every access is wrapped, because storage
 * can be blocked (private windows, strict privacy settings).
 */
export const DETAILS_KEY = 'rgn_assessment'
export const ANSWERS_KEY = 'rgn_assessment_answers'

export type AssessmentDetails = Record<string, string>

export function readDetails(): AssessmentDetails | null {
  try {
    const raw = window.sessionStorage.getItem(DETAILS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as AssessmentDetails) : null
  } catch {
    return null
  }
}

export function saveDetails(details: AssessmentDetails): boolean {
  try {
    window.sessionStorage.setItem(DETAILS_KEY, JSON.stringify(details))
    return true
  } catch {
    return false
  }
}

/** Answer index per question (null for unanswered). */
export function readAnswers(): Array<number | null> {
  try {
    const raw = window.sessionStorage.getItem(ANSWERS_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : null
    return Array.isArray(parsed) ? parsed.map((v) => (typeof v === 'number' ? v : null)) : []
  } catch {
    return []
  }
}

export function saveAnswers(answers: Array<number | null>) {
  try {
    window.sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
  } catch {
    // Storage blocked: answers stay in memory for this visit.
  }
}

export function clearAssessment() {
  try {
    window.sessionStorage.removeItem(DETAILS_KEY)
    window.sessionStorage.removeItem(ANSWERS_KEY)
  } catch {
    // Nothing to clear.
  }
}
