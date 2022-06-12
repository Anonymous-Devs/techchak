/*
// Parse CSV string
var data = Papa.parse(csv);

// Convert back to CSV
var csv = Papa.unparse(data);

// Parse local CSV file
Papa.parse(file, {

});

*/


const papa = require("papaparse");

// Parse CSV string
exports.parse = (file, config) => {

    function error(err, file) {

        console.log(file)
        return err
    }

    return papa.parse(file, config)
}

// Convert back to CSV
exports.unparse = (file, config) => {

    /*
        * CONFIG Options *
      // Stream big file in worker thread
      // enable worker for big file
      worker: true,

      // iterate over files in chunks
      step: function(results) {
          console.log("Row:", results.data);
      }
          // Stream big file in worker thread
          complete: function(results) {
            console.log("Finished:", results.data);
        }
      }
      ___/
    }); 
    */
    return papa.unparse(file, config)
}