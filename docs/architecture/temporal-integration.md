# Temporal Integration Architecture

**Status:** Production Architecture
**Updated:** 2025-10-24
**Compliance:** HIPAA-eligible (Temporal Cloud with BAA)

---

## Overview

Temporal serves as the **durable workflow orchestration backbone** for the Vantage Imaging System, providing:

- **Idempotent session workflows** across all 3 computers
- **Exactly-once semantics** for critical operations
- **Human-in-the-loop approvals** via signals
- **Audit trail** for compliance (HIPAA, SaMD)
- **Deterministic replays** for debugging

**Principle:** Temporal is the system of record for session lifecycles; Flowise handles LLM prompt chains and reasoning.

---

## Why Temporal (Not Flowise Alone)

| Capability | Temporal | Flowise |
|:--|:--|:--|
| **Durable workflows** | ✅ Exactly-once, retries, idempotency | ❌ Best-effort, no strong guarantees |
| **Human-in-the-loop** | ✅ Signals, queries, blocking waits | ⚠️ Requires custom webhooks |
| **Multi-computer coordination** | ✅ Activities across Cloud/Workstation/Edge | ❌ Single-node execution |
| **Audit trail** | ✅ Event history, immutable logs | ⚠️ Custom logging needed |
| **SLA management** | ✅ Built-in timeouts, SLO dashboards | ❌ Manual tracking |
| **LLM orchestration** | ⚠️ Possible but verbose | ✅ Visual prompt chains, rapid iteration |

**Decision:** Temporal for business workflows, Flowise for AI reasoning.

---

## Architecture: Temporal + Flowise Split

```
┌─────────────────────────────────────────────────────────┐
│                 TEMPORAL WORKFLOWS                       │
│                 (Session Lifecycle)                      │
│                                                          │
│  SessionWorkflow:                                        │
│    1. markCheckedIn()                                   │
│    2. startCapture()        ←── calls ──┐               │
│    3. syncToCloud()                     │               │
│    4. launchCloudFusion()   ────────────┼───────────┐   │
│    5. waitForFusionComplete()           │           │   │
│    6. generateReport()                  │           │   │
│    7. notifyMobile()                    │           │   │
│                                         │           │   │
└─────────────────────────────────────────┼───────────┼───┘
                                          │           │
                                          ▼           ▼
                            ┌───────────────────────────────┐
                            │     FLOWISE WORKFLOWS          │
                            │     (AI Reasoning)             │
                            │                                │
                            │  - VIS Image Quality Check     │
                            │  - Retinal Analysis Chain      │
                            │  - Multi-Modal Fusion Prompt   │
                            │  - Report Summarization        │
                            └────────────────────────────────┘
```

**Workflow Calls Flowise:**
```typescript
// Inside Temporal activity
async function launchCloudFusion({ sessionId }: SessionInput) {
  const flowiseUrl = process.env.FLOWISE_URL
  const response = await fetch(`${flowiseUrl}/api/v1/prediction/multi-modal-fusion`, {
    method: 'POST',
    body: JSON.stringify({ sessionId, question: 'Analyze all biomarkers' })
  })
  return response.json()
}
```

---

## Core Workflow: Session Orchestration

### Complete TypeScript Implementation

```typescript
// packages/workflows/src/session.workflow.ts
import { proxyActivities, defineSignal, setHandler, condition, upsertSearchAttributes } from '@temporalio/workflow'
import type * as activities from '../activities'

const {
  markCheckedIn,
  startCapture,
  syncToCloud,
  launchCloudFusion,
  waitForFusionComplete,
  generateReport,
  notifyMobile,
  publishResults,
  routeToHumanReview
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  retry: {
    initialInterval: '1s',
    maximumAttempts: 10,
    backoffCoefficient: 2,
  },
})

export interface SessionInput {
  sessionId: string
  userId: string
  tenantId: string
  locationId: string
}

// Signals for human-in-the-loop
export const reviewSignal = defineSignal<[{ approved: boolean; notes?: string }]>('review')
export const setProgressSignal = defineSignal<[number]>('setProgress')

// Queries for real-time status
export const getProgressQuery = defineQuery<number>('getProgress')

export async function sessionWorkflow(input: SessionInput): Promise<string> {
  let progress = 0
  let reviewResult: { approved: boolean; notes?: string } | null = null

  // Initialize Search Attributes for Temporal UI visibility
  upsertSearchAttributes({
    SessionId: input.sessionId,
    TenantId: input.tenantId,
    LocationId: input.locationId,
    SessionStatus: 'IN_PROGRESS',
    Progress: 0,
  })

  // Set up signal handlers
  setHandler(setProgressSignal, (p) => {
    progress = p
    upsertSearchAttributes({ Progress: p })
  })

  setHandler(reviewSignal, (result) => {
    reviewResult = result
  })

  setHandler(getProgressQuery, () => progress)

  try {
    // Step 1: Check-in
    await markCheckedIn(input)
    progress = 10
    upsertSearchAttributes({ Progress: 10 })

    // Step 2: Capture (Workstation)
    await startCapture(input)
    progress = 30
    upsertSearchAttributes({ Progress: 30 })

    // Step 3: Sync to Cloud
    await syncToCloud(input)
    progress = 50
    upsertSearchAttributes({ Progress: 50 })

    // Step 4: Launch Cloud AI Fusion (RunPod DGX)
    await launchCloudFusion(input)
    progress = 60
    upsertSearchAttributes({ Progress: 60 })

    // Step 5: Wait for fusion complete (durable wait)
    await waitForFusionComplete(input)
    progress = 80
    upsertSearchAttributes({ Progress: 80 })

    // Step 6: Generate Report
    await generateReport(input)
    progress = 90
    upsertSearchAttributes({ Progress: 90 })

    // Step 7: Human Review Gate (blocking)
    upsertSearchAttributes({ SessionStatus: 'REVIEW' })
    await condition(() => reviewResult !== null, '24 hours') // timeout after 24h

    if (!reviewResult) {
      throw new Error('Review timeout - no approval received')
    }

    if (reviewResult.approved) {
      await publishResults(input)
      upsertSearchAttributes({ SessionStatus: 'COMPLETED', Progress: 100 })
    } else {
      await routeToHumanReview({ ...input, notes: reviewResult.notes })
      upsertSearchAttributes({ SessionStatus: 'REQUIRES_REVIEW' })
    }

    // Step 8: Notify Mobile
    await notifyMobile(input)

    return 'COMPLETED'
  } catch (error) {
    upsertSearchAttributes({ SessionStatus: 'FAILED' })
    throw error
  }
}
```

### Activities Implementation

```typescript
// packages/workflows/src/activities/index.ts
import { Context } from '@temporalio/activity'
import { prisma } from '@vantage/database'

export async function markCheckedIn({ sessionId }: { sessionId: string }) {
  const session = await prisma.session.update({
    where: { id: sessionId },
    data: { status: 'CHECKED_IN', startedAt: new Date() },
  })
  Context.current().log.info('Session checked in', { sessionId })
  return session
}

export async function startCapture({ sessionId }: { sessionId: string }) {
  // Trigger workstation capture via MQTT or REST
  await fetch(`${process.env.WORKSTATION_URL}/api/sessions/${sessionId}/capture`, {
    method: 'POST',
  })
  Context.current().log.info('Capture started', { sessionId })
}

export async function syncToCloud({ sessionId }: { sessionId: string }) {
  // Trigger sync from workstation to cloud S3
  const captures = await prisma.capture.findMany({ where: { sessionId } })
  Context.current().log.info('Syncing captures to cloud', { count: captures.length })
  // Implementation: upload files, update storageUrl
}

export async function launchCloudFusion({ sessionId }: { sessionId: string }) {
  // Call Flowise multi-modal fusion workflow
  const flowiseUrl = process.env.FLOWISE_URL!
  const response = await fetch(`${flowiseUrl}/api/v1/prediction/multi-modal-fusion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      question: 'Analyze all biomarkers and generate risk scores'
    }),
  })
  const result = await response.json()
  Context.current().log.info('Cloud fusion launched', { sessionId, jobId: result.jobId })
  return result
}

export async function waitForFusionComplete({ sessionId }: { sessionId: string }) {
  // Poll for completion (Temporal handles retries)
  let attempts = 0
  while (attempts < 60) { // max 5 minutes (5s * 60)
    const report = await prisma.report.findFirst({
      where: { sessionId, type: 'COMPREHENSIVE' },
    })
    if (report) {
      Context.current().log.info('Fusion complete', { sessionId })
      return report
    }
    await new Promise(resolve => setTimeout(resolve, 5000))
    attempts++
  }
  throw new Error('Fusion timeout')
}

export async function generateReport({ sessionId }: { sessionId: string }) {
  // Generate PDF using PDFKit
  Context.current().log.info('Generating PDF report', { sessionId })
  // Implementation: fetch data, render PDF, upload to S3
}

export async function publishResults({ sessionId }: { sessionId: string }) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  })
  Context.current().log.info('Results published', { sessionId })
}

export async function routeToHumanReview(input: { sessionId: string; notes?: string }) {
  // Create review task
  Context.current().log.info('Routing to human review', { sessionId: input.sessionId })
}

export async function notifyMobile({ sessionId, userId }: { sessionId: string; userId: string }) {
  // Send push notification (no PHI in payload)
  const expo = await import('@vantage/push')
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } })
  if (user?.profile?.pushToken) {
    await expo.sendPush({
      to: user.profile.pushToken,
      sound: 'default',
      body: 'Your health report is ready to view.',
    })
  }
  Context.current().log.info('Mobile notified', { userId })
}
```

---

## Search Attributes: Bridge to UIs

### Why Search Attributes Matter

Search Attributes allow **both Temporal UI and our custom UIs** to filter/query workflows using business concepts (not just workflow IDs).

**Example queries:**
- `SessionStatus = 'FAILED' AND LocationId = 'nyc-soho'` (ops debugging)
- `TenantId = 'vantage-nyc' AND SessionStatus = 'REVIEW'` (pending reviews)
- `Progress < 50 AND SessionStatus = 'IN_PROGRESS'` (stuck sessions)

### Defining Search Attributes

```typescript
// Custom Search Attributes for Vantage
export interface VantageSearchAttributes {
  SessionId: string          // Keyword
  TenantId: string           // Keyword
  LocationId: string         // Keyword
  SessionStatus: string      // Keyword (IN_PROGRESS, REVIEW, COMPLETED, FAILED)
  Progress: number           // Int (0-100)
  BuildId: string            // Keyword (workstation version)
}
```

### Register in Temporal

```bash
# Via Temporal CLI
temporal operator search-attribute create \
  --namespace vantage-prod \
  --name SessionId --type Keyword \
  --name TenantId --type Keyword \
  --name LocationId --type Keyword \
  --name SessionStatus --type Keyword \
  --name Progress --type Int \
  --name BuildId --type Keyword
```

Or via Temporal Cloud UI (automatic on Cloud).

### Querying from Facilitator Portal

```typescript
// apps/facilitator-portal/src/api/sessions.ts
import { Client } from '@temporalio/client'

const client = new Client({
  namespace: 'vantage-prod',
  connection: { address: process.env.TEMPORAL_ADDRESS },
})

export async function getActiveSessionsForLocation(locationId: string) {
  const handle = client.workflow.list({
    query: `SessionStatus = 'IN_PROGRESS' AND LocationId = '${locationId}'`,
  })

  const sessions = []
  for await (const workflow of handle) {
    sessions.push({
      sessionId: workflow.searchAttributes?.SessionId,
      progress: workflow.searchAttributes?.Progress,
      status: workflow.status,
    })
  }
  return sessions
}
```

---

## GUI Surfaces: 4 Personas, 4 UIs

### 1. Patient (Mobile App)

**What they see:** Plain-language timeline, no technical jargon.

```typescript
// apps/mobile/screens/LiveSessionScreen.tsx
import { trpc } from '../utils/trpc'

export function LiveSessionScreen({ sessionId }: { sessionId: string }) {
  const { data: session } = trpc.sessions.getById.useQuery(sessionId, {
    refetchInterval: 2000, // poll every 2s
  })

  const progressSteps = [
    { key: 0, label: 'Checked in' },
    { key: 30, label: 'Scanning in progress' },
    { key: 50, label: 'Processing images' },
    { key: 80, label: 'AI analysis' },
    { key: 100, label: 'Report ready' },
  ]

  const currentStep = progressSteps.findLast(s => s.key <= (session?.progress || 0))

  return (
    <View>
      <Text className="text-2xl font-bold">Your Session</Text>
      <ProgressBar value={session?.progress || 0} />
      <Text className="text-lg">{currentStep?.label}</Text>

      {session?.aiReasoning && (
        <View className="mt-4 p-4 bg-blue-50 rounded">
          <Text className="font-semibold">Why this step:</Text>
          <Text>{session.aiReasoning}</Text>
        </View>
      )}
    </View>
  )
}
```

**Key:** No Temporal jargon, just human-readable status.

---

### 2. Facilitator (Next.js Portal on Workstation)

**What they see:** Today's schedule, device status, live session controls.

```typescript
// apps/facilitator-portal/src/app/dashboard/page.tsx
import { getActiveSessionsForLocation } from '@/api/sessions'
import { SessionCard } from '@/components/SessionCard'

export default async function DashboardPage() {
  const locationId = process.env.LOCATION_ID!
  const sessions = await getActiveSessionsForLocation(locationId)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Today's Sessions</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <DeviceStatusCard device="Canon R5" status="online" />
        <DeviceStatusCard device="DEXA" status="calibrating" />
        <DeviceStatusCard device="Retinal OCT" status="online" />
      </div>

      <div className="space-y-4">
        {sessions.map(session => (
          <SessionCard key={session.sessionId} session={session} />
        ))}
      </div>
    </div>
  )
}
```

**SessionCard Component:**

```typescript
// apps/facilitator-portal/src/components/SessionCard.tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function SessionCard({ session }) {
  const [approving, setApproving] = useState(false)

  const handleApprove = async () => {
    setApproving(true)
    await fetch(`/api/sessions/${session.sessionId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approved: true }),
    })
    setApproving(false)
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">{session.patientName}</h3>
          <p className="text-sm text-gray-600">Progress: {session.progress}%</p>
        </div>
        {session.status === 'REVIEW' && (
          <Button onClick={handleApprove} disabled={approving}>
            Approve Report
          </Button>
        )}
      </div>
      <ProgressBar value={session.progress} className="mt-2" />
    </div>
  )
}
```

**Backend API for Approval:**

```typescript
// apps/facilitator-portal/src/app/api/sessions/[id]/approve/route.ts
import { Client } from '@temporalio/client'

const client = new Client({
  namespace: 'vantage-prod',
  connection: { address: process.env.TEMPORAL_ADDRESS },
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { approved, notes } = await req.json()

  // Get workflow handle by SessionId search attribute
  const handle = await client.workflow.getHandle(params.id)

  // Send review signal
  await handle.signal('review', { approved, notes })

  return Response.json({ success: true })
}
```

---

### 3. Clinician/Researcher (Provenance Explorer)

**What they see:** Reproducibility bundle with deep-links to Temporal UI.

```typescript
// apps/admin/src/app/sessions/[id]/provenance/page.tsx
export default async function ProvenancePage({ params }: { params: { id: string } }) {
  const session = await prisma.session.findUnique({
    where: { id: params.id },
    include: { captures: true, biomarkers: true, reports: true },
  })

  const temporalUrl = `${process.env.TEMPORAL_WEB_URL}/namespaces/vantage-prod/workflows/${params.id}`

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Session Provenance</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Workflow History</h2>
        <a href={temporalUrl} target="_blank" className="text-blue-600 underline">
          View in Temporal UI (read-only)
        </a>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Model Versions</h2>
        <ul className="list-disc ml-6">
          <li>Retinal Segmentation: v2.3.1 (SHA: abc123)</li>
          <li>Body Composition: v1.8.0 (SHA: def456)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Device Settings</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(session.captures[0]?.metadata, null, 2)}
        </pre>
      </section>
    </div>
  )
}
```

---

### 4. SRE/Developer (Temporal Web UI)

**What they see:** Full workflow introspection, task queues, failures.

**Access:**
- Self-hosted: `http://localhost:8080` (included in Docker Compose)
- Temporal Cloud: `https://cloud.temporal.io/namespaces/vantage-prod`

**SSO Setup (for Temporal Cloud):**

```yaml
# Temporal Cloud SAML SSO with Okta/Entra
# Configure via Cloud UI:
# Settings → Namespace → Access → SSO
# Provider: Okta / Azure AD
# Groups: vantage-sre (admin), vantage-dev (read-only)
```

**Saved Queries (bookmark these in Temporal UI):**

```sql
-- Failed sessions in last 24h
SessionStatus = 'FAILED' AND StartTime > '2025-10-23'

-- Sessions pending review
SessionStatus = 'REVIEW' AND LocationId = 'nyc-soho'

-- Stuck sessions (low progress, long running)
Progress < 50 AND SessionStatus = 'IN_PROGRESS' AND ExecutionTime > '30m'
```

---

## Easy Retail Setup: Guided Installer

### Goal
Non-expert can bring a new retail location online in **< 60 minutes**.

### Installer: `vantagectl enroll`

```bash
# Run on new workstation
vantagectl enroll \
  --namespace vantage-prod \
  --api-key <TEMPORAL_CLOUD_API_KEY> \
  --location nyc-soho
```

### What It Does

**Phase 1: Validate Environment**
```bash
#!/bin/bash
# scripts/enroll.sh

echo "🔍 Validating workstation environment..."

# Check GPU
nvidia-smi > /dev/null || { echo "❌ NVIDIA GPU not found"; exit 1; }

# Check Docker
docker --version > /dev/null || { echo "❌ Docker not installed"; exit 1; }

# Check storage
FREE_GB=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$FREE_GB" -lt 1000 ]; then
  echo "❌ Need at least 1TB free space, found ${FREE_GB}GB"
  exit 1
fi

echo "✅ Environment validated"
```

**Phase 2: Deploy Services**
```bash
# Pull Docker Compose stack (includes Temporal UI)
docker-compose -f docker-compose.workstation.yml pull
docker-compose -f docker-compose.workstation.yml up -d

# Verify services
docker-compose ps
```

**Phase 3: Register Worker**
```typescript
// packages/workflows/src/worker.ts
import { NativeConnection, Worker } from '@temporalio/worker'
import * as activities from './activities'
import { sessionWorkflow } from './session.workflow'

async function run() {
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS!, // Cloud or self-hosted
    tls: process.env.TEMPORAL_MTLS === 'true' ? {
      clientCertPair: {
        crt: Buffer.from(process.env.TEMPORAL_CLIENT_CERT!),
        key: Buffer.from(process.env.TEMPORAL_CLIENT_KEY!),
      },
    } : undefined,
  })

  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE!,
    taskQueue: `workstation-${process.env.LOCATION_ID}`,
    workflowsPath: require.resolve('./workflows'),
    activities,
    maxConcurrentActivityTaskExecutions: 10,
  })

  console.log(`✅ Worker started for location: ${process.env.LOCATION_ID}`)
  await worker.run()
}

run().catch(err => {
  console.error('❌ Worker failed:', err)
  process.exit(1)
})
```

**Phase 4: Device Discovery**
```typescript
// Auto-discover devices via mDNS
import mdns from 'mdns'

const browser = mdns.createBrowser(mdns.tcp('vantage-device'))

browser.on('serviceUp', async (service) => {
  console.log(`📡 Discovered device: ${service.name}`)

  // Register in database
  await prisma.device.upsert({
    where: { serialNumber: service.txtRecord.serial },
    create: {
      name: service.name,
      type: service.txtRecord.type,
      ipAddress: service.addresses[0],
      status: 'ONLINE',
    },
    update: { ipAddress: service.addresses[0], status: 'ONLINE' },
  })

  // Launch calibration workflow
  await client.workflow.start('deviceCalibration', {
    taskQueue: `workstation-${process.env.LOCATION_ID}`,
    workflowId: `calibrate-${service.txtRecord.serial}`,
    args: [{ deviceId: service.txtRecord.serial }],
  })
})

browser.start()
```

**Phase 5: Site Acceptance Test**
```typescript
// Run comprehensive health check
export async function siteAcceptanceWorkflow({ locationId }: { locationId: string }) {
  const results = {
    storage: await testStorage(),
    network: await testNetworkLatency(),
    gpu: await testGPUInference(),
    devices: await testAllDevices(),
  }

  // Generate signed report
  const report = {
    locationId,
    timestamp: new Date(),
    results,
    passed: Object.values(results).every(r => r.passed),
  }

  if (report.passed) {
    upsertSearchAttributes({ SiteStatus: 'READY' })
  }

  return report
}
```

---

## Temporal Cloud vs Self-Hosted

### Feature Comparison

| Feature | Self-Hosted | Temporal Cloud |
|:--|:--|:--|
| **Web UI** | ✅ Included in Docker | ✅ Hosted |
| **RBAC** | ⚠️ Manual (OIDC) | ✅ Built-in |
| **Audit Logs** | ❌ Custom needed | ✅ Built-in |
| **SSO** | ✅ OIDC | ✅ SAML (Okta/Entra) |
| **HIPAA BAA** | ❌ Self-responsibility | ✅ Available |
| **Search Attributes** | ✅ (requires Visibility store) | ✅ (enabled by default) |
| **Ops burden** | High (upgrades, scaling) | Low (managed) |

### Recommendation

**Production:** Use **Temporal Cloud** with BAA for:
- HIPAA compliance out-of-the-box
- RBAC/audit/SSO without custom code
- Reduced ops burden

**Development:** Self-hosted Docker Compose is fine.

### Cost Estimate

**Temporal Cloud:**
- Actions: ~$0.025 per 1,000 actions
- Storage: ~$0.00042 per GB-month
- **Example:** 1,000 sessions/month × 100 activities each = 100K actions = **~$2.50/month**

(Much cheaper than building RBAC/audit yourself!)

---

## Embedding Temporal UI in Admin Portal

```nginx
# nginx.conf for admin portal
location /ops/temporal {
  auth_request /auth/check;  # SSO check
  proxy_pass http://temporal-web-ui:8080;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}
```

**SSO Integration:**
```typescript
// apps/admin/middleware.ts
import { auth } from '@clerk/nextjs'

export async function middleware(req: NextRequest) {
  const { userId, sessionClaims } = auth()

  if (req.nextUrl.pathname.startsWith('/ops/temporal')) {
    if (!sessionClaims?.role?.includes('SRE')) {
      return NextResponse.redirect('/unauthorized')
    }
  }

  return NextResponse.next()
}
```

---

## OpenTelemetry Integration

### Trace Session End-to-End

**Mobile → API → Temporal → Workstation**

```typescript
// apps/cloud-api/src/telemetry/tracing.interceptor.ts
import { context, trace, propagation } from '@opentelemetry/api'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const tracer = trace.getTracer('vantage-api')
    const span = tracer.startSpan(`${ctx.getClass().name}.${ctx.getHandler().name}`)

    return context.with(trace.setSpan(context.active(), span), () =>
      next.handle().pipe(finalize(() => span.end()))
    )
  }
}
```

**Propagate to Temporal:**

```typescript
// When starting workflow, inject traceparent
import { trace, propagation } from '@opentelemetry/api'

const carrier = {}
propagation.inject(context.active(), carrier)

await client.workflow.start('sessionWorkflow', {
  taskQueue: 'workstation-nyc-soho',
  workflowId: sessionId,
  args: [input],
  headers: carrier, // Temporal will propagate this
})
```

**Read in Activity:**

```typescript
// packages/workflows/src/activities/index.ts
import { Context } from '@temporalio/activity'
import { trace, context as otelContext, propagation } from '@opentelemetry/api'

export async function startCapture(input: { sessionId: string }) {
  const headers = Context.current().info.workflowExecution.headers
  const ctx = propagation.extract(otelContext.active(), headers)

  const tracer = trace.getTracer('vantage-activities')
  const span = tracer.startSpan('startCapture', undefined, ctx)

  try {
    // Do work...
  } finally {
    span.end()
  }
}
```

---

## SLOs & Monitoring

### Key SLOs

| Metric | Target | Critical |
|:--|:--|:--|
| Session completion rate | 99% < 30 min | 95% |
| Workflow failure rate | < 1% | < 5% |
| Cloud → Mobile latency | < 2s (p95) | < 5s |
| Sync lag (workstation → cloud) | < 60s | < 5 min |

### Dashboards (Temporal + Datadog)

**Temporal Metrics (Prometheus):**
```yaml
# Prometheus scrape config
scrape_configs:
  - job_name: 'temporal'
    static_configs:
      - targets: ['temporal-frontend:9090']
```

**Grafana Dashboard:**
- Workflow completion rate (by LocationId)
- Task queue lag
- Activity failure rate
- Worker health

**Datadog APM:**
- Trace from mobile app → Temporal → workstation
- Service map
- Error tracking

---

## Production Checklist

### Before Go-Live

- [ ] Temporal Cloud namespace created with BAA executed
- [ ] RBAC groups configured (SRE, Dev read-only)
- [ ] Search Attributes registered (SessionId, TenantId, LocationId, SessionStatus, Progress)
- [ ] Workers deployed to all locations
- [ ] Monitoring dashboards configured (Grafana + Datadog)
- [ ] Runbook documented (how to debug failed workflows)
- [ ] Backup/restore tested (Temporal state + PostgreSQL)

---

## Next Steps

1. **Week 1:** Deploy Temporal Cloud + register Search Attributes
2. **Week 2:** Implement SessionWorkflow + activities
3. **Week 3:** Build Facilitator Portal with live session view
4. **Week 4:** End-to-end test with mock devices

---

## References

- [Temporal Docs](https://docs.temporal.io)
- [Temporal Cloud HIPAA](https://docs.temporal.io/cloud/security#hipaa-compliance)
- [Search Attributes](https://docs.temporal.io/visibility#search-attribute)
- [Signals & Queries](https://docs.temporal.io/workflows#signals)
- [TypeScript SDK](https://typescript.temporal.io)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-24
**Maintained By:** Vantage Engineering
