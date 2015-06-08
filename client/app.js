if (Meteor.isClient) {

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
   * Converts physical page size dimensions to pixels to fit print dpi.
   */
  var convertPageSizeToPrintSize = function(pageSize, printDpi) {

    var size = pageSize.toInch();

    var width = size.width * printDpi;
    var height = size.height * printDpi;

    return {
      width: width,
      height: height
    };
  };

  var stage;
  var qrCode;
  var paper;

  Template.Tools.events({
    "keyup #document-url": function(e, tmpl) {
      if (e.keyCode === 13) {
        var url = tmpl.$('#document-url').val();
        qrCode.setText(url);
        paper.setUrl(encodeURIComponent(url));
        stage.draw();
      }
    },
    "keyup #document-max-height": function(e, tmpl) {
      if (e.keyCode === 13) {

        var maxHeight = parseInt(tmpl.$('#document-max-height').val());

        console.log(maxHeight);

        paper.setMaxHeight(maxHeight);
        stage.draw();
      }
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
        paper.setRenderQuality(dpi);
        stage.draw();
      }
    }
  });

  Template.Output.rendered = function() {

    var pageSize = convertPageSizeToPrintSize(PageSizes.A4, 96);

    stage = new Konva.Stage({
      container: 'output',
      width: pageSize.width,
      height: pageSize.height
    });

    var layer = new Konva.Layer();

    // add white paper background
    var rect = new Konva.Rect({
      width: pageSize.width,
      height: pageSize.height,
      fill: 'white'
    });
    layer.add(rect);

    paper = new Konva.Pdf({
      // url: 'HuddleLamp_ITS2014.pdf',
      url: encodeURIComponent('http://hci.uni-konstanz.de/downloads/HuddleLamp_Gesture_Study.pdf'),
      renderQuality: 300,
      // maxWidth: pageSize.width,
      // maxHeight: pageSize.height,
      draggable: true
    });

    layer.add(paper);
    // paper.setZIndex(0);

    qrCode = new Konva.QrCode({
      x: 60,
      y: pageSize.height - 188,
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
