#!/usr/bin/env python3

import json
import jsonschema
import requests
import sys
import datetime

class ApiValidate:
  
  def __init__(self):
    i_f = open("schema_index.json", "r")
    c_f = open("schema_city.json", "r")
    self.indexschema = json.load(i_f)
    self.cityschema = json.load(c_f)
    i_f.close()
    c_f.close()
  
  def validate_url(self, url):
    data = {}
    if not url.endswith("/"):
        url = url + "/"
    req = requests.get(url)
    data['status'] = req.status_code
    if req.status_code == 200:
      if self.index_is_valid(req.json()):
        data['index'] = 'valid'
        data['cities'] = []
        for city in req.json()['cities'].keys():
          co = {'name':city}
          creq = requests.get(url + city)
          co['status'] = creq.status_code
          if creq.status_code == 200:
            if self.city_is_valid(creq.json()):
              co['json'] = 'valid'
              timestamp = datetime.datetime.strptime(creq.json()['last_downloaded'], "%Y-%m-%dT%H:%M:%S")
              now = datetime.datetime.utcnow()
              co['age'] = (now - timestamp).total_seconds()
            else:
              co['json'] = 'invalid'
          else:
            co['json'] = 'unknown'
          data['cities'].append(co)
      else:
        data['index'] = 'invalid'
    else:
      data['index'] = 'unknown'
    return data
    
  def index_is_valid(self, data):
    try:
      jsonschema.validate(data, self.indexschema)
    except:
      return False
    return True
  
  
  def city_is_valid(self, data):
    try:
      jsonschema.validate(data, self.cityschema)
    except:
      return False
    return True

if __name__ == "__main__":
  if len(sys.argv) < 2:
    exit(1)
  validator = ApiValidate()
  print(validator.validate_url(sys.argv[1]))
