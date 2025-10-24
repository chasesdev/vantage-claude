/**
 * Tests for Event Mapper
 */

import { describe, it, expect } from 'vitest'
import {
  toNarrative,
  toNarrativeBatch,
  humanizeStep,
  getPrivacyBadgeLabel,
  getPrivacyBadgeDescription,
} from '../src/event-mapper'
import type { WorkflowEvent, NarrativeTemplate } from '../src/types'

const mockTemplate: NarrativeTemplate = {
  modality: 'oct',
  version: '1.0.0',
  steps: {
    focus_left: {
      text: "We're focusing on your left eye.",
      why: 'Focus helps capture sharp images of the retina.',
      doNow: 'Look at the green dot. Try not to blink.',
      icon: 'eye-focus',
      privacy: 'processing_local',
    },
    capture_left: {
      text: 'Taking an image of your left eye.',
      why: 'This image helps check retinal layers.',
      doNow: 'Hold still for a second.',
      icon: 'camera',
      privacy: 'processing_local',
    },
    sending_summary: {
      text: 'Summarizing results.',
      why: 'We compute measurements for your report.',
      doNow: "You're doing great.",
      icon: 'upload',
      privacy: 'sending_summary',
      etaHint: '~30 seconds',
    },
  },
}

describe('event-mapper', () => {
  describe('toNarrative', () => {
    it('maps workflow event to narrative event', () => {
      const event: WorkflowEvent = {
        step: 'focus_left',
        progress: 20,
        privacy: 'processing_local',
      }

      const narrative = toNarrative(event, mockTemplate)

      expect(narrative).toEqual({
        step: 'focus_left',
        plainText: "We're focusing on your left eye.",
        why: 'Focus helps capture sharp images of the retina.',
        doNow: 'Look at the green dot. Try not to blink.',
        icon: 'eye-focus',
        progress: 20,
        privacyBadge: 'processing_local',
        etaHint: undefined,
        alert: undefined,
      })
    })

    it('uses template privacy badge when event omits it', () => {
      const event: WorkflowEvent = {
        step: 'focus_left',
        progress: 20,
        // No privacy field
      }

      const narrative = toNarrative(event, mockTemplate)

      expect(narrative.privacyBadge).toBe('processing_local')
    })

    it('defaults progress to 0 when omitted', () => {
      const event: WorkflowEvent = {
        step: 'focus_left',
        // No progress field
      }

      const narrative = toNarrative(event, mockTemplate)

      expect(narrative.progress).toBe(0)
    })

    it('includes etaHint when defined in template', () => {
      const event: WorkflowEvent = {
        step: 'sending_summary',
        progress: 80,
      }

      const narrative = toNarrative(event, mockTemplate)

      expect(narrative.etaHint).toBe('~30 seconds')
    })

    it('throws error for unknown step', () => {
      const event: WorkflowEvent = {
        step: 'unknown_step',
        progress: 50,
      }

      expect(() => toNarrative(event, mockTemplate)).toThrow(
        'Step "unknown_step" not found'
      )
    })
  })

  describe('toNarrativeBatch', () => {
    it('maps multiple events', () => {
      const events: WorkflowEvent[] = [
        { step: 'focus_left', progress: 20 },
        { step: 'capture_left', progress: 40 },
      ]

      const narratives = toNarrativeBatch(events, mockTemplate)

      expect(narratives).toHaveLength(2)
      expect(narratives[0].step).toBe('focus_left')
      expect(narratives[1].step).toBe('capture_left')
    })
  })

  describe('humanizeStep', () => {
    it('converts snake_case to Title Case', () => {
      expect(humanizeStep('focus_left')).toBe('Focus Left')
      expect(humanizeStep('capture_left_eye')).toBe('Capture Left Eye')
      expect(humanizeStep('ai_qc')).toBe('Ai Qc')
    })

    it('handles single word', () => {
      expect(humanizeStep('focus')).toBe('Focus')
    })

    it('handles empty string', () => {
      expect(humanizeStep('')).toBe('')
    })
  })

  describe('getPrivacyBadgeLabel', () => {
    it('returns label for processing_local', () => {
      expect(getPrivacyBadgeLabel('processing_local')).toBe('Processing locally')
    })

    it('returns label for sending_summary', () => {
      expect(getPrivacyBadgeLabel('sending_summary')).toBe('Sending summary')
    })

    it('returns label for cloud_processing', () => {
      expect(getPrivacyBadgeLabel('cloud_processing')).toBe('Cloud processing')
    })

    it('returns badge as-is for unknown type', () => {
      expect(getPrivacyBadgeLabel('unknown')).toBe('unknown')
    })
  })

  describe('getPrivacyBadgeDescription', () => {
    it('returns description for processing_local', () => {
      const desc = getPrivacyBadgeDescription('processing_local')
      expect(desc).toContain('processed on this device')
    })

    it('returns description for sending_summary', () => {
      const desc = getPrivacyBadgeDescription('sending_summary')
      expect(desc).toContain('summary')
      expect(desc).toContain('not the full image')
    })

    it('returns description for cloud_processing', () => {
      const desc = getPrivacyBadgeDescription('cloud_processing')
      expect(desc).toContain('Encrypted')
      expect(desc).toContain('secure data center')
    })

    it('returns empty string for unknown type', () => {
      expect(getPrivacyBadgeDescription('unknown')).toBe('')
    })
  })
})
