# Vantage Imaging System

**Transparent AI-Driven Health Platform**

> Multi-modal biomarker acquisition powered by NVIDIA's 3 Computer Architecture

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Overview

Vantage combines advanced imaging (retinal OCT, DEXA, 3D body scanning), wearable data (Apple Health, Garmin), and AI-driven analysis into one transparent, patient-centric health platform.

### Features

- Multi-modal diagnostics (VIS, OCT, DEXA, VO₂, cardiovascular)
- Real-time patient narrative (transparent "what/why/where data goes")
- Local-first compute with intelligent cloud routing
- PHI rings for data minimization and privacy
- Mobile app (iOS/Android) with live session monitoring
- Apple Health & Garmin integration
- Open source (MIT license)

---

## Architecture

Vantage implements **NVIDIA's 3 Computer Architecture**:

### Computer 1 (Cloud)
- **Location:** DigitalReality NYC + RunPod DGX
- **Role:** Training, orchestration, mobile app backend
- **Stack:** NestJS, PostgreSQL, Temporal Cloud, Flowise

### Computer 2 (Workstation)
- **Location:** Retail locations (RTX 6000 Pro)
- **Role:** Real-time inference, device control, in-store experience
- **Stack:** Next.js iPads, Temporal worker, Ollama, local MinIO

### Computer 3 (Edge/Mobile)
- **Location:** Jetson devices + Expo mobile app
- **Role:** Patient interface, edge preprocessing
- **Stack:** React Native (Expo), TensorRT (Jetson)

[See detailed architecture →](DevelopmentPlan-3Computer.md)

---

## Key Innovations

### 1. Local Compute Decision Policy

Deterministically routes operations to Edge, Workstation, or Cloud based on:
- **SLA requirements** (latency target)
- **Privacy constraints** (PHI rings)
- **Connectivity quality** (bandwidth, jitter)
- **VRAM availability** (model size)
- **Cost budgets** (daily GPU spend)

[ADR-001: Local Compute Decision Policy →](docs/architecture/decisions/ADR-001-local-compute-decision-policy.md)

### 2. PHI Rings for Data Minimization

Four-tier data classification model:
- **Ring 0 (Sensor):** Raw photons, ephemeral buffers
- **Ring 1 (Local PHI):** Raw images, DICOM files (encrypted, local-only)
- **Ring 2 (Derived Features):** Masks, embeddings (cloud-safe)
- **Ring 3 (Public Analytics):** Aggregates, de-identified data (open source)

[ADR-002: PHI Rings and Data Minimization →](docs/architecture/decisions/ADR-002-phi-rings-data-minimization.md)

### 3. Narrative Layer

Transforms workflow events into patient-facing updates:
- **What:** Plain-language description ("We're focusing on your left eye")
- **Why:** Short rationale ("This helps measure retina layers clearly")
- **Do Now:** Patient action ("Look at the green dot. Try not to blink")
- **Privacy Badge:** Where data is ("Processing locally" / "Sending summary")

[ADR-003: Narrative Layer Architecture →](docs/architecture/decisions/ADR-003-narrative-layer-architecture.md)

### 4. Model Packaging as OCI Artifacts

AI models packaged as OCI images with:
- Semantic versioning (`retina/seg:2.4.1`)
- Capability labels (`cv3`, `int8`, `vram:8gb`)
- Provenance metadata (training run, dataset, SBOM)
- Atomic pull/rollback

[ADR-004: Model Packaging as OCI Artifacts →](docs/architecture/decisions/ADR-004-model-packaging-as-oci-artifacts.md)

---

## Project Structure

```
vantage-claude/
├── apps/
│   ├── narrative-service/       # Narrative Layer WebSocket service
│   ├── cloud-api/               # NestJS backend (Computer 1) [planned]
│   ├── mobile/                  # Expo app (Computer 3) [planned]
│   └── facilitator-portal/      # Next.js - Staff admin (Computer 2) [planned]
│
├── packages/
│   ├── policy/                  # Local compute decision policy
│   │   ├── src/
│   │   │   ├── execution-policy.ts   # Core policy engine
│   │   │   └── index.ts
│   │   ├── test/
│   │   │   └── execution-policy.test.ts
│   │   └── README.md
│   │
│   ├── narrative/               # Narrative Layer library
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── template-loader.ts
│   │   │   ├── event-mapper.ts
│   │   │   └── index.ts
│   │   ├── templates/
│   │   │   └── oct.v1.yaml      # OCT narrative template
│   │   ├── test/
│   │   │   └── event-mapper.test.ts
│   │   └── README.md
│   │
│   └── [other packages planned...]
│
├── docs/
│   ├── architecture/
│   │   ├── decisions/           # Architecture Decision Records
│   │   │   ├── ADR-001-local-compute-decision-policy.md
│   │   │   ├── ADR-002-phi-rings-data-minimization.md
│   │   │   ├── ADR-003-narrative-layer-architecture.md
│   │   │   └── ADR-004-model-packaging-as-oci-artifacts.md
│   │   └── temporal-integration.md
│   └── [other docs...]
│
├── DevelopmentPlan-3Computer.md # Comprehensive dev plan
├── Features.md
├── Tech.md
└── README.md                    # This file
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- NVIDIA GPU with CUDA 12+ (for workstation)

### Install Dependencies

```bash
pnpm install
```

### Build Packages

```bash
# Build policy package
cd packages/policy
pnpm build
pnpm test

# Build narrative package
cd packages/narrative
pnpm build
pnpm test
```

### Run Narrative Service

```bash
cd apps/narrative-service
pnpm dev

# Test WebSocket endpoint
# wscat -c "ws://localhost:3001?sessionId=test&modality=oct"
```

---

## Development Plan

See [DevelopmentPlan-3Computer.md](DevelopmentPlan-3Computer.md) for the comprehensive development roadmap, including:

- **Week 0:** HIPAA/PHI Compliance Prerequisites
- **Week 1:** Temporal Cloud, streaming architecture, sync backbone
- **Week 2:** Local compute policy, model registry, PHI rings enforcement
- **Week 3:** Narrative Layer foundation
- **Week 4:** Multi-modality narratives, end-to-end integration test
- **Weeks 5-6+:** Facilitator Portal, device integrations, scaling

---

## Documentation

- [3 Computer Architecture](DevelopmentPlan-3Computer.md)
- [Temporal Integration](docs/architecture/temporal-integration.md)
- [Architecture Decision Records](docs/architecture/decisions/)
- [Features Overview](Features.md)
- [Tech Stack](Tech.md)

---

## Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) (coming soon) for guidelines.

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Contact

- **Email:** engineering@vantage.health
- **Discord:** [Join Community](https://discord.gg/vantage) (coming soon)
- **Twitter:** [@vantagehealth](https://twitter.com/vantagehealth) (coming soon)

---

**Built with transparency. Powered by AI. Open by default.**

