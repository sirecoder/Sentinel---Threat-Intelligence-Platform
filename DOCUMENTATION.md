
# Sentinel: AI-Native Threat Intelligence Platform

## 1. Executive Summary
**Sentinel** is a high-fidelity cybersecurity intelligence platform designed for the modern SOC. It leverages the **Google Gemini 3.0 & 2.5** family of models to transform raw telemetry into actionable defensive strategies. Sentinel bridges the gap between static OSINT feeds and proactive threat hunting through neural-augmented workflows.

---

## 2. System Architecture
Sentinel follows a decoupled, event-driven React architecture with a heavy focus on real-time data visualization and AI orchestration.

### 2.1 Technology Stack
- **Frontend**: React 19, Tailwind CSS
- **Visuals**: D3.js (Geospatial Mapping), Recharts (Temporal Telemetry)
- **AI Engine**: @google/genai (Gemini API)
- **Voice**: Gemini Live API (Native Audio)
- **Icons**: Lucide-React

### 2.2 Intelligence Orchestration Layer (`geminiService.ts`)
The intelligence layer acts as the brain of the platform, utilizing different models for specific tactical requirements:
- **High-Fidelity Hunting**: `gemini-3-pro-preview` with `googleSearch` tool for discovering active 0-day TTPs.
- **Visual Forensics**: `gemini-3-flash-preview` for OCR and log-to-indicator parsing.
- **Real-Time Triage**: `gemini-3-flash-preview` for low-latency anomaly analysis.
- **Voice Interlink**: `gemini-2.5-flash-native-audio-preview-09-2025` for the Sentinel Voice Assistant.

---

## 3. Core Modules

### 3.1 Global Operations Dashboard
Provides a "War Room" overview of the global threat landscape.
- **Heuristic Scanning**: Simulates deep infrastructure scans.
- **Telemetry Monitor**: Visualizes "Signal Drift" and malicious activity spikes using stacked Area Charts.
- **Vector Ingress Map**: A D3-powered world map showing live attack vectors and origin telemetry.

### 3.2 IoC Management System
A centralized database for Indicators of Compromise.
- **AI Enrichment**: Instantly correlate IPs, Domains, or Hashes with global threat actor profiles using Google Search grounding.
- **Multi-Type Support**: Supports traditional indicators plus YARA rules, Snort signatures, and Registry Keys.
- **Lifecycle Management**: Automated expiry policies and bulk pruning of stale indicators.

### 3.3 Tactical Threat Hunter
A proactive investigation workspace.
- **Visual Ingest**: Upload screenshots of terminal logs or process trees for automated IoC extraction.
- **Tactical IDE**: Generates and executes KQL/SQL queries based on high-level analyst intent.
- **Saved Hunts**: A persistent library of successful hunting signatures for team collaboration.

### 3.4 MITRE ATT&CK Matrix
A strategic view of adversary coverage.
- **Layer Comparison**: Diff active coverage against specific actor groups (e.g., APT29 vs. FIN7).
- **Tactical Pivot**: Select a technique to instantly generate an AI briefing or launch a targeted Threat Hunt.

---

## 4. Security Model (RBAC)
Sentinel implements a strict **Role-Based Access Control** (RBAC) system defined by Tier Clearance levels:

| Role | Access Level | Capabilities |
| :--- | :--- | :--- |
| **Tier-1 (Viewer)** | Read-Only | Dashboard viewing, MITRE matrix exploration, feed reading. |
| **Tier-2 (Analyst)** | Triage | IoC addition, Threat Hunting execution, Anomaly Triage. |
| **Tier-3 (Admin)** | Command | Feed provisioning, IoC deletion, Model tuning, System settings. |

---

## 5. Deployment & Configuration

### 5.1 API Configuration
Sentinel requires a valid Google Gemini API Key. The application strictly expects this to be provided via the environment.
- **Variable**: `process.env.API_KEY`
- **Provider**: Google AI Studio (ai.google.dev)

### 5.2 Voice Assistant Permissions
The Sentinel Voice Assistant requires `microphone` permissions. Upon the first activation of the session, the browser will request hardware access to establish the neural bridge.

---

## 6. Developer Guidelines
- **UI Consistency**: Use the `slate-900` to `slate-950` palette for background surfaces.
- **Typography**: Primary font is `Inter`. Use `JetBrains Mono` for all indicator values, queries, and logs.
- **AI Logic**: Always use `thinkingBudget: 0` for real-time tasks to minimize latency unless performing deep campaign analysis.
- **Data Safety**: All mock data is stored in `constants.tsx` to ensure predictable demo environments.
