var fs = require("fs");
var path = require("path");
var exec = require('child_process').exec;
var sys = require('sys');

var lvl2 = /\/?([^\/]*)\/([^\/]*)\/(\d*)[\s-]*(.*)\.mp3$/;
var lvl1 = /\/?([^\/]*)\/()(\d*)[\s-]*(.*)\.mp3$/;
var lvl0 = /\/?([^-]*)()()-\s*(.*)\.mp3$/;


var regex = [lvl0,lvl1,lvl2];

var eecs = [];

var baseDir = process.argv[2];
//console.log("Base Dir  - " + baseDir);

var cmdlineesc = function(str) {
return str.replace(/'/g,"\'\\\'\'");
}


var HandleDir = function(dir, level) {

  var files = fs.readdirSync(dir);

  for(var i=0; i < files.length; i++) {
    var fullpath = path.join(dir,files[i]);
    var stat = fs.statSync(fullpath);
    var bit = fullpath.substring(baseDir.length, fullpath.length);

    if (stat.isDirectory()) {
//      console.log("DIR -> " + level + " "  + bit);
      HandleDir(fullpath,level+1);      
    } else if (stat.isFile()) {
      var matches = bit.match(regex[level]);
      if (matches != null) {
        //console.log("FIL -> " + level + " " + bit);
        //console.dir(matches);
        //console.log("id3 -l '" + cmdlineesc(fullpath) + "'");
        var cmdline;
        if (matches[3] == '') {
          cmdline = "id3v2 -a '" + cmdlineesc(matches[1]) + "' -A '" + cmdlineesc(matches[2]) + "' -t '" + cmdlineesc(matches[4]) + "'  '" + cmdlineesc(fullpath) + "'";
        } else {
          cmdline = "id3v2 -a '" + cmdlineesc(matches[1]) + "' -A '" + cmdlineesc(matches[2]) + "' -T '" + cmdlineesc(matches[3]) + "' -t '" + cmdlineesc(matches[4]) + "'  '" + cmdlineesc(fullpath) + "'";
        }
        console.log(cmdline);
        eecs[eecs.length] = cmdline;
        //exec("id3 -l '" + cmdlineesc(fullpath) + "'",
        //exec(cmdline,
        //  function (error, stdout, stderr) {
        //    //sys.print('stdout: ' + stdout);
        //    //sys.print('stderr: ' + stderr);
        //    if (error !== null) {
        //      console.log('exec error: ' + error);
        //    }
        //});
      }
    }
  }

}


var baseStats = fs.statSync(baseDir);
if (!baseStats.isDirectory()) {
  console.log("Not a directory");
  process.exit(1);
}

HandleDir(baseDir, 0);

