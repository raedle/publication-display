(function() {

  /**
   * Pdf constructor.
   * @constructor
   * @memberof Konva
   * @param {Object} config
   */
  Konva.Pdf = function(config) {
    this.___init(config);
  };

  Konva.Pdf.prototype = {
    ___init: function(config) {

      var that = this;

      // hook into Konva tree rendering to update page rendering on property
      // changes
      var _draw = Konva.Node.prototype.draw;
      Konva.Node.prototype.draw = function() {
        that._updatePage.call(that);
        _draw.call(this);
      };

      Konva.Shape.call(this, config);
      this.className = 'Pdf';
      this.sceneFunc(this._sceneFunc);
      this.hitFunc(this._hitFunc);
      this.canvas = document.createElement('canvas');
    },
    _updatePage: function() {
      if (this._document !== this.getDocument()) {
        this.renderPage(1);
      }
      else if (this._page !== this.getPage() ||
        this._maxHeight !== this.getMaxHeight()) {
        this.renderPage(this.getPage());
      }

      // update private variables to only render if parameters changed
      this._document = this.getDocument();
      this._page = this.getPage();
      this._maxHeight = this.getMaxHeight();

      return this;
    },
    _sceneFunc: function(context) {
      context.drawImage(this.canvas, 0, 0, this.getWidth(), this.getHeight());
      context.fillStrokeShape(this);
    },
    _hitFunc: function(context) {
      context.beginPath();
      context.rect(0, 0, this.getWidth(), this.getHeight());
      context.closePath();
      context.fillStrokeShape(this);
    },
    renderPage: function(pageNumber) {

      var that = this;

      var pdfDocument = that.getDocument();

      // ignore if pdf document is undefined
      if (!pdfDocument) return;

      // flag to indicate whether page is currently rendered
      that.isRenderingPage = true;

      pdfDocument.getPage(pageNumber).then(function(page) {

        // parent or containing component
        var parent = that.getParent();
        var desiredWidth = parent.getWidth();
        var desiredHeight = parent.getHeight();
        desiredWidth = Math.min(desiredWidth, that.getMaxWidth() ? that.getMaxWidth() : parent.getWidth());
        desiredHeight = Math.min(desiredHeight, that.getMaxHeight() ? that.getMaxHeight() : parent.getHeight());

        var context = that.canvas.getContext('2d');

        // clear offscreen canvas
        context.clearRect(0, 0, that.canvas.width, that.canvas.height);

        var rotation = that.getRotation();
        console.log(rotation);

        var viewport = page.getViewport(1.0, rotation);
        var scale = 1.0;

        var layer = that.getLayer();
        if (layer.customNodeType && layer.customNodeType === 'PrintLayer') {
          scale = layer.getDpi() / 72;
          viewport = page.getViewport(scale, rotation);
        }

        // Prepare canvas using PDF page dimensions
        that.canvas.height = viewport.height;
        that.canvas.width = viewport.width;

        var defaultViewport = page.getViewport(1.0, rotation);
        var scaleX = desiredWidth / defaultViewport.width;
        var scaleY = desiredHeight / defaultViewport.height;
        var desiredScale = Math.min(scaleX, scaleY);
        var newWidth = Math.min(desiredWidth, defaultViewport.width * desiredScale);
        var newHeight = Math.min(desiredHeight, defaultViewport.height * desiredScale);
        that.setWidth(newWidth);
        that.setHeight(newHeight);

        console.log(viewport);

        // Render PDF page into canvas context
        page.render({
          canvasContext: context,
          viewport: viewport //,
            // intent: 'print'
        }).promise.then(function() {

          // console.log('redraw2');
          //
          // // redraw parent after page was rendered
          // parent.draw();

          // set page as rendered
          that.isRenderingPage = false;
          
          if (that.getOnRendered()) {
            that.getOnRendered().call(that, page);
          }
        });
      });
    },
    nextPage: function() {
      if (!this.getDocument()) {
        throw new Meteor.Error('no pdf document loaded');
      }

      if (this.isRenderingPage) {
        throw new Meteor.Error('rendering in progress');
      }

      var parent = this.getParent();

      var currentPage = this.getPage();
      if (currentPage < this.getDocument().numPages) {
        this.setPage(++currentPage);
      }

      // redraw parent
      parent.draw();
    },
    previousPage: function() {
      if (!this.getDocument()) {
        throw new Meteor.Error('no pdf document loaded');
      }

      if (this.isRenderingPage) {
        throw new Meteor.Error('rendering in progress');
      }

      var parent = this.getParent();

      var currentPage = this.getPage();
      if (currentPage > 1) {
        this.setPage(--currentPage);
      }

      // redraw parent
      parent.draw();
    }
  };

  Konva.Util.extend(Konva.Pdf, Konva.Shape);

  Konva.Factory.addGetterSetter(Konva.Pdf, 'document', undefined);

  /**
   * set document
   * @name setDocument
   * @method
   * @memberof Konva.Pdf.prototype
   * @param {PDFDocumentProxy} document. The default is undefined
   */

  /**
   * get document
   * @name getDocument
   * @method
   * @memberof Konva.Pdf.prototype
   */

  Konva.Factory.addGetterSetter(Konva.Pdf, 'page', 1);

  /**
   * set page
   * @name setPage
   * @method
   * @memberof Konva.Pdf.prototype
   * @param {Number} page. The default is 1
   */

  /**
   * get page
   * @name getPage
   * @method
   * @memberof Konva.Pdf.prototype
   */
  Konva.Factory.addGetterSetter(Konva.Pdf, 'maxWidth', undefined);

  /**
   * set maxWidth
   * @name setMaxWidth
   * @method
   * @memberof Konva.Pdf.prototype
   * @param {Number} maxWidth. The default is undefined and parent width is used
   */

  /**
   * get maxWidth
   * @name getMaxWidth
   * @method
   * @memberof Konva.Pdf.prototype
   */

  Konva.Factory.addGetterSetter(Konva.Pdf, 'maxHeight', undefined);

  /**
   * set maxHeight
   * @name setMaxHeight
   * @method
   * @memberof Konva.Pdf.prototype
   * @param {Number} maxHeight. The default is undefined and parent height is used
   */

  /**
   * get maxHeight
   * @name getMaxHeight
   * @method
   * @memberof Konva.Pdf.prototype
   */

  Konva.Factory.addGetterSetter(Konva.Pdf, 'onRendered', undefined);

  /**
   * set onRendered
   * @name setOnRendered
   * @method
   * @memberof Konva.Pdf.prototype
   * @param {Function} onRendered. The default is undefined
   */

  /**
   * get onRendered
   * @name getOnRendered
   * @method
   * @memberof Konva.Pdf.prototype
   */

  Konva.Collection.mapMethods(Konva.Pdf);
})();
