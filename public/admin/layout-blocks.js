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
    /*
     * Layout Blocks has its own inspector, so it gets an explicit dark
     * palette instead of relying on Decap's generated widget classes.
     * Palette mirrors the main CMS theme: page -> panel -> field.
     */
    .cabilo-layout-widget {
      font-family: inherit;
      color: #f0f6fc;
      background: #0d1117;
      border: 1px solid #30363d;
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
      border: 1px solid #484f58;
      border-radius: 5px;
      background: #21262d;
      color: #f0f6fc;
      padding: 7px 10px;
      font-size: 12px;
      line-height: 1;
      cursor: pointer;
      -webkit-text-fill-color: #f0f6fc;
    }

    .cabilo-layout-button:hover,
    .cabilo-layout-button:focus {
      background: #30363d;
      border-color: #6e7681;
      color: #fff;
      -webkit-text-fill-color: #fff;
    }

    .cabilo-layout-help {
      color: #8b949e;
      font-size: 12px;
      line-height: 1.5;
      margin: 0 0 12px;
    }

    .cabilo-layout-add-row {
      margin-top: 8px;
    }

    .cabilo-layout-grid-wrap {
      overflow: hidden;
      border: 1px solid #484f58;
      border-radius: 6px;
      background: #090d13;
      padding: 0;
    }

    .cabilo-layout-grid {
      position: relative;
      width: 100%;
      aspect-ratio: 5 / var(--layout-visible-rows);
      background-color: #0d1117;
      background-image:
        repeating-linear-gradient(to right, rgba(240,246,252,.16) 0 1px, transparent 1px 10%),
        repeating-linear-gradient(to bottom, rgba(240,246,252,.16) 0 1px, transparent 1px calc(100% / (2 * var(--layout-visible-rows)))),
        repeating-linear-gradient(to right, rgba(240,246,252,.44) 0 2px, transparent 2px 20%),
        repeating-linear-gradient(to bottom, rgba(240,246,252,.44) 0 2px, transparent 2px calc(100% / var(--layout-visible-rows)));
    }

    .cabilo-layout-block {
      position: absolute;
      box-sizing: border-box;
      border: 1px solid #fac018;
      border-radius: 5px;
      background: rgba(250,192,24,.10);
      color: #f0f6fc;
      cursor: move;
      user-select: none;
      touch-action: none;
      overflow: visible;
    }

    .cabilo-layout-block.is-selected {
      box-shadow: 0 0 0 2px rgba(250,192,24,.28);
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
      color: #8b949e;
      font-size: 10px;
      pointer-events: none;
    }

    .cabilo-layout-handle {
      position: absolute;
      width: 10px;
      height: 10px;
      background: #fac018;
      border: 2px solid #0d1117;
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

    /*
     * The inspector uses the browser Popover API so it can live in the
     * top layer without fighting Decap's scrolling/overflow containers.
     * React still owns the same inspector element and its state.
     */
    .cabilo-layout-inspector {
      margin: 0;
      padding: 14px;
      box-sizing: border-box;
      width: min(900px, calc(100vw - 24px));
      max-width: calc(100vw - 24px);
      max-height: 42vh;
      overflow-y: auto;
      border: 1px solid #484f58;
      border-radius: 6px;
      background: #161b22;
      color: #f0f6fc;
      box-shadow: 0 12px 28px rgba(1,4,9,.55);
      position: fixed;
      inset: auto;
      left: 50%;
      bottom: 12px;
      transform: translateX(-50%);
      z-index: 1000;
    }

    .cabilo-layout-inspector::backdrop {
      background: transparent;
    }

    .cabilo-layout-inspector-grid {
      max-height: 34vh;
      overflow-y: auto;
      padding-right: 2px;
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
      color: #c9d1d9;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .08em;
    }

    .cabilo-layout-field input,
    .cabilo-layout-field select,
    .cabilo-layout-field textarea,
    .cabilo-layout-aov-pass input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #484f58;
      border-radius: 4px;
      background: #21262d;
      color: #f0f6fc;
      padding: 7px 8px;
      font: inherit;
      font-size: 12px;
      color-scheme: dark;
      -webkit-text-fill-color: #f0f6fc;
      caret-color: #fac018;
    }

    .cabilo-layout-field input:hover,
    .cabilo-layout-field select:hover,
    .cabilo-layout-field textarea:hover,
    .cabilo-layout-aov-pass input:hover {
      background: #292f38;
      border-color: #6e7681;
    }

    .cabilo-layout-field input:focus,
    .cabilo-layout-field select:focus,
    .cabilo-layout-field textarea:focus,
    .cabilo-layout-aov-pass input:focus {
      background: #292f38;
      border-color: #fac018;
      outline: none;
      color: #fff;
      -webkit-text-fill-color: #fff;
    }

    .cabilo-layout-field textarea {
      min-height: 90px;
      resize: vertical;
    }

    .cabilo-layout-field select option {
      background: #21262d;
      color: #f0f6fc;
    }

    .cabilo-layout-inspector-actions {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin-top: 12px;
    }

    .cabilo-layout-danger {
      border-color: #7d1d1d;
      background: #3d1618;
      color: #ff7b72;
      -webkit-text-fill-color: #ff7b72;
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


    .cabilo-text-editor { display: flex; flex-direction: column; gap: 8px; }
    .cabilo-text-toolbar { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; padding: 6px; border: 1px solid #484f58; border-radius: 4px; background: #21262d; }
    .cabilo-text-toolbar-button { appearance: none; border: 1px solid #484f58; border-radius: 4px; background: #30363d; color: #f0f6fc; min-width: 30px; height: 28px; padding: 0 7px; font: inherit; font-size: 12px; cursor: pointer; -webkit-text-fill-color: #f0f6fc; }
    .cabilo-text-heading-select { appearance: none; box-sizing: border-box; width: 42px; min-width: 42px; height: 28px; padding: 0 4px; border: 1px solid #484f58; border-radius: 4px; background: #30363d; color: #f0f6fc; font: inherit; font-size: 12px; cursor: pointer; color-scheme: dark; -webkit-text-fill-color: #f0f6fc; }
    .cabilo-text-heading-select:hover, .cabilo-text-heading-select:focus { background: #484f58; border-color: #6e7681; outline: none; }
    .cabilo-text-rich ul, .cabilo-text-rich ol { padding-left: 28px; margin-left: 0; }
    .cabilo-text-rich li { padding-left: 2px; }

    .cabilo-text-toolbar-button:hover, .cabilo-text-toolbar-button:focus { background: #484f58; border-color: #6e7681; color: #fff; -webkit-text-fill-color: #fff; outline: none; }
    .cabilo-text-toolbar-divider { width: 1px; height: 20px; background: #484f58; margin: 0 3px; }
    .cabilo-text-mode { margin-left: auto; display: flex; gap: 4px; }
    .cabilo-text-mode-button { appearance: none; border: 1px solid #484f58; border-radius: 4px; background: transparent; color: #8b949e; padding: 5px 7px; font: inherit; font-size: 10px; cursor: pointer; -webkit-text-fill-color: #8b949e; }
    .cabilo-text-mode-button.is-active { background: #484f58; color: #f0f6fc; -webkit-text-fill-color: #f0f6fc; }
    .cabilo-text-rich { min-height: 140px; padding: 10px; border: 1px solid #484f58; border-radius: 4px; background: #21262d; color: #f0f6fc; font: inherit; font-size: 13px; line-height: 1.55; outline: none; overflow-y: auto; }
    .cabilo-text-rich:focus { border-color: #fac018; background: #292f38; }
    .cabilo-text-rich h1, .cabilo-text-rich h2, .cabilo-text-rich h3 { margin: 0 0 8px; }
    .cabilo-text-rich p, .cabilo-text-rich blockquote, .cabilo-text-rich pre, .cabilo-text-rich ul, .cabilo-text-rich ol { margin: 0 0 8px; }
    .cabilo-text-rich blockquote { margin-left: 0; padding-left: 10px; border-left: 3px solid #6e7681; color: #c9d1d9; }
    .cabilo-text-rich code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; background: #161b22; padding: 1px 4px; border-radius: 3px; }
    .cabilo-text-rich pre { padding: 8px; overflow-x: auto; background: #161b22; border-radius: 4px; }
    .cabilo-text-raw { width: 100%; min-height: 140px; box-sizing: border-box; resize: vertical; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; line-height: 1.5; }
    .cabilo-layout-status {
      color: #8b949e;
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
      fitMode:
        block.fitMode === 'width-to-height' ||
        block.fitMode === 'height-to-width'
          ? block.fitMode
          : block.matchAspectRatio === true ||
            block.matchAspectRatio === 'true'
            ? (block.matchHeightToWidth === false ||
              block.matchHeightToWidth === 'false'
              ? 'height-to-width'
              : 'width-to-height')
            : 'none',
      fitToViewport:
        block.fitToViewport === false ||
        block.fitToViewport === 'false'
          ? false
          : true,
      compress:
        block.compress === false || block.compress === 'false'
          ? false
          : true,
      assetAlignment:
        block.assetAlignment === 'left' ||
        block.assetAlignment === 'center' ||
        block.assetAlignment === 'right'
          ? block.assetAlignment
          : 'auto',
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


  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function markdownToHtml(markdown) {
    var source = String(markdown || '').replace(/\r\n?/g, '\n');
    var html = [];
    var list = null;

    function inline(value) {
      var text = escapeHtml(value);
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
      text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
      text = text.replace(/~~([^~]+)~~/g, '<s>$1</s>');
      text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
      text = text.replace(/\x60([^\x60]+)\x60/g, '<code>$1</code>');
      return text;
    }

    function closeList() {
      if (list) {
        html.push('</' + list + '>');
        list = null;
      }
    }

    source.split('\n').forEach(function (line) {
      var heading = line.match(/^(#{1,6})\s+(.+)$/);
      var unordered = line.match(/^\s*[-*+]\s+(.+)$/);
      var ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);

      if (heading) {
        closeList();
        html.push('<h' + heading[1].length + '>' + inline(heading[2]) + '</h' + heading[1].length + '>');
      } else if (unordered || ordered) {
        var nextList = unordered ? 'ul' : 'ol';
        var item = unordered ? unordered[1] : ordered[1];
        var itemHeading = item.match(/^(#{1,6})\\s+(.+)$/);

        if (list !== nextList) {
          closeList();
          html.push('<' + nextList + '>');
          list = nextList;
        }

        if (itemHeading) {
          var itemLevel = itemHeading[1].length;
          html.push('<li><h' + itemLevel + '>' + inline(itemHeading[2]) + '</h' + itemLevel + '></li>');
        } else if (/^>\\s?/.test(item)) {
          html.push('<li><blockquote>' + inline(item.replace(/^>\\s?/, '')) + '</blockquote></li>');
        } else {
          html.push('<li>' + inline(item) + '</li>');
        }
      } else if (/^>\s?/.test(line)) {
        closeList();
        html.push('<blockquote>' + inline(line.replace(/^>\s?/, '')) + '</blockquote>');
      } else if (/^ {4}/.test(line)) {
        closeList();
        html.push('<pre><code>' + inline(line.slice(4)) + '</code></pre>');
      } else if (line.trim() === '') {
        closeList();
      } else {
        closeList();
        html.push('<p>' + inline(line) + '</p>');
      }
    });

    closeList();
    return html.join('');
  }

  function htmlToMarkdown(root) {
    function inline(node) {
      if (node.nodeType === 3) return node.nodeValue;
      if (node.nodeType !== 1) return '';

      var tag = node.tagName.toLowerCase();
      var text = Array.prototype.map.call(node.childNodes, inline).join('');

      if (tag === 'strong' || tag === 'b') return '**' + text + '**';
      if (tag === 'em' || tag === 'i') return '*' + text + '*';
      if (tag === 's' || tag === 'strike' || tag === 'del') return '~~' + text + '~~';
      if (tag === 'code') return '\x60' + text + '\x60';
      if (tag === 'a') return '[' + text + '](' + (node.getAttribute('href') || '') + ')';
      if (tag === 'br') return '\n';

      return text;
    }

    function block(node) {
      if (node.nodeType === 3) return node.nodeValue;
      if (node.nodeType !== 1) return '';

      var tag = node.tagName.toLowerCase();

      if (/^h[1-6]$/.test(tag)) {
        return '#'.repeat(Number(tag.charAt(1))) + ' ' +
          Array.prototype.map.call(node.childNodes, inline).join('').trim();
      }

      if (tag === 'blockquote') {
        var quote = Array.prototype.map.call(node.childNodes, inline).join('').trim();
        return quote.split('\n').map(function (line) {
          return '> ' + line;
        }).join('\n');
      }

      if (tag === 'ul' || tag === 'ol') {
        var ordered = tag === 'ol';

        return Array.prototype.map.call(node.children, function (item, index) {
          var marker = ordered ? (index + 1) + '. ' : '- ';
          var childBlocks = Array.prototype.filter.call(item.childNodes, function (child) {
            return child.nodeType === 1 && /^(H[1-6]|BLOCKQUOTE|PRE|P|DIV|UL|OL)$/.test(child.tagName);
          });

          if (childBlocks.length === 1 && /^H[1-6]$/.test(childBlocks[0].tagName)) {
            var heading = childBlocks[0];
            var level = Number(heading.tagName.charAt(1));
            var headingText = Array.prototype.map.call(heading.childNodes, inline).join('').trim();
            return marker + '#'.repeat(level) + ' ' + headingText;
          }

          if (childBlocks.length === 1 && childBlocks[0].tagName === 'BLOCKQUOTE') {
            var quote = Array.prototype.map.call(childBlocks[0].childNodes, inline).join('').trim();
            return marker + '> ' + quote;
          }

          var itemText = Array.prototype.map.call(item.childNodes, inline).join('').trim();
          return marker + itemText;
        }).join('\\n');
      }

      if (tag === 'pre') {
        return node.textContent.split('\n').map(function (line) {
          return '    ' + line;
        }).join('\n').trim();
      }

      if (tag === 'p' || tag === 'div') {
        return Array.prototype.map.call(node.childNodes, inline).join('').trim();
      }

      return inline(node).trim();
    }

    return Array.prototype.map.call(root.childNodes, block)
      .map(function (value) { return value.trim(); })
      .filter(Boolean)
      .join('\n\n');
  }

  function closestBlock(node, root) {
    var current = node && node.nodeType === 3 ? node.parentNode : node;

    while (current && current !== root) {
      if (
        current.nodeType === 1 &&
        /^(P|DIV|H1|H2|H3|H4|H5|H6|BLOCKQUOTE|LI|PRE)$/.test(current.tagName)
      ) {
        return current;
      }
      current = current.parentNode;
    }

    return root;
  }

  function saveSelection(root) {
    var selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || !root.contains(selection.anchorNode)) {
      return null;
    }

    return selection.getRangeAt(0).cloneRange();
  }

  function restoreSelection(range) {
    if (!range) return;

    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function selectionInside(root) {
    var selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    return root.contains(selection.getRangeAt(0).commonAncestorContainer);
  }

  function linkSelectedText(root) {
    if (!selectionInside(root)) return;

    var selection = window.getSelection();
    if (!selection.toString()) return;

    var url = window.prompt('Link URL', 'https://');
    if (!url) return;

    document.execCommand('createLink', false, url);
  }

  var CabiloTextEditor = createClass({
    getInitialState: function () {
      return {
        mode: 'rich_text',
        rawValue: this.props.value || '',
        heading: 'h1',
      };
    },

    componentDidMount: function () {
      this.syncRichText();
    },

    componentDidUpdate: function (previousProps, previousState) {
      if (this.state.mode === 'rich_text' && !this.isEditing) {
        if (
          previousProps.value !== this.props.value ||
          previousState.mode !== this.state.mode
        ) {
          this.syncRichText();
        }
      }
    },

    syncRichText: function () {
      if (!this.richNode) return;

      var html = markdownToHtml(this.props.value || '');

      if (this.richNode.innerHTML !== html) {
        this.richNode.innerHTML = html;
      }
    },

    setMode: function (mode) {
      if (mode === this.state.mode) return;

      if (mode === 'raw') {
        this.setState({
          mode: 'raw',
          rawValue: this.props.value || '',
        });
        return;
      }

      this.setState({
        mode: 'rich_text',
        rawValue: this.props.value || '',
      }, function () {
        this.syncRichText();
      });
    },

    emitMarkdown: function () {
      if (!this.richNode) return;
      this.props.onChange(htmlToMarkdown(this.richNode));
    },

    rememberSelection: function () {
      if (this.richNode && selectionInside(this.richNode)) {
        this.savedSelection = saveSelection(this.richNode);
      }
    },

    focusEditor: function () {
      if (!this.richNode) return;

      this.richNode.focus();

      if (this.savedSelection) {
        restoreSelection(this.savedSelection);
      }
    },

    execInline: function (command, value) {
      this.focusEditor();
      document.execCommand(command, false, value || null);
      this.emitMarkdown();
    },

    formatBlock: function (tagName) {
      if (!this.richNode) return;

      this.focusEditor();

      var selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      var range = selection.getRangeAt(0);
      var block = closestBlock(range.commonAncestorContainer, this.richNode);

      if (
        /^h[1-6]$/.test(tagName) &&
        block &&
        block !== this.richNode &&
        block.tagName === 'P' &&
        !range.collapsed &&
        range.startContainer === range.endContainer
      ) {
        var selected = range.toString();

        if (selected) {
          var textNode = range.startContainer;

          if (textNode.nodeType === 3) {
            var parent = block.parentNode;
            var beforeText = textNode.nodeValue.slice(0, range.startOffset);
            var afterText = textNode.nodeValue.slice(range.endOffset);

            var fragmentBefore = document.createDocumentFragment();
            var fragmentAfter = document.createDocumentFragment();

            if (beforeText) {
              var beforeP = document.createElement('p');
              beforeP.textContent = beforeText;
              fragmentBefore.appendChild(beforeP);
            }

            var heading = document.createElement(tagName);
            heading.textContent = selected;
            fragmentBefore.appendChild(heading);

            if (afterText) {
              var afterP = document.createElement('p');
              afterP.textContent = afterText;
              fragmentAfter.appendChild(afterP);
            }

            parent.insertBefore(fragmentBefore, block);
            if (fragmentAfter.firstChild) {
              parent.insertBefore(fragmentAfter, block);
            }
            parent.removeChild(block);

            this.emitMarkdown();
            return;
          }
        }
      }

      document.execCommand('formatBlock', false, tagName);
      this.emitMarkdown();
    },

    toggleQuote: function () {
      if (!this.richNode) return;

      this.focusEditor();

      var selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      var block = closestBlock(selection.getRangeAt(0).commonAncestorContainer, this.richNode);

      if (block && block.tagName === 'BLOCKQUOTE') {
        document.execCommand('formatBlock', false, 'p');
      } else {
        document.execCommand('formatBlock', false, 'blockquote');
      }

      this.emitMarkdown();
    },

    toggleList: function (ordered) {
      if (!this.richNode) return;

      this.focusEditor();
      var selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      var block = closestBlock(selection.getRangeAt(0).commonAncestorContainer, this.richNode);

      /*
       * Preserve block semantics when a list is created from a heading or
       * quote. execCommand may otherwise replace the block with a plain LI.
       */
      if (
        block &&
        block !== this.richNode &&
        /^(H[1-6]|BLOCKQUOTE)$/.test(block.tagName) &&
        block.parentNode === this.richNode
      ) {
        var list = document.createElement(ordered ? 'ol' : 'ul');
        var item = document.createElement('li');

        block.parentNode.insertBefore(list, block);
        list.appendChild(item);
        item.appendChild(block);

        this.emitMarkdown();
        return;
      }

      document.execCommand(
        ordered ? 'insertOrderedList' : 'insertUnorderedList',
        false,
        null
      );

      this.emitMarkdown();
    },

    toggleCode: function () {
      if (!this.richNode) return;

      this.focusEditor();

      var selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      var block = closestBlock(selection.getRangeAt(0).commonAncestorContainer, this.richNode);

      if (block && block.tagName === 'PRE') {
        document.execCommand('formatBlock', false, 'p');
      } else {
        document.execCommand('formatBlock', false, 'pre');
      }

      this.emitMarkdown();
    },

    clearFormatting: function () {
      if (!this.richNode) return;

      this.focusEditor();
      document.execCommand('removeFormat', false, null);
      document.execCommand('formatBlock', false, 'p');
      this.emitMarkdown();
    },

    handleInput: function () {
      this.isEditing = true;
      this.rememberSelection();
      this.emitMarkdown();
      this.isEditing = false;
    },

    handleRawChange: function (event) {
      var value = event.target.value;
      this.setState({ rawValue: value });
      this.props.onChange(value);
    },

    renderToolbarButton: function (label, title, handler) {
      return h('button', {
        type: 'button',
        className: 'cabilo-text-toolbar-button',
        title: title,
        disabled: this.state.mode === 'raw',
        onMouseDown: function (event) {
          event.preventDefault();

          if (this.state.mode === 'rich_text') {
            this.rememberSelection();
            handler();
          }
        }.bind(this),
      }, label);
    },

    renderHeadingButton: function (level) {
      return this.renderToolbarButton('H' + level, 'Heading ' + level, function () {
        this.formatBlock('h' + level);
      }.bind(this));
    },

    render: function () {
      var raw = this.state.mode === 'raw';

      return h('div', { className: 'cabilo-text-editor' },
        h('div', { className: 'cabilo-text-toolbar' },
          this.renderToolbarButton('B', 'Bold', function () {
            this.execInline('bold');
          }.bind(this)),
          this.renderToolbarButton('I', 'Italic', function () {
            this.execInline('italic');
          }.bind(this)),
          this.renderToolbarButton('S', 'Strikethrough', function () {
            this.execInline('strikeThrough');
          }.bind(this)),
          h('div', { className: 'cabilo-text-toolbar-divider' }),
          this.renderHeadingButton(1),
          this.renderHeadingButton(2),
          this.renderHeadingButton(3),
          this.renderHeadingButton(4),
          this.renderHeadingButton(5),
          this.renderHeadingButton(6),
          h('div', { className: 'cabilo-text-toolbar-divider' }),
          this.renderToolbarButton('Quote', 'Toggle quote', function () {
            this.toggleQuote();
          }.bind(this)),
          this.renderToolbarButton('• List', 'Bulleted list', function () {
            this.toggleList(false);
          }.bind(this)),
          this.renderToolbarButton('1. List', 'Numbered list', function () {
            this.toggleList(true);
          }.bind(this)),
          this.renderToolbarButton('Code', 'Toggle code block', function () {
            this.toggleCode();
          }.bind(this)),
          this.renderToolbarButton('Link', 'Add link', function () {
            linkSelectedText(this.richNode);
            this.emitMarkdown();
          }.bind(this)),
          this.renderToolbarButton('Clear', 'Clear formatting', function () {
            this.clearFormatting();
          }.bind(this)),
          h('div', { className: 'cabilo-text-mode' },
            h('button', {
              type: 'button',
              className: 'cabilo-text-mode-button' + (raw ? '' : ' is-active'),
              onClick: function () {
                this.setMode('rich_text');
              }.bind(this),
            }, 'Rich text'),
            h('button', {
              type: 'button',
              className: 'cabilo-text-mode-button' + (raw ? ' is-active' : ''),
              onClick: function () {
                this.setMode('raw');
              }.bind(this),
            }, 'Markdown')
          )
        ),
        raw
          ? h('textarea', {
              className: 'cabilo-text-raw',
              value: this.state.rawValue,
              onChange: this.handleRawChange,
              spellCheck: false,
            })
          : h('div', {
              className: 'cabilo-text-rich',
              contentEditable: true,
              suppressContentEditableWarning: true,
              ref: function (node) {
                this.richNode = node;
              }.bind(this),
              onInput: this.handleInput,
              onMouseUp: this.rememberSelection,
              onKeyUp: this.rememberSelection,
              onFocus: function () {
                this.isEditing = true;
                this.rememberSelection();
              }.bind(this),
              onBlur: function () {
                this.isEditing = false;
                this.rememberSelection();
              }.bind(this),
            })
      );
    },
  });

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
      this.startInspectorPopover();
    },

    componentDidUpdate: function () {
      this.updateInspectorPopover();
    },

    componentWillUnmount: function () {
      this.stopInspectorPopover();
      document.removeEventListener('keydown', this.handleKeyDown);
      document.removeEventListener('pointermove', this.handlePointerMove);
      document.removeEventListener('pointerup', this.handlePointerUp);
    },

    startInspectorPopover: function () {
      if (this.inspectorFrame) return;

      this.updateInspectorPopover = this.updateInspectorPopover.bind(this);
      this.inspectorScrollHandler = this.updateInspectorPopover;

      window.addEventListener('scroll', this.inspectorScrollHandler, true);
      window.addEventListener('resize', this.inspectorScrollHandler);

      this.inspectorFrame = requestAnimationFrame(this.updateInspectorPopover);
    },

    stopInspectorPopover: function () {
      if (this.inspectorFrame) cancelAnimationFrame(this.inspectorFrame);
      this.inspectorFrame = null;

      if (this.inspectorScrollHandler) {
        window.removeEventListener('scroll', this.inspectorScrollHandler, true);
        window.removeEventListener('resize', this.inspectorScrollHandler);
      }

      this.inspectorScrollHandler = null;

      if (
        this.inspectorNode &&
        typeof this.inspectorNode.hidePopover === 'function' &&
        this.inspectorNode.matches(':popover-open')
      ) {
        this.inspectorNode.hidePopover();
      }
    },

    updateInspectorPopover: function () {
      if (this.inspectorFrame) {
        cancelAnimationFrame(this.inspectorFrame);
      }

      this.inspectorFrame = requestAnimationFrame(function () {
        this.inspectorFrame = null;

        if (!this.inspectorNode) return;

        var widget = this.inspectorNode.closest('.cabilo-layout-widget');
        if (!widget) return;

        var rect = widget.getBoundingClientRect();
        var visible =
          rect.bottom > 0 &&
          rect.top < window.innerHeight &&
          rect.right > 0 &&
          rect.left < window.innerWidth;

        if (typeof this.inspectorNode.showPopover !== 'function') {
          return;
        }

        if (visible) {
          if (!this.inspectorNode.matches(':popover-open')) {
            try {
              this.inspectorNode.showPopover();
            } catch (error) {
              // The browser may already be transitioning the popover.
            }
          }
        } else if (this.inspectorNode.matches(':popover-open')) {
          this.inspectorNode.hidePopover();
        }
      }.bind(this));
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

    updateSelectedBlock: function (updater) {
      var blocks = this.getBlocks();
      var selectedId = this.state.selectedId;
      var index = blocks.findIndex(function (block) {
        return block.id === selectedId;
      });

      if (index === -1) return;

      var nextBlock = updater(clone(blocks[index]));
      blocks[index] = normalizeBlock(nextBlock);
      this.updateBlocks(blocks);
    },

    setFitMode: function (mode) {
      this.updateSelectedBlock(function (block) {
        block.fitMode = mode;
        delete block.matchAspectRatio;
        delete block.matchHeightToWidth;
        return block;
      });
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
        return h('div', {
        className: 'cabilo-layout-inspector',
        popover: 'manual',
        ref: function (node) {
          this.inspectorNode = node;
          if (node) this.updateInspectorPopover();
        }.bind(this),
      },
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
        contentControl = this.renderField('Content', h(CabiloTextEditor, {
          value: selected.content || '',
          onChange: function (value) {
            this.updateSelectedField('content', value);
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

      return h('div', {
        className: 'cabilo-layout-inspector',
        popover: 'manual',
        ref: function (node) {
          this.inspectorNode = node;
          if (node) this.updateInspectorPopover();
        }.bind(this),
      },
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
          this.renderField('Asset fit', h('select', {
            value: selected.fitMode,
            onChange: function (event) {
              this.setFitMode(event.target.value);
            }.bind(this),
          },
            [
              ['none', 'None'],
              ['width-to-height', 'Width → Height'],
              ['height-to-width', 'Height → Width'],
            ].map(function (option) {
              return h('option', {
                key: option[0],
                value: option[0],
              }, option[1]);
            })
          )),
          selected.type !== 'text'
            ? this.renderField('Asset alignment', h('select', {
                value: selected.assetAlignment,
                onChange: function (event) {
                  this.updateSelectedField('assetAlignment', event.target.value);
                }.bind(this),
              },
                [
                  ['auto', 'Automatic'],
                  ['left', 'Left'],
                  ['center', 'Center'],
                  ['right', 'Right'],
                ].map(function (option) {
                  return h('option', {
                    key: option[0],
                    value: option[0],
                  }, option[1]);
                })
              ))
            : null,
          selected.type !== 'text'
            ? this.renderField('Fit to viewport (max 75vh)', h('input', {
                type: 'checkbox',
                checked: selected.fitToViewport !== false,
                style: { width: 'auto' },
                onChange: function (event) {
                  this.updateSelectedField('fitToViewport', event.target.checked);
                }.bind(this),
              }))
            : null,
          (selected.type === 'image' || selected.type === 'turntable' || selected.type === 'aov')
            ? this.renderField(
                selected.type === 'image' ? 'Compress image (WebP)' :
                selected.type === 'turntable' ? 'Compress frames (WebP)' :
                'Compress images (WebP)',
                h('input', {
                  type: 'checkbox',
                  checked: selected.compress !== false,
                  style: { width: 'auto' },
                  onChange: function (event) {
                    this.updateSelectedField('compress', event.target.checked);
                  }.bind(this),
                })
              )
            : null,
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
