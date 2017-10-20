# elasticsearch

## Prerequisites

* Install node.js version 5+ from https://nodejs.org

* Install Oracle JET command line interface

```
$ npm -g install @oracle/ojet-cli
```

* Clone the project

```
$ git clone https://github.com/bstyrylski/elasticsearch.git
```

* Install corsproxy and corsproxy-https

```
$ npm -g install corsproxy
$ npm -g install corsproxy-https
```

## Starting the app

* Make sure you're on corporate VPN
* Start corsproxy on port 1337

```
$ ~/AppData/Roaming/npm/node_modules/corsproxy/bin/corsproxy
```

* Start corsproxy-https on port 1338

```
$ export CORSPROXY_PORT=1338
$ ~/AppData/Roaming/npm/node_modules/corsproxy-https/bin/corsproxy
```

* Start the app

```
$ cd elasticsearch
$ ojet serve
```
That's it, your browser should start and open http://localhost:8000
