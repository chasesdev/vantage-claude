# Vantage Imaging System - Workstation-Centric Development Plan

**Version:** 2.0 - Mothership Architecture
**Date:** 2025-10-24
**CTO/Co-Founder:** Lead Developer
**Philosophy:** Local-first, Transparent, Open Source (MIT License)

---

## Executive Summary

This development plan reimagines the Vantage Imaging System as a **workstation-centric, retail-integrated experience** powered by a single high-performance mothership running local Flowise orchestration. The system prioritizes transparency, real-time visualization, and modular iPad-based interfaces for each diagnostic feature.

**Core Concept:** One powerful workstation orchestrates all imaging, diagnostics, and AI — with transparent reasoning exposed to patients and facilitators in real-time.

---

## 1. The Mothership Architecture

### 1.1 Workstation Specifications

**Primary Compute Node (Mothership):**
- **GPU:** NVIDIA RTX 6000 Pro Blackwell (48GB VRAM) - 21,760 CUDA cores
- **CPU:** AMD Ryzen 9950X3D (16-core, 32-thread, 3D V-Cache)
- **RAM:** 256GB DDR5
- **Storage:** 3x 4TB Gen5 NVMe SSDs (12TB total)
  - SSD 1: OS + Applications
  - SSD 2: Active imaging data + models
  - SSD 3: Archive + backups

**Capabilities:**
- Run multiple LLM models locally (Llama 3.1 70B, Qwen2.5, etc.)
- Real-time image processing and 3D reconstruction
- Host all services (Flowise, Next.js apps, databases)
- Inference for all AI models (retinal analysis, body composition, etc.)
- 4K/8K video stream processing from Canon R5C

### 1.2 Network Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    MOTHERSHIP WORKSTATION                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Flowise (Central Orchestrator)                │ │
│  │  - Workflow engine                                     │ │
│  │  - AI reasoning exposed                                │ │
│  │  - Device coordination                                 │ │
│  └───────────────────┬────────────────────────────────────┘ │
│                      │                                       │
│  ┌──────────────────┴────────────────────────────────────┐ │
│  │                                                         │ │
│  │  Next.js Apps (Feature Nodes)                          │ │
│  │  ├─ VIS Control & Visualization                        │ │
│  │  ├─ Body Composition (DEXA/InBody)                     │ │
│  │  ├─ Retinal Imaging Dashboard                          │ │
│  │  ├─ Cardiovascular Monitor                             │ │
│  │  ├─ Lab Results Integration                            │ │
│  │  └─ Master Timeline & Reports                          │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Local Services                                      │   │
│  │  ├─ PostgreSQL (patient data)                        │   │
│  │  ├─ Redis (real-time state)                          │   │
│  │  ├─ Ollama (local LLM serving)                       │   │
│  │  ├─ vLLM (high-performance inference)                │   │
│  │  ├─ MinIO (imaging storage)                          │   │
│  │  └─ MQTT Broker (device messages)                    │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ 10GbE / WiFi 6E
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  iPad Pro    │  │  iPad Pro    │  │  iPad Pro    │
│  (VIS View)  │  │  (DEXA View) │  │ (Retina View)│
└──────────────┘  └──────────────┘  └──────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Canon R5/R5C │  │ DEXA Scanner │  │ Retinal OCT  │
│   Cameras    │  │              │  │   CX-1       │
└──────┬───────┘  └──────────────┘  └──────────────┘
       │
       ▼
┌──────────────┐
│ Jetson Orin  │
│   NX/Thor    │
│ (Edge Prep)  │
└──────────────┘
```

### 1.3 System Philosophy

**Local-First:**
- All processing happens on-premises
- No cloud dependency for core operations
- Patient data never leaves the facility (HIPAA by design)
- Optional cloud sync for backup/multi-location

**Transparent AI:**
- LLM reasoning displayed in real-time
- Decision trees visualized
- Confidence scores shown
- Human-in-the-loop at every stage

**Open Source:**
- All code released under MIT license
- Community contributions welcome
- Reproducible builds
- Documentation as code

---

## 2. Monorepo Structure

### 2.1 Repository Layout

```
vantage/
├── apps/
│   ├── vis-control/              # VIS room 3D visualization + control
│   ├── body-composition/         # DEXA/InBody interface
│   ├── retinal-dashboard/        # Retinal imaging + OCT viewer
│   ├── cardiovascular/           # BP, VO₂, grip strength
│   ├── lab-integration/          # Blood diagnostics
│   ├── master-timeline/          # Patient journey orchestration
│   └── facilitator-portal/       # Staff admin interface
│
├── packages/
│   ├── ui/                       # Shared React components (ShadCN)
│   ├── database/                 # Prisma schema + migrations
│   ├── flowise-sdk/              # Flowise client library
│   ├── device-adapters/          # Hardware abstraction layer
│   │   ├── canon-camera/
│   │   ├── dexa/
│   │   ├── retinal-oct/
│   │   ├── vo2-analyzer/
│   │   └── ...
│   ├── ai-models/                # Model definitions + ONNX exports
│   ├── mqtt-client/              # Device messaging
│   └── types/                    # Shared TypeScript types
│
├── services/
│   ├── flowise/                  # Flowise configuration + flows
│   ├── ollama/                   # Local LLM configs
│   ├── postgres/                 # Database setup
│   ├── redis/                    # Cache + pub/sub
│   ├── minio/                    # Object storage
│   └── mqtt-broker/              # Mosquitto config
│
├── hardware/
│   ├── vis-platform/             # VIS platform control (DMX, rotation)
│   ├── lighting/                 # Lighting control scripts
│   ├── jetson/                   # Edge compute setup
│   └── calibration/              # Camera + sensor calibration
│
├── models/
│   ├── retinal-segmentation/     # Retinal vessel models
│   ├── body-composition/         # 3D reconstruction models
│   ├── pose-estimation/          # Patient positioning
│   └── biomarker-extraction/     # Multi-modal AI
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── hardware-setup/
│   └── deployment/
│
├── docker-compose.yml            # Local dev environment
├── turbo.json                    # TurboRepo config
├── package.json
├── pnpm-workspace.yaml
└── LICENSE                       # MIT License
```

### 2.2 Tech Stack Per App

**Every Next.js App:**
- Next.js 15 (App Router)
- React Server Components
- Tailwind CSS + ShadCN UI
- tRPC for type-safe APIs
- WebSockets for real-time updates
- Three.js (for 3D visualization apps)

**Shared Services:**
- Flowise (AI orchestration)
- PostgreSQL + Prisma (data)
- Redis (state + pub/sub)
- MinIO (file storage)
- MQTT (device messages)
- Ollama/vLLM (local LLM inference)

---

## 3. The VIS Control App (Flagship Experience)

### 3.1 Purpose

The centerpiece iPad app showing a **real-time 3D visualization** of the VIS room during a scan session — like watching an AI think through the diagnostic process.

### 3.2 Features

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

### 3.3 Technical Implementation

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

---

## 4. Feature Development Plan (Phased)

### 4.1 Phase 0: Mothership Setup (Month 1)

**Goal:** Get the workstation ready and core services running.

#### Week 1-2: Operating System & Base Software
- [ ] Install Ubuntu 22.04 LTS (or latest stable)
- [ ] NVIDIA driver + CUDA toolkit for RTX 6000 Pro
- [ ] Docker + Docker Compose
- [ ] Node.js 20+ LTS
- [ ] pnpm (package manager)
- [ ] PostgreSQL 16
- [ ] Redis 7
- [ ] MinIO

#### Week 3-4: Monorepo & Core Services
- [ ] Initialize TurboRepo monorepo
- [ ] Setup Prisma with base schema (User, Session, Device)
- [ ] Deploy Flowise locally (Docker or native)
- [ ] Install Ollama + pull models (Llama 3.1 8B for testing)
- [ ] Setup MQTT broker (Mosquitto)
- [ ] Create first Next.js app (`apps/facilitator-portal`)
- [ ] Implement basic auth (Clerk or Auth.js)

#### Deliverables:
- Workstation fully operational
- All core services running via Docker Compose
- Monorepo initialized with 1 working Next.js app
- Documentation: "Mothership Setup Guide"

---

### 4.2 Phase I: VIS Control System (Months 2-4)

**Goal:** Build the 3D VIS visualization app and integrate cameras.

#### Sprint 1-2: Canon Camera Integration (Weeks 5-8)
- [ ] Canon SDK setup (R5 Mk II + R5C)
- [ ] Create `packages/device-adapters/canon-camera`
- [ ] Implement camera control API (capture, settings, live preview)
- [ ] MQTT pub/sub for camera events
- [ ] Test: Capture stills and video to MinIO

#### Sprint 3-4: VIS Platform Control (Weeks 9-12)
- [ ] Rotating platform control (serial/DMX)
- [ ] Scale integration (weight + biometrics)
- [ ] Lighting control (DMX via Thorlabs or similar)
- [ ] Create `hardware/vis-platform` control service
- [ ] Test: Full platform rotation cycle with camera sync

#### Sprint 5-6: 3D Visualization App (Weeks 13-16)
- [ ] Create `apps/vis-control`
- [ ] Implement Three.js room scene
- [ ] Real-time camera position updates
- [ ] Platform rotation animation
- [ ] Patient pose estimation (MediaPipe or basic skeleton)
- [ ] Activity feed component
- [ ] Flowise workflow visualization panel

#### Sprint 7: Flowise Integration (Weeks 17-18)
- [ ] Design first Flowise workflow: "VIS Session Orchestration"
- [ ] Nodes: Session Start → Camera Calibration → Capture Sequence → Quality Check → Complete
- [ ] WebSocket streaming of workflow state
- [ ] Expose LLM reasoning (if using AI for quality checks)
- [ ] Test: Run full session with VIS app showing live updates

#### Deliverables:
- Cameras controlled via MQTT from Flowise
- VIS 3D app running on iPad
- First end-to-end imaging session visualized in real-time
- Demo video: "Transparent AI-Driven Imaging"

---

### 4.3 Phase II: Body Composition Module (Months 5-6)

**Goal:** Integrate DEXA/InBody and create dedicated iPad interface.

#### Sprint 8: DEXA Integration (Weeks 19-20)
- [ ] Lease/acquire DEXA device (Hologic or GE)
- [ ] DICOM import pipeline
- [ ] Create `packages/device-adapters/dexa`
- [ ] Parse body composition metrics
- [ ] Store in PostgreSQL

#### Sprint 9: Body Composition App (Weeks 21-22)
- [ ] Create `apps/body-composition`
- [ ] Dashboard showing lean/fat/bone data
- [ ] Historical charts (Chart.js or Recharts)
- [ ] 3D body visualization (optional, using captured imaging data)
- [ ] Flowise workflow: "Body Composition Analysis"
  - AI summarization of results
  - Comparison to population norms
  - Trend detection

#### Deliverables:
- DEXA scans imported and visualized
- iPad app for body composition monitoring
- AI-generated summary reports

---

### 4.4 Phase III: Retinal Imaging Module (Months 7-9)

**Goal:** Integrate Canon CX-1 or Zeiss Cirrus OCT with AI analysis.

#### Sprint 10-11: Retinal Device Integration (Weeks 23-26)
- [ ] Canon CX-1 or Zeiss Cirrus setup
- [ ] DICOM-SR parsing for OCT data
- [ ] Fundus image import
- [ ] Create `packages/device-adapters/retinal-oct`

#### Sprint 12: AI Model Deployment (Weeks 27-28)
- [ ] Deploy retinal vessel segmentation model (U-Net or similar)
- [ ] ONNX runtime on RTX 6000 Pro
- [ ] Inference API
- [ ] Quality: Sensitivity/specificity >90%

#### Sprint 13: Retinal Dashboard App (Weeks 29-30)
- [ ] Create `apps/retinal-dashboard`
- [ ] OCT volume viewer (2D slices + 3D rendering)
- [ ] Vessel map overlay
- [ ] AI findings panel (microaneurysms, lesions)
- [ ] Flowise workflow: "Retinal Health Assessment"
  - LLM analyzes findings
  - Generates patient-friendly report
  - Flags risks (diabetic retinopathy, glaucoma)

#### Deliverables:
- Retinal imaging fully integrated
- AI models running locally with <3s inference
- Transparent AI reasoning shown on iPad

---

### 4.5 Phase IV: Cardiovascular & Fitness (Months 10-11)

**Goal:** Add VO₂ Max, blood pressure, and grip strength modules.

#### Sprint 14: Device Integration (Weeks 31-34)
- [ ] VO₂ Master or Cosmed K5 setup
- [ ] Omron/Withings BP monitor API
- [ ] Eforto R1 grip strength device (BLE)
- [ ] Create device adapters for each
- [ ] Real-time metric streaming to Redis

#### Sprint 15: Cardiovascular App (Weeks 35-36)
- [ ] Create `apps/cardiovascular`
- [ ] Real-time vital signs dashboard
- [ ] Historical trend charts
- [ ] Flowise workflow: "Cardio Fitness Analysis"
  - Correlate VO₂ Max with imaging data
  - Risk stratification
  - Exercise recommendations (via LLM)

#### Deliverables:
- All cardio/fitness devices integrated
- Real-time monitoring during sessions
- AI-generated fitness insights

---

### 4.6 Phase V: Lab Integration & Master Timeline (Months 12-14)

**Goal:** Pull in blood diagnostics and create unified patient timeline.

#### Sprint 16-17: Lab API Integration (Weeks 37-40)
- [ ] Quest Diagnostics / Ulta Labs API
- [ ] HL7 FHIR parsing
- [ ] Portable analyzer integration (i-STAT, Cue Health)
- [ ] Lab result normalization
- [ ] Create `apps/lab-integration`

#### Sprint 18: Master Timeline App (Weeks 41-44)
- [ ] Create `apps/master-timeline`
- [ ] Unified patient journey view
- [ ] Multi-modal data correlation
- [ ] Timeline visualization (all sessions + lab results)
- [ ] Flowise workflow: "Comprehensive Health Report"
  - Aggregate all biomarkers
  - Multi-modal AI analysis
  - Personalized recommendations
  - Generate PDF report (PDFKit)

#### Sprint 19: Advanced Flowise Workflows (Weeks 45-48)
- [ ] Multi-agent reasoning system
- [ ] Cross-domain biomarker correlation (retina + DEXA + labs)
- [ ] Predictive risk modeling
- [ ] Intervention suggestions
- [ ] Human-in-the-loop approval gates

#### Deliverables:
- Complete patient health timeline
- AI fusion across all data sources
- Comprehensive reports with transparent reasoning

---

### 4.7 Phase VI: Edge Compute Optimization (Months 15-16)

**Goal:** Offload preprocessing to Jetson devices, optimize performance.

#### Sprint 20: Jetson Orin NX/Thor Setup (Weeks 49-52)
- [ ] Deploy Jetson devices near cameras
- [ ] Install JetPack SDK
- [ ] Port preprocessing pipelines (image compression, feature extraction)
- [ ] MQTT communication with mothership
- [ ] Benchmark: Reduce mothership load by 40%+

#### Sprint 21: Performance Tuning (Weeks 53-56)
- [ ] Profile bottlenecks (AI inference, database queries)
- [ ] Optimize Prisma queries
- [ ] Implement Redis caching strategies
- [ ] Load test: 10 concurrent sessions
- [ ] GPU utilization monitoring

#### Deliverables:
- Edge devices handling preprocessing
- System capable of 5+ concurrent sessions
- <5s end-to-end latency for AI insights

---

### 4.8 Phase VII: Spatial Feedback & Polish (Months 17-18)

**Goal:** Advanced 3D visualization, holographic display, production-ready polish.

#### Sprint 22: Enhanced 3D Visualization (Weeks 57-60)
- [ ] Point cloud generation from imaging data
- [ ] Volumetric rendering (body scan reconstruction)
- [ ] AR overlays (optional: iPad LiDAR integration)
- [ ] Interactive biomarker overlays in 3D space
- [ ] Holographic display integration (Looking Glass, etc.)

#### Sprint 23: Production Hardening (Weeks 61-64)
- [ ] Security audit
- [ ] HIPAA compliance verification
- [ ] Error handling & recovery
- [ ] Automated backups (MinIO → external storage)
- [ ] Monitoring & alerting (Prometheus + Grafana)
- [ ] Documentation polish

#### Sprint 24: Open Source Release Prep (Weeks 65-72)
- [ ] Code cleanup & refactoring
- [ ] Comprehensive README files
- [ ] API documentation (OpenAPI specs)
- [ ] Setup guides for all hardware
- [ ] Contribution guidelines
- [ ] License headers (MIT) on all files
- [ ] Public GitHub repository
- [ ] Demo video & marketing site

#### Deliverables:
- Production-ready system
- Full open source release
- Community onboarding materials

---

## 5. iPad Interface Design Principles

### 5.1 Visual Language

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

### 5.2 Interaction Patterns

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

### 5.3 Example Screen Flow

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

## 6. Flowise Workflows (Examples)

### 6.1 VIS Session Orchestration Workflow

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

### 6.2 Multi-Modal Biomarker Fusion Workflow

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

## 7. Data Models (Prisma Schema)

### 7.1 Core Entities

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  role          Role
  profile       Profile?
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Profile {
  id              String    @id @default(cuid())
  userId          String    @unique
  firstName       String
  lastName        String
  dateOfBirth     DateTime?
  medicalHistory  Json?
  user            User      @relation(fields: [userId], references: [id])
}

model Session {
  id              String           @id @default(cuid())
  userId          String
  status          SessionStatus
  scheduledAt     DateTime
  startedAt       DateTime?
  completedAt     DateTime?
  flowiseWorkflowId String?
  user            User             @relation(fields: [userId], references: [id])
  captures        Capture[]
  biomarkers      Biomarker[]
  events          SessionEvent[]
  reports         Report[]
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
}

model Capture {
  id            String      @id @default(cuid())
  sessionId     String
  deviceType    DeviceType
  dataType      DataType
  storageUrl    String      // MinIO path
  thumbnailUrl  String?
  metadata      Json        // Device-specific metadata
  qualityScore  Float?      // AI-assessed quality (0-10)
  session       Session     @relation(fields: [sessionId], references: [id])
  createdAt     DateTime    @default(now())
}

model Biomarker {
  id            String             @id @default(cuid())
  sessionId     String
  category      BiomarkerCategory
  name          String
  value         Float
  unit          String
  normalRange   Json?              // {min, max, optimal}
  confidence    Float?             // AI confidence (0-1)
  aiReasoning   String?            // Transparent AI explanation
  session       Session            @relation(fields: [sessionId], references: [id])
  createdAt     DateTime           @default(now())
}

model SessionEvent {
  id            String      @id @default(cuid())
  sessionId     String
  eventType     EventType
  description   String
  metadata      Json?
  session       Session     @relation(fields: [sessionId], references: [id])
  timestamp     DateTime    @default(now())
}

model Report {
  id            String      @id @default(cuid())
  sessionId     String
  type          ReportType
  content       Json        // Structured report data
  pdfUrl        String?     // MinIO path to PDF
  aiSummary     String?     // LLM-generated summary
  reasoning     Json?       // All AI reasoning steps
  reviewedBy    String?     // Clinician ID
  reviewedAt    DateTime?
  session       Session     @relation(fields: [sessionId], references: [id])
  createdAt     DateTime    @default(now())
}

model FlowiseWorkflow {
  id              String    @id @default(cuid())
  name            String
  description     String?
  flowiseId       String    @unique // Flowise internal ID
  configuration   Json
  version         String
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Device {
  id            String      @id @default(cuid())
  name          String
  type          DeviceType
  serialNumber  String?     @unique
  ipAddress     String?
  status        DeviceStatus
  lastPing      DateTime?
  configuration Json?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum Role {
  ADMIN
  CLINICIAN
  PATIENT
  FACILITATOR
}

enum SessionStatus {
  SCHEDULED
  READY          // Devices checked, patient positioned
  IN_PROGRESS
  PROCESSING     // AI analysis running
  REVIEW         // Awaiting clinician review
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

## 8. Development Workflow

### 8.1 Solo Development Setup

Since you're the CTO developing solo initially, here's a pragmatic workflow:

**Daily Workflow:**
1. Morning: Review previous day's progress, plan today's sprint
2. Development: 4-6 hour focused coding sessions
3. Testing: Hardware-in-the-loop testing (cameras, devices)
4. Documentation: Update docs as you build
5. Evening: Commit & push to GitHub (MIT license repo)

**Tools:**
- **Editor:** VS Code with Prisma, Tailwind, TypeScript extensions
- **Database GUI:** Prisma Studio or TablePlus
- **API Testing:** Bruno or Postman
- **3D Preview:** React Three Fiber dev tools
- **Monitoring:** Local Grafana + Prometheus

**Version Control:**
```bash
# Feature branch workflow
git checkout -b feature/vis-3d-visualization
# ... develop ...
git commit -m "feat(vis-control): add 3D room scene with Three.js"
git push origin feature/vis-3d-visualization
# Merge to main when stable
```

### 8.2 Hardware Testing Strategy

**Mock Devices First:**
- Create mock device adapters that simulate hardware
- Test workflows without physical devices
- Use recorded data (images, DICOM files)

**Progressive Integration:**
- Start with 1 camera
- Add platform control
- Integrate DEXA
- Add retinal imager
- Full system integration

**Calibration Protocols:**
- Camera calibration checklists
- Platform rotation verification
- Lighting preset validation
- End-to-end session dry runs

---

## 9. Open Source Strategy

### 9.1 Repository Structure

**Public GitHub Repo:** `vantage-imaging/vantage` (MIT License)

```
README.md          # "Transparent AI-driven health imaging platform"
LICENSE            # MIT License
CONTRIBUTING.md    # How to contribute
CODE_OF_CONDUCT.md
docs/              # Comprehensive documentation
  ├── getting-started.md
  ├── architecture.md
  ├── hardware-setup/
  │   ├── workstation.md
  │   ├── cameras.md
  │   ├── dexa.md
  │   └── retinal-imaging.md
  ├── flowise-workflows/
  └── api-reference/
```

### 9.2 Documentation Philosophy

**"Explain Like I'm Building It":**
- Every component documented as you build it
- Architecture decision records (ADRs)
- Hardware setup guides with photos
- Troubleshooting sections
- Cost estimates for hardware

**Example Documentation:**
```markdown
# Setting Up the Canon R5 Mk II

## Hardware Requirements
- Canon R5 Mk II camera body ($4,299)
- RF 100mm f/2.8L Macro IS USM lens ($1,399)
- USB-C cable (3m, USB 3.2 Gen 2)
- Camera mount (Manfrotto Magic Arm)

## Software Setup
1. Install Canon SDK...
2. Configure camera settings...
3. Test image capture...

## Integration with Mothership
...
```

### 9.3 Community Engagement

**Launch Strategy:**
1. **Soft launch:** Share on X/Twitter, Hacker News
2. **Demo video:** 3-5 min showing VIS session with transparent AI
3. **Blog post:** "Building a Transparent Health Imaging System"
4. **Office hours:** Monthly community calls
5. **Discord:** For real-time support

**Contribution Areas:**
- Device adapters (new hardware support)
- AI models (improved accuracy)
- Flowise workflows (new diagnostic protocols)
- UI improvements
- Documentation translations
- Bug fixes

---

## 10. Budget & Timeline

### 10.1 Hardware Costs (Already Owned or To Acquire)

| Item | Cost | Status |
|:--|--:|:--|
| **Workstation** | — | ✓ Owned |
| RTX 6000 Pro Blackwell | ~$7,000 | ✓ Owned |
| Ryzen 9950X3D + Motherboard | ~$1,500 | ✓ Owned |
| 256GB DDR5 RAM | ~$1,200 | ✓ Owned |
| 3x 4TB Gen5 NVMe SSD | ~$1,800 | ✓ Owned |
| **Imaging Hardware** | | |
| Canon R5 Mk II + Lenses | ~$6,000 | To acquire |
| Canon R5C + Lenses | ~$5,000 | To acquire |
| Canon CX-1 Retinal Camera | ~$30,000 | To lease/acquire |
| DEXA Scanner (Hologic) | ~$900/mo lease | To lease |
| VO₂ Master Analyzer | ~$5,000 | To acquire |
| Eforto R1 Grip Device | ~$620 | To acquire |
| Blood Pressure Monitors | ~$300 | To acquire |
| **Edge Compute** | | |
| Jetson Orin NX (2 units) | ~$1,600 | To acquire |
| **iPads** | | |
| iPad Pro 12.9" (4 units) | ~$4,400 | To acquire |
| **Retail Setup** | | |
| VIS Platform (custom build) | ~$5,000 | To build |
| Lighting (DMX-controlled) | ~$2,000 | To acquire |
| Room buildout | ~$10,000 | To build |
| **Total (excluding workstation)** | **~$72,920** | |

### 10.2 Timeline (Solo Development)

**Realistic Timeline:** 18-24 months to production-ready system

| Phase | Duration | Completion |
|:--|:--|:--|
| Phase 0: Mothership Setup | 1 month | Month 1 |
| Phase I: VIS Control System | 3 months | Month 4 |
| Phase II: Body Composition | 2 months | Month 6 |
| Phase III: Retinal Imaging | 3 months | Month 9 |
| Phase IV: Cardiovascular | 2 months | Month 11 |
| Phase V: Lab Integration | 3 months | Month 14 |
| Phase VI: Edge Optimization | 2 months | Month 16 |
| Phase VII: Polish & Release | 2-8 months | Month 18-24 |

**Milestones:**
- **Month 4:** First VIS session with 3D visualization
- **Month 9:** Multi-modal data (VIS + DEXA + Retinal)
- **Month 14:** AI-generated comprehensive reports
- **Month 18:** Open source release + first retail deployment
- **Month 24:** Multi-location expansion ready

### 10.3 Funding Strategy

**Bootstrap Friendly:**
- Lease expensive equipment (DEXA, retinal imager)
- Buy cameras and compute outright (retain ownership)
- No cloud costs (local-first architecture)
- Open source reduces vendor lock-in

**Revenue Potential:**
- **Retail scans:** $500-1,500 per comprehensive session
- **Break-even:** ~50 scans to cover monthly costs
- **Scaling:** Franchise model (MIT license + support contracts)
- **B2B:** Sell mothership systems to clinics ($150K-200K ea.)

---

## 11. Success Metrics

### 11.1 Technical KPIs

| Metric | Target | Measurement |
|:--|:--|:--|
| **VIS Session Time** | <30 min end-to-end | Session logs |
| **AI Inference Latency** | <5s per model | Performance monitoring |
| **3D Render FPS (iPad)** | 60 FPS sustained | React DevTools |
| **System Uptime** | >99% | Prometheus |
| **Data Correlation Accuracy** | >90% | Manual validation |
| **Patient NPS** | >50 | Post-session surveys |

### 11.2 Transparency Metrics

| Metric | Target |
|:--|:--|
| **AI Reasoning Displayed** | 100% of decisions |
| **Confidence Scores Shown** | Every AI prediction |
| **Human Approval Gates** | Min. 3 per session |
| **Documentation Coverage** | 100% of public APIs |

### 11.3 Community Metrics (Post Open Source)

| Metric | 6 Months | 12 Months |
|:--|:--|:--|
| **GitHub Stars** | 500+ | 2,000+ |
| **Contributors** | 10+ | 50+ |
| **Deployments** | 5 | 25+ |
| **Discord Members** | 200+ | 1,000+ |

---

## 12. Risk Management

### 12.1 Technical Risks

| Risk | Mitigation |
|:--|:--|
| **Hardware failure** | Keep spare parts, warranty on all devices |
| **AI model accuracy** | Human review gates, continuous validation |
| **Performance bottlenecks** | Profile early, optimize incrementally |
| **Data corruption** | Automated backups, RAID storage |
| **Security breach** | Local-first = smaller attack surface, regular audits |

### 12.2 Business Risks

| Risk | Mitigation |
|:--|:--|
| **Regulatory (FDA)** | Start as wellness (non-diagnostic), SaMD later |
| **HIPAA compliance** | Local-first = easier compliance, third-party audit |
| **Market competition** | Open source = community moat |
| **Solo developer burnout** | Phased approach, realistic timeline, open source help |

---

## 13. Next Steps (Week 1 Action Plan)

### Day 1-2: Workstation Setup
- [ ] Install Ubuntu 22.04 LTS
- [ ] Install NVIDIA drivers (version 550+)
- [ ] Install CUDA 12.2+
- [ ] Install Docker, Docker Compose
- [ ] Install Node.js 20 LTS, pnpm
- [ ] Test GPU: `nvidia-smi` should show RTX 6000 Pro

### Day 3: Core Services
- [ ] Setup PostgreSQL (Docker)
- [ ] Setup Redis (Docker)
- [ ] Setup MinIO (Docker)
- [ ] Create `docker-compose.yml` for all services
- [ ] Test: All services accessible

### Day 4: Monorepo Init
- [ ] Create GitHub repo (private initially)
- [ ] Initialize TurboRepo: `npx create-turbo@latest`
- [ ] Setup Prisma: `pnpm add prisma -w`
- [ ] Initialize Prisma: `npx prisma init`
- [ ] Create base schema (User, Session)
- [ ] Run migration: `npx prisma migrate dev`

### Day 5: First Next.js App
- [ ] Create `apps/facilitator-portal`
- [ ] Setup Tailwind + ShadCN
- [ ] Implement auth (Clerk free tier or Auth.js)
- [ ] Create dashboard layout
- [ ] Deploy locally: `pnpm dev`

### Weekend: Flowise Setup
- [ ] Deploy Flowise (Docker or npm)
- [ ] Create first workflow (simple "Hello World")
- [ ] Test webhook trigger
- [ ] Document Flowise API endpoints

### Week 1 Deliverable:
**"Mothership is operational"** — All services running, first Next.js app accessible on iPad, Flowise responding to webhooks.

---

## 14. Long-Term Vision

### 14.1 3-Year Goals

**Year 1:** Solo development → working prototype → open source release
**Year 2:** First retail location profitable → 5 community deployments → hire 2-3 engineers
**Year 3:** 25+ locations → FDA clearance pathway → $5M ARR

### 14.2 Impact Goals

**Health Democratization:**
- Make advanced diagnostics accessible (<$1,000 per comprehensive scan)
- Open source enables community clinics to deploy
- Transparent AI builds patient trust

**Scientific Contribution:**
- Publish datasets (with consent)
- Open source models improve global health AI
- Multi-modal correlation research

**Technology Leadership:**
- Showcase local-first AI architecture
- Prove edge compute viability for medical imaging
- Set standard for transparent AI in healthcare

---

## 15. Conclusion

This workstation-centric plan transforms Vantage into a **transparent, experiential health platform** — where patients see AI think, hardware is locally controlled, and code is open source. The RTX 6000 Pro mothership running Flowise orchestration creates a unique architecture: no cloud dependency, maximum transparency, and community-driven innovation.

**Key Differentiators:**
1. **Local-first:** All processing on-premises (HIPAA by design)
2. **Transparent AI:** Every decision explained in real-time
3. **3D Visualization:** Patients see their scan session like a video game
4. **Open Source:** MIT license enables global deployment
5. **Modular:** Each feature is a standalone Next.js app on iPad
6. **Retail Experience:** Not just diagnostics — an immersive journey

**Philosophy:**
> "If AI is making decisions about your health, you deserve to see how it thinks. If hardware is scanning your body, you deserve to see it in real-time. If software is analyzing your future, it should be open source."

Let's build the future of health imaging — transparently, locally, and openly.

---

**Ready to start?** Let's execute Week 1 and get the mothership online.

**Next Document:** `Week1-Setup-Checklist.md`

---

**Document Metadata:**
- Version: 2.0 (Workstation-Centric)
- Author: CTO/Co-Founder
- License: This plan is MIT licensed (as will be all code)
- Last Updated: 2025-10-24
