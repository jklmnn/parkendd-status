url = 'https://api.parkendd.de/';
progressBar = {"progress":0, "status":"default", "step":10, "element":null};

function stepProgress(){
  progressBar.progress += progressBar.step;
  progressBar.element.style.width = progressBar.progress + "%";
  if(progressBar.progress >= 100){
    setProgressState("success");
  }
}

function setProgress(progress){
  progressBar.progress = progress;
  progressBar.element.style.width = progressBar.progress + "%";
}

function setProgressState(state){
  if(state == "success"){
    progressBar.status  = state;
    progressBar.element.className = "progress-bar progress-bar-success";
  }else if(state == "error"){
    progressBar.status = state;
    progressBar.element.className = "progress-bar progress-bar-danger";
  }else{
    progressBar.status = "default";
    progressBar.element.className = "progress-bar";
  }
}

function getFile(filepath){
  var request = new XMLHttpRequest();
  request.open('GET', filepath, false);
  request.send();
  return request.responseText;
}

function createLabel(text, state){
  var label = document.createElement('span');
  if(state == "success"){
    label.className = "label label-success";
  }else if(state == "unknown"){
    label.className = "label label-warning";
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
  if(status < 400){
    status_label = createLabel(status, "success");
  }else{
    status_label = createLabel(status, "");
  }
  td_status.appendChild(status_label);
  var td_json = document.createElement('td');
  var json_label;
  if(json == "valid"){
    json_label = createLabel(json, "success");
  }else if (json == "unknown"){
    json_label = createLabel(json, "unknown")
  }else{
    json_label = createLabel(json, "");
  }
  td_json.appendChild(json_label);
  tr.appendChild(td_path);
  tr.appendChild(td_status);
  tr.appendChild(td_json);
  return tr;
}

function validateCity(city, response){
  var cbody = document.getElementById("tbody-city");
  if(val_city(JSON.parse(response))){
    cbody.appendChild(createTableRow(city, 200, "valid"));
  }else{
    cbody.appendChild(createTableRow(city, 200, "invalid"));
  }
  stepProgress();
}

function fetchJSON(path){
  var request = new XMLHttpRequest();
  request.open('GET', url + path, true);
  request.onreadystatechange = function(){
    console.log("rstate: " + request.readyState + "; http status: " + request.status);
    if(request.readyState == 4 && request.status == 200){
      if(path == ""){
        validateIndex(request.responseText);
      }else{
        validateCity(path, request.responseText);
      }
    }else if(request.readyState == 2 && request.status >= 400){
      var ibody = document.getElementById("tbody-server");
      ibody.appendChild(createTableRow(url, request.status, "unknown"));
      setProgress(100);
      setProgressState("error");
    };
  };
  request.send();
}

function validateIndex(response){
  var data = JSON.parse(response);
  var ibody = document.getElementById("tbody-server");
  if(val_index(data)){
    var ctable = document.getElementById("table-city");
    ctable.style.visibility = "visible";
    var cities = Object.keys(data.cities);
    step = 100/(cities.length + 1);
    progressBar.step = step;
    stepProgress();
    for(var i = 0; i < cities.length; i++){
      fetchJSON(cities[i]);
    }
    ibody.appendChild(createTableRow(url, 200, "valid"));
  }else{
    ibody.appendChild(createTableRow(url, 200, "invalid"));
    setProgress(100);
    setProgressState("error");
  }
}

window.onload = function WindowLoad(event){
  val_index  = jsen(JSON.parse(getFile("./schema_index.json")));
  val_city = jsen(JSON.parse(getFile("./schema_city.json")));
  progressBar.element = document.getElementById("progress");
  fetchJSON("");
}