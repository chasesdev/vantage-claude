# @vantage/policy

Local compute decision policy for Vantage 3-Computer Architecture.

## Overview

This package implements the "Local when sensible" policy that deterministically routes operations to Edge (Jetson), Workstation (RTX 6000 Pro), or Cloud (DGX/Colo) based on five gates:

1. **Privacy gate:** Raw PHI stays on workstation if SLA permits
2. **SLA gate:** Ultra-low latency → edge
3. **VRAM gate:** Model too large for workstation → cloud
4. **Connectivity gate:** Poor uplink → local
5. **Cost gate:** Budget exceeded → local (degraded mode)

## Installation

```bash
pnpm add @vantage/policy
```

## Usage

```typescript
import { decideTarget, explainDecision, createDefaultContext } from '@vantage/policy'

// Create context
const ctx = {
  ...createDefaultContext(),
  slaMs: 120,
  payloadType: 'raw_image' as const,
  privacy: 'phi_raw' as const,
  model: {
    name: 'retina/seg',
    vramGB: 4,
    tier: 'small' as const,
  },
}

// Decide where to execute
const target = decideTarget(ctx) // => 'workstation'

// Get explanation
const explanation = explainDecision(ctx)
console.log(explanation)
// => "Routed to workstation: Privacy gate (raw PHI with SLA 120ms)"
```

## Integration with Temporal Workflows

```typescript
// packages/workflows/src/session.workflow.ts
import { decideTarget } from '@vantage/policy'
import { activities as a } from './activities'

export async function sessionWorkflow(input: { sessionId: string }) {
  const ctx = await a.collectRuntimeContext(input)

  // Decide where to run segmentation
  const t1 = decideTarget({
    ...ctx,
    slaMs: 120,
    payloadType: 'raw_image',
    privacy: 'phi_raw',
  })

  await (t1 === 'workstation' ? a.segWorkstation : a.segCloud)(input)
}
```

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Architecture Decision Record

See [ADR-001: Local Compute Decision Policy](../../docs/architecture/decisions/ADR-001-local-compute-decision-policy.md)

## License

MIT
