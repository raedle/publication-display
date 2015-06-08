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
      this.nodeType = 'PrintLayer';

      // // call super constructor
      Konva.Layer.call(this, config);
    },
    /**
     * get/set width of layer.getter return width of stage. setter doing nothing.
     * if you want change width use `stage.width(value);`
     * @name width
     * @method
     * @memberof Konva.BaseLayer.prototype
     * @returns {Number}
     * @example
     * var width = layer.width();
     */
    getWidth: function() {
        if (this.parent) {

          var dpi = this.getDpi();

          // 72DPI is the default render quality
          var scale = dpi / 72;

          return this.parent.getWidth() * scale;
        }
    },
    /**
     * get/set height of layer.getter return height of stage. setter doing nothing.
     * if you want change height use `stage.height(value);`
     * @name height
     * @method
     * @memberof Konva.BaseLayer.prototype
     * @returns {Number}
     * @example
     * var height = layer.height();
     */
    getHeight: function() {
        if (this.parent) {

          var dpi = this.getDpi();

          // 72DPI is the default render quality
          var scale = dpi / 72;

          return this.parent.getHeight() * scale;
        }
    },
    _setCanvasSize: function(width, height) {

      var dpi = this.getDpi();

      console.log(dpi);

      // 72DPI is the default render quality
      var scale = dpi / 72;
      var inverseScale = 1 / scale;

      var scaledWidth = width * scale;
      var scaledHeight = height * scale;

      console.log(width);
      console.log(scaledWidth);

      this.canvas.setSize(scaledWidth, scaledHeight);
      this.hitCanvas.setSize(scaledWidth, scaledHeight);

      this.setWidth(scaledWidth);
      this.setHeight(scaledHeight);

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
    }
  });

  Konva.Util.extend(Konva.PrintLayer, Konva.Layer);

  Konva.Factory.addGetterSetter(Konva.PrintLayer, 'dpi', 72);

  /**
   * set dpi
   * @name setDpi
   * @method
   * @memberof Konva.PrintLayer.prototype
   * @param {Number} dpi. The default is 96
   */

  /**
   * get dpi
   * @name getDpi
   * @method
   * @memberof Konva.PrintLayer.prototype
   */

  Konva.Collection.mapMethods(Konva.PrintLayer);
})();
