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
      if (this.renderedUrl != this.getUrl() || this.renderedPage != this.getPage() ||
      this.renderQuality != this.getRenderQuality()) {
        this.renderedUrl = this.getUrl();
        this.renderedPage = this.getPage();
        this.renderQuality = this.getRenderQuality();
        this.renderPageInCanvas(this.getUrl(), this.getPage());
      }

      // context.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height);
      context.drawImage(this.canvas, 0, 0, this.getWidth(), this.getHeight());

      context.fillStrokeShape(this);
    },
    _hitFunc: function(context) {
      context.beginPath();
      context.rect(0, 0, this.getWidth(), this.getHeight());
      context.closePath();
      context.fillStrokeShape(this);
    },
    renderPageInCanvas: function(url, page) {

      var that = this;

      /* In your Template.xxx.rendered */
      // Set worker URL to package assets
      PDFJS.workerSrc = '/packages/pascoual_pdfjs/build/pdf.worker.js';

      PDFJS.maxCanvasPixels = -1;

      // Create PDF
      PDFJS.getDocument('/download?url=' + url).then(function(pdf) {

        // set pdf document
        that.pdf = pdf;

        pdf.getPage(page).then(function(page) {

          // parent or containing component
          var parent = that.getParent();

          // 72DPI is the default render quality
          var scale = that.getRenderQuality() / 72;
          var viewport = page.getViewport(scale);

          // set width and height of pdf component based on default viewport of
          // pdf
          var desiredWidth = parent.getWidth();
          var desiredHeight = parent.getHeight();

          // calculate scale and viewport dependent on parent
          var defaultViewport = page.getViewport(1.0);
          var scaleX = desiredWidth / defaultViewport.width;
          var scaleY = desiredHeight / defaultViewport.height;
          var desiredScale = Math.min(scaleX, scaleY);
          var newWidth = Math.min(desiredWidth, defaultViewport.width * desiredScale);
          var newHeight = Math.min(desiredHeight, defaultViewport.height * desiredScale);
          that.setWidth(newWidth);
          that.setHeight(newHeight);

          // Prepare canvas using PDF page dimensions
          var context = that.canvas.getContext('2d');
          that.canvas.height = viewport.height;
          that.canvas.width = viewport.width;

          // Render PDF page into canvas context
          page.render({
            canvasContext: context,
            viewport: viewport,
            intent: 'print'
          }).promise.then(function() {
            // redraw parent after page was rendered
            parent.draw();
          });
        });
      });
    },
    nextPage: function() {
      if (!this.pdf) {
        throw new Meteor.Error('no pdf document loaded');
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

  Konva.Factory.addGetterSetter(Konva.Pdf, 'renderQuality', 96);

  /**
   * set renderQuality
   * @name setRenderQuality
   * @method
   * @memberof Konva.Pdf.prototype
   * @param {Number} renderQuality. The default is 96
   */

  /**
   * get renderQuality
   * @name getRenderQuality
   * @method
   * @memberof Konva.Pdf.prototype
   */

  Konva.Collection.mapMethods(Konva.Pdf);
})();
