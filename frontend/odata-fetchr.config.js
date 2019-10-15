const http = require("http");

/**
 * @type import("@furystack/odata-fetchr/dist/models/configuration").Configuration
 */
module.exports = {
  /**
   * Default root path for output
   */
  outputPath: "./src/odata",
  /**
   * In the following example we read it from a persisted example file. You can usually fetch it from your service endpoint.
   */
  getMetadataXml: async () => {
    return new Promise((resolve, reject) =>
      http.get("http://localhost:9090/odata/$metadata", res => {
        var data = "";
        res.on("data", function(chunk) {
          data += chunk;
        });
        res.on("end", function() {
          resolve(data);
        });
      })
    );
  },
  writeDump: true
};
