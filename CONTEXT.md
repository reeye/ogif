# ogif — Offline GIF

**ogif** means *offline gif*: the output is a physical, printed animation that works without a screen or electricity. Slide a transparent overlay across the printed composite and it animates — like a gif, offline.

The web tool itself runs in-browser and produces two printable images: a Composite Image and a Barrier Grid overlay.

See: https://en.wikipedia.org/wiki/Barrier-grid_animation_and_stereography

## Language

**Frame**:
A single input image representing one step in the animation sequence.
_Avoid_: image, layer, slide

**Composite Image**:
The output image produced by interleaving stripes from each frame in sequence. When the Barrier Grid is placed over it,
the eye sees one frame at a time.
_Avoid_: merged image, combined image, interleaved image

**Barrier Grid**:
The output PNG of opaque black stripes on a transparent background, sized identically to the Composite Image, intended
to be printed on a transparent sheet and physically overlaid.
_Avoid_: overlay, grid, filter, mask

**Stripe**:
A contiguous run of `stripe_width` pixel columns (or rows) assigned to a single frame in the Composite Image.
_Avoid_: slice, line, band

**Stripe Width**:
The number of pixels in each Stripe. Configurable; defaults to 3.
_Avoid_: resolution, density, thickness

**Direction**:
Whether Stripes run as vertical columns or horizontal rows. Configurable.
_Avoid_: axis, orientation, mode

**Starting Frame**:
The Frame assigned to the first Stripe in the Composite Image. The user can designate any Frame as the Starting Frame
without changing the overall sequence order.
_Avoid_: first frame, offset

**Live Preview**:
An in-browser animation that slides a virtual Barrier Grid over the Composite Image so the user can verify the effect
before printing.
_Avoid_: preview, animation, demo
