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

module.exports = {
  getPhotoUrl: getPhotoUrl,
};
