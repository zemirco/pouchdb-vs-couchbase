
// global object for database url
var globalUrl = '';

// one dummy user for later query
var queryUser = {};
var dummyId = '';

// remove all documents from Couchbase Lite - remove db and create new one
function couchbase_clearDb() {
  $.ajax({
    type: 'DELETE',
    url: globalUrl + 'performance'
  })
  .done(function() {
    $.ajax({
      type: 'PUT',
      url: globalUrl + 'performance'
    })
    .done(function(data) {
      log('Couchbase Lite cleared');
    })
  });
}

// add array of documents to Couchbase Lite
function couchbase_bulkAdd() {
  var max = 10000;
  var data = generate(max);
  console.time('Couchbase lite - bulk add');
  $.ajax({
    type: 'POST',
    url: globalUrl + 'performance/_bulk_docs',
    data: JSON.stringify({'docs': data}),
    contentType : 'application/json'
  })
  .done(function(res) {
    console.timeEnd('Couchbase lite - bulk add');
    dummyId = res[5000].id;
  });
}

// get all documents from Couchbase Lite
function couchbase_allDocs() {
  console.time('Couchbase lite - all docs');
  $.get(globalUrl + 'performance/_all_docs')
  .done(function(res) {
    console.time('Couchbase lite - all docs');
  });
}

// get a certain document by id
function couchbase_get() {
  console.time('Couchbase lite - get single doc');
  $.get(globalUrl + 'performance/' + dummyId)
  .done(function(doc) {
    console.timeEnd('Couchbase lite - get single doc');
    queryUser = doc;
  });
}

// query the database
function couchbase_query() {
  console.time('Couchbase lite - query single doc');
  $.ajax({
    url: globalUrl + 'performance/_design/users/_view/email?key="' + queryUser.email + '"'
  })
  .done(function(doc) {
    console.timeEnd('Couchbase lite - query single doc');
  });
}

// listen for device ready event
document.addEventListener("deviceready", function() {

  // check for Couchbase Lite
  if (!window.cblite) {
    log('Couchbase Lite not installed');
    return;
  }
  
  // get url of db
  cblite.getURL(function(err, url) {
    if (err) console.log(err);
    log('Connected to Couchbase Lite');
    globalUrl = url;
    
    // create database
    $.ajax({
      type: 'PUT',
      url: url + 'performance'
    })
    .done(function(data) {
      console.log(data);
    })
    .always(function() {
      // get db infos - db might have already been created so PUT will reject promise with fail()
        
      // create couchbase lite view
      var view = {
        "id": "_design/users",
        "views": {
          "email": {
            "map": "function(doc) { emit(doc.email, null) }"
          }
        }
      };

      // save view to couchbase lite
      $.ajax({
        type: 'PUT',
        url: globalUrl + 'performance/_design/users',
        data: JSON.stringify(view),
        contentType : 'application/json'
      })
      .done(function(res) {
        log('views created');
      });
        
    });    
    
  })
  
}, false);

// wait for DOM
document.addEventListener('DOMContentLoaded', function() {

  document.getElementById('cb-clearDb').onclick = function() {
    couchbase_clearDb();
  };

  document.getElementById('cb-bulkAdd').onclick = function() {
    couchbase_bulkAdd();
  };

  document.getElementById('cb-allDocs').onclick = function() {
    couchbase_allDocs();
  };

  document.getElementById('cb-get').onclick = function() {
    couchbase_get();
  };

  document.getElementById('cb-query').onclick = function() {
    couchbase_query();
  };

});