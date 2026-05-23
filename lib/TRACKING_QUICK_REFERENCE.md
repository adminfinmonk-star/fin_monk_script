# PostHog Tracking — Quick Reference

Copy-paste these into your components.

## Import

```typescript
import { 
  trackFormStarted,
  trackScreenView,
  trackFieldInteraction,
  trackFormSubmitSuccess,
  trackValidationError,
  trackPartialLead,
  trackSuccessScreen,
  trackCTAClick,
  trackWhatsAppClick,
  trackConsentInteraction
} from '@/lib/posthog';
```

---

## Common Patterns

### Form Initialization

```typescript
useEffect(() => {
  trackFormStarted('facebook'); // or 'organic', or utm_source
}, []);
```

### Screen Navigation

```typescript
const goToScreen = (screenNum: number) => {
  trackScreenView(screenNum, getScreenName(screenNum));
  setCurrentScreen(screenNum);
};
```

### Field Selection (Dropdowns, Cards, Radio Buttons)

```typescript
const handleSelect = (fieldName: string, value: string) => {
  trackFieldInteraction(fieldName, value, currentScreen);
  setFieldValue(fieldName, value);
};

// Example:
const handleCarBrandSelect = (brand: string) => {
  trackFieldInteraction('car_brand', brand, 1);
  setCarBrand(brand);
};
```

### Validation Error

```typescript
const validateField = (fieldName: string, value: string) => {
  if (!isValid(value)) {
    const message = getErrorMessage(fieldName);
    trackValidationError(fieldName, message);
    setError(fieldName, message);
  }
};
```

### After Screen 2 Completes (Partial Lead)

```typescript
const handleScreen2Complete = () => {
  // Track partial lead for retargeting
  trackPartialLead({
    product: formData.product,
    carBrand: formData.carBrand,
    carYear: formData.carYear,
    carValue: formData.carValue,
    loanAmount: formData.loanAmount,
    score: calculateScore(formData),
    segment: getSegment(calculateScore(formData))
  });
  
  goToScreen(3);
};
```

### Form Submission Success

```typescript
const handleSubmit = async () => {
  const payload = buildLeadPayload();
  
  try {
    const success = await submitLead(payload);
    if (success) {
      trackFormSubmitSuccess(payload);
      showSuccessScreen();
    }
  } catch (e) {
    trackFormSubmitError(e.message, payload);
  }
};
```

### Success Screen

```typescript
useEffect(() => {
  trackSuccessScreen(name, phone, segment);
}, []);
```

### CTA Button Click

```typescript
const handleCTAClick = (location: string) => {
  trackCTAClick(location, 'Check My Eligibility →');
  // or for sticky bar:
  trackCTAClick('sticky_bar', 'Get up to ₹10L against your car');
};
```

### WhatsApp CTA

```typescript
const handleWhatsAppClick = (source: string, scenario: string) => {
  trackWhatsAppClick(source, scenario);
  // source: 'success_screen' | 'error_fallback' | 'sticky_bar'
  // scenario: 'success' | 'error' | 'mobile_sticky'
  window.open(whatsappUrl);
};
```

### Consent Checkbox

```typescript
const handleConsentChange = (type: 'call' | 'whatsapp', checked: boolean) => {
  trackConsentInteraction(type, checked);
  setConsent(prev => ({...prev, [type]: checked}));
};
```

---

## Field Name Reference

Use these exact field names for consistency:

**Screen 1:**
- `product_type`
- `rc_ownership`
- `car_brand`
- `car_year`

**Screen 2:**
- `car_value`
- `loan_amount`
- `city`

**Screen 3:**
- `employment_type`
- `income_range`
- `name`
- `phone`

---

## Property Value Reference

**Screen Numbers:** 1, 2, 3
**Segments:** "HOT", "WARM", "COLD", "JUNK"
**Products:** "LAC", "UCL", "NCL"
**Employment:** "salaried", "business", "selfemployed", "unemployed"
**Error types:** "rate_limit", "network"

---

## Debug Mode

All events are also logged to console:

```
[PostHog Event] form_field_interaction {field_name: "car_brand", ...}
```

If PostHog key is missing, events still log to console but don't send to PostHog.

---

## Testing

To see events in action:

1. Open DevTools → Console
2. Add event tracking to a component
3. Interact with the form
4. See `[PostHog Event]` logs in console
5. Refresh and check PostHog dashboard after a few seconds (data takes ~30s to appear)
