# Glossary Card Design System

This document describes the gold standard card design for SPLUNKed glossary entries.

## Overview

The card uses a **zone-based tabbed architecture** that organizes information by depth rather than skill level. Three tabs (Essential → Practical → Deep Dive) provide progressive disclosure from core concepts to advanced details.

## Card Structure

```
┌─────────────────────────────────────────┐
│  ZONE TABS                              │
│  [ Essential | Practical | Deep Dive ]  │
├─────────────────────────────────────────┤
│  TAB CONTENT (scrollable, max 60vh)     │
│                                         │
│  Essential: What, Why, Syntax, Example  │
│  Practical: Examples, Watch Out, Uses   │
│  Deep Dive: Patterns, Perf, Internals   │
├─────────────────────────────────────────┤
│  FOOTER                                 │
│  └── Related (with tooltips)            │
└─────────────────────────────────────────┘
```

## Zone Tabs

| Tab | Color | Content Focus |
|-----|-------|---------------|
| **Essential** | Green | Core understanding: what it does, why use it, basic syntax |
| **Practical** | Teal | Hands-on usage: more examples, gotchas, common use cases |
| **Deep Dive** | Amber | Expert details: advanced patterns, performance, internals |

## Zone Content

### Essential Tab

The foundational information needed to understand and use the command.

| Section | Header | Purpose |
|---------|--------|---------|
| **What** | WHAT | Plain-language explanation of what the command does |
| **Why** | WHY | Practical reasons to use this command |
| **Syntax** | SYNTAX | Basic syntax pattern(s) |
| **Example** | (inline) | One simple example with brief explanation |

### Practical Tab

Hands-on guidance for real-world usage.

| Section | Header | Purpose |
|---------|--------|---------|
| **Examples** | MORE EXAMPLES | Multiple examples covering common scenarios |
| **Gotchas** | WATCH OUT | Warnings with `!` markers — things that often trip people up |
| **Common Uses** | COMMON USES | List of typical use cases with `→` markers |

### Deep Dive Tab

Advanced information for power users.

| Section | Header | Purpose |
|---------|--------|---------|
| **Advanced Patterns** | ADVANCED PATTERNS | Complex examples with named patterns |
| **Performance** | PERFORMANCE | Performance characteristics and optimization tips |
| **Internals** | INTERNALS | How it works under the hood |
| **Vs. Alternatives** | VS. ALTERNATIVES | Comparison with related commands (clickable links) |

## Footer

Always visible below the tabs.

### Related
- Links to related commands/concepts
- **Hover**: Shows tooltip with command description
- **Click**: Navigates to that command's card
- **Back button**: Appears for navigation history

## Visual Design

### Section Styling

Each section uses:
- Left border accent (3px, color varies by section type)
- Subtle background differentiation
- Uppercase header
- Comfortable padding

### Section Colors

| Section | Border Color |
|---------|--------------|
| What | Blue |
| Why | Teal |
| Syntax | Orange |
| Examples | Green |
| Gotchas | Amber |
| Common Uses | Teal |
| Advanced | Purple |
| Performance | Teal |
| Internals | Gray |
| Alternatives | Gray |

### List Styles

| List Type | Marker | Color |
|-----------|--------|-------|
| Warning (gotchas) | `!` | Amber |
| Uses | `→` | Teal |
| Alternatives | Command link | Orange |

## Interaction Patterns

### Tab Switching
- Smooth fade-in animation on tab content
- Active tab highlighted with zone color
- SPL syntax highlighting reapplied on switch

### Related Command Tooltips
- 200ms delay before showing
- 100ms delay before hiding
- Shows command name and takeaway description
- Fixed positioning, viewport-aware

### Card Navigation
- Clicking related command opens that card
- History stack maintained for back navigation
- Back button appears next to close button when history exists

## Data Structure

```javascript
{
    id: 'command_name',
    name: 'command',
    category: 'commands',
    subcategory: 'ordering',
    difficulty: 'beginner',
    takeaway: 'Short description for card preview',
    cardStyle: 'tabbed',

    zones: {
        essential: {
            what: 'Plain-language explanation of what it does',
            why: 'Why you would use this command',
            syntax: 'Basic syntax pattern',
            example: {
                spl: '... | command',
                explanation: 'Brief explanation'
            }
        },
        practical: {
            examples: [
                { spl: '... | command option', explanation: 'What this does' },
                { spl: '... | command other', explanation: 'Another use case' }
            ],
            gotchas: [
                'Warning about common mistake',
                'Another thing to watch out for'
            ],
            commonUses: [
                'First common use case',
                'Second common use case'
            ]
        },
        deep: {
            advancedPatterns: [
                {
                    name: 'Pattern Name',
                    spl: '... | complex command',
                    explanation: 'When and why to use this'
                }
            ],
            performance: 'Performance characteristics and tips',
            internals: 'How it works under the hood',
            vsAlternatives: {
                'other_command': 'When to use other_command instead',
                'another': 'Comparison with another option'
            }
        }
    },

    relatedCommands: ['other', 'commands']
}
```

## Content Guidelines

### Writing Style

1. **What**: Plain language, avoid jargon. Use analogies when helpful.
2. **Why**: Focus on outcomes and goals, not features.
3. **Syntax**: Show only essential patterns. Use comments (←) for inline notes.
4. **Examples**: Brief explanations that describe the result, not the code.
5. **Gotchas**: Start with the consequence, then the solution.
6. **Common Uses**: Action-oriented phrases.
7. **Advanced Patterns**: Name the pattern, explain when to use it.

### Zone Differentiation

| Aspect | Essential | Practical | Deep Dive |
|--------|-----------|-----------|-----------|
| Audience | "What is this?" | "How do I use it?" | "How does it really work?" |
| Tone | Welcoming, simple | Practical, direct | Technical, precise |
| Examples | 1 simple | 3-5 varied | 2-3 complex |
| Focus | Understanding | Application | Mastery |
