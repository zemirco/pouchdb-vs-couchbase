
// log to DOM
function log(message) {
  var div = document.createElement('div');
  div.innerText =  message;
  document.getElementById('log').appendChild(div);
}

// clear DOM log
function clearLog() {
  document.getElementById('log').innerHTML = '';
}

// generate some random user objects
function generate(max) {
  var data = [];
  for(var i = 0; i < max; i++) {
    data.push(Faker.Helpers.userCard());
  }
  return data;
}