if (Meteor.isClient) {



  var isRendering = false;
  var renderedData = null;

  Template.hello.rendered = function() {

    var stage = new Konva.Stage({
      container: 'container',
      width: 600,
      height: 800
    });

    var layer = new Konva.Layer();

    var paper = new Konva.Pdf({
      url: 'HuddleLamp_ITS2014.pdf'
    });

    layer.add(paper);
    paper.setZIndex(0);

    var qrCode2 = new Konva.QrCode({
      width: 128,
      height: 128,
      text: 'http://hci.uni-konstanz.de',
      draggable: true
    });
    layer.add(qrCode2);
    qrCode2.setZIndex(999);

    // add the layer to the stage
    stage.add(layer);

    // Meteor.setTimeout(function() {
    //   console.log('set page 2');
    //   paper.setPage(2);
    //   layer.draw();
    // }, 6000);

    return;

    // console.log('render qr code');
    //
    // var circle = new Konva.Circle({
    //   x: 200,
    //   y: 100,
    //   radius: 70,
    //   fill: 'red',
    //   stroke: 'black',
    //   strokeWidth: 4,
    //   draggable: true
    // });

    // /* In your Template.xxx.rendered */
    // // Set worker URL to package assets
    // PDFJS.workerSrc = '/packages/pascoual_pdfjs/build/pdf.worker.js';
    // // Create PDF
    // PDFJS.getDocument("HuddleLamp_ITS2014.pdf").then(function getPdfHelloWorld(pdf) {
    //   // Fetch the first page
    //
    //   console.log(pdf);
    //
    //
    //   pdf.getPage(1).then(function getPageHelloWorld(page) {
    //     var scale = 1.5;
    //     var viewport = page.getViewport(scale);
    //
    //     // Prepare canvas using PDF page dimensions
    //     var canvas = document.getElementById('pdfcanvas');
    //     var context = canvas.getContext('2d');
    //     canvas.height = viewport.height + 100;
    //     canvas.width = viewport.width;
    //
    //     // context.fillStyle = '#ffff00';
    //     // context.fillRect(0, 0, viewport.width, viewport.height);
    //
    //     // Render PDF page into canvas context
    //     page.render({canvasContext: context, viewport: viewport}).promise.then(function () {
    //
    //       // context.fillStyle = '#ff0000';
    //
    //       var offsetX = viewport.width - 128;
    //       var offsetY = viewport.height + 100 - 128;
    //
    // 			// create the qrcode itself
    // 			var qrcode	= new QRCode(-1, QRErrorCorrectLevel.H);
    // 			qrcode.addData('http://hci.uni-konstanz.de');
    // 			qrcode.make();
    //
    // 			// compute tileW/tileH based on options.width/options.height
    // 			var tileW	= 128 / qrcode.getModuleCount();
    // 			var tileH	= 128 / qrcode.getModuleCount();
    //
    // 			// draw in the canvas
    // 			for( var row = 0; row < qrcode.getModuleCount(); row++ ){
    // 				for( var col = 0; col < qrcode.getModuleCount(); col++ ){
    // 					context.fillStyle = qrcode.isDark(row, col) ? '#000000' : '#ffffff';
    // 					var w = (Math.ceil((col+1)*tileW) - Math.floor(col*tileW));
    // 					var h = (Math.ceil((row+1)*tileW) - Math.floor(row*tileW));
    //           context.fillRect(Math.round(col*tileW) + offsetX, Math.round(row*tileH) + offsetY, w, h);
    // 				}
    // 			}
    //     });
    //   });
    // });
  };

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  var http = Npm.require('http');
  var fs = Npm.require('fs');

  var download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(cb);
      });
    });
  };

  download('http://hci.uni-konstanz.de/downloads/HuddleLamp_Gesture_Study.pdf', 'filejockle.pdf', function(err, res) {
    console.log(err);
    console.log(res);
  });
}
