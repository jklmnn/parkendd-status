#!/usr/bin/env python3

import os
import json
from matrix_client.client import MatrixClient
import validate

def startup(config):
    if os.path.isfile(config):
        with open(config, "r") as cfg:
            conf = json.load(cfg)
            client = MatrixClient(conf["homeserver"],
                                  conf["token"],
                                  "@" + conf["username"] + ":" + conf["homeserver"])
            parkendd_server = conf["parkendd_server"]
    else:
        homeserver = input("homeserver: ")
        username = input("username: ")
        password = input("password: ")
        parkendd_server = input("parkendd_server: ")
        client = MatrixClient(homeserver)
        token = client.login(username, password)
        with open(config, "w") as cfg:
            json.dump({"homeserver": homeserver,
                       "token": token,
                       "username": username,
                       "parkendd_server": parkendd_server},
                      cfg)
    return client, parkendd_server


if __name__ == "__main__":
    client, server = startup(".mbot.json")
    validator = validate.ApiValidate()
    status = validator.validate_url(server)
    room = client.join_room("#parkendd:matrix.org")
    if status['status'] != 200:
        room.send_text("Error: server returned status code " + str(status['status']))
    else:
        if status['index'] != "valid":
            room.send_text("Error: server returned invalid index")
        else:
            invalid = []
            age = []
            for city in status['cities']:
                if city['json'] != "valid":
                    invalid.append(city['name'])
                if city['age'] > 84600:
                    age.append((city['name'], city['age']))
            if invalid:
                room.send_text("Cities with invalid data: " + ", ".join(invalid))
            if age:
                room.send_text("Outdated cities: " + ", ".join(map(lambda c: "{} ({}d)".format(c[0], int(c[1] / 86400)), age)))
