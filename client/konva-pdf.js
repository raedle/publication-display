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

      console.log(this.getPage());

      // render page to canvas if url or page changed since last rendering
      if (this.renderedUrl != this.getUrl() || this.renderedPage != this.getPage()) {
        this.renderedUrl = this.getUrl();
        this.renderedPage = this.getPage();
        this.renderPageInCanvas(this.getUrl(), this.getPage());
      }

      console.log('drawing pdf');
      context.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height);

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

      // Create PDF
      PDFJS.getDocument(url).then(function(pdf) {

        pdf.getPage(page).then(function(page) {
          var scale = 1.5;
          var viewport = page.getViewport(scale);

          // Prepare canvas using PDF page dimensions
          var context = that.canvas.getContext('2d');
          that.canvas.height = viewport.height;
          that.canvas.width = viewport.width;

          // set stage dimension to viewport width and viewport height
          var stage = that.getStage();
          stage.setWidth(viewport.width);
          stage.setHeight(viewport.height);

          // Render PDF page into canvas context
          page.render({ canvasContext: context, viewport: viewport }).promise.then(function () {

            // redraw parent after page was rendered
            var parent = that.getParent();
            parent.draw();
          });
        });
      });
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

  Konva.Collection.mapMethods(Konva.Pdf);
})();
