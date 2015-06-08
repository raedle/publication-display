if (Meteor.isClient) {

  var dpi = 300;

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

  var stage;
  var layer;
  var paper;
  var qrCode;
  var rect;

  Template.Tools.events({
    "keyup #document-url": function(e, tmpl) {
      if (e.keyCode === 13) {
        var url = tmpl.$('#document-url').val();
        qrCode.setText(url);
        paper.setUrl(url);
        layer.draw();
      }
    },
    "keyup #document-max-height": function(e, tmpl) {
      if (e.keyCode === 13) {

        var maxHeight = parseInt(tmpl.$('#document-max-height').val());

        console.log(maxHeight);

        paper.setMaxHeight(maxHeight);
        layer.draw();
      }
    },
    "click #rotate-page": function(e, tmpl) {
      // paper.setRotation((paper.getRotation() + 90) % 360);
      // layer.draw();

      var width = stage.getWidth();
      var height = stage.getHeight();

      stage.setWidth(height);
      stage.setHeight(width);

      rect.setWidth(height);
      rect.setHeight(width);

      layer.setDpi(dpi);

      stage.draw();
    },
    "click #prev-page": function(e, tmpl) {
      paper.previousPage();
    },
    "click #next-page": function(e, tmpl) {
      paper.nextPage();
    },
    "keyup #dpi": function(e, tmpl) {
      if (e.keyCode === 13) {
        var dpi = parseInt(tmpl.$('#dpi').val());
        layer.setDpi(dpi);
        layer.draw();
      }
    }
  });

  Template.Output.rendered = function() {

    var pageSize = convertPageSizeToScreenSize(PageSizes.A4, 96);

    stage = new Konva.Stage({
      container: 'output',
      width: pageSize.width,
      height: pageSize.height
    });

    layer = new Konva.PrintLayer({
      dpi: dpi
    });

    // add white paper background
    rect = new Konva.Rect({
      width: pageSize.width,
      height: pageSize.height,
      fill: 'white'
    });
    layer.add(rect);

    paper = new Konva.Pdf({
      url: 'http://hci.uni-konstanz.de/downloads/paper674.pdf',
      draggable: true
    });

    layer.add(paper);
    // paper.setZIndex(0);

    qrCode = new Konva.QrCode({
      x: 60,
      y: 60,//pageSize.height - 188,
      width: 128,
      height: 128,
      text: 'http://hci.uni-konstanz.de',
      draggable: true
    });
    layer.add(qrCode);
    // qrCode.setZIndex(999);

    // add the layer to the stage
    stage.add(layer);
  };
}
