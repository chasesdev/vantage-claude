/**
 * Tests for Local Compute Decision Policy
 *
 * Validates all five gates:
 * 1. Privacy gate
 * 2. SLA gate
 * 3. VRAM gate
 * 4. Connectivity gate
 * 5. Cost gate
 */

import { describe, it, expect } from 'vitest'
import { decideTarget, explainDecision, createDefaultContext, type Context } from '../src/execution-policy'

describe('execution-policy', () => {
  describe('decideTarget', () => {
    describe('Gate 1: Privacy gate', () => {
      it('routes raw PHI to workstation when SLA permits', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          privacy: 'phi_raw',
          slaMs: 200, // < 500ms, so can stay local
        }

        expect(decideTarget(ctx)).toBe('workstation')
      })

      it('allows raw PHI to cloud only when SLA requires it', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          privacy: 'phi_raw',
          slaMs: 3000, // > 500ms, async operation
          uplinkMbps: 100, // good connectivity
          cost: { dailyGpuBudgetUsd: 1000, spentUsd: 0 }, // budget available
        }

        expect(decideTarget(ctx)).toBe('cloud')
      })

      it('allows masked PHI to any target', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          privacy: 'phi_masked',
          slaMs: 3000,
        }

        expect(decideTarget(ctx)).toBe('cloud')
      })

      it('allows deidentified data to any target', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          privacy: 'deidentified',
          slaMs: 3000,
        }

        expect(decideTarget(ctx)).toBe('cloud')
      })
    })

    describe('Gate 2: SLA gate', () => {
      it('routes ultra-low latency operations to edge', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          slaMs: 30, // < 50ms
          model: {
            name: 'denoise',
            vramGB: 0.5,
            tier: 'tiny',
          },
          privacy: 'deidentified', // Not raw PHI, so privacy gate doesn't trigger
        }

        expect(decideTarget(ctx)).toBe('edge')
      })

      it('requires tiny model for edge routing', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          slaMs: 30, // < 50ms
          model: {
            name: 'seg',
            vramGB: 4,
            tier: 'small', // Not tiny
          },
          privacy: 'deidentified',
        }

        expect(decideTarget(ctx)).toBe('workstation')
      })
    })

    describe('Gate 3: VRAM gate', () => {
      it('routes large models to cloud', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          privacy: 'deidentified', // Not raw PHI
          model: {
            name: 'fusion',
            vramGB: 60, // > workstation 48GB
            tier: 'large',
          },
          slaMs: 5000, // Async, so privacy gate doesn't force local
        }

        expect(decideTarget(ctx)).toBe('cloud')
      })

      it('allows models that fit on workstation', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          privacy: 'deidentified',
          model: {
            name: 'retina/seg',
            vramGB: 4, // < workstation 48GB
            tier: 'small',
          },
          slaMs: 200,
        }

        expect(decideTarget(ctx)).toBe('workstation')
      })
    })

    describe('Gate 4: Connectivity gate', () => {
      it('routes to local when uplink is poor', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          privacy: 'deidentified', // Not raw PHI
          uplinkMbps: 10, // < 20 Mbps threshold
          slaMs: 3000, // Async, would prefer cloud
        }

        expect(decideTarget(ctx)).toBe('workstation')
      })

      it('routes to local when jitter is high', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          privacy: 'deidentified',
          jitterMs: 50, // > 30ms threshold
          slaMs: 3000,
        }

        expect(decideTarget(ctx)).toBe('workstation')
      })

      it('allows cloud when connectivity is good', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          privacy: 'deidentified',
          uplinkMbps: 100,
          jitterMs: 10,
          slaMs: 3000,
        }

        expect(decideTarget(ctx)).toBe('cloud')
      })
    })

    describe('Gate 5: Cost gate', () => {
      it('falls back to local when budget exceeded', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          privacy: 'deidentified',
          uplinkMbps: 100, // Good connectivity
          cost: {
            dailyGpuBudgetUsd: 50,
            spentUsd: 55, // Over budget
          },
          slaMs: 3000, // Would prefer cloud
        }

        expect(decideTarget(ctx)).toBe('workstation')
      })

      it('allows cloud when budget available', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          privacy: 'deidentified',
          uplinkMbps: 100,
          cost: {
            dailyGpuBudgetUsd: 100,
            spentUsd: 20, // Under budget
          },
          slaMs: 3000,
        }

        expect(decideTarget(ctx)).toBe('cloud')
      })

      it('handles budget edge case (exactly at limit)', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          privacy: 'deidentified',
          uplinkMbps: 100,
          cost: {
            dailyGpuBudgetUsd: 50,
            spentUsd: 50, // Exactly at limit
          },
          slaMs: 3000,
        }

        expect(decideTarget(ctx)).toBe('workstation')
      })
    })

    describe('Gate 6: Default routing', () => {
      it('prefers workstation for interactive operations', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          privacy: 'deidentified',
          uplinkMbps: 100,
          slaMs: 400, // < 500ms, interactive
        }

        expect(decideTarget(ctx)).toBe('workstation')
      })

      it('prefers cloud for async operations', () => {
        const ctx: Context = {
          ...createDefaultContext(),
          privacy: 'deidentified',
          uplinkMbps: 100,
          slaMs: 3000, // > 500ms, async
        }

        expect(decideTarget(ctx)).toBe('cloud')
      })
    })
  })

  describe('explainDecision', () => {
    it('explains privacy gate decision', () => {
      const ctx: Context = {
        ...createDefaultContext(),
        privacy: 'phi_raw',
        slaMs: 200,
      }

      const explanation = explainDecision(ctx)
      expect(explanation).toContain('Privacy gate')
      expect(explanation).toContain('raw PHI')
      expect(explanation).toContain('workstation')
    })

    it('explains SLA gate decision', () => {
      const ctx: Context = {
        ...createDefaultContext(),
        privacy: 'deidentified',
        slaMs: 30,
        model: {
          name: 'denoise',
          vramGB: 0.5,
          tier: 'tiny',
        },
      }

      const explanation = explainDecision(ctx)
      expect(explanation).toContain('SLA gate')
      expect(explanation).toContain('ultra-low latency')
      expect(explanation).toContain('edge')
    })

    it('explains VRAM gate decision', () => {
      const ctx: Context = {
        ...createDefaultContext(),
        privacy: 'deidentified',
        model: {
          name: 'fusion',
          vramGB: 60,
          tier: 'large',
        },
        slaMs: 5000,
      }

      const explanation = explainDecision(ctx)
      expect(explanation).toContain('VRAM gate')
      expect(explanation).toContain('cloud')
    })

    it('explains connectivity gate decision', () => {
      const ctx: Context = {
        ...createDefaultContext(),
        privacy: 'deidentified',
        uplinkMbps: 10,
        slaMs: 3000,
      }

      const explanation = explainDecision(ctx)
      expect(explanation).toContain('Connectivity gate')
      expect(explanation).toContain('workstation')
    })

    it('explains cost gate decision', () => {
      const ctx: Context = {
        ...createDefaultContext(),
        privacy: 'deidentified',
        uplinkMbps: 100,
        cost: {
          dailyGpuBudgetUsd: 50,
          spentUsd: 60,
        },
        slaMs: 3000,
      }

      const explanation = explainDecision(ctx)
      expect(explanation).toContain('Cost gate')
      expect(explanation).toContain('workstation')
    })

    it('explains default routing decision', () => {
      const ctx: Context = {
        ...createDefaultContext(),
        privacy: 'deidentified',
        uplinkMbps: 100,
        slaMs: 400,
      }

      const explanation = explainDecision(ctx)
      expect(explanation).toContain('Default routing')
      expect(explanation).toContain('workstation')
    })
  })

  describe('createDefaultContext', () => {
    it('creates valid default context', () => {
      const ctx = createDefaultContext()

      expect(ctx.slaMs).toBeGreaterThan(0)
      expect(ctx.uplinkMbps).toBeGreaterThan(0)
      expect(ctx.vrams.workstation).toBeGreaterThan(0)
      expect(ctx.model.vramGB).toBeGreaterThan(0)
      expect(ctx.cost.dailyGpuBudgetUsd).toBeGreaterThan(0)
    })
  })
})
