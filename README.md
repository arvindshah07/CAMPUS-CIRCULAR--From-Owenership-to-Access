# Campus Circular — From Ownership to Access ??

Campus Circular is a peer-to-peer student resource sharing and circular economy platform. It allows college students to seamlessly borrow and share expensive items (cameras, audio gear, projectors, scientific calculators, sports equipment, camping gear, and instruments) with trust score verification, automated settlement, condition checklists, and AI-powered natural language need discovery.

---

## ?? Key Features

1. **AI Need Discovery & Match Engine (`/needs`)**:
   - Natural language intent parser extracts purpose, urgency, duration, and required capabilities.
   - 7-factor ranking algorithm scoring suitability (35%), availability (20%), owner trust (15%), proximity (10%), condition (10%), daily cost (5%), and deposit requirements (5%).
   - Visual interactive circular route graph showing intent-to-capability-to-resource mapping.

2. **Complete Exchange Lifecycle Machine (`/borrow/:id` & `/exchange/:id`)**:
   - Multi-stage peer-to-peer state machine:
     `REQUESTED` ? `ACCEPTED` ? `HANDOVER` ? `BORROWED` ? `RETURN_DUE` ? `RETURNED` ? `INSPECTION` ? `SETTLEMENT` ? `RATED`
   - Digital handover condition checklist & return inspection comparison.
   - Automated settlement calculator with refundable security deposit and damage deduction handling.
   - Dual-party rating system (Resource rating & Owner rating).

3. **Live Resource Discovery (`/`)**:
   - Category filtering (Study, Create, Sports, Events, Outdoor, Music), availability toggles, and multi-criteria sorting (Best Match, Nearest, Lowest Fee, Highest Trust).
   - Real-time search by resource name, capabilities, and description.

4. **Community Resource Requests (`/community`)**:
   - Post open requests when an item isn't directly listed in the catalog.
   - One-click transition to AI matching to discover newly compatible resources.

5. **Campus Impact Analytics (`/impact`)**:
   - Circular economy metrics: total resources reused, new purchases avoided, platform money saved, and category borrowing distribution.

6. **Admin Dashboard (`/admin`)**:
   - Resource moderation (Approve / Reject).
   - User trust management and safety flagging.
   - Exchange tracking and dispute resolution.

7. **Theme System**:
   - Full light, dark, and OS-system adaptive theme support with zero-flicker client initialization.

---

## ?? Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Run

```bash
# Navigate to the app directory
cd my-app

# Install dependencies
npm install

# Start the Vite development server
npm run dev

# Run Oxlint checks
npm run lint

# Build for production
npm run build
```
