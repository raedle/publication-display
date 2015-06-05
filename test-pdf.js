if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.rendered = function() {
    /* In your Template.xxx.rendered */
    // Set worker URL to package assets
    PDFJS.workerSrc = '/packages/pascoual_pdfjs/build/pdf.worker.js';
    // Create PDF
    PDFJS.getDocument("HuddleLamp_ITS2014.pdf").then(function getPdfHelloWorld(pdf) {
      // Fetch the first page

      console.log(pdf);


      pdf.getPage(1).then(function getPageHelloWorld(page) {
        var scale = 1.5;
        var viewport = page.getViewport(scale);

        // Prepare canvas using PDF page dimensions
        var canvas = document.getElementById('pdfcanvas');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height + 100;
        canvas.width = viewport.width;

        // context.fillStyle = '#ffff00';
        // context.fillRect(0, 0, viewport.width, viewport.height);

        // Render PDF page into canvas context
        page.render({canvasContext: context, viewport: viewport}).promise.then(function () {

          // context.fillStyle = '#ff0000';

          var offsetX = viewport.width - 128;
          var offsetY = viewport.height + 100 - 128;

    			// create the qrcode itself
    			var qrcode	= new QRCode(-1, QRErrorCorrectLevel.H);
    			qrcode.addData('http://hci.uni-konstanz.de');
    			qrcode.make();

    			// compute tileW/tileH based on options.width/options.height
    			var tileW	= 128 / qrcode.getModuleCount();
    			var tileH	= 128 / qrcode.getModuleCount();

    			// draw in the canvas
    			for( var row = 0; row < qrcode.getModuleCount(); row++ ){
    				for( var col = 0; col < qrcode.getModuleCount(); col++ ){
    					context.fillStyle = qrcode.isDark(row, col) ? '#000000' : '#ffffff';
    					var w = (Math.ceil((col+1)*tileW) - Math.floor(col*tileW));
    					var h = (Math.ceil((row+1)*tileW) - Math.floor(row*tileW));
              context.fillRect(Math.round(col*tileW) + offsetX, Math.round(row*tileH) + offsetY, w, h);
    				}
    			}
        });
      });
    });
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
}
