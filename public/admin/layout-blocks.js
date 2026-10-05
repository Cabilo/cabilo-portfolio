/*
 * CABILO Layout Blocks — experimental Decap CMS widget
 *
 * This is intentionally separate from the existing Media Blocks system.
 * Layout Blocks describe composition: position, size, and snapping.
 * Media Blocks continue to describe content/rendering.
 *
 * Grid model:
 * - 5 columns conceptually, represented internally as 10 half-column units.
 * - 50 rows maximum for now.
 * - Constrained = snap edges to full columns/rows (2 half-units).
 * - Free = snap edges to half-columns/half-rows (1 half-unit).
 */

(function () {
  if (!window.CMS || !window.createClass || !window.h) return;

  var h = window.h;
  var createClass = window.createClass;

  var HALF_COLUMNS = 10;
  var MAX_ROWS = 50;
  var INITIAL_ROWS = 5;

  var styles = `
    .cabilo-layout-widget {
      font-family: inherit;
      color: #f4f4f5;
      background: #050506;
      border: 1px solid #3f3f46;
      border-radius: 6px;
      padding: 14px;
    }

    .cabilo-layout-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-bottom: 12px;
    }

    .cabilo-layout-button {
      appearance: none;
      border: 1px solid #3f3f46;
      border-radius: 5px;
      background: #18181b;
      color: #f4f4f5;
      padding: 7px 10px;
      font-size: 12px;
      line-height: 1;
      cursor: pointer;
    }

    .cabilo-layout-button:hover {
      background: #27272a;
      border-color: #71717a;
    }

    .cabilo-layout-help {
      color: #a1a1aa;
      font-size: 12px;
      line-height: 1.5;
      margin: 0 0 12px;
    }

    .cabilo-layout-add-row {
      margin-top: 8px;
    }

    .cabilo-layout-grid-wrap {
      overflow: hidden;
      border: 1px solid #52525b;
      border-radius: 6px;
      background: #020204;
      padding: 0;
    }

    .cabilo-layout-grid {
      position: relative;
      width: 100%;
      aspect-ratio: 5 / var(--layout-visible-rows);
      background-color: #07070a;
      background-image:
        repeating-linear-gradient(to right, rgba(212,212,216,.20) 0 1px, transparent 1px 10%),
        repeating-linear-gradient(to bottom, rgba(212,212,216,.20) 0 1px, transparent 1px calc(100% / (2 * var(--layout-visible-rows)))),
        repeating-linear-gradient(to right, rgba(244,244,245,.58) 0 2px, transparent 2px 20%),
        repeating-linear-gradient(to bottom, rgba(244,244,245,.58) 0 2px, transparent 2px calc(100% / var(--layout-visible-rows)));
    }

    .cabilo-layout-block {
      position: absolute;
      box-sizing: border-box;
      border: 1px solid #fac018;
      border-radius: 5px;
      background: rgba(250,192,24,.10);
      color: #f4f4f5;
      cursor: move;
      user-select: none;
      touch-action: none;
      overflow: visible;
    }

    .cabilo-layout-block.is-selected {
      box-shadow: 0 0 0 2px rgba(250,192,24,.25);
    }

    .cabilo-layout-block-label {
      padding: 7px 9px;
      font-size: 12px;
      font-weight: 600;
      pointer-events: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cabilo-layout-block-meta {
      padding: 0 9px;
      color: #a1a1aa;
      font-size: 10px;
      pointer-events: none;
    }

    .cabilo-layout-handle {
      position: absolute;
      width: 10px;
      height: 10px;
      background: #fac018;
      border: 2px solid #09090b;
      border-radius: 50%;
      z-index: 3;
      touch-action: none;
    }

    .cabilo-layout-handle-n { left: 50%; top: -6px; transform: translateX(-50%); cursor: ns-resize; }
    .cabilo-layout-handle-s { left: 50%; bottom: -6px; transform: translateX(-50%); cursor: ns-resize; }
    .cabilo-layout-handle-w { left: -6px; top: 50%; transform: translateY(-50%); cursor: ew-resize; }
    .cabilo-layout-handle-e { right: -6px; top: 50%; transform: translateY(-50%); cursor: ew-resize; }
    .cabilo-layout-handle-nw { left: -6px; top: -6px; cursor: nwse-resize; }
    .cabilo-layout-handle-ne { right: -6px; top: -6px; cursor: nesw-resize; }
    .cabilo-layout-handle-sw { left: -6px; bottom: -6px; cursor: nesw-resize; }
    .cabilo-layout-handle-se { right: -6px; bottom: -6px; cursor: nwse-resize; }

    .cabilo-layout-inspector {
      margin-top: 12px;
      padding: 14px;
      border: 1px solid #3f3f46;
      border-radius: 6px;
      background: #121215;
    }

    .cabilo-layout-inspector-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
    }

    .cabilo-layout-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .cabilo-layout-field label {
      color: #a1a1aa;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .08em;
    }

    .cabilo-layout-field input,
    .cabilo-layout-field select,
    .cabilo-layout-field textarea {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #3f3f46;
      border-radius: 4px;
      background: #09090b;
      color: #f4f4f5;
      padding: 7px 8px;
      font: inherit;
      font-size: 12px;
    }

    .cabilo-layout-field textarea {
      min-height: 90px;
      resize: vertical;
    }

    .cabilo-layout-inspector-actions {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin-top: 12px;
    }

    .cabilo-layout-danger {
      border-color: #7f1d1d;
      color: #fecaca;
    }

    .cabilo-layout-aov-editor {
      margin-top: 10px;
    }

    .cabilo-layout-aov-pass {
      display: grid;
      grid-template-columns: minmax(100px, .5fr) minmax(180px, 1fr) auto;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }

    .cabilo-layout-aov-pass input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #3f3f46;
      border-radius: 4px;
      background: #09090b;
      color: #f4f4f5;
      padding: 7px 8px;
      font: inherit;
      font-size: 12px;
    }

    .cabilo-layout-status {
      color: #a1a1aa;
      font-size: 11px;
      margin-top: 8px;
    }
  `;

  if (!document.getElementById('cabilo-layout-widget-styles')) {
    var style = document.createElement('style');
    style.id = 'cabilo-layout-widget-styles';
    style.textContent = styles;
    document.head.appendChild(style);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value || []));
  }

  function toPlainValue(value) {
    if (Array.isArray(value)) return clone(value);
    if (value && typeof value.toJS === 'function') return clone(value.toJS());
    if (value && typeof value.toArray === 'function') return clone(value.toArray());
    return [];
  }

  function uid() {
    return 'layout-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  function snap(value, step) {
    return Math.round(value / step) * step;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function normalizeBlock(block) {
    var type = block.type || 'image';
    var defaults = {
      id: block.id || uid(),
      type: type,
      x: Number.isFinite(block.x) ? block.x : 0,
      y: Number.isFinite(block.y) ? block.y : 0,
      w: Number.isFinite(block.w) ? block.w : 4,
      h: Number.isFinite(block.h) ? block.h : 4,
      snap: block.snap === 'free' ? 'free' : 'grid',
      title: block.title || '',
      matchAspectRatio: block.matchAspectRatio === true,
      matchHeightToWidth: block.matchHeightToWidth !== false,
      content: block.content || '',
      image: block.image || '',
      videoUrl: block.videoUrl || '',
      folder: block.folder || '',
      aovPasses: Array.isArray(block.aovPasses) ? clone(block.aovPasses) : [],
    };

    defaults.x = clamp(defaults.x, 0, HALF_COLUMNS - 1);
    defaults.y = clamp(defaults.y, 0, MAX_ROWS * 2 - 1);
    defaults.w = clamp(defaults.w, 1, HALF_COLUMNS - defaults.x);
    defaults.h = clamp(defaults.h, 1, MAX_ROWS * 2 - defaults.y);

    return defaults;
  }

  var LayoutBlocksControl = createClass({
    getInitialState: function () {
      return {
        selectedId: null,
        interaction: null,
      };
    },

    componentDidMount: function () {
      this.handlePointerMove = this.handlePointerMove.bind(this);
      this.handlePointerUp = this.handlePointerUp.bind(this);
      document.addEventListener('keydown', this.handleKeyDown);
      document.addEventListener('pointermove', this.handlePointerMove);
      document.addEventListener('pointerup', this.handlePointerUp);
    },

    componentWillUnmount: function () {
      document.removeEventListener('keydown', this.handleKeyDown);
      document.removeEventListener('pointermove', this.handlePointerMove);
      document.removeEventListener('pointerup', this.handlePointerUp);
    },

    getBlocks: function () {
      return toPlainValue(this.props.value).map(normalizeBlock);
    },

    updateBlocks: function (blocks) {
      this.props.onChange(blocks);
    },

    addRows: function () {
      var currentRows = this.getVisibleRows();
      if (currentRows >= MAX_ROWS) return;
      this.setState({ visibleRows: Math.min(MAX_ROWS, currentRows + 1) });
    },

    getVisibleRows: function () {
      if (this.state.visibleRows) return this.state.visibleRows;
      var blocks = this.getBlocks();
      var usedRows = Math.max(
        0,
        ...blocks.map(function (block) { return Math.ceil((block.y + block.h) / 2); })
      );
      return Math.min(MAX_ROWS, Math.max(INITIAL_ROWS, usedRows));
    },

    handleKeyDown: function (event) {
      if ((event.key !== 'Delete' && event.key !== 'Backspace') || !this.state.selectedId) return;

      var target = event.target;
      if (target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      )) return;

      event.preventDefault();
      this.removeSelected();
    },

    addBlock: function (type) {
      var blocks = this.getBlocks();
      var maxBottom = 0;

      blocks.forEach(function (block) {
        maxBottom = Math.max(maxBottom, block.y + block.h);
      });

      var block = normalizeBlock({
        id: uid(),
        type: type,
        x: 0,
        y: Math.max(maxBottom, 0),
        w: 4,
        h: 4,
        snap: 'grid',
        title: type.charAt(0).toUpperCase() + type.slice(1),
      });

      blocks.push(block);
      this.setState({ selectedId: block.id });
      this.updateBlocks(blocks);
    },

    removeSelected: function () {
      var selectedId = this.state.selectedId;
      if (!selectedId) return;

      var blocks = this.getBlocks().filter(function (block) {
        return block.id !== selectedId;
      });

      this.setState({ selectedId: null });
      this.updateBlocks(blocks);
    },

    selectBlock: function (id) {
      this.setState({ selectedId: id });
    },

    beginInteraction: function (event, id, mode, handle) {
      event.preventDefault();
      event.stopPropagation();

      var blocks = this.getBlocks();
      var block = blocks.find(function (item) { return item.id === id; });
      var grid = event.currentTarget.closest('.cabilo-layout-grid');

      if (!block || !grid) return;

      var rect = grid.getBoundingClientRect();

      this.setState({
        selectedId: id,
        interaction: {
          mode: mode,
          handle: handle || null,
          id: id,
          startX: event.clientX,
          startY: event.clientY,
          gridWidth: rect.width,
          rowHeight: rect.width / HALF_COLUMNS,
          block: clone(block),
        },
      });
    },

    handlePointerMove: function (event) {
      var interaction = this.state.interaction;
      if (!interaction) return;

      var blocks = this.getBlocks();
      var index = blocks.findIndex(function (block) {
        return block.id === interaction.id;
      });

      if (index === -1) return;

      var original = interaction.block;
      var current = clone(original);
      var columnWidth = interaction.gridWidth / HALF_COLUMNS;
      var dx = (event.clientX - interaction.startX) / columnWidth;
      var dy = (event.clientY - interaction.startY) / interaction.rowHeight;

      var step = original.snap === 'free' ? 1 : 2;
      var sx = snap(dx, step);
      var sy = snap(dy, step);

      if (interaction.mode === 'move') {
        current.x = clamp(original.x + sx, 0, HALF_COLUMNS - original.w);
        current.y = clamp(original.y + sy, 0, MAX_ROWS * 2 - original.h);
      } else {
        var handle = interaction.handle || '';

        if (handle.indexOf('w') !== -1) {
          var newX = clamp(original.x + sx, 0, original.x + original.w - step);
          current.x = newX;
          current.w = original.w + (original.x - newX);
        }

        if (handle.indexOf('e') !== -1) {
          current.w = clamp(original.w + sx, step, HALF_COLUMNS - original.x);
        }

        if (handle.indexOf('n') !== -1) {
          var newY = clamp(original.y + sy, 0, original.y + original.h - step);
          current.y = newY;
          current.h = original.h + (original.y - newY);
        }

        if (handle.indexOf('s') !== -1) {
          current.h = clamp(original.h + sy, step, MAX_ROWS * 2 - original.y);
        }
      }

      blocks[index] = normalizeBlock(current);
      this.updateBlocks(blocks);
    },

    handlePointerUp: function () {
      if (this.state.interaction) {
        this.setState({ interaction: null });
      }
    },

    addAovPass: function () {
      var blocks = this.getBlocks();
      var selectedId = this.state.selectedId;
      var index = blocks.findIndex(function (block) { return block.id === selectedId; });

      if (index === -1) return;

      blocks[index].aovPasses = (blocks[index].aovPasses || []).concat([{
        name: 'Pass',
        image: '',
      }]);
      this.updateBlocks(blocks);
    },

    updateAovPass: function (passIndex, field, value) {
      var blocks = this.getBlocks();
      var selectedId = this.state.selectedId;
      var index = blocks.findIndex(function (block) { return block.id === selectedId; });

      if (index === -1) return;

      var passes = clone(blocks[index].aovPasses || []);
      if (!passes[passIndex]) return;
      passes[passIndex][field] = value;
      blocks[index].aovPasses = passes;
      this.updateBlocks(blocks);
    },

    removeAovPass: function (passIndex) {
      var blocks = this.getBlocks();
      var selectedId = this.state.selectedId;
      var index = blocks.findIndex(function (block) { return block.id === selectedId; });

      if (index === -1) return;

      blocks[index].aovPasses = (blocks[index].aovPasses || []).filter(function (_, i) {
        return i !== passIndex;
      });
      this.updateBlocks(blocks);
    },

    updateSelectedField: function (field, value) {
      var blocks = this.getBlocks();
      var selectedId = this.state.selectedId;
      var index = blocks.findIndex(function (block) {
        return block.id === selectedId;
      });

      if (index === -1) return;

      blocks[index][field] = value;
      this.updateBlocks(blocks);
    },

    setAspectRatioEnabled: function (enabled) {
      this.updateSelectedField('matchAspectRatio', enabled);

      if (!enabled) {
        this.updateSelectedField('matchHeightToWidth', true);
      }
    },

    renderHandle: function (id, handle) {
      return h('span', {
        key: handle,
        className: 'cabilo-layout-handle cabilo-layout-handle-' + handle,
        onPointerDown: function (event) {
          this.beginInteraction(event, id, 'resize', handle);
        }.bind(this),
      });
    },

    renderBlock: function (block) {
      var selected = block.id === this.state.selectedId;
      var style = {
        left: (block.x * 10) + '%',
        top: (block.y / (2 * this.getVisibleRows()) * 100) + '%',
        width: (block.w * 10) + '%',
        height: (block.h / (2 * this.getVisibleRows()) * 100) + '%',
      };

      var label = block.title || block.type;
      var meta = block.snap === 'free' ? 'HALF GRID' : 'GRID';

      return h(
        'div',
        {
          key: block.id,
          className: 'cabilo-layout-block' + (selected ? ' is-selected' : ''),
          style: style,
          onPointerDown: function (event) {
            this.beginInteraction(event, block.id, 'move');
          }.bind(this),
          onClick: function (event) {
            event.stopPropagation();
            this.selectBlock(block.id);
          }.bind(this),
        },
        h('div', { className: 'cabilo-layout-block-label' }, label),
        h('div', { className: 'cabilo-layout-block-meta' },
          meta + ' · ' + (block.w / 2) + ' × ' + (block.h / 2)
        ),
        selected ? [
          ['n', 'e', 's', 'w', 'nw', 'ne', 'sw', 'se'].map(function (handle) {
            return this.renderHandle(block.id, handle);
          }.bind(this)),
        ] : null
      );
    },

    renderField: function (label, element) {
      return h('div', { className: 'cabilo-layout-field' },
        h('label', null, label),
        element
      );
    },

    renderInspector: function (selected) {
      if (!selected) {
        return h('div', { className: 'cabilo-layout-inspector' },
          h('div', { className: 'cabilo-layout-help' },
            'Select a block to edit its content and snapping mode.'
          )
        );
      }

      var input = function (field, placeholder) {
        return h('input', {
          value: selected[field] || '',
          placeholder: placeholder || '',
          onChange: function (event) {
            this.updateSelectedField(field, event.target.value);
          }.bind(this),
        });
      }.bind(this);

      var contentControl;

      if (selected.type === 'text') {
        contentControl = this.renderField('Content', h('textarea', {
          value: selected.content || '',
          onChange: function (event) {
            this.updateSelectedField('content', event.target.value);
          }.bind(this),
        }));
      } else if (selected.type === 'image') {
        contentControl = this.renderField('Image URL / path', input('image', '/uploads/example.jpg'));
      } else if (selected.type === 'video') {
        contentControl = this.renderField('Video URL', input('videoUrl', 'YouTube, Vimeo, or MP4 URL'));
      } else if (selected.type === 'turntable') {
        contentControl = this.renderField('Turntable folder', input('folder', 'turntables/example'));
      } else if (selected.type === 'aov') {
        var passes = selected.aovPasses || [];
        contentControl = h('div', { className: 'cabilo-layout-aov-editor' },
          this.renderField('AOV Passes', h('div', null,
            passes.map(function (pass, index) {
              return h('div', {
                key: index,
                className: 'cabilo-layout-aov-pass',
              },
                h('input', {
                  value: pass.name || '',
                  placeholder: 'Pass name',
                  onChange: function (event) {
                    this.updateAovPass(index, 'name', event.target.value);
                  }.bind(this),
                }),
                h('input', {
                  value: pass.image || '',
                  placeholder: 'Image URL / path',
                  onChange: function (event) {
                    this.updateAovPass(index, 'image', event.target.value);
                  }.bind(this),
                }),
                h('button', {
                  type: 'button',
                  className: 'cabilo-layout-button cabilo-layout-danger',
                  onClick: function () { this.removeAovPass(index); }.bind(this),
                }, 'Remove')
              );
            }.bind(this)),
            h('button', {
              type: 'button',
              className: 'cabilo-layout-button',
              onClick: this.addAovPass,
            }, '+ Add AOV Pass')
          ))
        );
      }

      return h('div', { className: 'cabilo-layout-inspector' },
        h('div', { className: 'cabilo-layout-inspector-grid' },
          this.renderField('Type', h('select', {
            value: selected.type,
            onChange: function (event) {
              this.updateSelectedField('type', event.target.value);
            }.bind(this),
          },
            ['image', 'text', 'video', 'turntable', 'aov'].map(function (type) {
              return h('option', { key: type, value: type }, type);
            })
          )),
          this.renderField('Match asset aspect ratio', h('input', {
            type: 'checkbox',
            checked: selected.matchAspectRatio,
            onChange: function (event) {
              this.setAspectRatioEnabled(event.target.checked);
            }.bind(this),
          })),
          this.renderField(
            'Asset sizing direction',
            h('button', {
              type: 'button',
              className: 'cabilo-layout-button',
              disabled: !selected.matchAspectRatio,
              onMouseDown: function (event) {
                event.stopPropagation();
              },
              onClick: function (event) {
                event.preventDefault();
                event.stopPropagation();
                this.updateSelectedField('matchHeightToWidth', !selected.matchHeightToWidth);
              }.bind(this),
            }, selected.matchHeightToWidth ? 'Width → Height' : 'Height → Width')
          ),
          this.renderField('Snap mode', h('select', {
            value: selected.snap,
            onChange: function (event) {
              this.updateSelectedField('snap', event.target.value);
            }.bind(this),
          },
            h('option', { value: 'grid' }, 'Constrained — full grid'),
            h('option', { value: 'free' }, 'Free — half grid')
          )),
          this.renderField('Title', input('title', 'Optional block title')),
          this.renderField('X', h('input', {
            type: 'number',
            value: selected.x,
            min: 0,
            max: HALF_COLUMNS - selected.w,
            step: selected.snap === 'free' ? 1 : 2,
            onChange: function (event) {
              this.updateSelectedField('x', Number(event.target.value));
            }.bind(this),
          })),
          this.renderField('Y', h('input', {
            type: 'number',
            value: selected.y / 2,
            min: 0,
            max: MAX_ROWS - selected.h / 2,
            step: selected.snap === 'free' ? 0.5 : 1,
            onChange: function (event) {
              this.updateSelectedField('y', Number(event.target.value) * 2);
            }.bind(this),
          })),
          this.renderField('Width', h('input', {
            type: 'number',
            value: selected.w / 2,
            min: 0.5,
            max: HALF_COLUMNS / 2,
            step: selected.snap === 'free' ? 0.5 : 1,
            onChange: function (event) {
              this.updateSelectedField('w', Number(event.target.value) * 2);
            }.bind(this),
          })),
          this.renderField('Height', h('input', {
            type: 'number',
            value: selected.h / 2,
            min: 0.5,
            step: selected.snap === 'free' ? 0.5 : 1,
            onChange: function (event) {
              this.updateSelectedField('h', Number(event.target.value) * 2);
            }.bind(this),
          }))
        ),
        contentControl,
        h('div', { className: 'cabilo-layout-inspector-actions' },
          h('div', null,
            h('button', {
              type: 'button',
              className: 'cabilo-layout-button cabilo-layout-danger',
              onClick: this.removeSelected,
            }, 'Delete Block')
          ),
          h('div', { className: 'cabilo-layout-status' },
            'Matrix: ∞ × 5 · Editor limit: 50 rows · Half-grid: 10 × 100 units'
          )
        )
      );
    },

    render: function () {
      var blocks = this.getBlocks();
      var selected = blocks.find(function (block) {
        return block.id === this.state.selectedId;
      }.bind(this));

      return h('div', { className: 'cabilo-layout-widget' },
        h('div', { className: 'cabilo-layout-toolbar' },
          h('button', {
            type: 'button',
            className: 'cabilo-layout-button',
            onClick: function () { this.addBlock('image'); }.bind(this),
          }, '+ Image'),
          h('button', {
            type: 'button',
            className: 'cabilo-layout-button',
            onClick: function () { this.addBlock('text'); }.bind(this),
          }, '+ Text'),
          h('button', {
            type: 'button',
            className: 'cabilo-layout-button',
            onClick: function () { this.addBlock('video'); }.bind(this),
          }, '+ Video'),
          h('button', {
            type: 'button',
            className: 'cabilo-layout-button',
            onClick: function () { this.addBlock('turntable'); }.bind(this),
          }, '+ Turntable'),
          h('button', {
            type: 'button',
            className: 'cabilo-layout-button',
            onClick: function () { this.addBlock('aov'); }.bind(this),
          }, '+ AOV')
        ),
        h('p', { className: 'cabilo-layout-help' },
          'Drag blocks to move them. Drag any edge or corner to resize. ',
          'Constrained snaps to the 5-column grid; Free snaps to half-columns and half-rows. ',
          'The visible grid is only an editing aid — it is not stored as content.'
        ),
        h('div', { className: 'cabilo-layout-grid-wrap' },
          h('div', {
            className: 'cabilo-layout-grid',
            style: { '--layout-visible-rows': this.getVisibleRows() },
            onClick: function () { this.setState({ selectedId: null }); }.bind(this),
          }, blocks.map(this.renderBlock.bind(this)))
        ),
        this.getVisibleRows() < MAX_ROWS
          ? h('button', {
              type: 'button',
              className: 'cabilo-layout-button cabilo-layout-add-row',
              onClick: this.addRows,
            }, '+ Add 1 Row')
          : null,
        this.renderInspector(selected)
      );
    },
  });

  var LayoutBlocksPreview = createClass({
    render: function () {
      var blocks = Array.isArray(this.props.value) ? this.props.value : [];

      return h('div', {
        style: {
          padding: '12px',
          border: '1px solid #3f3f46',
          background: '#121215',
          color: '#a1a1aa',
          fontSize: '12px',
        },
      }, blocks.length + ' Layout Block' + (blocks.length === 1 ? '' : 's'));
    },
  });

  CMS.registerWidget('layoutBlocks', LayoutBlocksControl, LayoutBlocksPreview);
})();
