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
    content: ""
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
    content: ""
    image: ""
    videoUrl: https://www.youtube.com/watch?v=FjSAVJJ0w3I
    folder: ""
    aovPasses: []
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
    content: ""
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
    fitToViewport: true
    assetAlignment: auto
    content: >-
      ## A little controlled chaos

      This block is intentionally text-only. Its alignment belongs to the Markdown content, not the visual asset alignment system.

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
  - id: funky-aov-forced-left
    type: aov
    x: 0
    y: 28
    w: 3
    h: 8
    snap: free
    title: AOV — Forced Left
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: left
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
  - id: funky-aov-forced-center
    type: aov
    x: 3
    y: 28
    w: 4
    h: 8
    snap: grid
    title: AOV — Forced Center
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: center
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
  - id: funky-aov-forced-right
    type: aov
    x: 7
    y: 28
    w: 3
    h: 8
    snap: free
    title: AOV — Forced Right
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: right
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
  - id: funky-aov-viewport-cap
    type: aov
    x: 0
    y: 36
    w: 10
    h: 10
    snap: grid
    title: AOV — Wide Viewport Cap
    fitMode: width-to-height
    fitToViewport: true
    assetAlignment: center
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
    content: ""
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
