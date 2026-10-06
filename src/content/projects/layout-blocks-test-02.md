---
title: Layout Blocks Test 02
category: Cinematics
publishDate: 2026-10-05T18:13:00.000-03:00
thumbnail: https://cdnb.artstation.com/p/assets/images/images/031/216/037/large/lucas-cabilo-highresscreenshot00012.jpg?1602954475
role: Lookdev Artist
client: Personal Project
tags:
  - Lookdev Artist
softwareUsed:
  - Maya
  - Arnold
  - Substance Painter
layoutBlocks:
  - id: layout-test-02-turntable
    type: turntable
    x: 0
    y: 0
    w: 5
    h: 5
    snap: free
    title: Turntable
    fitMode: width-to-height
    content: ""
    image: ""
    videoUrl: ""
    folder: turntables\test
    aovPasses: []
  - id: layout-test-02-text
    type: text
    x: 5
    y: 0
    w: 5
    h: 5
    snap: grid
    title: Text
    fitMode: width-to-height
    content: >-
      # Layout Blocks Test 02

      This page is intentionally arranged differently from the first test.

      It tests a mixture of constrained and free blocks, fractional dimensions, different media sizes, and vertical spacing.

      The goal is to see whether the layout still feels predictable when blocks do not all use the same proportions.
    image: ""
    videoUrl: ""
    folder: ""
    aovPasses: []
  - id: layout-test-02-image
    type: image
    x: 0
    y: 5
    w: 7
    h: 3
    snap: free
    title: Wide Image
    fitMode: width-to-height
    content: ""
    image: https://cdnb.artstation.com/p/media_assets/images/images/001/392/567/large/Wildcat%E2%80%99s_Gilded_Jade_1.jpg?1790720806
    videoUrl: ""
    folder: ""
    aovPasses: []
  - id: layout-test-02-video
    type: video
    x: 7
    y: 5
    w: 3
    h: 3
    snap: free
    title: Small Video
    fitMode: width-to-height
    content: ""
    image: ""
    videoUrl: https://www.youtube.com/watch?v=FjSAVJJ0w3I
    folder: ""
    aovPasses: []
  - id: layout-test-02-aov
    type: aov
    x: 0
    y: 8
    w: 10
    h: 5
    snap: free
    title: AOV Comparison
    fitMode: height-to-width
    content: ""
    image: ""
    videoUrl: ""
    folder: ""
    aovPasses:
      - name: Beauty
        image: https://help.maxon.net/r3d/cinema/en-us/Content/Resources/Images/aov_scene_beauty17ce.jpg
      - name: Reflection
        image: https://help.maxon.net/r3d/cinema/en-us/Content/Resources/Images/aov_scene_test.Reflectionsb184.jpg
      - name: Depth
        image: https://help.maxon.net/r3d/cinema/en-us/Content/Resources/Images/aov_utility.Z_Normalized_Inverted4230.jpg
      - name: Wireframe
        image: https://help.maxon.net/r3d/cinema/en-us/Content/Resources/Images/aov_utility.Wireframe1353.jpg
  - id: layout-test-02-text-small
    type: text
    x: 0
    y: 13
    w: 3
    h: 3
    snap: free
    title: Small Text
    fitMode: width-to-height
    content: A small free-snap text block. It should keep its own space without
      introducing an internal scrollbar.
    image: ""
    videoUrl: ""
    folder: ""
    aovPasses: []
  - id: layout-test-02-image-small
    type: image
    x: 3
    y: 13
    w: 4
    h: 3
    snap: free
    title: Small Image
    fitMode: width-to-height
    content: ""
    image: https://cdna.artstation.com/p/media_assets/images/images/001/392/568/large/Wildcat%27s_Gilded_Jade_-_1_1.jpg?1790720808
    videoUrl: ""
    folder: ""
    aovPasses: []
  - id: layout-test-02-text-wide
    type: text
    x: 7
    y: 13
    w: 3
    h: 3
    snap: free
    title: Another Text Block
    fitMode: width-to-height
    content: Another small block to test how multiple fractional free-snap elements
      sit beside one another.
    image: ""
    videoUrl: ""
    folder: ""
    aovPasses: []
---
