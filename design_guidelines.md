# Design Guidelines: Profile Viewing Platform

## Design Approach
**Reference-Based Approach:** guns.lol aesthetic with dark, modern premium profile platform

**Core Principle:** Immersive, customizable profile experiences with elegant dark UI and seamless media integration

---

## Color Palette

**Dark Mode (Primary)**
- Background Base: `220 15% 8%` (very dark blue-gray)
- Background Elevated: `220 15% 12%` (cards, modals)
- Purple Primary: `270 80% 60%` (brand accent, CTAs)
- Purple Gradient: Linear from `270 80% 50%` to `280 70% 65%`
- Text Primary: `0 0% 95%` (high contrast white)
- Text Secondary: `220 10% 65%` (muted text)
- Border Subtle: `220 15% 20%` (dividers, inputs)
- Success Green: `150 60% 50%` (view counter increment)

**Accent Colors**
- Pink Highlight: `320 70% 60%` (interactions, badges)
- Blue Info: `210 80% 60%` (statistics)

---

## Typography

**Font Stack**
- Primary: 'Inter', -apple-system, sans-serif (UI elements, body)
- Display: 'Space Grotesk', sans-serif (usernames, headers)

**Scale**
- Username Display: text-4xl md:text-6xl, font-bold
- Modal Headers: text-2xl, font-semibold
- Body Text: text-base, font-normal
- Stats/Counters: text-sm, font-medium, tracking-wide uppercase
- Buttons: text-sm md:text-base, font-semibold

---

## Layout System

**Spacing Units:** Tailwind 2, 3, 4, 6, 8, 12, 16, 24

**Profile Page Layout**
- Full viewport immersive background (video/image)
- Centered profile card: max-w-2xl with backdrop-blur-xl
- Floating elements with glass morphism effect
- View counter fixed top-right corner

**Modal/Popup System**
- Login Modal: w-full max-w-md, centered overlay
- Dark overlay: bg-black/70 backdrop-blur-sm
- Modal card: rounded-2xl, p-8, shadow-2xl

---

## Component Library

### Login Popup Modal
- **Container:** Centered overlay with backdrop blur
- **Card:** Dark background `220 15% 12%`, rounded-2xl, border `220 15% 20%`
- **Header:** "Sign in with [AppName] to access" - text-xl, mb-6
- **Inputs:** Dark style with border, rounded-lg, p-3, focus purple ring
- **Submit Button:** Full-width, gradient purple, rounded-lg, py-3, font-semibold
- **Close Button:** Absolute top-right, subtle hover effect

### Profile View Components
- **Profile Picture:** Large circular (w-32 h-32 md:w-48 md:h-48), border-4 purple gradient, shadow-xl
- **Username Display:** Bold, large typography with gradient text effect
- **View Counter Badge:** 
  - Fixed top-right: top-6 right-6
  - Pill shape: rounded-full, px-4 py-2
  - Glass effect: backdrop-blur-md, bg-white/10, border border-white/20
  - Eye icon + number: flex items-center gap-2
  - Animate increment: scale pulse on update
- **Posts/Content Cards:** 
  - Grid layout: grid-cols-1 md:grid-cols-2 gap-4
  - Glass morphism: backdrop-blur-lg, bg-white/5
  - Rounded corners: rounded-xl
  - Hover lift: hover:scale-102 transition

### Background Media
- **Video Background:** 
  - Fixed full viewport: fixed inset-0 w-full h-full object-cover
  - Darkened overlay: absolute inset-0 bg-black/40
  - Z-index layering: z-0 (video), z-10 (content)
- **Audio Controls:** 
  - Floating bottom-left: fixed bottom-6 left-6
  - Minimal icon button: rounded-full, p-3
  - Glass effect with volume indicator

### Input Fields
- **Style:** Dark background, subtle border, rounded-lg
- **States:** 
  - Default: border-gray-700
  - Focus: ring-2 ring-purple-500, border-purple-500
  - Error: border-red-500
- **Typography:** text-base, text-white, placeholder-gray-500

### Buttons
- **Primary:** Purple gradient background, white text, rounded-lg, shadow-lg
- **Secondary:** Border-only (outline) with backdrop-blur for use on images
- **Icon Buttons:** Circular, glass morphism, hover scale effect
- **States:** Built-in hover/active states, no custom implementation needed

---

## Visual Effects

**Glass Morphism**
- backdrop-blur-xl or backdrop-blur-lg
- bg-white/10 or bg-black/20
- border border-white/20
- Use for cards, modals, floating elements

**Gradients**
- Purple gradient overlays for headers
- Radial gradients for background accents
- Text gradients for username displays

**Animations** (Minimal)
- View counter increment: scale-105 transition 200ms
- Modal entrance: opacity + scale fade-in
- Hover states: subtle scale-102 or brightness changes
- NO complex scroll animations or excessive motion

**Shadows**
- Cards: shadow-xl with purple tint
- Elevated elements: shadow-2xl
- Buttons: shadow-lg on hover

---

## Images

**Hero/Background**
- Large immersive background video or fallback image
- Full viewport coverage with darkened overlay
- Placement: Fixed background layer behind all content

**Profile Picture**
- Centered prominent placement above username
- High-quality avatar with purple gradient border effect

**No additional hero image needed** - background video/image serves this purpose

---

## Key UI Patterns

**Profile Page Flow:**
1. Background media loads (video autoplay muted, or image)
2. Login modal appears immediately (centered overlay)
3. After login, modal fades out revealing profile
4. View counter increments with animation
5. User can explore posts/content with glass-effect cards

**Visual Hierarchy:**
1. Username (largest, gradient text)
2. Profile picture (prominent, bordered)
3. View counter (floating badge, animated)
4. Posts/content (grid cards below)

**Interaction Feedback:**
- Subtle scale on hover
- Purple glow on focus
- Success green flash on view increment
- Smooth 200-300ms transitions

---

## Accessibility & Polish

- Maintain dark mode consistency across all elements
- High contrast white text on dark backgrounds
- Ensure form inputs have dark styling
- Glass effects should not obscure readability
- All interactive elements have clear hover states
- Keyboard navigation support for modal