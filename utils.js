/**
 * Utilities module for various utilities used throughout the server.
 */
var config = require('./config.js');
var fs = require('fs');
var path = require('path');

/**
 * Given a path to a photo, produces a URL for accessing the photo
 * over the network.
 * @param  {String} photoPath The path to the photo on the server. This should
 *                            be relative to the root directory of the server.
 * @return {String}           The URL for accessing the photo. If no photoPath
 *                            provided or no available resource is accessible
 *                            at that filesystem path, returns the empty string.
 */
function getPhotoUrl(photoPath) {
  try { // Test that path exists and the server has read access.
    var absolutePath = path.join(config.appRoot, photoPath);
    fs.statSync(absolutePath);
  } catch (exception) {
    console.log('Warn: getPhotoUrl() failed as the path "'+ absolutePath +'"' +
                ' does not exist or permissions are incorrectly set.');
    return '';
  }

  return config.urlRoot + photoPath;
}

/**
 * Writes a given hapi file object to the given outputPath.
 * @param  {Object}   file       Hapi file object (eg. from multipart form)
 * @param  {String}   outputPath Filepath of the file to write to.
 * @param  {Function} cb         Callback invoked on success/fail.
 */
function writeFile(file, outputPath, cb) {
  var outputFile = fs.createWriteStream(outputPath);

  // Catch I/O errors while writing to the strem.
  outputFile.on('error', function(err) {
    console.log(err);
  });

  file.pipe(outputFile);

  file.on('end', function(err) {
    if (err) {
      cb(err);
    } else {
      cb(null);
    }
  });
}

module.exports = {
  getPhotoUrl: getPhotoUrl,
  writeFile: writeFile,
};
