(function() {

  var pdfDocument;
  var page;
  var pageScale;
  var canvas;
  var isInvalid = false;

  var updatePage = function() {
    if (pdfDocument !== this.getDocument()) {
      renderPage.call(this, 1);
    } else if (isInvalid ||
      page !== this.getPage() ||
      pageScale != this.getPageScale()) {
      renderPage.call(this, this.getPage());
    }

    // update private variables to only render if parameters changed
    pdfDocument = this.getDocument();
    page = this.getPage();
    pageScale = this.getPageScale();
    isInvalid = false;

    return this;
  };

  var renderPage = function(pageNumber) {
    var that = this;

    var pdfDocument = that.getDocument();

    var context = canvas.getContext('2d');

    // clear offscreen canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // ignore if pdf document is undefined
    if (!pdfDocument) return;

    // flag to indicate whether page is currently rendered
    that.isRenderingPage = true;

    pdfDocument.getPage(pageNumber).then(function(page) {

      // parent or containing component
      var parent = that.getParent();
      var desiredWidth = parent.getWidth();
      var desiredHeight = parent.getHeight();

      var pageScale = that.getPageScale() / 100.0;
      desiredWidth *= pageScale;
      desiredHeight *= pageScale;

      var viewport = page.getViewport(1.0);
      var scale = 1.0;

      var layer = that.getLayer();
      if (layer.customNodeType && layer.customNodeType === 'PrintLayer') {
        scale = layer.getDpi() / 72;
        viewport = page.getViewport(scale);
      }

      // Prepare canvas using PDF page dimensions
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      var defaultViewport = page.getViewport(1.0);
      var scaleX = desiredWidth / defaultViewport.width;
      var scaleY = desiredHeight / defaultViewport.height;
      var desiredScale = Math.min(scaleX, scaleY);
      var newWidth = Math.min(desiredWidth, defaultViewport.width * desiredScale);
      var newHeight = Math.min(desiredHeight, defaultViewport.height * desiredScale);
      that.setWidth(newWidth);
      that.setHeight(newHeight);

      // Render PDF page into canvas context
      page.render({
        canvasContext: context,
        viewport: viewport //,
          // intent: 'print'
      }).promise.then(function() {

        // set page as rendered
        that.isRenderingPage = false;

        that.fire('rendered', {
          sender: that,
          page: page
        }, false);
      });
    });
  };

  // http: //www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
  var wrapText = function(context, text, x, y, maxWidth, lineHeight) {
    var cars = text.split("\n");

    for (var ii = 0; ii < cars.length; ii++) {

      var line = "";
      var words = cars[ii].split(" ");

      for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;

        if (testWidth > maxWidth) {
          context.fillText(line, x, y);
          line = words[n] + " ";
          y += lineHeight;
        } else {
          line = testLine;
        }
      }

      context.fillText(line, x, y);
      y += lineHeight;
    }
  }

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
        updatePage.call(that);
        _draw.call(this);
      };

      Konva.Shape.call(this, config);
      this.className = 'Pdf';
      this.sceneFunc(this._sceneFunc);
      this.hitFunc(this._hitFunc);
      canvas = document.createElement('canvas');
    },
    _sceneFunc: function(context) {

      if (this.getDocument()) {
        context.drawImage(canvas, 0, 0, this.getWidth(), this.getHeight());
        context.fillStrokeShape(this);
      } else {

        var instructions = [
          'Paste url of pdf document to the input field "Url to Document" and press "Go" button or hit enter key to generate pdf.',
          'OPTIONALLY: Select different page orientation, e.g., if pdf page orientation is horizontal.',
          'Use drag and drop to position generated QR code on page so it does not overlap with pdf content.',
          'OPTIONALLY: Scale page with slider if pdf content and QR code overlap. Alternatively use drag and drop to position pdf content.',
          'OPTIONALLY: Adjust "Print Quality".',
          'Press "Print" button to render page. It automatically opens the print dialog.'
        ];
        var text = '';
        for (var i = 0; i < instructions.length; i++) {
          if (i > 0)
            text += '\n';

          text += i + 1 + '. ' + instructions[i];
        }

        var fontSize = 20;
        context.font = 'bold ' + fontSize + 'px Arial';
        context.fillStyle = 'black';
        var measureText = context.measureText(text);

        wrapText(context, text, 100, 100, this.getParent().getWidth() - 100, fontSize * 1.5);
      }
    },
    _hitFunc: function(context) {
      context.beginPath();
      context.rect(0, 0, this.getWidth(), this.getHeight());
      context.closePath();
      context.fillStrokeShape(this);
    },
    invalidate: function() {
      isInvalid = true;
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

  Konva.Factory.addGetterSetter(Konva.Pdf, 'pageScale', 100);

  /**
   * set pageScale
   * @name setPageScale
   * @method
   * @memberof Konva.Pdf.prototype
   * @param {Number} pageScale. The default is 100
   */

  /**
   * get pageScale
   * @name getPageScale
   * @method
   * @memberof Konva.Pdf.prototype
   */

  Konva.Collection.mapMethods(Konva.Pdf);
})();
