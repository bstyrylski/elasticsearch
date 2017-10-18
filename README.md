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

* Install corsproxy

```
$ npm -g install corsproxy
```

## Starting the app

* Make sure your on corporate VPN
* Start corsproxy

```
$ corsproxy
```

* Start the app

```
$ cd elasticsearch
$ ojet serve
```
That's it, your browser should start and open http://localhost:8000
