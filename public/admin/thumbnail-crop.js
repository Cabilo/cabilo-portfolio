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

          if (nextImageUrl !== self.lastObservedImageUrl) {
            var previousImageUrl = self.lastObservedImageUrl;
            self.lastObservedImageUrl = nextImageUrl;
            self.setState({ imageUrl: nextImageUrl });

            if (!previousImageUrl && nextImageUrl && !self.state.open) {
              self.setState({
                open: true,
                draft: normalizeValue(self.props.value)
              });
            }
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
        this.setState({ draft: normalizeValue(this.props.value) });
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
      this.setState({ draft: normalizeValue(DEFAULTS) });
    },

    handlePointerDown: function (event) {
      if (!this.state.imageUrl) return;

      event.preventDefault();
      event.stopPropagation();

      if (window.getSelection) {
        var selection = window.getSelection();
        if (selection) selection.removeAllRanges();
      }

      var start = {
        x: event.clientX,
        y: event.clientY,
        positionX: this.state.draft.positionX,
        positionY: this.state.draft.positionY
      };

      var viewport = event.currentTarget.getBoundingClientRect();

      var onMove = function (moveEvent) {
        moveEvent.preventDefault();

        var next = normalizeValue(this.state.draft);

        next.positionX = clamp(
          start.positionX - ((moveEvent.clientX - start.x) / viewport.width) * 100,
          0,
          100
        );
        next.positionY = clamp(
          start.positionY - ((moveEvent.clientY - start.y) / viewport.height) * 100,
          0,
          100
        );

        this.setState({ draft: next });

        if (window.getSelection) {
          var selection = window.getSelection();
          if (selection) selection.removeAllRanges();
        }
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

      if (window.getSelection) {
        var selection = window.getSelection();
        if (selection) selection.removeAllRanges();
      }

      var viewport = event.currentTarget.parentElement.parentElement.getBoundingClientRect();
      var start = {
        x: event.clientX,
        y: event.clientY,
        zoom: this.state.draft.zoom
      };

      var sizeForZoom = function (zoom) {
        return 54 - ((zoom - 1) / 2) * 18;
      };

      var zoomForSize = function (size) {
        return 1 + ((54 - size) / 18) * 2;
      };

      var onMove = function (moveEvent) {
        moveEvent.preventDefault();

        var dx = moveEvent.clientX - start.x;
        var dy = moveEvent.clientY - start.y;
        var direction = event.currentTarget.getAttribute('data-direction') || 'se';
        var signedDistance;

        if (direction === 'nw') signedDistance = (-dx - dy) / Math.sqrt(2);
        if (direction === 'ne') signedDistance = (dx - dy) / Math.sqrt(2);
        if (direction === 'sw') signedDistance = (-dx + dy) / Math.sqrt(2);
        if (direction === 'se') signedDistance = (dx + dy) / Math.sqrt(2);

        var currentSize = sizeForZoom(start.zoom);
        var size = clamp(
          currentSize + (signedDistance / viewport.width) * 100,
          36,
          88
        );

        var next = normalizeValue(this.state.draft);
        next.zoom = clamp(zoomForSize(size), 1, 3);
        this.setState({ draft: next });

        if (window.getSelection) {
          var selection = window.getSelection();
          if (selection) selection.removeAllRanges();
        }
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

      var previewStyle = {
        position: 'relative',
        width: '100%',
        maxWidth: '360px',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        background: '#111',
        borderRadius: '6px',
        cursor: imageUrl ? 'grab' : 'default',
        touchAction: 'none'
      };

      var imageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: draft.positionX + '% ' + draft.positionY + '%',
        transform: 'scale(' + draft.zoom + ')',
        transformOrigin: 'center',
        pointerEvents: 'none'
      };

      var cropSize = 54 - ((draft.zoom - 1) / 2) * 18;

      var squareStyle = {
        position: 'absolute',
        width: cropSize + '%',
        maxWidth: '560px',
        aspectRatio: '1 / 1',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        border: '2px solid #fff',
        boxShadow: '0 0 0 9999px rgba(0,0,0,.58)',
        pointerEvents: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      };

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
                  h('div', { style: { fontSize: '18px', fontWeight: '700' } }, 'Thumbnail Crop'),
                  h('div', { style: { marginTop: '4px', color: '#a1a1aa', fontSize: '13px' } }, 'Drag the image to reposition it. Use zoom to tighten the crop.')
                ),
                h('button', {
                  type: 'button',
                  onClick: this.closeEditor,
                  style: Object.assign({}, buttonStyle, { background: '#27272a', color: '#fff', borderColor: '#52525b' })
                }, 'Close')
              ),

              imageUrl
                ? h('div', {
                    style: {
                      position: 'relative',
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '10px 0 22px'
                    }
                  },
                    h('div', {
                      style: Object.assign({}, previewStyle, {
                        maxWidth: '640px',
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                      }),
                      onPointerDown: this.handlePointerDown,
                      onDragStart: function (event) {
                        event.preventDefault();
                      },
                      onSelectStart: function (event) {
                        event.preventDefault();
                      }
                    },
                      h('img', { src: imageUrl, alt: 'Thumbnail crop preview', style: imageStyle, draggable: false }),
                      h('div', {
                        style: {
                          position: 'absolute',
                          inset: '0',
                          pointerEvents: 'none'
                        }
                      },
                        h('div', {
                          style: {
                            position: 'absolute',
                            left: '0',
                            right: '0',
                            top: '0',
                            height: 'calc(50% - ' + (cropSize / 2) + '%)',
                            background: 'rgba(0,0,0,.58)'
                          }
                        }),
                        h('div', {
                          style: {
                            position: 'absolute',
                            left: '0',
                            right: '0',
                            bottom: '0',
                            height: 'calc(50% - ' + (cropSize / 2) + '%)',
                            background: 'rgba(0,0,0,.58)'
                          }
                        }),
                        h('div', {
                          style: {
                            left: '0',
                            top: 'calc(50% - ' + (cropSize / 2) + '%)',
                            bottom: 'calc(50% - ' + (cropSize / 2) + '%)',
                            width: 'calc(50% - ' + (cropSize / 2) + '%)',
                            background: 'rgba(0,0,0,.58)',
                            position: 'absolute'
                          }
                        }),
                        h('div', {
                          style: {
                            right: '0',
                            top: 'calc(50% - ' + (cropSize / 2) + '%)',
                            bottom: 'calc(50% - ' + (cropSize / 2) + '%)',
                            width: 'calc(50% - ' + (cropSize / 2) + '%)',
                            background: 'rgba(0,0,0,.58)',
                            position: 'absolute'
                          }
                        })
                      ),
                      h('div', Object.assign({}, squareStyle, {
                        pointerEvents: 'none'
                      }),
                        ['nw', 'ne', 'sw', 'se'].map(function (direction) {
                          var isTop = direction.indexOf('n') !== -1;
                          var isLeft = direction.indexOf('w') !== -1;

                          var cornerStyle = {
                            position: 'absolute',
                            width: '22px',
                            height: '22px',
                            pointerEvents: 'auto',
                            touchAction: 'none',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            cursor: direction === 'nw' || direction === 'se' ? 'nwse-resize' : 'nesw-resize',
                            boxSizing: 'border-box'
                          };

                          if (isTop) {
                            cornerStyle.top = '-2px';
                          } else {
                            cornerStyle.bottom = '-2px';
                          }

                          if (isLeft) {
                            cornerStyle.left = '-2px';
                          } else {
                            cornerStyle.right = '-2px';
                          }

                          var horizontalStyle = {
                            position: 'absolute',
                            width: '12px',
                            height: '2px',
                            background: '#fff',
                            top: isTop ? '0' : 'auto',
                            bottom: isTop ? 'auto' : '0',
                            left: isLeft ? '0' : 'auto',
                            right: isLeft ? 'auto' : '0',
                            pointerEvents: 'none'
                          };

                          var verticalStyle = {
                            position: 'absolute',
                            width: '2px',
                            height: '12px',
                            background: '#fff',
                            top: isTop ? '0' : 'auto',
                            bottom: isTop ? 'auto' : '0',
                            left: isLeft ? '0' : 'auto',
                            right: isLeft ? 'auto' : '0',
                            pointerEvents: 'none'
                          };

                          return h('div', {
                            key: direction,
                            'data-direction': direction,
                            style: cornerStyle,
                            onPointerDown: self.handleResizePointerDown,
                            onDragStart: function (event) {
                              event.preventDefault();
                            }
                          },
                            h('div', { style: horizontalStyle }),
                            h('div', { style: verticalStyle })
                          );
                        })
                      ),

                      h('div', {
                        style: {
                          position: 'absolute',
                          left: '50%',
                          bottom: '10px',
                          transform: 'translateX(-50%)',
                          padding: '5px 9px',
                          borderRadius: '999px',
                          background: 'rgba(0,0,0,.72)',
                          color: '#fff',
                          fontSize: '11px',
                          pointerEvents: 'none',
                          userSelect: 'none',
                          WebkitUserSelect: 'none'
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
                  display: 'grid',
                  gap: '14px',
                  marginBottom: '22px'
                }
              },
                h('label', {},
                  h('div', { style: { marginBottom: '5px', fontSize: '12px', color: '#a1a1aa' } }, 'Zoom'),
                  h('input', {
                    type: 'range',
                    min: '1',
                    max: '3',
                    step: '0.05',
                    value: draft.zoom,
                    onChange: function (event) { self.updateDraft('zoom', event.target.value); },
                    style: { width: '100%' }
                  }),
                  h('div', { style: { fontSize: '12px', color: '#a1a1aa' } }, draft.zoom.toFixed(2) + '×')
                )
              ),

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
                  style: Object.assign({}, buttonStyle, { background: '#27272a', color: '#fff', borderColor: '#52525b' })
                }, 'Reset'),
                h('div', { style: { display: 'flex', gap: '10px' } },
                  h('button', {
                    type: 'button',
                    onClick: this.closeEditor,
                    style: Object.assign({}, buttonStyle, { background: 'transparent', color: '#fff', borderColor: '#52525b' })
                  }, 'Cancel'),
                  h('button', {
                    type: 'button',
                    onClick: this.apply,
                    style: Object.assign({}, buttonStyle, { background: '#e67300', color: '#fff', borderColor: '#e67300' })
                  }, 'Apply Crop')
                )
              )
            )
          )
        : null;

      return h('div', {
        id: this.props.forID,
        className: this.props.classNameWrapper,
        style: { display: 'grid', gap: '10px' }
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
          h('span', { style: { color: '#666', fontSize: '12px' } },
            'Crop ' + Math.round(54 - ((value.zoom - 1) / 2) * 18) + '% · X ' + Math.round(value.positionX) + ' · Y ' + Math.round(value.positionY)
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
      }, 'Crop ' + Math.round(54 - ((value.zoom - 1) / 2) * 18) + '% · Position ' + Math.round(value.positionX) + '% / ' + Math.round(value.positionY) + '%');
    }
  });

  CMS.registerWidget('thumbnailCrop', CropControl, CropPreview);
})();