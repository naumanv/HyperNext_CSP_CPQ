# HyperNext CSP — Cloud Capacity Planner & CPQ

A web-based Cloud Capacity Planning and Configure-Price-Quote (CPQ) application for **HyperNext CSP Edition**, built for Cloud Service Providers running Red Hat OpenStack on OpenShift.

## Features

### 7 Core Modules

| Module | Description |
|---|---|
| **Dashboard** | Real-time KPI cards, interactive charts, deployment summary |
| **Deployment Config** | AZ mode, managed tier, billing, over-subscription ratios |
| **Compute Services** | 5 compute types (GP, Compute/Memory Intensive + GPU) with vGPU/MIG/Passthrough |
| **Storage Services** | 4 CEPH tiers (High Perf SSD, GP SSD, HDD, Archive) |
| **Service Catalog** | Full IaaS, PaaS & Cloud Console service listing with availability status |
| **Cost Calculator** | Monthly/annual pricing with volume discounts & NRC investment breakdown |
| **BOQ Generator** | Auto-generated Bill of Quantities, exportable as CSV |

### Compute Types
- **General Purpose** — 1 vCPU : 4 GB Memory
- **Compute Intensive** — 1 vCPU : 2 GB Memory
- **Extreme Compute** — 1 vCPU : 1 GB Memory
- **Memory Intensive** — 1 vCPU : 8 GB Memory
- **Extreme Memory** — 1 vCPU : 16 GB Memory
- **GPU Nodes** — vGPU / MIG / Passthrough (NVIDIA T4, L4, L40, L40S, A100, H100, H200, B200)

### Storage Tiers (CEPH)
- **Tier 1** — High Performance NVMe/SAS SSD (Replication 3x)
- **Tier 2** — General Purpose SAS SSD (EC 4+2)
- **Tier 3** — HDD Capacity with NVMe Cache (EC 4+2)
- **Tier 4** — Archive Cold Storage (EC 9+3 + Compression)

## 🌐 Live Application

**[https://naumanv.github.io/HyperNext_CSP_CPQ/](https://naumanv.github.io/HyperNext_CSP_CPQ/)**

> Powered by GitHub Pages — no server required.

## Quick Start (Local)

```bash
# Clone the repo
git clone https://github.com/naumanv/HyperNext_CSP_CPQ.git
cd HyperNext_CSP_CPQ

# Run with Node.js (no dependencies)
node server.js
# Open http://localhost:8080
```

## Based On

- **HyperNext Stack v2.2** capacity calculator
- Red Hat OpenStack on OpenShift 18.x
- iVolve Technologies HyperNext CSP pricing model

## Technology

- Pure HTML5 / CSS3 / Vanilla JavaScript — zero build tools required
- Chart.js for interactive dashboards
- Google Fonts (Inter)
- LocalStorage for config persistence

---

*Powered by iVolve Technologies | HyperNext CSP Edition*
