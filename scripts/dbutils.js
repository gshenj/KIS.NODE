/**
 * Created by jin on 2016/2/23 0023.
 */

var LinvoDB = require("linvodb3");
LinvoDB.defaults.store = { db: require("medeadown") }; // Comment out to use LevelDB instead of Medea
// Set dbPath - this should be done explicitly and will be the dir where each model's store is saved
LinvoDB.dbPath = process.cwd()+"/db/";
function dbtest() {


// The following two lines are very important
// Initialize the default store to Medeadown - which is a JS-only store which will work without recompiling in NW.js / Electron

    var Users = new LinvoDB("users", { /* schema, can be empty */ })

//LinvoDB.dbPath // default path where data files are stored for each model
//LinvoDB.defaults // default options for every model


// Construct a single document and then save it
    var doc = new Users({a: 5, now: new Date(), test: "this is a string"});
    doc.b = 13; // you can modify the doc
    doc.save(function (err) {
        // Document is saved
        console.log(doc._id);
    });


}