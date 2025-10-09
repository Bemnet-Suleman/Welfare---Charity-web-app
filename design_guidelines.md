# Welfare Charity Portal - Design Guidelines

## Design Approach: Reference-Based

**Primary References:** GoFundMe (emotional storytelling), Kiva (transparency focus), DonorsChoose (impact visualization), GlobalGiving (campaign discovery)

**Core Principles:**
- Trust through transparency and visual clarity
- Emotional engagement via storytelling and real impact data
- Approachable design that empowers action
- Data visualization that makes giving tangible

---

## Color Palette

### Light Mode
- **Primary (Trust Blue):** 210 85% 45% - Headers, primary CTAs, navigation
- **Secondary (Hope Green):** 150 60% 45% - Success states, progress indicators, verified badges
- **Accent (Warmth Orange):** 25 90% 55% - Urgent campaigns, donation buttons, highlights
- **Background Base:** 0 0% 98%
- **Surface:** 0 0% 100%
- **Text Primary:** 220 20% 15%
- **Text Secondary:** 220 10% 45%

### Dark Mode
- **Primary:** 210 75% 60%
- **Secondary:** 150 50% 55%
- **Accent:** 25 85% 60%
- **Background Base:** 220 25% 8%
- **Surface:** 220 20% 12%
- **Text Primary:** 0 0% 95%
- **Text Secondary:** 220 10% 70%

### Semantic Colors
- **Success/Funded:** 150 60% 45%
- **Warning/Urgent:** 35 90% 55%
- **Info:** 210 85% 55%
- **Error:** 0 75% 50%

---

## Typography

**Font Stack:** 
- **Headings:** 'Poppins' (Google Fonts) - Bold, modern, approachable
- **Body:** 'Inter' (Google Fonts) - Excellent readability for stories and data
- **Accent/Stats:** 'Space Grotesk' (Google Fonts) - Impact numbers

**Scale:**
- Hero Headline: text-5xl md:text-6xl lg:text-7xl, font-bold
- Section Headers: text-3xl md:text-4xl, font-bold
- Card Titles: text-xl md:text-2xl, font-semibold
- Body Text: text-base, font-normal
- Captions/Meta: text-sm, font-medium
- Large Stats: text-4xl md:text-5xl, font-bold (Space Grotesk)

---

## Layout System

**Spacing Units:** Tailwind units of 4, 6, 8, 12, 16, 20, 24
- **Component Padding:** p-4 to p-8
- **Section Spacing:** py-16 md:py-24 lg:py-32
- **Card Gaps:** gap-6 md:gap-8
- **Grid Gutters:** gap-4 md:gap-6 lg:gap-8

**Container Strategy:**
- Full-width sections with inner max-w-7xl mx-auto px-4
- Campaign cards: max-w-6xl for grid layouts
- Story content: max-w-4xl for readability

**Grid Systems:**
- Campaign Discovery: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Feature Sections: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Story Wall: Masonry-style (staggered heights)
- Dashboard: grid-cols-1 lg:grid-cols-3 (2-col main, 1-col sidebar)

---

## Component Library

### Navigation
- Sticky header with blur backdrop (backdrop-blur-lg bg-white/80)
- Logo left, main nav center, user/donate right
- Prominent "Donate Now" CTA in accent orange
- Mobile: Slide-in drawer with smooth animation

### Hero Section
**Design:** Full-viewport hero with large background image overlay
- Large hero image showing diverse beneficiaries/volunteers in action
- Semi-transparent gradient overlay (from primary blue to transparent)
- Centered content with compelling headline and dual CTAs
- Animated impact counter (donations raised, lives helped)
- Height: min-h-[85vh]

### Campaign Cards
- Image-first design with 16:9 aspect ratio
- Progress bar with animated fill (transition-all duration-700)
- Urgency indicators (badges for "2 days left", "90% funded")
- Raised card effect: shadow-lg hover:shadow-2xl transition-shadow
- Creator avatar and verification badge overlay
- Rounded corners: rounded-2xl

### Donation Flow
- Multi-step form with animated progress indicator
- Amount selector with quick-select buttons ($25, $50, $100, Custom)
- Impact preview: "Your $50 provides X meals" with icon
- Secure badge and payment icons for trust
- Thank you modal with confetti animation (canvas-confetti)

### Story Wall
- Masonry layout with varying card heights
- Quote-style cards with large testimonial text
- Before/after image pairs for impact stories
- Hover effect: lift animation (translate-y-1) with scale
- Category tags with color coding

### Transparency Dashboard
- Animated donut chart (Chart.js) for fund allocation
- Real-time donation feed with slide-in animation
- Campaign outcome timeline with milestone markers
- Interactive filters with smooth transitions

### Volunteer Hub
- Skill badge system with colorful icons (Heroicons)
- Opportunity cards with location pins and time commitment
- Match score indicator (percentage-based, animated)
- Quick apply button with loading state animation

### Beneficiary Portal
- Guided multi-step form with encouraging copy
- Document upload with drag-and-drop (dashed border animation)
- Status tracker with checkmarks and pending states
- Success confirmation with celebration animation

---

## Animations

**Micro-Interactions:**
- Button hover: slight scale (scale-105) + shadow increase
- Card hover: lift (-translate-y-2) + shadow enhancement
- Progress bars: smooth fill animation (transition-all duration-1000)
- Badges: gentle pulse animation for "New" labels

**Page Transitions:**
- Fade-in on scroll (Intersection Observer)
- Stagger animation for card grids (delay children by 100ms)
- Smooth counter animations for statistics (CountUp.js)

**Hero Animations:**
- Fade-in + slide-up on load for headline
- Delayed fade-in for subheading and CTAs
- Number counters with easing effect

**Donation Success:**
- Confetti burst (canvas-confetti)
- Success checkmark with draw animation
- Share prompt with bounce-in effect

---

## Images

### Hero Section
**Primary Hero Image:** Large, high-quality photograph showing volunteers distributing food/supplies to diverse beneficiaries, genuine smiles, warm lighting. Full-width background with gradient overlay.

### Campaign Cards
Each campaign includes a relevant featured image (food distribution, education, medical aid, disaster relief, etc.)

### Story Wall
Before/after comparison images, beneficiary portraits with genuine expressions, volunteer action shots

### Trust Indicators
Partner charity logos, certification badges, team photos

---

## Key Features Visual Treatment

**Impact Visualization:** Animated counter numbers, circular progress charts, color-coded fund allocation graphs

**Urgency Indicators:** Pulsing red dots, countdown timers, "Only 2 days left" badges with warning color

**Trust Signals:** Verification checkmarks (green), secure payment icons, transparency score meters

**Social Proof:** Donor count display, recent donation feed with avatar stack, testimonial carousel

**Call-to-Actions:** Large, high-contrast buttons with accent orange, prominent placement, icon reinforcement (heart icon for donate)