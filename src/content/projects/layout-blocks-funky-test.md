---
title: Layout Blocks Funky Test
category: 3D Modeler & Lookdev
publishDate: 2026-10-06T17:20:00.000-03:00
thumbnail: https://cdnb.artstation.com/p/assets/images/images/031/216/037/large/lucas-cabilo-highresscreenshot00012.jpg?1602954475
thumbnailCrop:
  zoom: 1
  positionX: 50
  positionY: 50
role: Lead 3D Artist
client: Lighting
tags:
  - Layout Blocks
  - Experimental
softwareUsed:
  - Maya
layoutBlocks:
  # ============================================================
  # ROW 1 — Three visual types sharing the same row.
  # The AOV is mathematically centered; image/video sit left/right.
  # ============================================================
  - id: funky-image-left
    type: image
    x: 0
    y: 0
    w: 3
    h: 6
    snap: free
    title: Image — Auto Left
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: auto
    image: https://cdnb.artstation.com/p/media_assets/images/images/001/392/567/large/Wildcat%E2%80%99s_Gilded_Jade_1.jpg?1790720806
    videoUrl: ""
    folder: ""
    aovPasses: []

  - id: funky-aov-center
    type: aov
    x: 3
    y: 0
    w: 4
    h: 6
    snap: grid
    title: AOV — Auto Center
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: auto
    image: ""
    videoUrl: ""
    folder: ""
    aovPasses:
      - name: Viewport
        image: https://cdna.artstation.com/p/media_assets/images/images/001/392/568/large/Wildcat%27s_Gilded_Jade_-_1_1.jpg?1790720808
      - name: Passfasf
        image: https://cdnb.artstation.com/p/media_assets/images/images/001/392/567/large/Wildcat%E2%80%99s_Gilded_Jade_1.jpg?1790720806

  - id: funky-video-right
    type: video
    x: 7
    y: 0
    w: 3
    h: 6
    snap: free
    title: Video — Auto Right
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: auto
    image: ""
    videoUrl: https://www.youtube.com/watch?v=FjSAVJJ0w3I
    folder: ""
    aovPasses: []

  # ============================================================
  # ROW 2 — Turntable + text + AOV.
  # Tests the Turntable collision footprint beside text.
  # Text deliberately has no asset alignment control.
  # ============================================================
  - id: funky-turntable
    type: turntable
    x: 0
    y: 8
    w: 4
    h: 8
    snap: grid
    title: Turntable
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: auto
    image: ""
    videoUrl: ""
    folder: turntables\test
    aovPasses: []

  - id: funky-text
    type: text
    x: 4
    y: 8
    w: 2
    h: 12
    snap: grid
    title: Text — Markdown Controlled
    fitMode: none
    content: >-
      ## A little controlled chaos

      This block is intentionally text-only. Its alignment belongs to the
      Markdown content, not the visual asset alignment system.

      Try moving the neighboring assets around it and watch the layout breathe.
    image: ""
    videoUrl: ""
    folder: ""
    aovPasses: []

  - id: funky-aov-right
    type: aov
    x: 6
    y: 8
    w: 4
    h: 8
    snap: grid
    title: AOV — Auto Right
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: auto
    image: ""
    videoUrl: ""
    folder: ""
    aovPasses:
      - name: Viewport
        image: https://cdna.artstation.com/p/media_assets/images/images/001/392/568/large/Wildcat%27s_Gilded_Jade_-_1_1.jpg?1790720808
      - name: Passfasf
        image: https://cdnb.artstation.com/p/media_assets/images/images/001/392/567/large/Wildcat%E2%80%99s_Gilded_Jade_1.jpg?1790720806

  # ============================================================
  # ROW 3 — Explicit alignment controls.
  # Same AOV assets, deliberately forced left / center / right.
  # ============================================================
  - id: funky-aov-forced-left
    type: aov
    x: 0
    y: 22
    w: 3
    h: 8
    snap: free
    title: AOV — Forced Left
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: left
    image: ""
    videoUrl: ""
    folder: ""
    aovPasses:
      - name: Viewport
        image: https://cdna.artstation.com/p/media_assets/images/images/001/392/568/large/Wildcat%27s_Gilded_Jade_-_1_1.jpg?1790720808
      - name: Passfasf
        image: https://cdnb.artstation.com/p/media_assets/images/images/001/392/567/large/Wildcat%E2%80%99s_Gilded_Jade_1.jpg?1790720806

  - id: funky-aov-forced-center
    type: aov
    x: 3
    y: 22
    w: 4
    h: 8
    snap: grid
    title: AOV — Forced Center
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: center
    image: ""
    videoUrl: ""
    folder: ""
    aovPasses:
      - name: Viewport
        image: https://cdna.artstation.com/p/media_assets/images/images/001/392/568/large/Wildcat%27s_Gilded_Jade_-_1_1.jpg?1790720808
      - name: Passfasf
        image: https://cdnb.artstation.com/p/media_assets/images/images/001/392/567/large/Wildcat%E2%80%99s_Gilded_Jade_1.jpg?1790720806

  - id: funky-aov-forced-right
    type: aov
    x: 7
    y: 22
    w: 3
    h: 8
    snap: free
    title: AOV — Forced Right
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: right
    image: ""
    videoUrl: ""
    folder: ""
    aovPasses:
      - name: Viewport
        image: https://cdna.artstation.com/p/media_assets/images/images/001/392/568/large/Wildcat%27s_Gilded_Jade_-_1_1.jpg?1790720808
      - name: Passfasf
        image: https://cdnb.artstation.com/p/media_assets/images/images/001/392/567/large/Wildcat%E2%80%99s_Gilded_Jade_1.jpg?1790720806

  # ============================================================
  # ROW 4 — Viewport cap stress test.
  # This AOV gets a very wide authored slot and should respect 75vh.
  # ============================================================
  - id: funky-aov-viewport-cap
    type: aov
    x: 0
    y: 34
    w: 10
    h: 10
    snap: grid
    title: AOV — Wide Viewport Cap
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: center
    image: ""
    videoUrl: ""
    folder: ""
    aovPasses:
      - name: Viewport
        image: https://cdna.artstation.com/p/media_assets/images/images/001/392/568/large/Wildcat%27s_Gilded_Jade_-_1_1.jpg?1790720808
      - name: Passfasf
        image: https://cdnb.artstation.com/p/media_assets/images/images/001/392/567/large/Wildcat%E2%80%99s_Gilded_Jade_1.jpg?1790720806

  # ============================================================
  # ROW 5 — Deliberately oversized detail image.
  # Viewport protection is OFF so this can become genuinely huge.
  # ============================================================
  - id: funky-detail-image
    type: image
    x: 1
    y: 48
    w: 8
    h: 10
    snap: free
    title: Detail Image — Viewport OFF
    fitMode: width-to-height
    fitToViewport: false
    assetAlignment: center
    image: https://cdnb.artstation.com/p/media_assets/images/images/001/392/567/large/Wildcat%E2%80%99s_Gilded_Jade_1.jpg?1790720806
    videoUrl: ""
    folder: ""
    aovPasses: []
---

# Layout Blocks Funky Test

This page is a playground for the experimental Layout Blocks system.

Try dragging, resizing, changing fit modes, switching alignment, and toggling
the viewport cap. The AOV blocks intentionally reuse the same AOV passes as the
existing Layout Blocks test so the geometry tests are not affected by different
image resolutions.
