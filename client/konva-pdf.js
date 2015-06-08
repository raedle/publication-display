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
      Konva.Shape.call(this, config);
      this.className = 'Pdf';
      this.sceneFunc(this._sceneFunc);
      this.hitFunc(this._hitFunc);

      this.canvas = document.createElement('canvas');
      this.renderedUrl = undefined;
      this.renderedPage = undefined;
    },
    _sceneFunc: function(context) {

      // render page to canvas if url or page changed since last rendering
      if (this.renderedUrl != this.getUrl() ||
        this.renderedPage != this.getPage() ||
        this.rotation != this.getRotation() ||
        this.maxHeight != this.getMaxHeight()) {

        if (this.renderedUrl === this.getUrl()) {
          this.renderPage(this.pdf, this.getPage());
        } else {
          this.renderDocumentInCanvas(this.getUrl(), this.getPage());
        }

        this.renderedUrl = this.getUrl();
        this.renderedPage = this.getPage();
        this.rotation = this.getRotation();
        this.maxHeight = this.getMaxHeight();
      }

      // context.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height);
      context.drawImage(this.canvas, 0, 0, this.getWidth(), this.getHeight());
      // context.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.getWidth(), this.getHeight());

      context.fillStrokeShape(this);
    },
    _hitFunc: function(context) {
      context.beginPath();
      context.rect(0, 0, this.getWidth(), this.getHeight());
      context.closePath();
      context.fillStrokeShape(this);
    },
    renderDocumentInCanvas: function(url, pageNumber) {

      var that = this;
      var encodedUrl = encodeURIComponent(url);

      /* In your Template.xxx.rendered */
      // Set worker URL to package assets
      PDFJS.workerSrc = '/packages/pascoual_pdfjs/build/pdf.worker.js';

      PDFJS.maxCanvasPixels = -1;

      $('.progress-modal').css('display', 'block');

      // Create PDF
      PDFJS.getDocument('/download?url=' + encodedUrl).then(function(pdf) {
        // PDFJS.getDocument('HuddleLamp_ITS2014.pdf').then(function(pdf) {

        $('.progress-modal').css('display', 'none');

        // set pdf document
        that.pdf = pdf;

        // render page in canvas
        that.renderPage(pdf, pageNumber);
      });
    },
    renderPage: function(pdf, pageNumber) {
      var that = this;

      // flag to indicate whether page is currently rendered
      that.isRenderingPage = true;

      pdf.getPage(pageNumber).then(function(page) {

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

          // redraw parent after page was rendered
          parent.draw();

          // set page as rendered
          that.isRenderingPage = false;
        });
      });
    },
    nextPage: function() {
      if (!this.pdf) {
        throw new Meteor.Error('no pdf document loaded');
      }

      if (this.isRenderingPage) {
        throw new Meteor.Error('rendering in progress');
      }

      var parent = this.getParent();

      var currentPage = this.getPage();
      if (currentPage < this.pdf.numPages) {
        this.setPage(++currentPage);
      }

      // redraw parent
      parent.draw();
    },
    previousPage: function() {
      if (!this.pdf) {
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
    },
    rerender: function() {
      this.renderPage(this.pdf, this.renderedPage);
    }
  };

  Konva.Util.extend(Konva.Pdf, Konva.Shape);

  Konva.Factory.addGetterSetter(Konva.Pdf, 'url', undefined);

  /**
   * set url
   * @name setUrl
   * @method
   * @memberof Konva.Pdf.prototype
   * @param {String} text. The default is undefined
   */

  /**
   * get url
   * @name getUrl
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

  Konva.Factory.addGetterSetter(Konva.Pdf, 'rotation', 0);

  /**
   * set rotation
   * @name setRotation
   * @method
   * @memberof Konva.Pdf.prototype
   * @param {Number} rotation. The default is 0
   */

  /**
   * get rotation
   * @name getRotation
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

  Konva.Collection.mapMethods(Konva.Pdf);
})();
