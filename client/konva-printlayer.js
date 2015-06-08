(function() {

  'use strict';
    // constants
    var HASH = '#',
        BEFORE_DRAW = 'beforeDraw',
        DRAW = 'draw',

        /*
         * 2 - 3 - 4
         * |       |
         * 1 - 0   5
         *         |
         * 8 - 7 - 6
         */
        INTERSECTION_OFFSETS = [
            {x: 0, y: 0},  // 0
            {x: -1, y: 0}, // 1
            {x: -1, y: -1}, // 2
            {x: 0, y: -1}, // 3
            {x: 1, y: -1}, // 4
            {x: 1, y: 0}, // 5
            {x: 1, y: 1}, // 6
            {x: 0, y: 1}, // 7
            {x: -1, y: 1}  // 8
        ],
        INTERSECTION_OFFSETS_LEN = INTERSECTION_OFFSETS.length;

  /**
   * PrintLayer constructor.
   * @constructor
   * @memberof Konva
   * @param {Object} config
   */
  Konva.PrintLayer = function(config) {
    this.__initPrintLayer(config);
  };

  Konva.Util.addMethods(Konva.PrintLayer, {
    __initPrintLayer: function(config) {
      this.customNodeType = 'PrintLayer';

      // // call super constructor
      Konva.Layer.call(this, config);
    },
    _setCanvasSize: function(width, height) {

      var dpi = this.getDpi();

      // 72DPI is the default render quality
      var scale = dpi / 72;
      var inverseScale = 1 / scale;

      var scaledWidth = width * scale;
      var scaledHeight = height * scale;

      this.canvas.setSize(scaledWidth, scaledHeight);
      this.hitCanvas.setSize(scaledWidth, scaledHeight);

      // scale down to actual size
      var $printLayerCanvas = $(this.canvas._canvas);
      $printLayerCanvas.css({
        'transform': 'scale(' + inverseScale + ')',
        '-webkit-transform': 'scale(' + inverseScale + ')',
        '-moz-transform': 'scale(' + inverseScale + ')',
        '-o-transform': 'scale(' + inverseScale + ')',
        '-webkit-transform-origin': '0 0 0',
        '-moz-transform-origin': '0 0 0',
        '-o-transform-origin': '0 0 0',
        'transform-origin': '0 0 0'
      });
    },
    drawScene: function(can, top) {
        var layer = this.getLayer(),
            canvas = can || (layer && layer.getCanvas());

        this._fire(BEFORE_DRAW, {
            node: this
        });

        if(this.getClearBeforeDraw()) {
            canvas.getContext().clear();
        }


        var dpi = this.getDpi();

        // 72DPI is the default render quality
        var scale = dpi / 72;
        var inverseScale = 1 / scale;

        canvas.getContext().scale(scale, scale);

        Konva.Container.prototype.drawScene.call(this, canvas, top);

        this._fire(DRAW, {
            node: this
        });

        canvas.getContext().scale(inverseScale, inverseScale);

        return this;
    },
    getDpi: function() {
      if (!this.attrs['dpi']) {
        this.attrs['dpi'] = 72;
      }
      return this.attrs['dpi'];
    },
    setDpi: function(dpi) {
      this.attrs['dpi'] = dpi;
      this._setCanvasSize(this.getWidth(), this.getHeight());
    }
  });

  Konva.Util.extend(Konva.PrintLayer, Konva.Layer);
  Konva.Collection.mapMethods(Konva.PrintLayer);
})();
