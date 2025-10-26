# SafeCart Logo Usage Guide

## Primary Logo Design

The SafeCart logo features a **shield with shopping cart** design, representing safety and protection in grocery shopping. The logo combines:
- **Shield shape**: Represents safety, security, and protection
- **Shopping cart**: Instantly recognizable grocery shopping symbol
- **Purple gradient**: Brand colors (#667eea to #764ba2)

## Logo Component

Location: `/src/components/Logo.tsx`

### Usage

```tsx
import Logo from '@/components/Logo'

// Basic usage
<Logo />

// Different sizes
<Logo size="small" />   // 32px shield
<Logo size="medium" />  // 48px shield (default)
<Logo size="large" />   // 64px shield
<Logo size="xlarge" />  // 80px shield

// Variants
<Logo variant="default" />  // Purple gradient shield, purple text
<Logo variant="white" />    // White shield with purple cart, white text
<Logo variant="colored" />  // Purple gradient shield, black text

// Without text
<Logo showText={false} />

// With custom className
<Logo className="custom-class" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small'` \| `'medium'` \| `'large'` \| `'xlarge'` | `'medium'` | Size of the logo |
| `showText` | `boolean` | `true` | Whether to show "SafeCart" text |
| `variant` | `'default'` \| `'white'` \| `'colored'` | `'default'` | Color variant |
| `className` | `string` | `''` | Additional CSS classes |

## Current Implementations

### 1. App Favicon
- **File**: `/src/app/icon.svg`
- **Usage**: Automatically used by Next.js as the app favicon
- **Design**: Shield cart logo with purple gradient

### 2. Auth/Login Page
- **File**: `/src/components/Auth.tsx`
- **Implementation**: Large logo at the top of the login/signup form
- **Variant**: `colored` variant (purple shield, black text)
- **Size**: `large`

### 3. Dashboard Header
- **File**: `/src/components/Dashboard.tsx`
- **Implementation**: Logo in the top navigation bar
- **Variant**: `white` variant (white text on purple background)
- **Size**: `medium`

### 4. Onboarding Flow
- **File**: `/src/components/Onboarding.tsx`
- **Implementation**: Logo at the top of each onboarding step
- **Variant**: `colored` variant
- **Size**: `medium`

### 5. Loading Screen
- **File**: `/src/app/page.tsx`
- **Implementation**: Large logo while app is loading
- **Variant**: `white` variant (on purple gradient background)
- **Size**: `xlarge`

## Brand Colors

### Primary Gradient
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Individual Colors
- **Primary Purple**: `#667eea`
- **Secondary Purple**: `#764ba2`
- **Safe Green**: `#28a745`
- **Warning Yellow**: `#ffc107`
- **Danger Red**: `#dc3545`
- **Text Black**: `#1a1a1a`
- **Text Gray**: `#666666`

## Logo Guidelines

### ✅ DO
- Use the official Logo component
- Maintain clear space around logo (minimum 10px)
- Use approved color variations (default, white, colored)
- Scale proportionally
- Use on clean backgrounds

### ❌ DON'T
- Stretch or distort the logo
- Change the colors outside of approved variants
- Add effects or shadows
- Rotate the logo
- Place on busy backgrounds
- Recreate or modify the SVG paths

## File Locations

```
packages/frontend/
├── src/
│   ├── app/
│   │   └── icon.svg                 # Favicon
│   └── components/
│       └── Logo.tsx                 # Logo component
```

## Tagline

**"Shop safely, live confidently"**

Use this tagline in marketing materials, landing pages, and app descriptions.

## Meta Information

- **Title**: SafeCart - Safe Grocery Shopping
- **Description**: AI-powered grocery shopping for allergies and diabetes. Shop safely, live confidently.
- **Keywords**: grocery shopping, allergies, diabetes, safe shopping, health, barcode scanner

## Examples

### Example 1: Hero Section
```tsx
<div className="text-center">
  <Logo size="xlarge" variant="default" />
  <h1 className="text-4xl font-bold mt-4">Shop safely, live confidently</h1>
</div>
```

### Example 2: Navigation Bar
```tsx
<nav className="bg-gradient-to-r from-purple-600 to-purple-800">
  <Logo size="medium" variant="white" />
</nav>
```

### Example 3: Footer
```tsx
<footer className="bg-gray-900 text-white">
  <Logo size="small" variant="white" />
  <p className="text-sm">© 2024 SafeCart. All rights reserved.</p>
</footer>
```

## Support

For logo design files in other formats (PNG, AI, EPS), or for questions about logo usage, please contact the design team.
