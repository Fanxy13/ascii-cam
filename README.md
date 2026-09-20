# ASCII-Cam

Your webcam, live, as text.

**→ [fanxy13.github.io/ascii-cam](https://fanxy13.github.io/ascii-cam)**

Everything happens in your browser. No upload, no server, no analytics — the
video stream never leaves the machine it is running on. Deny the camera
permission and you still get an animated demo instead of a dead page.

## What it does

- Live webcam feed rendered as character art on a canvas, 60 fps on anything recent
- Character ramps from a coarse 3-step block set to a 70-glyph gradient
- Colour palettes, or sample the colour straight from the image for RGB output
- Contrast, brightness, gamma and glyph weight, all adjustable while running
- CRT scanlines, vignette and bloom, because it would be rude not to
- Save a PNG, copy the current frame as plain text, save a `.txt`, or record a WebM clip
- Front/back camera switching, mirroring, fullscreen
- Settings survive a reload

## Keyboard

| Key | |
|---|---|
| `H` | hide the panel |
| `S` | save PNG |
| `C` | copy frame as text |
| `T` | save `.txt` |
| `R` | start/stop recording |
| `F` | switch camera |
| `I` | invert luminance |
| `M` | mirror |
| `←` `→` | cycle character ramp |
| `↑` `↓` | cycle palette |
| `Enter` | fullscreen |

## How it works

The video frame is drawn into an offscreen canvas scaled down to the character
grid — so a 140-column render only ever samples 140×39 pixels, which is why it
stays cheap. Each pixel's luminance goes through brightness, contrast and gamma,
then picks a glyph from the ramp and a colour from the palette. Glyphs are drawn
one palette colour at a time so the canvas context only switches fill style a
handful of times per frame instead of once per character.

Monospace glyphs are about half as wide as they are tall, so the row count is
derived from the column count with that ratio applied — otherwise every face
comes out stretched.

## Adding a ramp or a palette

Both live in [`js/presets.js`](js/presets.js) and are plain data. Ramps run dark
to light; because glyphs are drawn light-on-dark, "light" means a *denser*
character, which is the reverse of the classic ink-on-paper ramp. Palettes run
dark to light too, and a palette with a light `bg` sets `light: true` so the
ramp gets flipped and the picture does not come out as a negative.

## Browser support

Needs `getUserMedia` and canvas — so any current Firefox, Chrome or Safari.
Recording uses `MediaRecorder` with WebM, which Safari has been late to; the
button reports it instead of failing silently. Camera access requires HTTPS,
which GitHub Pages provides.

## Licence

MIT
