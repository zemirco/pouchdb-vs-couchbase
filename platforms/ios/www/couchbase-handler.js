
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
  var max = 25000;
  var data = generate(max);
  var clock = new StopWatch();
  clock.start();
  $.ajax({
    type: 'POST',
    url: globalUrl + 'performance/_bulk_docs',
    data: JSON.stringify({'docs': data}),
    contentType : 'application/json'
  })
  .done(function(res) {
    clock.stop();
    log('Couchbase Lite bulkDocs - ' + max + ' docs: ' + clock.elapsed() + 'ms');
    dummyId = res[5000].id;
  });
}

// get all documents from Couchbase Lite
function couchbase_allDocs() {
  var clock = new StopWatch();
  clock.start();
  $.get(globalUrl + 'performance/_all_docs')
  .done(function(res) {
    clock.stop();
    log('Couchbase Lite allDocs - ' + res.rows.length + ': ' + clock.elapsed() + 'ms');
  });
}

// get a certain document by id
function couchbase_get() {
  var clock = new StopWatch();
  clock.start();
  $.get(globalUrl + 'performance/' + dummyId)
  .done(function(doc) {
    clock.stop();
    log('Couchbase Lite get - Object found: ' + clock.elapsed() + 'ms');
    queryUser = doc;
  });
}

// query the database
function couchbase_query() {
  var clock = new StopWatch();
  clock.start();
  $.ajax({
    url: globalUrl + 'performance/_design/users/_view/email?key="' + queryUser.email + '"'
  })
  .done(function(doc) {
    clock.stop();
    log('Couchbase Lite query - ' + doc.rows.length + ' user(s) found: ' + clock.elapsed() + 'ms');
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