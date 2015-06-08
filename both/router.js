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

  var url = req.query.url;

  var download = function(url) {
    var request = http.get(url, function(response) {
      response.pipe(res);
    });
  };

  if (url) {
    console.log('Downloading ' + url);

    download(url);
  }
}, {
  where: 'server'
});
