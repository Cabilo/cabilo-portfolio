(function () {
  var h = window.h;
  var createClass = window.createClass;

  if (!window.CMS || !h || !createClass) return;

  var DEFAULTS = {
    zoom: 1,
    positionX: 50,
    positionY: 50
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function numberOr(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function normalizeValue(value) {
    return {
      zoom: clamp(numberOr(value && value.zoom, DEFAULTS.zoom), 1, 3),
      positionX: clamp(numberOr(value && value.positionX, DEFAULTS.positionX), 0, 100),
      positionY: clamp(numberOr(value && value.positionY, DEFAULTS.positionY), 0, 100)
    };
  }

  // zoom 1 = largest crop window; zoom 3 = smallest crop window.
  // 100% means the crop window fills the entire square frame.
  function cropSizeForZoom(zoom) {
    return 100 - ((zoom - 1) / 2) * 64;
  }

  function zoomForCropSize(size) {
    return 1 + ((100 - size) / 64) * 2;
  }

  function findImageUrl(controlId) {
    var control = document.getElementById(controlId);
    if (!control) return '';

    var root = control.parentElement;

    while (root && root !== document.body) {
      var images = root.querySelectorAll('img');

      for (var i = 0; i < images.length; i += 1) {
        var src = images[i].currentSrc || images[i].src || '';
        if (src && !src.startsWith('data:image/svg+xml')) return src;
      }

      root = root.parentElement;
    }

    return '';
  }

  function clearSelection() {
    if (!window.getSelection) return;

    var selection = window.getSelection();
    if (selection) selection.removeAllRanges();
  }

  var CropControl = createClass({
    getInitialState: function () {
      return {
        open: false,
        draft: normalizeValue(this.props.value),
        imageUrl: ''
      };
    },

    componentDidMount: function () {
      this.refreshImage();

      var self = this;

      window.setTimeout(function () {
        self.lastObservedImageUrl = findImageUrl(self.props.forID);

        self.imageWatcher = window.setInterval(function () {
          var nextImageUrl = findImageUrl(self.props.forID);

          if (nextImageUrl === self.lastObservedImageUrl) return;

          var previousImageUrl = self.lastObservedImageUrl;
          self.lastObservedImageUrl = nextImageUrl;

          self.setState({ imageUrl: nextImageUrl });

          if (!previousImageUrl && nextImageUrl && !self.state.open) {
            self.setState({
              open: true,
              draft: normalizeValue(self.props.value)
            });
          }
        }, 300);
      }, 600);
    },

    componentWillUnmount: function () {
      if (this.imageWatcher) {
        window.clearInterval(this.imageWatcher);
      }
    },

    componentDidUpdate: function (prevProps) {
      if (prevProps.value !== this.props.value && !this.state.open) {
        this.setState({
          draft: normalizeValue(this.props.value)
        });
      }
    },

    refreshImage: function () {
      var self = this;

      window.setTimeout(function () {
        var imageUrl = findImageUrl(self.props.forID);

        if (imageUrl !== self.state.imageUrl) {
          self.setState({ imageUrl: imageUrl });
        }
      }, 0);
    },

    openEditor: function () {
      this.refreshImage();

      this.setState({
        open: true,
        draft: normalizeValue(this.props.value)
      });
    },

    closeEditor: function () {
      this.setState({ open: false });
    },

    apply: function () {
      this.props.onChange(normalizeValue(this.state.draft));
      this.setState({ open: false });
    },

    reset: function () {
      this.setState({
        draft: normalizeValue(DEFAULTS)
      });
    },

    handleCropPointerDown: function (event) {
      if (!this.state.imageUrl) return;

      event.preventDefault();
      event.stopPropagation();
      clearSelection();

      var frame = event.currentTarget.closest('[data-crop-frame]');
      if (!frame) return;

      var frameRect = frame.getBoundingClientRect();

      var start = {
        x: event.clientX,
        y: event.clientY,
        positionX: this.state.draft.positionX,
        positionY: this.state.draft.positionY
      };

      var onMove = function (moveEvent) {
        moveEvent.preventDefault();

        var next = normalizeValue(this.state.draft);

        next.positionX = clamp(
          start.positionX - ((moveEvent.clientX - start.x) / frameRect.width) * 100,
          0,
          100
        );

        next.positionY = clamp(
          start.positionY - ((moveEvent.clientY - start.y) / frameRect.height) * 100,
          0,
          100
        );

        this.setState({ draft: next });
        clearSelection();
      }.bind(this);

      var onUp = function () {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', onUp);
    },

    handleImagePointerDown: function (event) {
      if (!this.state.imageUrl) return;

      event.preventDefault();
      event.stopPropagation();
      clearSelection();

      var frame = event.currentTarget.getBoundingClientRect();

      var start = {
        x: event.clientX,
        y: event.clientY,
        positionX: this.state.draft.positionX,
        positionY: this.state.draft.positionY
      };

      var onMove = function (moveEvent) {
        moveEvent.preventDefault();

        var next = normalizeValue(this.state.draft);

        next.positionX = clamp(
          start.positionX - ((moveEvent.clientX - start.x) / frame.width) * 100,
          0,
          100
        );

        next.positionY = clamp(
          start.positionY - ((moveEvent.clientY - start.y) / frame.height) * 100,
          0,
          100
        );

        this.setState({ draft: next });
        clearSelection();
      }.bind(this);

      var onUp = function () {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', onUp);
    },

    handleResizePointerDown: function (event) {
      if (!this.state.imageUrl) return;

      event.preventDefault();
      event.stopPropagation();
      clearSelection();

      var handle = event.currentTarget;
      var frame = handle.closest('[data-crop-frame]');

      if (!frame) return;

      var frameRect = frame.getBoundingClientRect();
      var direction = handle.getAttribute('data-direction') || 'se';

      var start = {
        x: event.clientX,
        y: event.clientY,
        size: cropSizeForZoom(this.state.draft.zoom)
      };

      var onMove = function (moveEvent) {
        moveEvent.preventDefault();

        var dx = moveEvent.clientX - start.x;
        var dy = moveEvent.clientY - start.y;
        var diagonal = 0;

        if (direction === 'nw') diagonal = (-dx - dy) / Math.sqrt(2);
        if (direction === 'ne') diagonal = (dx - dy) / Math.sqrt(2);
        if (direction === 'sw') diagonal = (-dx + dy) / Math.sqrt(2);
        if (direction === 'se') diagonal = (dx + dy) / Math.sqrt(2);

        var nextSize = clamp(
          start.size + (diagonal / frameRect.width) * 100,
          36,
          100
        );

        var next = normalizeValue(this.state.draft);
        next.zoom = clamp(zoomForCropSize(nextSize), 1, 3);

        this.setState({ draft: next });
        clearSelection();
      }.bind(this);

      var onUp = function () {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', onUp);
    },

    render: function () {
      var self = this;
      var value = normalizeValue(this.props.value);
      var draft = this.state.draft;
      var imageUrl = this.state.imageUrl;
      var cropSize = cropSizeForZoom(draft.zoom);
      var cropOffset = (100 - cropSize) / 2;

      var buttonStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 14px',
        border: '1px solid #777',
        borderRadius: '4px',
        background: '#fff',
        color: '#222',
        fontWeight: '600',
        cursor: 'pointer'
      };

      /*
       * Interaction model:
       *
       * FRAME
       * ├── IMAGE LAYER       -> only layer that moves the image
       * ├── DIM LAYER         -> visual only, never receives pointer events
       * └── CROP LAYER        -> visual boundary, never moves the image
       *     └── FOUR HANDLES   -> only elements that resize the crop
       */

      var frameStyle = {
        position: 'relative',
        width: 'min(640px, 80vh)',
        maxWidth: '100%',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
        background: '#111',
        border: '2px solid #fff',
        borderRadius: '6px',
        boxSizing: 'border-box',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      };

      var imageLayerStyle = {
        position: 'absolute',
        inset: '0',
        zIndex: '1',
        overflow: 'hidden',
        cursor: 'grab',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      };

      var imageStyle = {
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: draft.positionX + '% ' + draft.positionY + '%',
        transform: 'scale(' + draft.zoom + ')',
        transformOrigin: 'center',
        pointerEvents: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      };

      var dimLayerStyle = {
        position: 'absolute',
        inset: '0',
        zIndex: '2',
        pointerEvents: 'none'
      };

      var cropLayerStyle = {
        position: 'absolute',
        left: cropOffset + '%',
        top: cropOffset + '%',
        width: cropSize + '%',
        height: cropSize + '%',
        zIndex: '3',
        border: '2px solid #fff',
        boxSizing: 'border-box',
        overflow: 'visible',
        pointerEvents: 'auto',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: 'move'
      };

      function makeDimStyle(position) {
        return Object.assign({
          position: 'absolute',
          background: 'rgba(0,0,0,.58)',
          pointerEvents: 'none'
        }, position);
      }

      function makeHandle(direction) {
        var isTop = direction.indexOf('n') !== -1;
        var isLeft = direction.indexOf('w') !== -1;

        var handleStyle = {
          position: 'absolute',
          width: '32px',
          height: '32px',
          zIndex: '4',
          pointerEvents: 'auto',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          cursor: direction === 'nw' || direction === 'se'
            ? 'nwse-resize'
            : 'nesw-resize'
        };

        handleStyle.top = isTop ? '-16px' : 'auto';
        handleStyle.bottom = isTop ? 'auto' : '-16px';
        handleStyle.left = isLeft ? '-16px' : 'auto';
        handleStyle.right = isLeft ? 'auto' : '-16px';

        var horizontalStyle = {
          position: 'absolute',
          width: '18px',
          height: '3px',
          background: '#fff',
          top: isTop ? '15px' : 'auto',
          bottom: isTop ? 'auto' : '15px',
          left: isLeft ? '15px' : 'auto',
          right: isLeft ? 'auto' : '15px',
          pointerEvents: 'none'
        };

        var verticalStyle = {
          position: 'absolute',
          width: '3px',
          height: '18px',
          background: '#fff',
          top: isTop ? '15px' : 'auto',
          bottom: isTop ? 'auto' : '15px',
          left: isLeft ? '15px' : 'auto',
          right: isLeft ? 'auto' : '15px',
          pointerEvents: 'none'
        };

        return h('div', {
          key: direction,
          'data-direction': direction,
          style: handleStyle,
          onPointerDown: self.handleResizePointerDown,
          onDragStart: function (event) {
            event.preventDefault();
          }
        },
          h('div', { style: horizontalStyle }),
          h('div', { style: verticalStyle })
        );
      }

      var modal = this.state.open
        ? h('div', {
            style: {
              position: 'fixed',
              inset: '0',
              zIndex: '999999',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              background: 'rgba(0,0,0,.82)'
            },
            onMouseDown: function (event) {
              if (event.target === event.currentTarget) self.closeEditor();
            }
          },
            h('div', {
              style: {
                width: 'min(760px, 100%)',
                maxHeight: 'calc(100vh - 64px)',
                overflow: 'auto',
                padding: '24px',
                background: '#18181b',
                color: '#f4f4f5',
                border: '1px solid #3f3f46',
                borderRadius: '10px',
                boxShadow: '0 25px 80px rgba(0,0,0,.55)'
              }
            },
              h('div', {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '18px'
                }
              },
                h('div', {},
                  h('div', {
                    style: {
                      fontSize: '18px',
                      fontWeight: '700'
                    }
                  }, 'Thumbnail Crop'),
                  h('div', {
                    style: {
                      marginTop: '4px',
                      color: '#a1a1aa',
                      fontSize: '13px'
                    }
                  }, 'Drag the image to reposition it. Drag a corner bracket to resize the crop window.')
                ),
                h('button', {
                  type: 'button',
                  onClick: this.closeEditor,
                  style: Object.assign({}, buttonStyle, {
                    background: '#27272a',
                    color: '#fff',
                    borderColor: '#52525b'
                  })
                }, 'Close')
              ),

              imageUrl
                ? h('div', {
                    style: {
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '10px 0 22px'
                    }
                  },
                    h('div', {
                      'data-crop-frame': 'true',
                      style: frameStyle
                    },

                      // 1. IMAGE / DRAG LAYER
                      h('div', {
                        style: imageLayerStyle,
                        onPointerDown: self.handleImagePointerDown,
                        onDragStart: function (event) {
                          event.preventDefault();
                        },
                        onSelectStart: function (event) {
                          event.preventDefault();
                        }
                      },
                        h('img', {
                          src: imageUrl,
                          alt: 'Thumbnail crop preview',
                          style: imageStyle,
                          draggable: false
                        })
                      ),

                      // 2. DIMMING — four panels around the crop, never interactive
                      h('div', {
                        style: dimLayerStyle
                      },
                        h('div', {
                          style: makeDimStyle({
                            left: '0',
                            right: '0',
                            top: '0',
                            height: cropOffset + '%'
                          })
                        }),
                        h('div', {
                          style: makeDimStyle({
                            left: '0',
                            right: '0',
                            bottom: '0',
                            height: cropOffset + '%'
                          })
                        }),
                        h('div', {
                          style: makeDimStyle({
                            left: '0',
                            top: cropOffset + '%',
                            bottom: cropOffset + '%',
                            width: cropOffset + '%'
                          })
                        }),
                        h('div', {
                          style: makeDimStyle({
                            right: '0',
                            top: cropOffset + '%',
                            bottom: cropOffset + '%',
                            width: cropOffset + '%'
                          })
                        })
                      ),

                      // 3. CROP LAYER — boundary only; it does not drag the image
                      h('div', {
                        style: cropLayerStyle,
                        onPointerDown: self.handleCropPointerDown,
                        onDragStart: function (event) {
                          event.preventDefault();
                        },
                        onSelectStart: function (event) {
                          event.preventDefault();
                        }
                      },
                        makeHandle('nw'),
                        makeHandle('ne'),
                        makeHandle('sw'),
                        makeHandle('se')
                      ),

                      h('div', {
                        style: {
                          position: 'absolute',
                          left: '50%',
                          bottom: '10px',
                          transform: 'translateX(-50%)',
                          zIndex: '5',
                          padding: '5px 9px',
                          borderRadius: '999px',
                          background: 'rgba(0,0,0,.72)',
                          color: '#fff',
                          fontSize: '11px',
                          pointerEvents: 'none',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          whiteSpace: 'nowrap'
                        }
                      }, 'Drag image · Drag a corner to resize crop')
                    )
                  )
                : h('div', {
                    style: {
                      padding: '36px',
                      textAlign: 'center',
                      color: '#a1a1aa',
                      background: '#09090b',
                      borderRadius: '6px',
                      marginBottom: '22px'
                    }
                  }, 'Select a thumbnail first to open the crop preview.'),

              h('div', {
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '10px'
                }
              },
                h('button', {
                  type: 'button',
                  onClick: this.reset,
                  style: Object.assign({}, buttonStyle, {
                    background: '#27272a',
                    color: '#fff',
                    borderColor: '#52525b'
                  })
                }, 'Reset'),
                h('div', {
                  style: {
                    display: 'flex',
                    gap: '10px'
                  }
                },
                  h('button', {
                    type: 'button',
                    onClick: this.closeEditor,
                    style: Object.assign({}, buttonStyle, {
                      background: 'transparent',
                      color: '#fff',
                      borderColor: '#52525b'
                    })
                  }, 'Cancel'),
                  h('button', {
                    type: 'button',
                    onClick: this.apply,
                    style: Object.assign({}, buttonStyle, {
                      background: '#e67300',
                      color: '#fff',
                      borderColor: '#e67300'
                    })
                  }, 'Apply Crop')
                )
              )
            )
          )
        : null;

      return h('div', {
        id: this.props.forID,
        className: this.props.classNameWrapper,
        style: {
          display: 'grid',
          gap: '10px'
        }
      },
        h('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }
        },
          h('button', {
            type: 'button',
            onClick: this.openEditor,
            style: buttonStyle
          }, 'Open Crop Editor'),
          h('span', {
            style: {
              color: '#666',
              fontSize: '12px'
            }
          },
            'Crop ' + Math.round(cropSizeForZoom(value.zoom)) +
            '% · X ' + Math.round(value.positionX) +
            ' · Y ' + Math.round(value.positionY)
          )
        ),
        modal
      );
    }
  });

  var CropPreview = createClass({
    render: function () {
      var value = normalizeValue(this.props.value);

      return h('div', {
        style: {
          padding: '8px 0',
          color: '#666',
          fontSize: '12px'
        }
      },
        'Crop ' + Math.round(cropSizeForZoom(value.zoom)) +
        '% · Position ' + Math.round(value.positionX) +
        '% / ' + Math.round(value.positionY) + '%'
      );
    }
  });

  CMS.registerWidget('thumbnailCrop', CropControl, CropPreview);
})();