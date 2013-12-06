
// init PouchDB
var db = new PouchDB('performance');

// one dummy user for later query
var queryUser = {};
var dummyId = '';

// remove all documents from PouchDB
function pouch_clearDb() {
  // delete database
  PouchDB.destroy('performance', function(err, info) {
    if (err) console.log(err);
    // create a new one with the same name
    db = new PouchDB('performance');
    log('PouchDb cleared');
  });
}

// add array of documents to PouchDB
function pouch_bulkAdd() {
  var max = 10000;
  var data = generate(max);
  console.time('PouchDB - bulk add');
  db.bulkDocs({docs: data}, function(err, res) {
    if (err) console.log(err);
    console.timeEnd('PouchDB - bulk add');
    // save one user for later query
    dummyId = res[5000].id;
  })
}

// get all documents from PouchDB
function pouch_allDocs() {
  console.time('PouchDB - all docs');
  db.allDocs(function(err, res) {
    if (err) log(err);
    console.timeEnd('PouchDB - all docs');
  });
}

// get a certain document by id
function pouch_get() {
  console.time('PouchDB - get single doc');
  db.get(dummyId, function(err, doc) {
    if (err) console.log(err);
    console.timeEnd('PouchDB - get single doc');
    queryUser = doc;
  });
}

// query the database
function pouch_query() {
  // mapping function
  var map = function(doc) {
    emit(doc.email, null);
  };
  console.time('PouchDB - query single doc');
  // query PouchDB
  db.query({map: map}, {key: queryUser.email}, function(err, res) {
    if (err) console.log(err);
    console.timeEnd('PouchDB - query single doc');
  });
  
}

// wait for DOM
document.addEventListener('DOMContentLoaded', function() {

  document.getElementById('bulkAdd').onclick = function() {
    pouch_bulkAdd();
  };

  document.getElementById('clearDb').onclick = function() {
    pouch_clearDb();
  };

  document.getElementById('allDocs').onclick = function() {
    pouch_allDocs();
  };

  document.getElementById('get').onclick = function() {
    pouch_get();
  };

  document.getElementById('query').onclick = function() {
    pouch_query();
  };
  
});