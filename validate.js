function getFile(filepath){
  var request = new XMLHttpRequest();
  request.open('GET', filepath, false);
  request.send();
  return request.responseText;
}

function createLabel(text, success){
  var label = document.createElement('span');
  if(success){
    label.className = "label label-success";
  }else{
    label.className = "label label-danger";
  }
  label.appendChild(document.createTextNode(text));
  return label;
}

function createTableRow(path, status, json){
  var tr = document.createElement('tr');
  var td_path = document.createElement('td');
  td_path.appendChild(document.createTextNode(path));
  var td_status = document.createElement('td');
  var status_label;
  if(status == 200){
    status_label = createLabel(status, true);
  }else{
    status_label = createLabel(status, false);
  }
  td_status.appendChild(status_label);
  var td_json = document.createElement('td');
  var json_label;
  if(json == "valid"){
    json_label = createLabel(json, true);
  }else{
    json_label = createLabel(json, false);
  }
  td_json.appendChild(json_label);
  tr.appendChild(td_path);
  tr.appendChild(td_status);
  tr.appendChild(td_json);
  return tr;
}

function validateCity(city){
  var request = new XMLHttpRequest();
  request.open('GET', 'https://api.parkendd.de/' + city, false);
  request.send();
  var status = {"json":"valid", "path":city, "status":request.status};
  if(request.status == 200){
    if(val_city(JSON.parse(request.responseText))){
      status.json = "valid";
    }
  }
  return status;
}

function validateIndex(){
  var request = new XMLHttpRequest();
  request.open('GET', 'https://api.parkendd.de/', false);
  request.send();
  var data = JSON.parse(request.responseText);
  var status = {"json":"valid", "path":"/", "status":request.status, "data":data};
  if(request.status == 200){
    if(val_index(data)){
      status.json = "valid";
    }
  }
  return status;
}

function getCities(index){
  return Object.keys(index.cities);
}

function setProgress(progress){
  var progressBar = document.getElementById("progress");
  progressBar.style.width = progress;
  if(progress == "100%"){
    progressBar.className += " progress-bar-success";
  }
}

window.onload = function WindowLoad(event){
  val_index  = jsen(JSON.parse(getFile("https://raw.githubusercontent.com/jklmnn/parkendd-status/master/schema_index.json")));
  val_city = jsen(JSON.parse(getFile("https://raw.githubusercontent.com/jklmnn/parkendd-status/master/schema_city.json")));
  var tbody = document.getElementById("tbody");
  istatus = validateIndex();
  tbody.appendChild(createTableRow(istatus.path, istatus.status, istatus.json));
  var progress = 15;
  setProgress(15+"%");
  var cities = getCities(istatus.data);
  var step = 85/cities.length;
  for(var i = 0; i < cities.length; i++){
    var status = validateCity(cities[i]);
    tbody.appendChild(createTableRow(status.path, status.status, status.json));
    progress += step;
    setProgress(progress + "%");
  }
  setProgress("100%");
}