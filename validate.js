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

function printTime(time){
  if(time < 60){
    return time.toFixed(1)+"s";
  }else if(time < 3600){
    return (time/60).toFixed(1) + "m";
  }else if(time < 86400){
    return (time/3600).toFixed(1) + "h";
  }else{
    return (time/86400).toFixed(1) + "d";
  }
}

function createTableRow(path, status, json, age){
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
  var td_time = document.createElement('td');
  td_json.appendChild(json_label);
  tr.appendChild(td_path);
  tr.appendChild(td_status);
  tr.appendChild(td_json);
  if(age > -1){
    if(age < 300){
      td_time.appendChild(createLabel(printTime(age), "success"));
    }else if(age < 3600){
      td_time.appendChild(createLabel(printTime(age), "unknown"));
    }else{
      td_time.appendChild(createLabel(printTime(age), ""));
    }
    tr.appendChild(td_time);
  }
  return tr;
}

function validateCity(city, response, data){
  var ddate = new Date(data.last_downloaded);
  var now = new Date()
  var time = (now.getTime() - ddate.getTime()) / (1000) + ddate.getTimezoneOffset() * 60;
  var cbody = document.getElementById("tbody-city");
  if(val_city(JSON.parse(response))){
    cbody.appendChild(createTableRow(city, 200, "valid", time));
  }else{
    cbody.appendChild(createTableRow(city, 200, "invalid", time));
  }
  stepProgress();
}

function fetchJSON(path){
  var request = new XMLHttpRequest();
  request.open('GET', url + path, true);
  request.onreadystatechange = function(){
    var ibody = document.getElementById("tbody-server");
    if(request.readyState == 4 && request.status == 200){
      if(path == ""){
        validateIndex(request.responseText);
      }else{
        validateCity(indexdata.cities[path].name, request.responseText, JSON.parse(request.responseText));
      }
    }else if(request.readyState == 2 && request.status >= 400){
      ibody.appendChild(createTableRow(url, request.status, "unknown"));
      setProgress(100);
      setProgressState("error");
    }else if(request.readyState == 2 && request.status == 0){
      if(path == ""){
        ibody.appendChild(createTableRow(url, "50x", "unknown", -1));
        setProgress(100);
        setProgressState("error");
      }else{
        var cbody = document.getElementById("tbody-city");
        cbody.appendChild(createTableRow(indexdata.cities[path].name, "50x", "unknown", -1));
        stepProgress();
      }
    };
  };
  request.send();
}

function validateIndex(response){
  var data = JSON.parse(response);
  indexdata = data
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