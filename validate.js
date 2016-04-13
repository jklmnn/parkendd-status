url = 'http://127.0.0.1/parkapi/'

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
  if(status == "Ok"){
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

function validateCity(city){
  var request = new XMLHttpRequest();
  request.open('GET', url + city, false);
  try{
    request.send();
  }catch (exception){
    return {"json":"unknown", "path":city, "status":"Error"};
  }
  if(request.status == 200){
    if(val_city(JSON.parse(request.responseText))){
      return {"json":"valid", "path":city, "status":"Ok"};
    }else{
      console.log(val_city.errors);
      return {"json":"invalid", "path":city, "status":"Ok"};
    }
  }else{
    return {"json":"unknown", "path":city, "status":"Error"};
  }
}

function validateIndex(){
  var request = new XMLHttpRequest();
  request.open('GET', url, false);
  try{
    request.send();
  }catch(exception){
    return {"json":"unknown", "path":"/", "status":"Error", "data":null};
  }
  if(request.status == 200){
    var data = JSON.parse(request.responseText);
    if(val_index(data)){
      return {"json":"valid", "path":"/", "status":"Ok", "data":data};
    }else{
      return {"json":"invalid", "path":"/", "status":"Ok", "data":data};
    }
  }else{
    return {"json":"unknown", "path":"/", "status":"Error", "data":null};
  }
}

function getCities(index){
  return Object.keys(index.cities);
}

function setProgress(progress, state){
  var progressBar = document.getElementById("progress");
  progressBar.style.width = progress;
  if(progress == "100%"){
    if(state == "success"){
      progressBar.className = "progress-bar progress-bar-success";
    }else{
      progressBar.className = "progress-bar progress-bar-danger";
    }
  }
}

window.onload = function WindowLoad(event){
  val_index  = jsen(JSON.parse(getFile("./schema_index.json")));
  val_city = jsen(JSON.parse(getFile("./schema_city.json")));
  var ibody = document.getElementById("tbody-server");
  var ctable = document.getElementById("table-city");
  var cbody = document.getElementById("tbody-city");
  istatus = validateIndex();
  ibody.appendChild(createTableRow(url, istatus.status, istatus.json));
  if(istatus.status == "Ok"){
    ctable.style.visibility = "visible";
    var progress = 15;
    setProgress(15+"%");
    var cities = getCities(istatus.data);
    var step = 85/cities.length;
    for(var i = 0; i < cities.length; i++){
      var status = validateCity(cities[i]);
      name = istatus.data.cities[cities[i]].name;
      cbody.appendChild(createTableRow(name, status.status, status.json));
      progress += step;
      setProgress(progress + "%", "");
    }
    setProgress("100%", "success");
  }else{
    setProgress("100%", "");
  }
}