# PWA Icons TODO

The manifest.json requires actual PNG icons. For now, you can:

1. Create placeholder icons using an online tool like:
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator

2. Or use ImageMagick to convert the SVG:

```bash
# If you have ImageMagick installed
convert -background none -resize 192x192 public/icon.svg public/icon-192.png
convert -background none -resize 512x512 public/icon.svg public/icon-512.png
```

3. Or create them manually in any image editor

For development, the app will work without the PNG icons, but you'll see warnings.
