/**
 * Narrative Layer Types
 *
 * See: docs/architecture/decisions/ADR-003-narrative-layer-architecture.md
 */

/**
 * Privacy badge indicating where data is being processed.
 * Maps to PHI Rings (ADR-002).
 */
export type PrivacyBadge = 'processing_local' | 'sending_summary' | 'cloud_processing'

/**
 * Event received from Temporal workflow.
 */
export interface WorkflowEvent {
  /** Step identifier (e.g., "focus_left") */
  step: string

  /** Progress percentage (0-100) */
  progress?: number

  /** Privacy badge for this step */
  privacy?: PrivacyBadge
}

/**
 * Patient-facing narrative event.
 */
export interface NarrativeEvent {
  /** Step identifier */
  step: string

  /** Plain-language description (6th-grade reading level) */
  plainText: string

  /** Short rationale ("Why this step matters") */
  why: string

  /** Patient action ("What to do now") */
  doNow: string

  /** Icon identifier for UI */
  icon: string

  /** Progress percentage (0-100) */
  progress: number

  /** Privacy badge */
  privacyBadge: PrivacyBadge

  /** Optional soft ETA hint */
  etaHint?: string

  /** Optional safety alert */
  alert?: string
}

/**
 * Narrative template step definition.
 */
export interface TemplateStep {
  text: string
  why: string
  doNow: string
  icon: string
  privacy: PrivacyBadge
  etaHint?: string
  alert?: string
}

/**
 * Narrative template for a modality.
 */
export interface NarrativeTemplate {
  modality: string
  version: string
  steps: Record<string, TemplateStep>
}
