---
title: Media Group Playground
description: Temporary example page demonstrating mixed media groups, columns, and responsive layouts.
publishDate: 2026-10-05
type: Breakdown
tags:
  - Lookdev
  - Lighting
  - Topology
softwareUsed:
  - Maya
  - Arnold
  - ZBrush
  - Nuke
thumbnail: https://cdna.artstation.com/p/assets/images/images/046/504/170/large/lucas-cabilo-ls-portraitheadscans-square-v001-0001.jpg?1645275374
thumbnailCrop:
  zoom: 1
  positionX: 50
  positionY: 50
featured: false
mediaBlocks:
  - type: group
    columns: 3
    items:
      - type: image
        title: Head Scan
        image: https://cdna.artstation.com/p/assets/images/images/046/504/170/large/lucas-cabilo-ls-portraitheadscans-square-v001-0001.jpg?1645275374
        fitToViewport: true
        comment: Three-column image test.
      - type: image
        title: XGen
        image: https://cdna.artstation.com/p/assets/images/images/046/500/860/large/lucas-cabilo-xgen.jpg?1645267427
        fitToViewport: true
        comment: Another image in the same Media Group.
      - type: text_block
        title: Mixed Media
        content: |
          ## This is a Media Group

          Text can live beside images, video, AOVs, or turntables.

          This example is intentionally here so you can inspect the result before creating your own content.
  - type: group
    columns: 2
    items:
      - type: aov
        title: AOV Comparison
        aovPasses:
          - name: Viewport
            image: https://cdna.artstation.com/p/assets/images/images/046/500/860/large/lucas-cabilo-xgen.jpg?1645267427
          - name: Wireframe
            image: https://cdnb.artstation.com/p/assets/images/images/046/504/715/large/lucas-cabilo-uv-and-topo.jpg?1645276624
        fitToViewport: true
        comment: AOV block inside a two-column Media Group.
      - type: turntable
        title: Turntable Test
        folder: turntables/test/
        fitToViewport: true
        comment: Existing test turntable used to demonstrate mixed media.
---

This is a temporary playground page for testing the new Media Group system.

The goal is simply to give you a ready-made page with mixed content so you can see how the new layout behaves before using it on real tutorials and breakdowns.
