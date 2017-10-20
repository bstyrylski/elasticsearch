/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * jobsSuggest module
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojinputtext', 'ojs/ojtable', 'ojs/ojarraytabledatasource', 
    'ojs/ojcollapsible', 'ojs/ojprogress'
], function (oj, ko) {
    /**
     * The view model for the main content view template
     */
    return function jobsSuggestContentViewModel() {
        var self = this;

        self.searchPhrase = ko.observable();
        
        self.throttledSearchPhrase = ko.computed(self.searchPhrase)
                            .extend({ throttle: 300 });
        
        self.jobs = ko.observableArray();
        self.timeTook = ko.observable("0");
        self.timeTookOverall = ko.observable(0);
        self.totalHits = ko.observable("0");
        
        self.payload = ko.observable("Hey, make some search first!");
        
        self.inProgress = ko.observable(0);
        
        self.isInProgress = ko.computed(function() {
            return self.inProgress() > 0;
        });
        
        
        self.search = function(value) {
            self.inProgress(self.inProgress() + 1);
            
            var payload = {
                _source: ["Name"],
                suggest: {
                }
            };
            
            payload.suggest["name-suggest"] = {
                prefix: value,
                completion: {
                    size: 100,
                    field: "Name-Completion"
                }
            };
            
            
            var url = "slc12qen.us.oracle.com:9200/jobs/_search";
            
            self.payload("POST http://" + url + "\n\n" + JSON.stringify(payload, null, 2));
            
            url = "http://localhost:1337/" + url;

            var responseTime = Date.now();
            $.post(url, JSON.stringify(payload))
                .done(function (searchResult) {
                    self.timeTookOverall(Date.now() - responseTime);
                    
                    self.jobs([]);
                    self.timeTook(searchResult.took);
                    self.totalHits(searchResult.suggest["name-suggest"][0].options.length);
                    
                    $.each(searchResult.suggest["name-suggest"][0].options, function () {
                        self.jobs.push({
                            id: this._id,
                            jobName: this._source.Name,
                            score: this._score
                        });
                    });
                    
                    self.inProgress(self.inProgress() - 1);
                });

        };
        
        self.triggerSearch = function (event) {
            if (self.throttledSearchPhrase()) {
                self.search(self.throttledSearchPhrase());
            }
        }
        
        self.throttledSearchPhrase.subscribe(self.triggerSearch);

        self.results = new oj.ArrayTableDataSource(self.jobs, {idAttribute: "id"});
        
    }
});
