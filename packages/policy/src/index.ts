/**
 * @vantage/policy
 *
 * Local compute decision policy for Vantage 3-Computer Architecture.
 *
 * Routes operations to Edge, Workstation, or Cloud based on:
 * - SLA requirements
 * - Privacy constraints (PHI rings)
 * - Connectivity quality
 * - VRAM availability
 * - Cost budgets
 *
 * See: docs/architecture/decisions/ADR-001-local-compute-decision-policy.md
 */

export {
  decideTarget,
  explainDecision,
  createDefaultContext,
  type Target,
  type PayloadType,
  type Privacy,
  type ModelTier,
  type ModelSpec,
  type Context,
} from './execution-policy'
