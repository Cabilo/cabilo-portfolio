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
layoutBlocks:
  - id: media-group-head-scan
    type: image
    x: 0
    y: 0
    w: 3
    h: 6
    snap: free
    title: Head Scan
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: center
    image: https://cdna.artstation.com/p/assets/images/images/046/504/170/large/lucas-cabilo-ls-portraitheadscans-square-v001-0001.jpg?1645275374
  - id: media-group-xgen
    type: image
    x: 3
    y: 0
    w: 3
    h: 6
    snap: free
    title: XGen
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: center
    image: https://cdna.artstation.com/p/assets/images/images/046/500/860/large/lucas-cabilo-xgen.jpg?1645267427
  - id: media-group-text
    type: text
    x: 6
    y: 0
    w: 4
    h: 8
    snap: free
    title: Mixed Media
    fitMode: none
    fitToViewport: true
    assetAlignment: auto
    content: >-
      ## This is a Media Group

      Text can live beside images, video, AOVs, or turntables.

      This example is intentionally here so you can inspect the result before creating your own content.
  - id: media-group-aov
    type: aov
    x: 0
    y: 8
    w: 5
    h: 8
    snap: free
    title: AOV Comparison
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: center
    aovPasses:
      - name: Viewport
        image: https://cdna.artstation.com/p/assets/images/images/046/500/860/large/lucas-cabilo-xgen.jpg?1645267427
      - name: Wireframe
        image: https://cdnb.artstation.com/p/assets/images/images/046/504/715/large/lucas-cabilo-uv-and-topo.jpg?1645276624
  - id: media-group-turntable
    type: turntable
    x: 5
    y: 8
    w: 5
    h: 8
    snap: free
    title: Turntable Test
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: center
    folder: turntables/test/
---

This is a temporary playground page for testing the new Media Group system.

The goal is simply to give you a ready-made page with mixed content so you can see how the new layout behaves before using it on real tutorials and breakdowns.
