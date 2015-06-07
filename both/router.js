if (Meteor.isServer) {

}

Router.route('/', function() {
  this.render('Application');
});

Router.route('/download', function() {

  var http = Npm.require('http');
  var fs = Npm.require('fs');

  var req = this.request;
  var res = this.response;

  res.setHeader("Content-Type", "application/pdf");

  var url = req.query.url;
  console.log('Url: ' + url);

  var download = function(url) {
    var request = http.get(url, function(response) {
      console.log('response');
      response.pipe(res);
      // file.on('finish', function() {
        // res.end();
      // });
    });
  };

  download(url);
}, {
  where: 'server'
});
