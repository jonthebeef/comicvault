# Comic Book Barcode Reference

## Barcode Format

Comic books use a **UPC-A barcode** with a **5-digit supplement**.

### Structure

```
[12-digit UPC-A] [5-digit supplement]
```

**Example:** `76194134182400111`
- UPC-A: `761941341824`
- Supplement: `00111`

### UPC-A (12 digits)

The main barcode identifies the publisher and series:
- First 6 digits: Manufacturer/Publisher code
- Next 5 digits: Product code (specific comic series)
- Last digit: Check digit

Common publisher prefixes:
- `76194` - DC Comics
- `75960` - Marvel Comics
- `82002` - Image Comics
- `85899` - Dark Horse Comics

### 5-Digit Supplement

The supplement provides additional information:

```
IIVVV
```

- **II** - Issue number (2 digits)
  - `00` = Issue 1
  - `01` = Issue 2
  - `10` = Issue 11
  - `99` = Issue 100+

- **VVV** - Variant/Cover code (3 digits)
  - `111` - Direct Market edition
  - `211` - Newsstand edition
  - `311` - Second printing
  - `411` - Third printing
  - `511` - Variant cover A
  - `611` - Variant cover B
  - etc.

### Example Breakdown

Barcode: `76194134182400111`

```
761941341824  00111
    ↓           ↓
  UPC-A      Supplement
              ↓  ↓
           Issue Variant
             #1  Direct
```

This is:
- DC Comics publication
- Series/Title: (varies by middle digits)
- Issue #1
- Direct Market edition (comic shop, not newsstand)

## QuaggaJS Configuration

Our scanner is configured to read:
- UPC-A format (12 digits)
- EAN format (backup, also common)
- UPC-E format (compressed version)

The 5-digit supplement is part of the same barcode image but may need special handling depending on how QuaggaJS reads it.

## Testing Barcodes

If you don't have comics handy for testing, you can use these real examples:

**Batman #1 (2016):**
- `76194134182400111`

**Amazing Spider-Man #1 (2018):**
- `75960608936800111`

**The Walking Dead #1 (Reprint):**
- `82002300006001311` (third printing)

## Known Issues

1. **Lighting:** Glossy covers can cause glare
2. **Wrinkles:** Bent barcodes may not scan
3. **Small Size:** Comic barcodes are often small
4. **Supplement Reading:** Some scanners skip the 5-digit supplement

## Fallback Strategy

If scanner misses the supplement:
1. Use manual entry mode
2. Type the full barcode including supplement
3. Or: Enter just UPC-A and manually add issue number in notes

## API Considerations

GoCollect API may accept:
- Full barcode with supplement ✅ (preferred)
- Just UPC-A ⚠️ (may return multiple issues)
- Series name + issue number 📝 (manual fallback)

Test your specific API endpoint to see what works best.
