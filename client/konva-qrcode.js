(function() {

  /**
   * QrCode constructor.
   * @constructor
   * @memberof Konva
   * @param {Object} config
   */
  Konva.QrCode = function(config) {
    this.___init(config);
  };

  Konva.QrCode.prototype = {
    ___init: function(config) {
      Konva.Shape.call(this, config);
      this.className = 'QrCode';
      this.sceneFunc(this._sceneFunc);
      this.hitFunc(this._hitFunc);
    },
    _sceneFunc: function(context) {

      // create the qrcode itself
      var qrcode = new QRCode(-1, QRErrorCorrectLevel.H);
      qrcode.addData(this.getText());
      qrcode.make();

      // compute tileW/tileH based on options.width/options.height
      var tileW = this.getWidth() / qrcode.getModuleCount();
      var tileH = this.getHeight() / qrcode.getModuleCount();

      // draw in the canvas
      for (var row = 0; row < qrcode.getModuleCount(); row++) {
        for (var col = 0; col < qrcode.getModuleCount(); col++) {
          context.fillStyle = qrcode.isDark(row, col) ? this.getForeground() : this.getBackground();
          var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
          var h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
          context.fillRect(Math.round(col * tileW), Math.round(row * tileH), w, h);
        }
      }

      context.fillStrokeShape(this);
    },
    _hitFunc: function(context) {
      context.beginPath();
      context.rect(0, 0, this.getWidth(), this.getHeight());
      context.closePath();
      context.fillStrokeShape(this);
    },
  };

  Konva.Util.extend(Konva.QrCode, Konva.Shape);

  Konva.Factory.addGetterSetter(Konva.QrCode, 'text', 'Hello World!');

  /**
   * set text
   * @name setText
   * @method
   * @memberof Konva.QrCode.prototype
   * @param {String} text. The default is 'Hello World!'
   */

  /**
   * get text
   * @name getText
   * @method
   * @memberof Konva.QrCode.prototype
   */

  Konva.Factory.addGetterSetter(Konva.QrCode, 'background', '#ffffff');

  /**
   * set background color
   * @name setBackground
   * @method
   * @memberof Konva.QrCode.prototype
   * @param {String} background color. The default is #000000
   */

  /**
   * get background color
   * @name getBackground
   * @method
   * @memberof Konva.QrCode.prototype
   */

  Konva.Factory.addGetterSetter(Konva.QrCode, 'foreground', '#000000');

  /**
   * set foreground color
   * @name setForeground
   * @method
   * @memberof Konva.QrCode.prototype
   * @param {String} foreground
   */

  /**
   * get foreground color
   * @name getForeground
   * @method
   * @memberof Konva.QrCode.prototype
   */

  Konva.Collection.mapMethods(Konva.QrCode);
})();
