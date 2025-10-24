/**
 * Local Compute Decision Policy
 *
 * Deterministically routes operations to Edge, Workstation, or Cloud based on:
 * - SLA requirements (latency target)
 * - Privacy constraints (PHI rings)
 * - Connectivity quality (bandwidth, jitter)
 * - VRAM availability
 * - Cost budgets
 *
 * See: docs/architecture/decisions/ADR-001-local-compute-decision-policy.md
 */

export type Target = 'edge' | 'workstation' | 'cloud'

export type PayloadType = 'raw_image' | 'features' | 'metrics'

export type Privacy = 'phi_raw' | 'phi_masked' | 'deidentified'

export type ModelTier = 'tiny' | 'small' | 'medium' | 'large'

export interface ModelSpec {
  name: string
  vramGB: number
  tier: ModelTier
}

export interface Context {
  /** Target latency in milliseconds */
  slaMs: number

  /** Type of data payload */
  payloadType: PayloadType

  /** Uplink bandwidth in Mbps */
  uplinkMbps: number

  /** Network jitter in milliseconds */
  jitterMs: number

  /** Available VRAM per compute tier */
  vrams: {
    jetson: number
    workstation: number
  }

  /** Model specification */
  model: ModelSpec

  /** Privacy level (PHI rings) */
  privacy: Privacy

  /** Cost constraints */
  cost: {
    dailyGpuBudgetUsd: number
    spentUsd: number
  }
}

/**
 * Decide where to execute an operation based on context.
 *
 * Evaluation order (gates):
 * 1. Privacy gate: Raw PHI stays on workstation if SLA allows
 * 2. SLA gate: Ultra-low latency → edge
 * 3. VRAM gate: Model too large for workstation → cloud
 * 4. Connectivity gate: Poor uplink → local
 * 5. Cost gate: Budget exceeded → local (degraded mode)
 * 6. Default: Prefer workstation for interactive, cloud for async
 *
 * @param ctx Runtime context
 * @returns Target compute tier
 */
export function decideTarget(ctx: Context): Target {
  // Gate 1: Privacy gate
  // Raw PHI must stay on workstation if SLA permits
  if (ctx.privacy === 'phi_raw' && ctx.slaMs <= 500) {
    return 'workstation'
  }

  // Gate 2: SLA gate
  // Ultra-low latency operations (< 50ms) run on edge if model is tiny
  if (ctx.slaMs <= 50 && ctx.model.tier === 'tiny') {
    return 'edge'
  }

  // Gate 3: VRAM gate
  // If model doesn't fit in workstation VRAM, must go to cloud
  if (ctx.model.vramGB > ctx.vrams.workstation) {
    return 'cloud'
  }

  // Gate 4: Connectivity gate
  // Poor network conditions require local execution
  if (ctx.uplinkMbps < 20 || ctx.jitterMs > 30) {
    return 'workstation'
  }

  // Gate 5: Cost gate
  // If daily budget exceeded, fall back to local compute
  if (ctx.cost.spentUsd >= ctx.cost.dailyGpuBudgetUsd) {
    return 'workstation'
  }

  // Gate 6: Default routing
  // Interactive operations (< 500ms SLA) prefer workstation
  // Async operations (> 500ms SLA) can use cloud
  return ctx.slaMs <= 500 ? 'workstation' : 'cloud'
}

/**
 * Get human-readable explanation of routing decision.
 *
 * Useful for debugging and provenance logging.
 *
 * @param ctx Runtime context
 * @returns Explanation string
 */
export function explainDecision(ctx: Context): string {
  const target = decideTarget(ctx)

  // Determine which gate triggered
  if (ctx.privacy === 'phi_raw' && ctx.slaMs <= 500) {
    return `Routed to ${target}: Privacy gate (raw PHI with SLA ${ctx.slaMs}ms)`
  }

  if (ctx.slaMs <= 50 && ctx.model.tier === 'tiny') {
    return `Routed to ${target}: SLA gate (ultra-low latency ${ctx.slaMs}ms, tiny model)`
  }

  if (ctx.model.vramGB > ctx.vrams.workstation) {
    return `Routed to ${target}: VRAM gate (model ${ctx.model.vramGB}GB > workstation ${ctx.vrams.workstation}GB)`
  }

  if (ctx.uplinkMbps < 20 || ctx.jitterMs > 30) {
    return `Routed to ${target}: Connectivity gate (uplink ${ctx.uplinkMbps}Mbps, jitter ${ctx.jitterMs}ms)`
  }

  if (ctx.cost.spentUsd >= ctx.cost.dailyGpuBudgetUsd) {
    return `Routed to ${target}: Cost gate (spent $${ctx.cost.spentUsd} >= budget $${ctx.cost.dailyGpuBudgetUsd})`
  }

  return `Routed to ${target}: Default routing (SLA ${ctx.slaMs}ms)`
}

/**
 * Create a default context for testing.
 *
 * Represents a typical retail workstation with good connectivity.
 */
export function createDefaultContext(): Context {
  return {
    slaMs: 200,
    payloadType: 'raw_image',
    uplinkMbps: 100,
    jitterMs: 10,
    vrams: {
      jetson: 8,
      workstation: 48,
    },
    model: {
      name: 'retina/seg',
      vramGB: 4,
      tier: 'small',
    },
    privacy: 'phi_raw',
    cost: {
      dailyGpuBudgetUsd: 100,
      spentUsd: 0,
    },
  }
}
