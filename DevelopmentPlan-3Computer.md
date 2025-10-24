# Vantage Imaging System - 3 Computer Architecture Development Plan

**Version:** 3.0 - 3 Computer Architecture
**Date:** 2025-10-24
**CTO/Co-Founder:** Lead Developer
**Philosophy:** Distributed Intelligence, Transparent, Open Source (MIT License)

---

## Executive Summary

The Vantage Imaging System implements **NVIDIA's 3 Computer Architecture** for distributed health intelligence:

1. **Computer 1 (Cloud):** DigitalReality NYC + RunPod DGX - Training, orchestration, mobile app backend
2. **Computer 2 (Workstation):** Retail RTX 6000 Pro - Real-time inference, device control, in-store experience
3. **Computer 3 (Edge/Mobile):** Expo mobile app + Jetson devices - Patient interface, edge preprocessing

**Core Concept:** Three computers work together - the cloud trains and orchestrates, the workstation delivers the retail experience, and mobile devices keep participants engaged everywhere.

**Reference:** [NVIDIA's Three Computers for Robotics](https://blogs.nvidia.com/blog/three-computers-robotics/)

---

## 1. The 3 Computer Architecture

### 1.1 Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              COMPUTER 1: CLOUD (DigitalReality NYC)              │
│                                                                  │
│  ┌──────────────────────┐    ┌──────────────────────────────┐  │
│  │  NestJS Backend API  │    │   RunPod DGX Instances       │  │
│  │  - User management   │    │   - Model training           │  │
│  │  - Mobile app API    │    │   - Heavy inference          │  │
│  │  - Multi-location    │    │   - Batch processing         │  │
│  │  - Data aggregation  │    │   - Research workflows       │  │
│  └──────────────────────┘    └──────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────┐    ┌──────────────────────────────┐  │
│  │  PostgreSQL (Main)   │    │   Flowise (Orchestrator)     │  │
│  │  - All user data     │    │   - Global workflows         │  │
│  │  │  - All sessions    │    │   - Cross-location AI        │  │
│  └──────────────────────┘    └──────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              S3-Compatible Storage (MinIO)                │  │
│  │              - All imaging archives                        │  │
│  │              - Model checkpoints                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             │ HTTPS / WebSocket
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐  ┌─────────────────────┐  ┌───────────────┐
│ Expo Mobile   │  │  COMPUTER 2:        │  │ Expo Mobile   │
│ App (Patient  │  │  WORKSTATION        │  │ App (Patient  │
│ in NYC)       │  │  (Retail Location)  │  │ in LA)        │
└───────────────┘  └──────────┬──────────┘  └───────────────┘
                              │
                              │
    ┌─────────────────────────────────────────────────────┐
    │     RTX 6000 Pro Blackwell + Ryzen 9950X3D          │
    │     256GB RAM + 12TB NVMe                           │
    │                                                      │
    │  ┌────────────────────────────────────────────────┐ │
    │  │  Flowise (Local Orchestrator)                  │ │
    │  │  - Synced workflows from Cloud                 │ │
    │  │  - Real-time session control                   │ │
    │  └────────────────────────────────────────────────┘ │
    │                                                      │
    │  ┌────────────────────────────────────────────────┐ │
    │  │  Next.js Apps (iPad Interfaces)                │ │
    │  │  ├─ VIS Control (3D visualization)             │ │
    │  │  ├─ Body Composition                           │ │
    │  │  ├─ Retinal Dashboard                          │ │
    │  │  └─ Cardiovascular Monitor                     │ │
    │  └────────────────────────────────────────────────┘ │
    │                                                      │
    │  ┌────────────────────────────────────────────────┐ │
    │  │  Local Services                                │ │
    │  │  ├─ PostgreSQL (local cache + sync)            │ │
    │  │  ├─ Redis (real-time state)                    │ │
    │  │  ├─ Ollama (local LLM)                         │ │
    │  │  ├─ MinIO (local image cache)                  │ │
    │  │  └─ MQTT Broker                                │ │
    │  └────────────────────────────────────────────────┘ │
    └──────────────┬───────────────────────────────────────┘
                   │
                   │ 10GbE / WiFi 6E
                   │
    ┌──────────────┼──────────────────────────┐
    │              │                          │
    ▼              ▼                          ▼
┌─────────┐  ┌─────────┐               ┌─────────────┐
│ iPad    │  │ iPad    │               │ COMPUTER 3: │
│ (VIS)   │  │ (DEXA)  │               │ EDGE/MOBILE │
└─────────┘  └─────────┘               └──────┬──────┘
                                               │
                   ┌───────────────────────────┼──────────┐
                   │                           │          │
                   ▼                           ▼          ▼
           ┌──────────────┐           ┌──────────┐  ┌────────────┐
           │ Jetson Orin  │           │  iPhone  │  │  Android   │
           │  NX/Thor     │           │  (Expo)  │  │  (Expo)    │
           │ (Camera prep)│           └──────────┘  └────────────┘
           └──────────────┘
```

### 1.2 Computer 1: Cloud (DigitalReality NYC + RunPod)

**Purpose:** Training, orchestration, mobile app backend, multi-location coordination

**Location:** DigitalReality NYC datacenter (primary), RunPod (burst compute)

**Stack:**
- **Backend:** NestJS API (TypeScript)
- **Database:** PostgreSQL (primary source of truth)
- **Storage:** S3-compatible (MinIO or AWS S3)
- **AI Orchestration:** Flowise (global instance)
- **Queue:** BullMQ + Redis
- **Auth:** Clerk (mobile + web)
- **API:** tRPC (type-safe) + REST (mobile)

**Responsibilities:**
- User authentication & profiles
- Mobile app API endpoints
- Historical data aggregation
- Model training (RunPod DGX)
- Cross-location analytics
- Global Flowise workflows
- Sync coordination with retail workstations
- Apple Health / Garmin data ingestion
- Document processing (OCR for medical records)

**Infrastructure:**
- DigitalReality: Dedicated server (16+ core, 128GB RAM, A6000 GPU)
- RunPod: On-demand DGX instances for training
- Kubernetes for orchestration
- CloudFlare for CDN + DDoS protection

### 1.3 Computer 2: Workstation (Retail Location)

**Purpose:** Real-time inference, device control, in-store experience

**Hardware:** RTX 6000 Pro Blackwell + Ryzen 9950X3D + 256GB RAM + 12TB NVMe

**Stack:**
- **Orchestration:** Flowise (synced from cloud)
- **Frontend:** Next.js apps (iPad interfaces)
- **Database:** PostgreSQL (local replica with sync)
- **Storage:** MinIO (local cache, syncs to cloud)
- **LLM:** Ollama + vLLM (local inference)
- **Queue:** BullMQ + Redis

**Responsibilities:**
- Control all imaging devices (cameras, DEXA, OCT)
- Real-time AI inference during sessions
- 3D visualization for in-store iPads
- Local data processing
- Sync session data to cloud
- Offline-first operation (works without internet)
- Real-time updates to participant's mobile app

**Sync Strategy:**
- Bidirectional sync with cloud PostgreSQL (Prisma sync or custom)
- Imaging data: upload to cloud S3 after session
- Real-time session updates via WebSocket to cloud → mobile app
- Conflict resolution: cloud wins for user data, local wins for session data

### 1.4 Computer 3: Edge/Mobile (Expo App + Jetson)

#### 3.1 Jetson Edge Devices

**Purpose:** Preprocessing near cameras to reduce workstation load

**Hardware:** Jetson Orin NX or Thor (per camera)

**Responsibilities:**
- Camera feed preprocessing (compression, stabilization)
- Initial feature extraction
- Stream to workstation via MQTT
- Reduce bandwidth and latency

#### 3.2 Expo Mobile App (iOS/Android)

**Purpose:** Participant onboarding, historical data, real-time session monitoring, health integrations

**Stack:**
- **Framework:** Expo (React Native)
- **UI:** NativeWind (Tailwind for React Native)
- **State:** Zustand or TanStack Query
- **Auth:** Clerk (same as cloud)
- **API:** tRPC client (type-safe)
- **Offline:** WatermelonDB or PouchDB
- **Camera:** Expo Camera (document scanning)
- **Health:** expo-health-connect (Android), HealthKit (iOS)

**Features:**

**1. Onboarding & Profile**
- Sign up with email/phone
- Health questionnaire
- Consent forms (digital signature)
- Insurance/payment setup

**2. Dashboard**
- Latest biomarker summary
- Upcoming appointments
- Scan history timeline
- AI-generated health insights

**3. Historical Data**
- All past session results
- Trend charts (body composition, retinal health, cardiovascular)
- Compare scans over time
- Download reports (PDF)

**4. Real-Time Session Monitoring**
- When at retail location, see live session progress
- 3D VIS room visualization (simplified for mobile)
- Activity feed (same as iPad view)
- AI reasoning exposed
- Receive notifications ("DEXA scan complete")

**5. Document Scanning**
- OCR for medical records (expo-document-scanner)
- Upload lab results manually
- AI extracts biomarkers from PDFs
- Store in cloud, link to profile

**6. Health Integrations**
- **Apple Health:** Import steps, heart rate, sleep, workouts
- **Garmin:** Sync VO₂ max, stress, HRV, activities
- Auto-sync daily (background job)
- Correlate with scan data

**7. Recommendations & Tracking**
- AI-generated personalized goals
- Track interventions (exercise, nutrition)
- Progress tracking
- Reminders & notifications

**8. Secure Messaging**
- Chat with facilitators/clinicians
- Ask questions about results
- Schedule follow-ups

**Screen Flow Example:**
```
┌─────────────────────┐
│   Login / Signup    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Dashboard        │
│  ┌───────────────┐  │
│  │ Latest Scan   │  │
│  │ Body Comp: ↑  │  │
│  │ Retinal: →    │  │
│  │ Cardio: ↓     │  │
│  └───────────────┘  │
│                     │
│  [History] [Health] │
│  [Docs] [Chat]      │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│   History View      │
│  ┌───────────────┐  │
│  │ 2025-10-15    │  │
│  │ Comprehensive │  │
│  │ [View Report] │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ 2025-07-20    │  │
│  │ Body Comp     │  │
│  │ [View Report] │  │
│  └───────────────┘  │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Health Data        │
│  ┌───────────────┐  │
│  │ Apple Health  │  │
│  │ [Connected ✓] │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ Garmin        │  │
│  │ [Connect]     │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ Steps: 8,234  │  │
│  │ HR Avg: 68    │  │
│  │ Sleep: 7.2h   │  │
│  └───────────────┘  │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Live Session       │
│  (When in-store)    │
│  ┌───────────────┐  │
│  │  VIS Room 3D  │  │
│  │  (Simplified) │  │
│  └───────────────┘  │
│                     │
│  Activity Feed:     │
│  • Platform rotating│
│  • Capturing image  │
│  • AI analyzing...  │
│                     │
│  [45% Complete]     │
└─────────────────────┘
```

---

## 2. Monorepo Structure (Updated)

```
vantage/
├── apps/
│   ├── cloud-api/                # NestJS backend (Computer 1)
│   ├── mobile/                   # Expo app (Computer 3)
│   ├── vis-control/              # Next.js - VIS 3D (Computer 2)
│   ├── body-composition/         # Next.js - DEXA (Computer 2)
│   ├── retinal-dashboard/        # Next.js - OCT (Computer 2)
│   ├── cardiovascular/           # Next.js - Cardio (Computer 2)
│   ├── lab-integration/          # Next.js - Labs (Computer 2)
│   ├── master-timeline/          # Next.js - Patient journey (Computer 2)
│   └── facilitator-portal/       # Next.js - Staff admin (Computer 2)
│
├── packages/
│   ├── ui/                       # Shared React components (web)
│   ├── mobile-ui/                # Shared React Native components
│   ├── database/                 # Prisma schema + migrations
│   ├── api/                      # tRPC router definitions
│   ├── flowise-sdk/              # Flowise client library
│   ├── device-adapters/          # Hardware abstraction layer
│   │   ├── canon-camera/
│   │   ├── dexa/
│   │   ├── retinal-oct/
│   │   ├── vo2-analyzer/
│   │   └── ...
│   ├── ai-models/                # Model definitions + ONNX exports
│   ├── mqtt-client/              # Device messaging
│   ├── sync-engine/              # Cloud ↔ Workstation sync
│   ├── health-integrations/      # Apple Health, Garmin SDKs
│   └── types/                    # Shared TypeScript types
│
├── services/
│   ├── flowise/                  # Flowise config (cloud + workstation)
│   ├── postgres/                 # Database setup
│   ├── redis/                    # Cache + pub/sub
│   ├── minio/                    # Object storage
│   └── mqtt-broker/              # Mosquitto config
│
├── hardware/
│   ├── vis-platform/             # VIS platform control
│   ├── lighting/                 # Lighting control
│   ├── jetson/                   # Edge compute setup
│   └── calibration/              # Camera + sensor calibration
│
├── models/
│   ├── retinal-segmentation/     # Training code
│   ├── body-composition/         # 3D reconstruction
│   ├── pose-estimation/          # Patient positioning
│   ├── document-ocr/             # Medical record extraction
│   └── biomarker-extraction/     # Multi-modal AI
│
├── cloud/
│   ├── k8s/                      # Kubernetes manifests
│   ├── terraform/                # Infrastructure as code
│   └── runpod/                   # RunPod job configs
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── mobile-app/
│   ├── hardware-setup/
│   └── deployment/
│
├── docker-compose.yml            # Local dev (Computer 2)
├── docker-compose.cloud.yml      # Cloud services (Computer 1)
├── turbo.json                    # TurboRepo config
├── package.json
├── pnpm-workspace.yaml
└── LICENSE                       # MIT License
```

---

## 3. Data Flow Architecture

### 3.1 Participant Onboarding Flow

```
1. User downloads Expo app
   ↓
2. Sign up with Clerk (email/phone)
   → POST /api/users (Computer 1 - Cloud API)
   → Creates User + Profile in PostgreSQL
   ↓
3. Complete health questionnaire
   → POST /api/profiles/:id/health-data
   ↓
4. Connect Apple Health / Garmin
   → Mobile app requests permissions
   → Background sync starts (daily)
   → POST /api/health/sync
   ↓
5. Scan documents (medical records)
   → Expo Camera captures image
   → Upload to cloud S3
   → POST /api/documents/upload
   → BullMQ job: OCR extraction (Tesseract or AWS Textract)
   → AI extracts biomarkers (LLM)
   → Updates profile
   ↓
6. Book first session
   → GET /api/locations (find nearest retail location)
   → POST /api/sessions/schedule
   ↓
7. Receive confirmation & prep instructions
```

### 3.2 In-Store Session Flow

```
1. Participant arrives at retail location
   ↓
2. Check-in via mobile app (QR code scan)
   → PUT /api/sessions/:id/check-in
   → Cloud notifies workstation (Computer 2) via WebSocket
   ↓
3. Facilitator starts session on workstation iPad
   → Flowise workflow "VIS Session" triggered (Computer 2)
   → Session status → "IN_PROGRESS"
   → Cloud updates mobile app in real-time
   ↓
4. Participant sees live session on mobile app
   → WebSocket connection: Workstation → Cloud → Mobile
   → 3D visualization (simplified)
   → Activity feed updates
   ↓
5. Devices capture data (VIS, DEXA, OCT, etc.)
   → Computer 3 (Jetson): Preprocess camera feeds
   → Computer 2 (Workstation): Real-time AI inference
   → Local PostgreSQL: Store session data
   → Local MinIO: Store images
   ↓
6. AI analysis (during session)
   → Workstation runs local LLMs (Ollama)
   → Quality checks, feature extraction
   → Results displayed on iPads + mobile app
   ↓
7. Session complete
   → Workstation syncs to cloud:
      - PostgreSQL sync (session data)
      - S3 upload (all images)
   → Cloud triggers global Flowise workflow:
      - "Comprehensive Health Analysis"
      - Uses RunPod DGX for heavy compute
      - Cross-modal biomarker fusion
   ↓
8. Report generation
   → LLM generates patient-friendly report
   → PDF created (PDFKit)
   → Uploaded to cloud S3
   → Mobile app notified: "Your results are ready!"
   ↓
9. Participant views report on mobile
   → Download PDF
   → Interactive charts
   → AI recommendations
   → Schedule follow-up
```

### 3.3 Continuous Health Monitoring Flow

```
Daily (Background):
1. Mobile app syncs Apple Health / Garmin
   → POST /api/health/sync (batch)
   → Cloud stores in PostgreSQL
   ↓
2. AI analyzes trends
   → Detect anomalies (sudden weight change, HR spike)
   → Compare to latest scan biomarkers
   ↓
3. Generate insights
   → Push notification: "Your step count is up 20% this week!"
   → In-app recommendation: "Consider scheduling a follow-up scan"

Weekly:
1. Cloud aggregates all user data
   → Flowise workflow: "Longitudinal Analysis"
   → Identify trends, predict risks
   ↓
2. Update mobile dashboard
   → Personalized goals
   → Progress tracking
```

---

## 4. Technology Stack Deep Dive

### 4.1 Computer 1 (Cloud) - Full Stack

**Backend API (NestJS):**
```typescript
// apps/cloud-api/src/app.module.ts
import { Module } from '@nestjs/common'
import { TrpcModule } from './trpc/trpc.module'
import { HealthModule } from './health/health.module'
import { SessionsModule } from './sessions/sessions.module'
import { DocumentsModule } from './documents/documents.module'

@Module({
  imports: [
    TrpcModule,        // tRPC router for mobile app
    HealthModule,      // Apple Health / Garmin sync
    SessionsModule,    // Session management
    DocumentsModule,   // Document OCR
  ],
})
export class AppModule {}
```

**tRPC API (Type-Safe Mobile ↔ Cloud):**
```typescript
// packages/api/src/routers/health.router.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

export const healthRouter = router({
  sync: protectedProcedure
    .input(z.object({
      source: z.enum(['apple_health', 'garmin']),
      data: z.array(z.object({
        type: z.string(),
        value: z.number(),
        unit: z.string(),
        timestamp: z.date(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      // Store health data
      await ctx.db.healthData.createMany({ data: input.data })
      // Trigger AI analysis
      await ctx.queues.health.add('analyze', { userId: ctx.user.id })
      return { success: true }
    }),

  getHistory: protectedProcedure
    .input(z.object({
      type: z.string(),
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.healthData.findMany({
        where: {
          userId: ctx.user.id,
          type: input.type,
          timestamp: { gte: input.startDate, lte: input.endDate },
        },
      })
    }),
})
```

**Apple Health Integration:**
```typescript
// packages/health-integrations/src/apple-health.ts
import AppleHealthKit, { HealthValue } from 'react-native-health'

export async function syncAppleHealth(): Promise<HealthData[]> {
  const permissions = {
    permissions: {
      read: ['Steps', 'HeartRate', 'SleepAnalysis', 'ActiveEnergyBurned'],
    },
  }

  await AppleHealthKit.initHealthKit(permissions)

  const now = new Date()
  const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24h ago

  const [steps, heartRate, sleep] = await Promise.all([
    AppleHealthKit.getStepCount({ startDate }),
    AppleHealthKit.getHeartRateSamples({ startDate }),
    AppleHealthKit.getSleepSamples({ startDate }),
  ])

  return [
    ...steps.map(s => ({ type: 'steps', value: s.value, timestamp: s.date })),
    ...heartRate.map(h => ({ type: 'heart_rate', value: h.value, timestamp: h.date })),
    ...sleep.map(s => ({ type: 'sleep', value: s.value, timestamp: s.date })),
  ]
}
```

**Garmin Integration:**
```typescript
// packages/health-integrations/src/garmin.ts
// Uses Garmin Health API (OAuth)
export async function syncGarmin(accessToken: string): Promise<HealthData[]> {
  const response = await fetch('https://apis.garmin.com/wellness-api/rest/dailies', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const data = await response.json()

  return data.map(day => ([
    { type: 'steps', value: day.totalSteps, timestamp: day.calendarDate },
    { type: 'vo2_max', value: day.vo2Max, timestamp: day.calendarDate },
    { type: 'stress', value: day.averageStressLevel, timestamp: day.calendarDate },
    { type: 'hrv', value: day.hrvAverage, timestamp: day.calendarDate },
  ])).flat()
}
```

**Document OCR Pipeline:**
```typescript
// apps/cloud-api/src/documents/document.processor.ts
import Tesseract from 'tesseract.js'
import { ChatOpenAI } from 'langchain/chat_models/openai'

export async function processDocument(imageUrl: string) {
  // 1. OCR extraction
  const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng')

  // 2. AI extraction of biomarkers
  const llm = new ChatOpenAI({ modelName: 'gpt-4' })
  const prompt = `Extract all biomarkers from this medical document:

${text}

Return JSON with format: [{ name: string, value: number, unit: string, date: string }]`

  const response = await llm.call([{ role: 'user', content: prompt }])
  const biomarkers = JSON.parse(response.content)

  // 3. Store in database
  await db.biomarker.createMany({
    data: biomarkers.map(b => ({
      userId,
      source: 'uploaded_document',
      ...b,
    })),
  })

  return biomarkers
}
```

### 4.2 Computer 2 (Workstation) - Retail Experience

**Sync Engine (Workstation ↔ Cloud):**
```typescript
// packages/sync-engine/src/index.ts
import { PrismaClient } from '@prisma/client'
import { WebSocket } from 'ws'

export class SyncEngine {
  private localDb: PrismaClient
  private cloudWs: WebSocket
  private cloudApiUrl: string

  async syncSession(sessionId: string) {
    // 1. Get local session data
    const session = await this.localDb.session.findUnique({
      where: { id: sessionId },
      include: { captures: true, biomarkers: true },
    })

    // 2. Upload images to cloud S3
    const imageUploads = session.captures.map(async (capture) => {
      const localFile = await readFile(capture.storageUrl)
      const cloudUrl = await uploadToCloudS3(localFile, `sessions/${sessionId}/${capture.id}`)
      return { ...capture, storageUrl: cloudUrl }
    })

    const updatedCaptures = await Promise.all(imageUploads)

    // 3. Sync session data to cloud PostgreSQL
    await fetch(`${this.cloudApiUrl}/api/sync/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: { ...session, captures: updatedCaptures },
      }),
    })

    // 4. Notify cloud to trigger analysis
    this.cloudWs.send(JSON.stringify({
      type: 'session:complete',
      sessionId,
    }))
  }

  // Real-time updates: Cloud → Workstation
  async listenToCloudUpdates() {
    this.cloudWs.on('message', async (data) => {
      const event = JSON.parse(data.toString())

      if (event.type === 'workflow:update') {
        // Update local Flowise workflow
        await this.updateLocalFlowise(event.workflow)
      }

      if (event.type === 'user:updated') {
        // Sync user profile to local DB
        await this.localDb.user.upsert({
          where: { id: event.userId },
          update: event.data,
          create: event.data,
        })
      }
    })
  }
}
```

### 4.3 Computer 3 (Mobile) - Expo App

**App Structure:**
```typescript
// apps/mobile/App.tsx
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TRPCProvider } from './utils/trpc'
import { ClerkProvider } from '@clerk/clerk-expo'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      <TRPCProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="HealthData" component={HealthDataScreen} />
            <Stack.Screen name="LiveSession" component={LiveSessionScreen} />
            <Stack.Screen name="DocumentScan" component={DocumentScanScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </TRPCProvider>
    </ClerkProvider>
  )
}
```

**tRPC Client Setup:**
```typescript
// apps/mobile/utils/trpc.ts
import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@vantage/api'

export const trpc = createTRPCReact<AppRouter>()

export function TRPCProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'https://api.vantage.health/trpc',
          headers: async () => {
            const token = await getClerkToken()
            return { Authorization: `Bearer ${token}` }
          },
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

**Dashboard Screen:**
```typescript
// apps/mobile/screens/DashboardScreen.tsx
import { View, Text, ScrollView } from 'react-native'
import { trpc } from '../utils/trpc'
import { BiomarkerCard } from '../components/BiomarkerCard'

export function DashboardScreen() {
  const { data: latestSession } = trpc.sessions.getLatest.useQuery()
  const { data: healthSummary } = trpc.health.getSummary.useQuery()

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold mb-4">Your Health Dashboard</Text>

      {latestSession && (
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-lg font-semibold">Latest Scan</Text>
          <Text className="text-gray-600">{latestSession.completedAt.toLocaleDateString()}</Text>

          <View className="mt-4 space-y-2">
            <BiomarkerCard
              name="Body Composition"
              trend={latestSession.bodyCompTrend}
            />
            <BiomarkerCard
              name="Retinal Health"
              trend={latestSession.retinalTrend}
            />
            <BiomarkerCard
              name="Cardiovascular"
              trend={latestSession.cardioTrend}
            />
          </View>
        </View>
      )}

      {healthSummary && (
        <View className="bg-white rounded-lg p-4 shadow">
          <Text className="text-lg font-semibold">Today's Activity</Text>
          <Text>Steps: {healthSummary.steps.toLocaleString()}</Text>
          <Text>Heart Rate: {healthSummary.avgHeartRate} bpm</Text>
          <Text>Sleep: {healthSummary.sleepHours.toFixed(1)} hours</Text>
        </View>
      )}
    </ScrollView>
  )
}
```

**Live Session Screen (Real-Time Updates):**
```typescript
// apps/mobile/screens/LiveSessionScreen.tsx
import { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { trpc } from '../utils/trpc'
import { useWebSocket } from '../hooks/useWebSocket'

export function LiveSessionScreen({ route }) {
  const { sessionId } = route.params
  const { data: session } = trpc.sessions.getById.useQuery(sessionId)
  const [events, setEvents] = useState([])

  // WebSocket for real-time updates
  const { connected, lastMessage } = useWebSocket(`wss://api.vantage.health/sessions/${sessionId}`)

  useEffect(() => {
    if (lastMessage) {
      setEvents(prev => [...prev, lastMessage])
    }
  }, [lastMessage])

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">Live Session</Text>

      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-lg font-semibold">Status: {session?.status}</Text>
        <Text className="text-gray-600">Progress: {session?.progress}%</Text>
      </View>

      <View className="bg-white rounded-lg p-4">
        <Text className="text-lg font-semibold mb-2">Activity Feed</Text>
        {events.map((event, i) => (
          <View key={i} className="border-l-2 border-blue-500 pl-3 mb-2">
            <Text className="text-sm text-gray-600">{event.timestamp}</Text>
            <Text>{event.description}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
```

**Document Scanner:**
```typescript
// apps/mobile/screens/DocumentScanScreen.tsx
import { Camera } from 'expo-camera'
import { useState } from 'react'
import { View, Button } from 'react-native'
import { trpc } from '../utils/trpc'

export function DocumentScanScreen() {
  const [hasPermission, setHasPermission] = useState(null)
  const uploadMutation = trpc.documents.upload.useMutation()

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted')
    })
  }, [])

  const takePicture = async () => {
    const photo = await cameraRef.current.takePictureAsync({ base64: true })

    // Upload to cloud
    await uploadMutation.mutateAsync({
      base64: photo.base64,
      type: 'medical_record',
    })

    // Navigate back with success message
  }

  return (
    <View className="flex-1">
      <Camera ref={cameraRef} className="flex-1" />
      <Button title="Capture Document" onPress={takePicture} />
    </View>
  )
}
```

---

## 4.4 VIS Control App - Detailed Implementation

### 4.4.1 Purpose

The centerpiece iPad app showing a **real-time 3D visualization** of the VIS room during a scan session — like watching an AI think through the diagnostic process.

### 4.4.2 Features

**3D Room Visualization (Three.js):**
- Isometric or first-person view of VIS room
- 3D models of:
  - Patient (pose estimated from camera feed)
  - Rotating platform
  - Canon R5/R5C cameras (with FOV cones)
  - Lighting setup
  - Facilitator position
  - Connected devices (DEXA, retinal imager, etc.)

**Real-Time Activity Feed:**
- Camera capture events ("Macro shot captured - right retina")
- Device status ("DEXA scan 35% complete")
- AI reasoning ("Detecting vessel abnormalities... confidence 87%")
- Platform movements ("Rotating to position 3/8")
- Quality checks ("Image quality: Excellent ✓")

**Flowise Reasoning Panel:**
- Live stream of Flowise workflow execution
- Show which nodes are active
- Display LLM thinking (if using chain-of-thought prompting)
- Confidence scores for AI decisions
- Human approval gates ("Retinal focus acceptable? [Yes] [Retry]")

**Session Timeline:**
- Vertical timeline showing completed/pending steps
- Estimated time remaining
- Anomaly flags

### 4.4.3 Technical Implementation

**3D Rendering:**
```typescript
// apps/vis-control/components/VISRoom3D.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'

export function VISRoom3D({ sessionState }: Props) {
  return (
    <Canvas>
      <PerspectiveCamera position={[5, 5, 5]} />
      <OrbitControls />

      <Room />
      <Platform rotation={sessionState.platformAngle} />
      <Patient pose={sessionState.patientPose} />
      <Camera
        position={sessionState.camera1Position}
        active={sessionState.activeCamera === 'R5'}
      />
      <Lighting setup={sessionState.lightingConfig} />

      <ActivityMarkers events={sessionState.recentEvents} />
    </Canvas>
  )
}
```

**Flowise Integration:**
```typescript
// packages/flowise-sdk/client.ts
export class FlowiseClient {
  private ws: WebSocket

  subscribeToWorkflow(workflowId: string, onUpdate: (node: WorkflowNode) => void) {
    this.ws.on('node:start', (data) => {
      onUpdate({ status: 'running', ...data })
    })

    this.ws.on('node:complete', (data) => {
      onUpdate({ status: 'completed', ...data })
    })

    this.ws.on('llm:thinking', (data) => {
      // Expose chain-of-thought reasoning
      onUpdate({ type: 'reasoning', content: data.thinking })
    })
  }
}
```

**Real-Time Updates via WebSocket + Redis Pub/Sub:**
```typescript
// All iPads subscribe to session-specific channels
const channel = `session:${sessionId}:updates`

redis.subscribe(channel, (message) => {
  // Parse and display update in 3D scene + activity feed
  handleSessionUpdate(message)
})
```

### 4.4.4 Screen Flow

**VIS Control App:**
1. **Session Start Screen**
   - Patient info card
   - Session checklist (devices connected, patient positioned)
   - [Start Session] button

2. **Live Session Screen** (3D visualization)
   - 3D room scene (60% of screen)
   - Activity feed (right sidebar)
   - Flowise reasoning panel (bottom drawer, expandable)
   - Session controls (Pause, Emergency Stop)

3. **Review Screen**
   - Captured images gallery
   - AI findings summary
   - Quality metrics
   - [Approve & Continue] or [Retry]

---

## 4.5 iPad Interface Design Principles

### 4.5.1 Visual Language

**Transparency:**
- Always show AI confidence scores
- Expose reasoning, don't hide complexity
- Real-time activity feeds
- No "black box" decisions

**Clarity:**
- Large, readable typography (SF Pro, Inter)
- High contrast for medical displays
- Color-coded status indicators
- Progressive disclosure (details on tap)

**Responsiveness:**
- 60 FPS animations (3D scenes)
- Haptic feedback for interactions
- <100ms interaction latency
- Optimistic UI updates

### 4.5.2 Interaction Patterns

**Touch-First:**
- Large tap targets (44x44pt minimum)
- Swipe gestures for navigation
- Pinch-to-zoom for images/3D scenes
- Long-press for contextual actions

**Multi-iPad Coordination:**
- Each iPad shows its "feature node"
- All iPads can view master timeline
- Facilitator can push views to patient iPads
- Synchronized 3D cameras (VIS room view)

---

## 5. Development Phases (Updated)

### 5.1 Phase 0: Foundation (Month 1)

**Week 1-2: Computer 1 (Cloud) Setup**
- [ ] Provision DigitalReality NYC server
- [ ] Setup Kubernetes cluster
- [ ] Deploy PostgreSQL (primary)
- [ ] Deploy Redis
- [ ] Deploy MinIO (S3-compatible)
- [ ] Setup CloudFlare CDN
- [ ] Initialize NestJS backend
- [ ] Deploy Clerk authentication

**Week 3: Computer 2 (Workstation) Setup**
- [ ] Install Ubuntu 22.04 on workstation
- [ ] NVIDIA drivers + CUDA
- [ ] Docker + Docker Compose
- [ ] PostgreSQL (local replica)
- [ ] Redis, MinIO, Ollama
- [ ] Initialize monorepo

**Week 4: Computer 3 (Mobile) Setup**
- [ ] Initialize Expo app
- [ ] Setup tRPC client
- [ ] Clerk authentication
- [ ] Basic navigation
- [ ] Test deployment (TestFlight/Play Store internal)

**Deliverable:** All 3 computers operational, basic auth flow working end-to-end

---

### 5.2 Phase I: Mobile Onboarding & Cloud Backend (Months 2-3)

**Sprint 1-2: User Management (Weeks 5-8)**
- [ ] Cloud API: User CRUD, profiles
- [ ] Mobile: Sign up/login screens
- [ ] Mobile: Health questionnaire
- [ ] Mobile: Dashboard (basic)
- [ ] tRPC endpoints fully typed

**Sprint 3-4: Health Integrations (Weeks 9-12)**
- [ ] Apple Health SDK integration
- [ ] Garmin OAuth + API integration
- [ ] Background sync (daily)
- [ ] Cloud API: Health data storage
- [ ] Mobile: Health data visualization

**Sprint 5: Document Scanning (Weeks 13-14)**
- [ ] Mobile: Camera + document scanner
- [ ] Cloud: S3 upload endpoint
- [ ] Cloud: OCR processing (BullMQ job)
- [ ] Cloud: AI biomarker extraction
- [ ] Mobile: View extracted data

**Deliverable:** Mobile app fully functional for onboarding, health tracking, document uploads

---

### 5.3 Phase II: Workstation VIS System (Months 4-6)

**Sprint 6-7: VIS Hardware Integration (Weeks 15-18)**
- [ ] Canon R5/R5C SDK integration
- [ ] VIS platform control (rotation, scale)
- [ ] Jetson Orin setup (edge preprocessing)
- [ ] MQTT device communication
- [ ] Local Flowise deployment

**Sprint 8-9: VIS Control App (iPad) (Weeks 19-22)**
- [ ] Next.js app: 3D room visualization
- [ ] Three.js scene with patient, cameras, platform
- [ ] Real-time activity feed
- [ ] Flowise reasoning panel
- [ ] WebSocket updates to cloud → mobile

**Sprint 10: First End-to-End Session (Weeks 23-24)**
- [ ] Workstation orchestrates full session
- [ ] Mobile app shows live updates
- [ ] Data syncs to cloud
- [ ] Images upload to S3
- [ ] Test: Complete session, view on mobile

**Deliverable:** VIS imaging system operational, mobile app shows real-time session progress

---

### 5.4 Phase III: Multi-Modal Devices (Months 7-10)

**Sprint 11-12: Body Composition (Weeks 25-28)**
- [ ] DEXA/InBody integration
- [ ] iPad app for body composition
- [ ] Sync to cloud + mobile
- [ ] Historical charts on mobile

**Sprint 13-14: Retinal Imaging (Weeks 29-32)**
- [ ] Canon CX-1 / Zeiss Cirrus integration
- [ ] AI retinal segmentation model (RunPod training)
- [ ] Deploy model to workstation
- [ ] iPad retinal dashboard
- [ ] Mobile: Retinal health summary

**Sprint 15-16: Cardiovascular (Weeks 33-36)**
- [ ] VO₂, BP, grip strength devices
- [ ] Real-time monitoring (iPad + mobile)
- [ ] Correlate with Apple Health / Garmin data

**Sprint 17: Lab Integration (Weeks 37-40)**
- [ ] Quest/Ulta Labs API
- [ ] Manual entry via mobile app
- [ ] Document upload (lab reports)
- [ ] AI extraction

**Deliverable:** All biomarker modules integrated, mobile app shows comprehensive health data

---

### 5.5 Phase IV: AI Fusion & Reports (Months 11-13)

**Sprint 18-19: Cloud AI Workflows (Weeks 41-46)**
- [ ] Flowise: "Comprehensive Health Analysis"
- [ ] RunPod DGX: Multi-modal AI fusion
- [ ] Cross-domain biomarker correlation
- [ ] Risk stratification
- [ ] Recommendation generation

**Sprint 20: Mobile Report Viewing (Weeks 47-48)**
- [ ] PDF report generation (cloud)
- [ ] Mobile: Download & view reports
- [ ] Interactive charts
- [ ] AI reasoning transparency
- [ ] Push notifications

**Deliverable:** End-to-end: session → AI analysis → report in mobile app

---

### 5.6 Phase V: Multi-Location & Scaling (Months 14-16)

**Sprint 21-22: Multi-Location Support (Weeks 49-52)**
- [ ] Tenant/location hierarchy
- [ ] Workstation sync per location
- [ ] Mobile: Find nearest location
- [ ] Mobile: Book at any location
- [ ] Cloud: Cross-location analytics

**Sprint 23: Performance Optimization (Weeks 53-56)**
- [ ] Workstation: GPU profiling
- [ ] Cloud: Database optimization
- [ ] Mobile: Offline-first (WatermelonDB)
- [ ] Load testing (100+ concurrent users)

**Sprint 24: Admin Portal (Weeks 57-60)**
- [ ] Next.js web app for operations
- [ ] Multi-location management
- [ ] User management
- [ ] Analytics dashboards
- [ ] Device monitoring

**Deliverable:** System supports 5+ retail locations, mobile app works offline

---

### 5.7 Phase VI: Polish & Launch (Months 17-18)

**Sprint 25: Security & Compliance (Weeks 61-64)**
- [ ] HIPAA compliance audit
- [ ] Penetration testing
- [ ] Data encryption audit
- [ ] BAA documentation
- [ ] Privacy policy + terms

**Sprint 26: Open Source Preparation (Weeks 65-68)**
- [ ] Code cleanup
- [ ] Documentation (architecture, APIs, hardware)
- [ ] Contribution guidelines
- [ ] Demo videos
- [ ] Marketing site

**Sprint 27: Public Launch (Weeks 69-72)**
- [ ] Mobile app: TestFlight → App Store
- [ ] Mobile app: Internal → Play Store
- [ ] Public GitHub repository (MIT license)
- [ ] Blog post + social media
- [ ] Community Discord
- [ ] First retail location opens

**Deliverable:** Public launch, mobile app in stores, open source release

---

## 6. Database Schema (Updated for 3 Computers)

```prisma
// packages/database/prisma/schema.prisma

model User {
  id              String          @id @default(cuid())
  clerkId         String          @unique
  email           String          @unique
  role            Role
  profile         Profile?
  sessions        Session[]
  healthData      HealthData[]
  documents       Document[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model Profile {
  id              String    @id @default(cuid())
  userId          String    @unique
  firstName       String
  lastName        String
  dateOfBirth     DateTime?
  phone           String?
  address         Json?
  emergencyContact Json?
  medicalHistory  Json?
  insurance       Json?
  preferences     Json?     // Notification settings, etc.
  user            User      @relation(fields: [userId], references: [id])
}

model HealthData {
  id              String    @id @default(cuid())
  userId          String
  source          HealthSource
  type            String    // 'steps', 'heart_rate', 'sleep', etc.
  value           Float
  unit            String
  timestamp       DateTime
  metadata        Json?     // Device info, accuracy, etc.
  user            User      @relation(fields: [userId], references: [id])
  createdAt       DateTime  @default(now())

  @@index([userId, type, timestamp])
}

model Document {
  id              String          @id @default(cuid())
  userId          String
  type            DocumentType
  storageUrl      String          // S3 URL
  thumbnailUrl    String?
  originalName    String
  ocrText         String?         // Extracted text
  extractedData   Json?           // AI-extracted biomarkers
  processingStatus ProcessingStatus @default(PENDING)
  user            User            @relation(fields: [userId], references: [id])
  createdAt       DateTime        @default(now())
}

model Location {
  id              String    @id @default(cuid())
  name            String
  address         Json
  timezone        String
  workstationId   String?   @unique // Link to workstation
  isActive        Boolean   @default(true)
  sessions        Session[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Session {
  id              String           @id @default(cuid())
  userId          String
  locationId      String
  status          SessionStatus
  scheduledAt     DateTime
  startedAt       DateTime?
  completedAt     DateTime?
  flowiseWorkflowId String?
  progress        Int              @default(0) // 0-100
  user            User             @relation(fields: [userId], references: [id])
  location        Location         @relation(fields: [locationId], references: [id])
  captures        Capture[]
  biomarkers      Biomarker[]
  events          SessionEvent[]
  reports         Report[]
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([userId, status])
  @@index([locationId, scheduledAt])
}

model Capture {
  id              String      @id @default(cuid())
  sessionId       String
  deviceType      DeviceType
  dataType        DataType
  storageUrl      String      // S3 or MinIO URL
  thumbnailUrl    String?
  metadata        Json
  qualityScore    Float?
  aiAnalysis      Json?       // AI-extracted features
  session         Session     @relation(fields: [sessionId], references: [id])
  createdAt       DateTime    @default(now())
}

model Biomarker {
  id              String             @id @default(cuid())
  sessionId       String?
  userId          String
  category        BiomarkerCategory
  name            String
  value           Float
  unit            String
  normalRange     Json?
  confidence      Float?
  aiReasoning     String?
  source          String             // 'session', 'manual', 'apple_health', 'garmin', 'document'
  session         Session?           @relation(fields: [sessionId], references: [id])
  createdAt       DateTime           @default(now())

  @@index([userId, category, createdAt])
}

model SessionEvent {
  id              String      @id @default(cuid())
  sessionId       String
  eventType       EventType
  description     String
  metadata        Json?
  session         Session     @relation(fields: [sessionId], references: [id])
  timestamp       DateTime    @default(now())
}

model Report {
  id              String      @id @default(cuid())
  sessionId       String
  type            ReportType
  content         Json
  pdfUrl          String?
  aiSummary       String?
  reasoning       Json?       // Transparent AI decision log
  reviewedBy      String?
  reviewedAt      DateTime?
  session         Session     @relation(fields: [sessionId], references: [id])
  createdAt       DateTime    @default(now())
}

model Device {
  id              String        @id @default(cuid())
  locationId      String?
  name            String
  type            DeviceType
  serialNumber    String?       @unique
  ipAddress       String?
  status          DeviceStatus
  lastPing        DateTime?
  configuration   Json?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum Role {
  ADMIN
  CLINICIAN
  PATIENT
  FACILITATOR
}

enum HealthSource {
  APPLE_HEALTH
  GARMIN
  MANUAL
  SESSION
}

enum DocumentType {
  MEDICAL_RECORD
  LAB_REPORT
  INSURANCE_CARD
  ID
  CONSENT_FORM
}

enum ProcessingStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum SessionStatus {
  SCHEDULED
  CHECKED_IN
  READY
  IN_PROGRESS
  PROCESSING
  REVIEW
  COMPLETED
  CANCELLED
}

enum DeviceType {
  VIS_CAMERA_R5
  VIS_CAMERA_R5C
  VIS_PLATFORM
  DEXA
  INBODY
  RETINAL_OCT
  RETINAL_FUNDUS
  VO2_ANALYZER
  GRIP_STRENGTH
  BLOOD_PRESSURE
  LAB_ANALYZER
  JETSON_EDGE
}

enum DataType {
  IMAGE
  VIDEO
  DICOM
  JSON
  CSV
  POINT_CLOUD
}

enum BiomarkerCategory {
  BODY_COMPOSITION
  CARDIOVASCULAR
  RETINAL
  MUSCULOSKELETAL
  METABOLIC
  RESPIRATORY
  BLOOD_CHEMISTRY
  ACTIVITY
  SLEEP
}

enum ReportType {
  COMPREHENSIVE
  BODY_COMPOSITION
  RETINAL_ANALYSIS
  CARDIOVASCULAR
  WELLNESS_SUMMARY
}

enum EventType {
  SESSION_START
  SESSION_COMPLETE
  DEVICE_CONNECTED
  DEVICE_ERROR
  CAPTURE_START
  CAPTURE_COMPLETE
  AI_ANALYSIS_START
  AI_ANALYSIS_COMPLETE
  QUALITY_CHECK_PASS
  QUALITY_CHECK_FAIL
  HUMAN_APPROVAL
  PLATFORM_ROTATE
  LIGHTING_CHANGE
  SYNC_TO_CLOUD
}

enum DeviceStatus {
  ONLINE
  OFFLINE
  ERROR
  CALIBRATING
  BUSY
}
```

---

## 6.1 Flowise Workflows (Examples)

### 6.1.1 VIS Session Orchestration Workflow

```yaml
Workflow: "VIS Session Orchestration"

Nodes:
  1. Session Start Trigger (Webhook)
  2. Check Device Status (Custom Tool)
     - Verify cameras online
     - Check platform connection
     - Validate lighting
  3. Patient Positioning Guidance (LLM)
     - Generate instructions based on patient profile
     - Output to VIS app
  4. Camera Calibration Sequence
     - Rotate platform 360°
     - Capture test shots
     - AI quality check
  5. Primary Capture Sequence (Loop)
     - For each angle (0°, 45°, 90°, ...)
       - Rotate platform
       - Adjust lighting
       - Capture still + video
       - Quality check (LLM analyzes image)
       - If fail: retry logic
  6. Retinal Imaging Trigger
     - Switch to CX-1 device
     - Capture fundus + OCT
  7. Session Complete
     - Generate preview report
     - Notify facilitator
     - Queue for processing

Human-in-the-Loop Gates:
  - After Node 3: "Patient positioned correctly?"
  - After Node 5: "Review captured images"
  - After Node 6: "Retinal focus acceptable?"

Exposed Reasoning:
  - Node 4 LLM: "Analyzing test shot... checking focus, exposure, patient visibility..."
  - Node 5 LLM: "Image quality assessment: Focus=9.2/10, Exposure=8.8/10, Coverage=Complete"
```

### 6.1.2 Multi-Modal Biomarker Fusion Workflow

```yaml
Workflow: "Comprehensive Health Analysis"

Trigger: All session data captured

Nodes:
  1. Data Aggregation
     - Fetch VIS images from MinIO
     - Fetch DEXA results from DB
     - Fetch retinal OCT from DB
     - Fetch lab results (if available)
     - Fetch cardio metrics

  2. Individual Domain Analysis (Parallel)
     - Retinal AI Model → vessel health score
     - Body Composition Parser → lean mass, visceral fat
     - Cardiovascular Analyzer → VO₂ percentile, BP risk

  3. Cross-Domain Correlation (LLM Agent)
     - Prompt: "Analyze these biomarkers for systemic patterns..."
     - Input: All domain results
     - Output: Correlation insights (e.g., "Retinal microvasculature narrowing correlates with elevated BP")

  4. Risk Stratification (LLM Agent)
     - Calculate risk scores (cardiovascular, metabolic, etc.)
     - Compare to population norms
     - Identify trends vs. previous sessions

  5. Recommendation Generation (LLM Agent)
     - Personalized interventions (exercise, nutrition, follow-up)
     - Prioritized by impact and feasibility

  6. Report Assembly
     - Generate PDF with all findings
     - Include transparent reasoning from each agent
     - Confidence scores for all AI predictions

  7. Human Review Gate
     - Clinician reviews report
     - Can edit LLM suggestions
     - Approve for patient delivery

Reasoning Transparency:
  - Node 3: Show LLM chain-of-thought
  - Node 4: Display risk calculation logic
  - Node 5: Explain why each recommendation was made
```

---

## 7. Deployment Architecture

### 7.1 Computer 1 (Cloud) - DigitalReality NYC

**Kubernetes Cluster:**
```yaml
# cloud/k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vantage-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vantage-api
  template:
    metadata:
      labels:
        app: vantage-api
    spec:
      containers:
      - name: api
        image: vantage/cloud-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          value: redis://redis-service:6379
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "2"
---
apiVersion: v1
kind: Service
metadata:
  name: vantage-api
spec:
  type: LoadBalancer
  selector:
    app: vantage-api
  ports:
  - port: 443
    targetPort: 3000
```

**RunPod DGX Jobs:**
```python
# cloud/runpod/train_model.py
import runpod

def train_retinal_model():
    pod = runpod.create_pod(
        name="vantage-retinal-training",
        image_name="pytorch/pytorch:2.0.0-cuda11.8-cudnn8-runtime",
        gpu_type_id="NVIDIA H100",
        volume_mount_path="/workspace",
        docker_args="python train.py --model retinal_segmentation --epochs 100"
    )

    # Monitor training
    while pod.get_status() != "COMPLETED":
        logs = pod.get_logs()
        print(logs)

    # Download trained model
    pod.download_file("/workspace/model.onnx", "./models/retinal_segmentation.onnx")
```

### 7.2 Computer 2 (Workstation) - Retail Location

**Docker Compose (Local Services):**
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

  ollama:
    image: ollama/ollama
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  flowise:
    image: flowiseai/flowise
    environment:
      DATABASE_PATH: /data
      APIKEY_PATH: /data
    volumes:
      - flowise_data:/data
    ports:
      - "3001:3000"

  mosquitto:
    image: eclipse-mosquitto
    volumes:
      - ./services/mqtt-broker/mosquitto.conf:/mosquitto/config/mosquitto.conf
    ports:
      - "1883:1883"
      - "9001:9001"

volumes:
  postgres_data:
  minio_data:
  ollama_data:
  flowise_data:
```

**Systemd Service (Auto-start on boot):**
```ini
# /etc/systemd/system/vantage.service
[Unit]
Description=Vantage Workstation
After=network.target docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/vantage
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
User=vantage

[Install]
WantedBy=multi-user.target
```

### 7.3 Computer 3 (Mobile) - App Stores

**EAS Build Config:**
```json
// apps/mobile/eas.json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "simulator": false
      },
      "env": {
        "API_URL": "https://api.vantage.health"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "API_URL": "https://staging.api.vantage.health"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890"
      }
    }
  }
}
```

---

## 8. Cost Estimates

### 8.1 Cloud Infrastructure (Monthly)

| Service | Specs | Cost |
|:--|:--|--:|
| **DigitalReality Dedicated Server** | 16-core, 128GB RAM, A6000 GPU | $800/mo |
| **PostgreSQL (managed)** | 4 vCPU, 16GB RAM | $200/mo |
| **Redis (managed)** | 2GB RAM | $50/mo |
| **S3 Storage** | 5TB + bandwidth | $150/mo |
| **CloudFlare Pro** | CDN + DDoS | $20/mo |
| **RunPod DGX (burst)** | H100 × 8, 100 hrs/mo | $400/mo |
| **Clerk (auth)** | 10K MAU | $25/mo |
| **Monitoring** | Datadog / New Relic | $100/mo |
| **Total (Cloud)** | | **$1,745/mo** |

### 8.2 Workstation (One-Time per Location)

| Item | Cost |
|:--|--:|
| Workstation (owned) | $0 |
| Canon R5 Mk II + lenses | $6,000 |
| Canon R5C + lenses | $5,000 |
| Canon CX-1 Retinal (lease) | $900/mo |
| DEXA (lease) | $900/mo |
| VO₂ Master | $5,000 |
| Grip, BP devices | $1,000 |
| 4× iPad Pro | $4,400 |
| 2× Jetson Orin NX | $1,600 |
| VIS Platform + Lighting | $7,000 |
| Room buildout | $10,000 |
| **Total (per location)** | **~$46,000 + $1,800/mo lease** |

### 8.3 Mobile App (One-Time + Ongoing)

| Item | Cost |
|:--|--:|
| Apple Developer | $99/yr |
| Google Play Developer | $25 (one-time) |
| App Store Optimization | $500 (one-time) |
| Push notifications (OneSignal) | Free (< 10K users) |
| **Total** | **$124/yr** |

---

## 9. Success Metrics

### 9.1 Technical KPIs

| Metric | Target | Measurement |
|:--|:--|:--|
| **Mobile App Rating** | >4.5 stars | App Store/Play Store |
| **Mobile App Crash Rate** | <0.1% | Firebase Crashlytics |
| **API Response Time (p95)** | <500ms | Datadog APM |
| **Workstation Session Time** | <30 min | Session logs |
| **Cloud → Mobile Latency** | <2s for updates | WebSocket ping |
| **Health Sync Success Rate** | >95% | Background job logs |
| **OCR Accuracy** | >90% | Manual validation |

### 9.2 Business KPIs

| Metric | 6 Months | 12 Months | 24 Months |
|:--|:--|:--|:--|
| **Mobile App Downloads** | 1,000 | 10,000 | 100,000 |
| **Active Users (MAU)** | 500 | 5,000 | 50,000 |
| **Retail Locations** | 1 | 3 | 10 |
| **Scans Completed** | 200 | 2,000 | 20,000 |
| **Revenue** | $100K | $1M | $10M |

---

## 10. Quality Assurance Strategy

### 10.1 Testing Pyramid

```
        ┌─────────────┐
        │   Manual    │  5%
        │  Exploratory│
        └─────────────┘
      ┌───────────────────┐
      │   E2E Tests       │  15%
      │  (Playwright)     │
      └───────────────────┘
    ┌─────────────────────────┐
    │  Integration Tests      │  30%
    │  (API, Database)        │
    └─────────────────────────┘
  ┌───────────────────────────────┐
  │     Unit Tests                │  50%
  │  (Jest, Vitest)               │
  └───────────────────────────────┘
```

### 10.2 Quality Gates

**Per Pull Request:**
- All tests passing (unit, integration)
- Code coverage >80%
- Linter warnings = 0
- Security scan (npm audit, Snyk)
- Code review approved (self-review initially, team review as you grow)

**Per Release:**
- E2E test suite passing
- Performance benchmarks met
- Security audit completed
- Documentation updated
- Changelog generated

### 10.3 Performance Benchmarks

| Metric | Target | Critical Threshold |
|:--|:--|:--|
| API response time (p95) | <500ms | <2s |
| Image upload speed | >10 MB/s | >5 MB/s |
| AI inference latency | <3s | <10s |
| Dashboard load time | <1s | <3s |
| Database query time (p95) | <100ms | <500ms |
| Mobile app launch time | <2s | <5s |

---

## 11. Security & Compliance

### 11.1 HIPAA Compliance Checklist

**Administrative Safeguards:**
- [ ] Security management process
- [ ] Assigned security responsibility
- [ ] Workforce security policies
- [ ] Information access management
- [ ] Security awareness training
- [ ] Security incident procedures
- [ ] Contingency planning
- [ ] Business associate agreements

**Physical Safeguards:**
- [ ] Facility access controls
- [ ] Workstation use policies
- [ ] Device and media controls
- [ ] Secure workstation placement (locked room)

**Technical Safeguards:**
- [ ] Access control (unique user IDs, emergency access, encryption)
- [ ] Audit controls (activity logging)
- [ ] Integrity controls (data validation)
- [ ] Transmission security (encryption in transit)

### 11.2 Security Implementation

**Authentication & Authorization:**
- Clerk-based SSO with MFA
- RBAC implementation (Admin, Clinician, Patient, Facilitator)
- JWT tokens with short expiration (15 min access, 7 day refresh)
- API key rotation for device access (monthly)
- Session management (auto-logout after inactivity)

**Data Encryption:**
- TLS 1.3 for all communications (cloud ↔ workstation ↔ mobile)
- AES-256 encryption at rest (MinIO, PostgreSQL)
- Field-level encryption for sensitive data (SSN, DOB, medical history)
- Encrypted backups

**Audit Logging:**
- All data access logged (who, what, when)
- Immutable audit trail (append-only logs)
- 7-year retention policy
- SIEM integration for anomaly detection (as you scale)
- Regular audit log reviews

**Network Security:**
- VPC isolation (cloud)
- Firewall rules (workstation)
- WAF (Web Application Firewall) for cloud API
- DDoS protection (CloudFlare)
- Rate limiting on all APIs (prevent abuse)
- IP whitelisting for workstation ↔ cloud sync (optional)

**Mobile App Security:**
- Certificate pinning (prevent MITM attacks)
- Biometric authentication (Face ID, Touch ID)
- Secure storage (iOS Keychain, Android Keystore)
- No sensitive data in logs
- Jailbreak/root detection

---

## 12. Deployment Strategy Details

### 12.1 Environment Structure

| Environment | Purpose | Deployment Frequency |
|:--|:--|:--|
| **Development** | Local development (your workstation) | Continuous |
| **Staging** | Pre-production validation (cloud) | Per feature completion |
| **Production** | Live system (cloud + retail) | Bi-weekly releases |

### 12.2 Deployment Pipeline (Cloud)

```
┌──────────────┐
│  Git Push    │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  GitHub Actions  │
│  - Lint          │
│  - Unit Tests    │
│  - Build         │
│  - Type Check    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Build Docker    │
│  Images          │
│  - cloud-api     │
│  - flowise       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Push to         │
│  Container Reg   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Deploy to       │
│  Staging (K8s)   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Integration &   │
│  E2E Tests       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Manual Approval │
│  (Your review)   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Deploy to       │
│  Production      │
│  (Blue/Green)    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Smoke Tests     │
│  Health Checks   │
│  Monitoring      │
└──────────────────┘
```

### 12.3 Mobile App Deployment (Expo EAS)

```
┌──────────────────┐
│  Code Complete   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  eas build       │
│  --platform all  │
│  --profile prod  │
└──────┬───────────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌──────────────┐  ┌──────────────┐
│  iOS Build   │  │ Android Build│
│  (TestFlight)│  │ (Play Store) │
└──────┬───────┘  └──────┬───────┘
       │                  │
       └────────┬─────────┘
                │
                ▼
        ┌──────────────────┐
        │  Internal Testing│
        │  (Your device +  │
        │   beta testers)  │
        └──────┬───────────┘
               │
               ▼
        ┌──────────────────┐
        │  Production      │
        │  Release         │
        └──────────────────┘
```

### 12.4 Workstation Deployment

**Initial Setup:**
1. Clone repo to workstation
2. Run setup script: `./scripts/setup-workstation.sh`
3. Configure environment variables
4. Start services: `docker-compose up -d`
5. Run initial sync: `npm run sync:cloud`

**Updates:**
1. Pull latest code: `git pull origin main`
2. Run migrations: `npx prisma migrate deploy`
3. Rebuild containers: `docker-compose build`
4. Restart services: `docker-compose restart`
5. Verify health: `npm run health-check`

### 12.5 Rollback Strategy

- **Cloud:** Blue/Green deployments (zero-downtime)
- **Mobile:** Staged rollout (10% → 50% → 100%)
- **Workstation:** Keep previous version in `backup/` directory
- Feature flags for gradual rollout (LaunchDarkly or custom)
- Automated rollback on health check failure
- Database migrations versioned (Prisma)
- Rollback runbook documented

---

## 13. Risk Management

### 13.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|:--|:--|:--|:--|
| Device SDK integration failures | Medium | High | Early prototype testing, vendor support contracts, fallback to manual control |
| AI model accuracy below threshold | Medium | High | Continuous validation, human review gates, fallback to manual analysis |
| Database performance bottlenecks | Low | Medium | Early load testing, read replicas, Redis caching |
| HIPAA compliance gaps | Low | Critical | Third-party audit (year 2), compliance consultant, regular self-audits |
| Cloud vendor lock-in | Medium | Medium | Multi-cloud abstractions, containerization, local-first design |
| Workstation hardware failure | Medium | High | Spare parts inventory, vendor warranty, backup workstation |
| Mobile app rejection (App Store) | Low | Medium | Follow guidelines strictly, pre-submission review |
| Data loss | Low | Critical | Automated backups (daily), 3-2-1 backup rule, test restores monthly |

### 13.2 Project Risks

| Risk | Probability | Impact | Mitigation |
|:--|:--|:--|:--|
| Scope creep | High | High | Strict change control, phased rollout, MVP-first mindset |
| Solo developer burnout | Medium | Critical | Realistic timeline, regular breaks, hire help when revenue allows |
| Hardware delivery delays | Medium | Medium | Multiple vendor options, buffer time, lease equipment initially |
| Regulatory approval delays (FDA) | Medium | High | Start as wellness (non-diagnostic), phased SaMD approach |
| Budget overruns | Medium | High | Monthly financial reviews, 20% contingency, lean approach |
| Participant adoption slow | Medium | High | Strong marketing, referral program, exceptional UX |
| Competitive pressure | Low | Medium | Open source moat, community building, unique transparency |

---

## 14. Team Structure & Growth Plan

### 14.1 Solo Phase (Months 1-12)

**You (CTO/Co-Founder):**
- Architecture & technical decisions
- Full-stack development (cloud, workstation, mobile)
- DevOps & infrastructure
- Hardware integration
- Documentation
- Initial customer support

**Tools to Stay Productive:**
- GitHub Copilot / Cursor for coding assistance
- ChatGPT / Claude for problem-solving
- Automated testing (catch bugs early)
- Good documentation (your future self will thank you)
- Regular breaks (avoid burnout)

### 14.2 First Hire (Month 12-18)

**Recommended:** Full-Stack Engineer

**Responsibilities:**
- Mobile app development (Expo)
- Frontend iPad apps (Next.js)
- Help with backend API
- Testing & QA
- Customer support escalations

**Why full-stack?** Maximizes flexibility, reduces communication overhead

### 14.3 Growth Phase (Months 18-36)

**Team at 18 months (5 people):**
- You (CTO)
- Full-Stack Engineer #1 (mobile/frontend focus)
- Backend Engineer (NestJS, cloud infrastructure)
- AI/ML Engineer (model training, Flowise workflows)
- Designer/Product Manager (UX, product direction)

**Team at 36 months (12-15 people):**
- Engineering (8): 2 mobile, 2 frontend, 2 backend, 1 DevOps, 1 AI/ML
- Product (2): 1 PM, 1 Designer
- Operations (2): Customer success, Compliance specialist
- Sales/Marketing (2-3)

### 14.4 Key Hiring Principles

1. **Hire for mission alignment** - Open source, transparency, health equity
2. **Generalists over specialists** (early stage)
3. **Remote-first** - Access global talent
4. **Equity-heavy comp** - Conserve cash
5. **Slow hiring, fast firing** - Cultural fit matters

---

## 15. Week 1 Action Plan (Updated)

### Day 1: Cloud Infrastructure
- [ ] Provision DigitalReality server
- [ ] Install Ubuntu, Docker, Kubernetes
- [ ] Deploy PostgreSQL (managed or self-hosted)
- [ ] Deploy Redis
- [ ] Setup CloudFlare DNS

### Day 2: Cloud Backend
- [ ] Clone monorepo
- [ ] Initialize `apps/cloud-api` (NestJS)
- [ ] Setup Prisma, run migrations
- [ ] Deploy Clerk auth
- [ ] Create first tRPC endpoint: `health.ping`
- [ ] Deploy to cloud (test URL)

### Day 3: Mobile App
- [ ] Initialize `apps/mobile` (Expo)
- [ ] Setup tRPC client
- [ ] Implement login screen (Clerk)
- [ ] Test: Login from mobile → cloud API
- [ ] Deploy to TestFlight (internal)

### Day 4: Workstation
- [ ] Install Ubuntu on workstation
- [ ] NVIDIA drivers + CUDA
- [ ] Docker Compose up (postgres, redis, ollama, flowise)
- [ ] Clone monorepo
- [ ] Create first Next.js app: `apps/facilitator-portal`
- [ ] Test: Access from iPad on local network

### Day 5: Integration Test
- [ ] Mobile app → Cloud API → Workstation sync
- [ ] Create test user on mobile
- [ ] Sync to cloud
- [ ] Verify in workstation local DB
- [ ] Document setup process

**Week 1 Goal:** All 3 computers talking to each other, mobile app in TestFlight, workstation accessible from iPad.

---

## 16. Open Source Strategy

### 16.1 Public Repository

**Repo:** `vantage-health/vantage` (MIT License)

**README.md Structure:**
```markdown
# Vantage Imaging System

**Transparent AI-Driven Health Platform**

> Multi-modal biomarker acquisition powered by NVIDIA's 3 Computer Architecture

## Overview

Vantage combines advanced imaging (retinal OCT, DEXA, 3D body scanning),
wearable data (Apple Health, Garmin), and AI-driven analysis into one
transparent, patient-centric health platform.

## Architecture

- **Computer 1 (Cloud):** Training, orchestration, mobile backend
- **Computer 2 (Workstation):** Real-time inference, device control
- **Computer 3 (Mobile/Edge):** Patient app, edge preprocessing

[See detailed architecture →](docs/architecture/3-computer.md)

## Features

✅ Mobile app (iOS/Android) for participants
✅ Real-time session monitoring
✅ Apple Health & Garmin integration
✅ Document scanning with OCR
✅ Multi-modal AI analysis (transparent reasoning)
✅ Retail-ready imaging stations
✅ Open source (MIT license)

## Quick Start

[Setup Cloud →](docs/setup/cloud.md)
[Setup Workstation →](docs/setup/workstation.md)
[Build Mobile App →](docs/setup/mobile.md)

## Documentation

- [3 Computer Architecture](docs/architecture/3-computer.md)
- [API Reference](docs/api/README.md)
- [Hardware Setup](docs/hardware/README.md)
- [Contributing](CONTRIBUTING.md)

## Community

- Discord: [Join →](https://discord.gg/vantage)
- Twitter: [@vantagehealth](https://twitter.com/vantagehealth)

## License

MIT License - see [LICENSE](LICENSE)
```

### 16.2 Community Engagement

**Launch Plan:**
1. **Soft launch:** Tweet thread + Hacker News post
2. **Demo video:** 5-min showing:
   - Mobile onboarding
   - In-store session with 3D visualization
   - Real-time AI reasoning
   - Report delivered to mobile
3. **Blog series:**
   - "Building a Transparent Health Platform"
   - "NVIDIA's 3 Computer Architecture in Healthcare"
   - "Open Source Medical Imaging"
4. **Discord community:** Weekly office hours
5. **Bounties:** $500-$2K for key contributions

---

## 17. Long-Term Vision

### 17.1 3-Year Roadmap

**Year 1:**
- Launch mobile app (10K downloads)
- Open 3 retail locations
- Open source release (1K GitHub stars)
- First community deployments (5)

**Year 2:**
- 50K app users
- 10 retail locations
- FDA clearance pathway initiated
- Partner with health systems (3)

**Year 3:**
- 500K app users
- 50+ locations (franchise model)
- FDA cleared for diagnostic use
- $50M Series A

### 17.2 Impact Goals

**Health Equity:**
- Reduce cost of comprehensive imaging 10×
- Enable community health centers to deploy
- Open source = accessible globally

**Scientific Advancement:**
- Publish multi-modal biomarker datasets
- Advance transparent AI in healthcare
- Set standard for patient-centric design

**Technology Leadership:**
- Showcase 3 Computer Architecture
- Prove edge compute viability
- Inspire next generation of health tech

---

## 18. Conclusion

The **3 Computer Architecture** transforms Vantage into a scalable, transparent, patient-centric health platform. By distributing intelligence across cloud (training + orchestration), workstation (real-time inference), and mobile/edge (patient interface), we achieve:

1. **Scalability:** Cloud handles millions of users
2. **Performance:** Workstation delivers sub-second inference
3. **Engagement:** Mobile app keeps participants connected 24/7
4. **Transparency:** AI reasoning exposed at every step
5. **Openness:** MIT license enables global deployment

**Next Steps:**
1. Execute Week 1 action plan
2. Deploy mobile app to TestFlight
3. Build first VIS feature node (iPad app)
4. Complete first end-to-end session
5. Open source release (Month 18)

Let's build the future of health imaging — transparently, collaboratively, and openly.

---

**Ready to start Week 1?**

**Document Metadata:**
- Version: 3.0 (3 Computer Architecture)
- Author: CTO/Co-Founder
- Reference: [NVIDIA's Three Computers for Robotics](https://blogs.nvidia.com/blog/three-computers-robotics/)
- License: MIT
- Last Updated: 2025-10-24
