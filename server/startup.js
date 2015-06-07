Meteor.startup(function () {
  // code to run on server at startup
});

if (false) {
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
