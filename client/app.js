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
  var layer;
  var paper;
  var qrCode;
  var rect;

  Template.Application.events({

    "click #prev-page": function(e, tmpl) {
      paper.previousPage();
    },
    "click #next-page": function(e, tmpl) {
      paper.nextPage();
    },
  });

  Template.Tools.rendered = function() {
    this.$('select').material_select();
  };

  Template.Tools.events({
    "keyup #document-url": function(e, tmpl) {
      if (e.keyCode === 13) {
        var url = tmpl.$('#document-url').val();
        qrCode.setText(url);
        paper.setUrl(url);
        layer.draw();
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
      paper.rerender();
      stage.draw();
    },
    "change #document-render-quality": function(e, tmpl) {
      var dpi = parseInt(tmpl.$('#document-render-quality').val());

      layer.setDpi(dpi);
      paper.rerender();
      layer.draw();
    },
    "change #document-max-height": function(e, tmpl) {
      var maxHeight = parseInt(tmpl.$('#document-max-height').val());

      paper.setMaxHeight(maxHeight);
      layer.draw();
    },
    "click #print": function(e, tmpl) {
      layer.setDpi(300);
      paper.rerender();
      layer.draw();

      // wait until rendered for print.
      Meteor.setTimeout(function() {
        window.print();
      }, 3000);
    }
  });

  Template.Output.rendered = function() {

    $('#document-max-height').attr('max', pageSize.height);
    $('#document-max-height').val(pageSize.height);

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
      url: url,
      draggable: true
    });

    layer.add(paper);
    // paper.setZIndex(0);

    qrCode = new Konva.QrCode({
      x: 60,
      y: 60, //pageSize.height - 188,
      width: 128,
      height: 128,
      text: url,
      draggable: true
    });
    layer.add(qrCode);
    // qrCode.setZIndex(999);

    // add the layer to the stage
    stage.add(layer);
  };
}
