/**
 * Event Mapper
 *
 * Maps Temporal workflow events to patient-facing narrative events.
 */

import type { WorkflowEvent, NarrativeEvent, NarrativeTemplate } from './types'

/**
 * Map a workflow event to a narrative event using a template.
 *
 * @param event Workflow event from Temporal
 * @param template Narrative template for this modality
 * @returns Patient-facing narrative event
 * @throws Error if step not found in template
 */
export function toNarrative(event: WorkflowEvent, template: NarrativeTemplate): NarrativeEvent {
  const stepTemplate = template.steps[event.step]

  if (!stepTemplate) {
    throw new Error(
      `Step "${event.step}" not found in template for modality "${template.modality}"`
    )
  }

  return {
    step: event.step,
    plainText: stepTemplate.text,
    why: stepTemplate.why,
    doNow: stepTemplate.doNow,
    icon: stepTemplate.icon,
    progress: event.progress ?? 0,
    privacyBadge: event.privacy ?? stepTemplate.privacy,
    etaHint: stepTemplate.etaHint,
    alert: stepTemplate.alert,
  }
}

/**
 * Batch map multiple workflow events to narrative events.
 *
 * @param events Array of workflow events
 * @param template Narrative template
 * @returns Array of narrative events
 */
export function toNarrativeBatch(
  events: WorkflowEvent[],
  template: NarrativeTemplate
): NarrativeEvent[] {
  return events.map((event) => toNarrative(event, template))
}

/**
 * Humanize a step identifier for display.
 *
 * Converts snake_case to Title Case.
 *
 * @param step Step identifier (e.g., "focus_left")
 * @returns Human-readable title (e.g., "Focus Left")
 */
export function humanizeStep(step: string): string {
  return step
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Get privacy badge label for display.
 *
 * @param badge Privacy badge identifier
 * @returns Human-readable label
 */
export function getPrivacyBadgeLabel(badge: string): string {
  switch (badge) {
    case 'processing_local':
      return 'Processing locally'
    case 'sending_summary':
      return 'Sending summary'
    case 'cloud_processing':
      return 'Cloud processing'
    default:
      return badge
  }
}

/**
 * Get privacy badge description (one-line explanation).
 *
 * @param badge Privacy badge identifier
 * @returns Description text
 */
export function getPrivacyBadgeDescription(badge: string): string {
  switch (badge) {
    case 'processing_local':
      return 'Your images are being processed on this device.'
    case 'sending_summary':
      return "We're sending a summary (not the full image) for advanced analysis."
    case 'cloud_processing':
      return 'Encrypted processing in our secure data center.'
    default:
      return ''
  }
}
