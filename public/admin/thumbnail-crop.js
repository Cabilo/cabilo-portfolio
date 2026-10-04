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

    updateDraft: function (key, value) {
      var next = normalizeValue(this.state.draft);
      next[key] = clamp(Number(value), key === 'zoom' ? 1 : 0, key === 'zoom' ? 3 : 100);
      this.setState({ draft: next });
    },

    handlePointerDown: function (event) {
      if (!this.state.imageUrl) return;

      var start = {
        x: event.clientX,
        y: event.clientY,
        positionX: this.state.draft.positionX,
        positionY: this.state.draft.positionY
      };

      var viewport = event.currentTarget.getBoundingClientRect();

      var onMove = function (moveEvent) {
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
      }.bind(this);

      var onUp = function () {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      event.currentTarget.setPointerCapture && event.currentTarget.setPointerCapture(event.pointerId);
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

      var overlayStyle = {
        position: 'absolute',
        inset: '0',
        pointerEvents: 'none',
        background: 'linear-gradient(rgba(0,0,0,.58), rgba(0,0,0,.58))'
      };

      var squareStyle = {
        position: 'absolute',
        width: 'min(72%, 260px)',
        aspectRatio: '1 / 1',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        border: '2px solid #fff',
        boxShadow: '0 0 0 9999px rgba(0,0,0,.58)',
        pointerEvents: 'none'
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
                      style: Object.assign({}, previewStyle, { maxWidth: '640px' }),
                      onPointerDown: this.handlePointerDown
                    },
                      h('img', { src: imageUrl, alt: 'Thumbnail crop preview', style: imageStyle }),
                      h('div', { style: overlayStyle }),
                      h('div', { style: squareStyle }),
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
                          pointerEvents: 'none'
                        }
                      }, 'Drag image')
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
            'Zoom ' + value.zoom.toFixed(2) + '× · X ' + Math.round(value.positionX) + ' · Y ' + Math.round(value.positionY)
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
      }, 'Zoom ' + value.zoom.toFixed(2) + '× · Position ' + Math.round(value.positionX) + '% / ' + Math.round(value.positionY) + '%');
    }
  });

  CMS.registerWidget('thumbnailCrop', CropControl, CropPreview);
})();