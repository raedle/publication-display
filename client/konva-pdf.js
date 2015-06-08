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
        this.maxHeight != this.getMaxHeight()) {

        if (this.renderedUrl === this.getUrl()) {
          this.renderPage(this.pdf, this.getPage());
        } else {
          this.renderDocumentInCanvas(this.getUrl(), this.getPage());
        }

        this.renderedUrl = this.getUrl();
        this.renderedPage = this.getPage();
        this.maxHeight = this.getMaxHeight();
      }

      // var steps = Math.ceil(Math.log(this.canvas.width / this.getWidth()) / Math.log(2));
      //
      // if (!isFinite(steps)) return;
      //
      // /// step 1 - create off-screen canvas
      // var oc = document.createElement('canvas'),
      //   octx = oc.getContext('2d');
      //
      // oc.width = this.canvas.width * 0.5;
      // oc.height = this.canvas.height * 0.5;
      //
      // octx.drawImage(this.canvas, 0, 0, oc.width, oc.height);
      //
      // /// step 2
      // octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);
      //
      // /// step 3
      // context.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5, 0, 0, this.getWidth(), this.getHeight());

      // context.scale(this.getWidth() / this.canvas.width, this.getHeight() / this.canvas.height);
      //
      context.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height);
      // context.drawImage(this.canvas, 0, 0, this.getWidth(), this.getHeight());
      // context.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.getWidth(), this.getHeight());

      context.fillStrokeShape(this);
    },
    _hitFunc: function(context) {
      context.beginPath();
      context.rect(0, 0, this.getWidth(), this.getHeight());
      context.closePath();
      context.fillStrokeShape(this);
    },
    renderDocumentInCanvas: function(url, page) {

      var that = this;

      /* In your Template.xxx.rendered */
      // Set worker URL to package assets
      PDFJS.workerSrc = '/packages/pascoual_pdfjs/build/pdf.worker.js';

      PDFJS.maxCanvasPixels = -1;

      // Create PDF
      PDFJS.getDocument('/download?url=' + url).then(function(pdf) {

        // set pdf document
        that.pdf = pdf;

        // render page in canvas
        that.renderPage(pdf, page);
      });
    },
    renderPage: function(pdf, page) {
      var that = this;

      // flag to indicate whether page is currently rendered
      that.isRenderingPage = true;

      pdf.getPage(page).then(function(page) {

        // parent or containing component
        var parent = that.getParent();

        var desiredWidth = parent.getWidth();
        var desiredHeight = parent.getHeight();

        console.log('des: ' + desiredWidth);

        var defaultViewport = page.getViewport(1.0);
        var scaleX = desiredWidth / defaultViewport.width;
        var scaleY = desiredHeight / defaultViewport.height;
        var desiredScale = Math.min(scaleX, scaleY);
        var newWidth = Math.min(desiredWidth, defaultViewport.width * desiredScale);
        var newHeight = Math.min(desiredHeight, defaultViewport.height * desiredScale);
        that.setWidth(newWidth);
        that.setHeight(newHeight);

        var viewport = page.getViewport(desiredScale);

        // // set width and height of pdf component based on default viewport of
        // // pdf
        // // var desiredWidth = that.getMaxWidth() ? that.getMaxWidth() : parent.getWidth();
        // // var desiredHeight = that.getMaxHeight() ? that.getMaxHeight() : parent.getHeight();
        // var desiredWidth = parent.getWidth();
        // var desiredHeight = parent.getHeight();
        //
        // // desiredWidth = Math.min(desiredWidth, that.getMaxWidth() ? that.getMaxWidth() : parent.getWidth());
        // // desiredHeight = Math.min(desiredHeight, that.getMaxHeight() ? that.getMaxHeight() : parent.getHeight());
        //
        // // console.log(desiredHeight);
        //
        // // calculate scale and viewport dependent on parent
        // var defaultViewport = page.getViewport(1.0);
        // var scaleX = desiredWidth / defaultViewport.width;
        // var scaleY = desiredHeight / defaultViewport.height;
        // var desiredScale = Math.min(scaleX, scaleY);
        // // var newWidth = Math.min(desiredWidth, defaultViewport.width * desiredScale);
        // // var newHeight = Math.min(desiredHeight, defaultViewport.height * desiredScale);
        // // that.setWidth(newWidth);
        // // that.setHeight(newHeight);

        // Prepare canvas using PDF page dimensions
        var context = that.canvas.getContext('2d');
        that.canvas.height = viewport.height;
        that.canvas.width = viewport.width;
        that.setWidth(viewport.width);
        that.setHeight(viewport.height);
        // that.getStage().setWidth(viewport.width);
        // that.getStage().setHeight(viewport.height);

        // var inverseScale = (1.0 * desiredScale) / scale;
        // console.log(inverseScale);
        //
        // var stage = that.getStage();
        //
        // console.log(stage);
        //
        // var paperLayer = stage.findOne('#paper-layer');
        //
        // console.log(paperLayer);
        //
        // var $paperLayer = $(paperLayer.canvas._canvas);
        //
        // console.log($paperLayer);
        //
        // // var $paperLayer = $(paperLayer);
        // //
        // $paperLayer.css('transform', 'scale(' + inverseScale + ')');
        // $paperLayer.css('transform-origin', '0 0 0');
        //
        // $paperLayer.css('-webkit-transform', 'scale(' + inverseScale + ')');
        // $paperLayer.css('-webkit-transform-origin', '0 0 0');

        // Render PDF page into canvas context
        page.render({
          canvasContext: context,
          viewport: viewport,
          intent: 'print'
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
        throw new Meteor.Error('rendering in progress')
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
        throw new Meteor.Error('rendering in progress')
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
