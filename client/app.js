PDFJS.workerSrc = '/packages/pascoual_pdfjs/build/pdf.worker.js';
PDFJS.maxCanvasPixels = -1;

var PageSizes = {
  A4: {
    unit: 'mm',
    width: 210,
    height: 297
  },
  Letter: {
    unit: 'in',
    width: 8.5,
    height: 11
  }
};

PageSizes = _.extend(PageSizes, {
  __init: function() {
    for (var prop in this) {
      if (typeof this[prop] === 'function') continue;
      this[prop].toInch = this.__toInch.bind(this[prop]);
    }
  }.bind(PageSizes),
  __toInch: function() {

    // do not convert if already in inches
    if (this.unit === 'in') return this;

    return {
      width: this.width / 25.4,
      height: this.height / 25.4
    };
  }
});

PageSizes.__init();

/**
 * Converts physical page size dimensions to pixels to fit screen dpi.
 */
var convertPageSizeToScreenSize = function(pageSize, printDpi) {

  var size = pageSize.toInch();

  var width = size.width * printDpi;
  var height = size.height * printDpi;

  return {
    width: width,
    height: height
  };
};

// var url = 'http://hci.uni-konstanz.de/downloads/paper674.pdf';
var url = 'http://hci.uni-konstanz.de/downloads/its230n-klinkhammer.pdf';
var dpi = 96;
var pageSize = convertPageSizeToScreenSize(PageSizes.A4, 96);

var stage;
var paper;
var pdf;
var qrCode;
var paperBackground;

Template.Application.events({

  "click #prev-page": function(e, tmpl) {
    previousPage();
  },
  "click #next-page": function(e, tmpl) {
    nextPage();
  },
});

Template.Tools.rendered = function() {
  this.$('select').material_select();
};

Template.Tools.events({
  "keyup #document-url": function(e, tmpl) {
    if (e.keyCode === 13) {
      var url = tmpl.$('#document-url').val();
      downloadDocument(url);
    }
  },
  "change input[name=document-orientation]": function(e, tmpl) {
    console.log('hello');
    console.log(e);

    var width = pageSize.width;
    var height = pageSize.height;

    var id = e.currentTarget.id;
    switch (id) {
      case 'document-landscape':
        stage.setWidth(height);
        stage.setHeight(width);
        paperBackground.setWidth(height);
        paperBackground.setHeight(width);
        break;
      case 'document-portrait':
        stage.setWidth(width);
        stage.setHeight(height);
        paperBackground.setWidth(width);
        paperBackground.setHeight(height);
        break;
    }

    paper.setDpi(dpi);
    pdf.invalidate();
    stage.draw();
  },
  "change #document-render-quality": function(e, tmpl) {
    var dpi = parseInt(tmpl.$('#document-render-quality').val());
    paper.setDpi(dpi);
    pdf.invalidate();
    paper.draw();
  },
  "change #document-page-scale": function(e, tmpl) {
    var pageScale = parseInt(tmpl.$('#document-page-scale').val());

    pdf.setPageScale(pageScale);
    pdf.invalidate();
    paper.draw();
  },
  "click #print": function(e, tmpl) {
    var dpi = parseInt(tmpl.$('#document-print-quality').val());
    paper.setDpi(dpi);
    pdf.invalidate();
    paper.draw();

    pdf.on('rendered', print);
  }
});

Template.Paper.rendered = function() {

  stage = new Konva.Stage({
    container: 'paper',
    width: pageSize.width,
    height: pageSize.height
  });

  paper = new Konva.PrintLayer({
    dpi: dpi
  });

  // add white paper background
  paperBackground = new Konva.Rect({
    width: pageSize.width,
    height: pageSize.height,
    fill: 'white'
  });
  paper.add(paperBackground);

  pdf = new Konva.Pdf({
    draggable: true
  });
  pdf.on('rendered', pdfRendered);

  paper.add(pdf);

  qrCode = new Konva.QrCode({
    x: 60,
    y: 60, //pageSize.height - 188,
    width: 128,
    height: 128,
    draggable: true
  });
  paper.add(qrCode);
  // qrCode.setZIndex(999);

  // add the layer to the stage
  stage.add(paper);

  downloadDocument(url);
};

/**
 * Downloads a pdf document and displays it in the paper view.
 * @param {String} url Url to pdf document.
 */
var downloadDocument = function(url) {

  // if (!url.endsWith('.pdf')) {
  //   throw new Meteor.Error('only pdf documents are allowed');
  // }

  showActivityIndicator(true);

  var encodedUrl = encodeURIComponent(url);
  var serviceUrl = '/download?url=' + encodedUrl;
  // serviceUrl = 'HuddleLamp_ITS2014.pdf';

  // Download and create PDF
  PDFJS.getDocument(serviceUrl).then(function(pdfDocument) {

    // set pdf document
    pdf.setDocument(pdfDocument);

    // update qr code text
    qrCode.setText(url);

    // render paper canvas
    paper.draw();
  });
};

var previousPage = function() {
  showActivityIndicator(true);
  pdf.previousPage();
  paper.draw();
};

var nextPage = function() {
  showActivityIndicator(true);
  pdf.nextPage();
  paper.draw();
};

var pdfRendered = function(e) {
  paper.draw();
  showActivityIndicator(false);
};

var print = function(e) {
  // off removes all listeners but the pdf rendered is always needed
  pdf.off('rendered', print);
  pdf.on('rendered', pdfRendered);

  showActivityIndicator(true);

  window.print();

  var dpi = parseInt($('#document-render-quality').val());

  paper.setDpi(dpi);
  pdf.invalidate();
  paper.draw();
};

/**
 * Shows (true) or hides (false) the activity indicator.
 * @param {Boolean} visible True shows the indicator, false hides it otherwise.
 */
var showActivityIndicator = function(visible) {
  var visibility = visible ? 'block' : 'none';
  $('.progress-modal').css('display', visibility);
};
