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
      downloadDocument(url)
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
        rect.setWidth(height);
        rect.setHeight(width);
        $('#document-max-height').attr('max', width);
        $('#document-max-height').val(width);
        break;
      case 'document-portrait':
        stage.setWidth(width);
        stage.setHeight(height);
        rect.setWidth(width);
        rect.setHeight(height);
        $('#document-max-height').attr('max', height);
        $('#document-max-height').val(height);
        break;
    }

    layer.setDpi(dpi);
    pdf.rerender();
    stage.draw();
  },
  "change #document-render-quality": function(e, tmpl) {
    var dpi = parseInt(tmpl.$('#document-render-quality').val());

    layer.setDpi(dpi);
    pdf.rerender();
    layer.draw();
  },
  "change #document-max-height": function(e, tmpl) {
    var maxHeight = parseInt(tmpl.$('#document-max-height').val());

    pdf.setMaxHeight(maxHeight);
    layer.draw();
  },
  "click #print": function(e, tmpl) {
    layer.setDpi(300);
    pdf.rerender();
    layer.draw();

    // wait until rendered for print.
    Meteor.setTimeout(function() {
      window.print();
    }, 3000);
  }
});

Template.Paper.rendered = function() {

  $('#document-max-height').attr('max', pageSize.height);
  $('#document-max-height').val(pageSize.height);

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
    draggable: true,
    onRendered: function(page) {
      console.log('rendered');
      paper.draw();

      showActivityIndicator(false);
    }
  });

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

  console.log(qrCode);

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
};

var nextPage = function() {
  showActivityIndicator(true);
  pdf.nextPage();
};

/**
 * Shows (true) or hides (false) the activity indicator.
 * @param {Boolean} visible True shows the indicator, false hides it otherwise.
 */
var showActivityIndicator = function(visible) {
  var visibility = visible ? 'block' : 'none';
  $('.progress-modal').css('display', visibility);
}
