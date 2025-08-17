# Card Type Constants Documentation

## Overview

The Card Type Constants system (`lib/utils/card-type-constants.js`) provides centralized definitions for conversation card types, labels, colors, text styling, and type mappings. This system ensures consistency across all card-related components (ConversationCard, CardFace, CardBack) and handles backward compatibility with legacy type variations.

## Core Principles

### 1. **Type Normalization**
All card type variations are mapped to canonical display labels, ensuring consistent presentation regardless of how types are stored in the database.

### 2. **Centralized Styling**
Card colors, text sizes, and styling rules are defined in one location, preventing style drift across components.

### 3. **Backward Compatibility**
The system gracefully handles legacy type variations and field names, ensuring older cards display correctly.

### 4. **Responsive Text Sizing**
Text styles adapt based on screen size, providing optimal readability across devices.

## Architecture

### Type System Structure

```javascript
// Type label mapping - handles all variations
export const TYPE_LABEL = {
  // Topic variations
  topic: 'TOPIC',
  conversation: 'TOPIC',
  conversation_topic: 'TOPIC',
  
  // Question variations  
  question: 'QUESTION',
  open_question: 'QUESTION',
  'open-question': 'QUESTION',
  
  // Additional types with their variations...
}
```

### Color System

```javascript
export const TYPE_COLORS = {
  topic: {
    bg: 'bg-white dark:bg-gray-700',           // Card background
    border: 'border-gray-300 dark:border-gray-600',  // Card border
    text: 'text-gray-800 dark:text-gray-100',       // Text color
    container: 'bg-white dark:bg-gray-700 ...',     // Full container
    hoverBg: 'hover:bg-gray-50 dark:hover:bg-gray-600',
  },
  // Additional types with coordinated color schemes...
}
```

### Text Styling System

```javascript
export const CARD_TEXT_STYLES = {
  footer: {
    date: {
      mobile: 'text-[10px]',
      desktop: 'text-[12px]',
      color: 'text-gray-400 dark:text-gray-300'
    },
    createdBy: {
      mobile: 'text-[10px]',
      desktop: 'text-[12px]',  
      color: 'text-gray-400 dark:text-gray-300'
    },
    assignedTo: {
      mobile: 'text-[10px]',
      desktop: 'text-[12px]',
      color: 'text-blue-500 dark:text-blue-300'  // Different color for assignment
    }
  },
  content: {
    text: 'text-sm sm:text-base lg:text-lg',
    color: 'text-gray-800 dark:text-gray-100',
    placeholder: 'italic text-gray-400 dark:text-gray-200/90'
  },
  icons: {
    calendar: {
      mobile: 'w-6 h-6',   // Matches xs profile pic size
      desktop: 'w-6 h-6',  
      color: 'text-gray-400 dark:text-gray-300'
    }
  }
}
```

## Helper Functions

### `getTypeLabel(type)`
Returns the canonical display label for any type variation.

```javascript
getTypeLabel('open_question')  // Returns: 'QUESTION'
getTypeLabel('conversation')   // Returns: 'TOPIC'
getTypeLabel(undefined)        // Returns: 'TOPIC' (default)
```

### `getBaseType(typeKey)`
Maps type variations to their base type for color lookup.

```javascript
getBaseType('open-question')  // Returns: 'question'
getBaseType('claim')          // Returns: 'accusation'
```

### `getTypeColors(type)`
Returns the complete color configuration for a card type.

```javascript
const colors = getTypeColors('question');
// Returns: { bg, border, text, container, hoverBg }
```

### `getCardTextStyle(element, screenWidth)`
Returns responsive text styling classes.

```javascript
getCardTextStyle('footer.date', 640)     // Mobile styles
getCardTextStyle('footer.date', 1024)    // Desktop styles
// Returns: 'text-[10px] text-gray-400 dark:text-gray-300'
```

## Implementation Patterns

### 1. **Component Integration**

```javascript
// In CardFace.jsx
import { getTypeLabel, getCardTextStyle, CARD_TEXT_STYLES } from '@/lib/utils/card-type-constants';

// Display type label
<span className="font-extrabold">
  {getTypeLabel(card?.type)}
</span>

// Apply responsive text styling
<span className={getCardTextStyle('footer.date', screenWidth)}>
  {dateText}
</span>

// Use icon sizes
<Calendar className={`${CARD_TEXT_STYLES.icons.calendar.mobile} ${CARD_TEXT_STYLES.icons.calendar.color}`} />
```

### 2. **Type Color Application**

```javascript
// In ConversationCard.jsx
import { getTypeColors } from '@/lib/utils/card-type-constants';

const cardType = getTypeColors(card.type);

// Apply to card container
<div className={`${cardType.bg} ${cardType.border} ${cardType.hoverBg}`}>
```

### 3. **Footer Text Consistency**

```javascript
// Consistent footer styling across all card elements
<div className="flex items-center gap-2">
  <Calendar className={iconClasses} />
  <span className={getCardTextStyle('footer.date', screenWidth)}>
    {dateText}
  </span>
</div>

<span className={getCardTextStyle('footer.createdBy', screenWidth)}>
  Author: {createdByUser.name}
</span>

<span className={getCardTextStyle('footer.assignedTo', screenWidth)}>
  Assignee: {assignedToUser.name}
</span>
```

## Card Type Definitions

### Core Types

1. **TOPIC** - General conversation topics
   - Variations: `topic`, `conversation`, `conversation_topic`
   - Color: Gray/neutral theme
   - Purpose: Main discussion points

2. **QUESTION** - Open-ended questions
   - Variations: `question`, `open_question`, `open-question`
   - Color: Blue theme
   - Purpose: Questions requiring answers

3. **ACCUSATION** - Claims or allegations
   - Variations: `accusation`, `claim`, `allegation`
   - Color: Red theme
   - Purpose: Statements requiring validation

4. **FACT** - Objective statements
   - Variations: `fact`, `factual`, `factual_statement`, `objective_fact`, `statement`
   - Color: Yellow theme
   - Purpose: Verifiable information

5. **GUESS** - Speculation or estimates
   - Variations: `guess` only
   - Color: Purple theme
   - Purpose: Uncertain statements

6. **OPINION** - Subjective viewpoints
   - Variations: `opinion` only
   - Color: Pink theme
   - Purpose: Personal perspectives

## Visual Hierarchy

### Text Size Scaling

- **Content Text**: Responsive scaling from `text-sm` to `text-lg`
- **Footer Text**: Consistent small size (`text-[10px]` mobile, `text-[12px]` desktop)
- **Labels**: Bold, uppercase for type labels

### Color Contrast

- **Light Mode**: Dark text on light backgrounds
- **Dark Mode**: Light text on dark backgrounds
- **Assignments**: Blue accent to differentiate from creation

### Icon Coordination

- Calendar icon sized to match profile pictures (24px / `w-6 h-6`)
- Consistent icon colors matching footer text

## Migration & Compatibility

### Legacy Field Support

The system maintains backward compatibility with:
- Old `person` field (mapped to `createdBy`)
- Various type naming conventions
- Different case styles (snake_case, kebab-case, camelCase)

### Type Variation Handling

```javascript
// All these variations map to the same display
card.type = 'open_question'     // → 'QUESTION'
card.type = 'open-question'     // → 'QUESTION'  
card.type = 'question'          // → 'QUESTION'
```

## Best Practices

### 1. **Always Use Helper Functions**

```javascript
// ✅ Good: Use helper functions for consistency
const label = getTypeLabel(card.type);
const colors = getTypeColors(card.type);

// ❌ Avoid: Direct TYPE_LABEL access
const label = TYPE_LABEL[card.type] || 'TOPIC';
```

### 2. **Responsive Text Styling**

```javascript
// ✅ Good: Pass screen width for responsive sizing
className={getCardTextStyle('footer.date', screenWidth)}

// ❌ Avoid: Hardcoded text sizes
className="text-xs"
```

### 3. **Maintain Type Consistency**

```javascript
// ✅ Good: Use getBaseType for color lookups
const baseType = getBaseType(typeKey);
return TYPE_COLORS[baseType];

// ❌ Avoid: Direct type mapping without normalization
return TYPE_COLORS[card.type];
```

### 4. **Icon Size Coordination**

```javascript
// ✅ Good: Use defined icon sizes that match other elements
className={CARD_TEXT_STYLES.icons.calendar.mobile}

// ❌ Avoid: Arbitrary icon sizes
className="w-4 h-4"
```

## Testing Considerations

### 1. **Type Variation Testing**
Test all type variations map correctly:
```javascript
// Each should return 'QUESTION'
['question', 'open_question', 'open-question'].forEach(type => {
  expect(getTypeLabel(type)).toBe('QUESTION');
});
```

### 2. **Responsive Behavior**
Verify text sizes change at breakpoints:
- Mobile: < 640px
- Desktop: ≥ 640px

### 3. **Color Contrast**
Ensure sufficient contrast in both light and dark modes:
- Footer text readable on all card backgrounds
- Assignment highlighting distinguishable

### 4. **Legacy Compatibility**
Test older cards with legacy fields display correctly.

## Common Issues & Solutions

### Issue: Topic Cards Blending with Background
**Problem**: Topic cards using `gray-800` matched board background in dark mode.

**Solution**: Lightened to `gray-700` for better differentiation.

### Issue: Inconsistent Footer Text
**Problem**: Different text sizes and colors for date vs. created by fields.

**Solution**: Centralized styling in `CARD_TEXT_STYLES` with consistent sizing.

### Issue: Date Text Wrapping
**Problem**: Full date format caused wrapping on mobile.

**Solution**: 
- Compact format: `mm/dd/yy, HH:mm`
- Shortened labels: "Author" instead of "Created by"

### Issue: Icon Size Mismatch
**Problem**: Calendar icon smaller than profile pictures.

**Solution**: Matched icon size to xs profile picture size (24px).

## Future Enhancements

### 1. **Additional Card Types**
- Support for new conversation types
- Custom type definitions per workspace

### 2. **Theme Variants**
- High contrast mode support
- Color blind friendly palettes
- Custom theme overrides

### 3. **Advanced Typography**
- Font weight variations
- Line height optimization
- Letter spacing adjustments

### 4. **Animation States**
- Type change transitions
- Hover state animations
- Focus indicators

## Related Files

- **Primary**: `lib/utils/card-type-constants.js` - Main constants file
- **Components**:
  - `components/conversation-board/ConversationCard.jsx`
  - `components/conversation-board/CardFace.jsx`
  - `components/conversation-board/CardBack.jsx`
  - `components/conversation-board/FlippableCard.jsx`
- **UI Constants**: `lib/utils/ui-constants.js` - General theme system
- **Core Constants**: `lib/utils/constants.js` - Application-wide constants

## Conclusion

The Card Type Constants system provides a robust foundation for card presentation and styling. By centralizing type mappings, colors, and text styles, we ensure:

1. **Consistency** across all card components
2. **Maintainability** through single-source definitions
3. **Flexibility** with backward compatibility
4. **Accessibility** via proper contrast and sizing

This system works in harmony with the broader UI constants architecture to deliver a cohesive user experience across the conversation tracking application.