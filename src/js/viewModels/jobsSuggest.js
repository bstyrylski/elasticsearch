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
        self.totalHits = ko.observable("0");
        
        self.payload = ko.observable();
        
        self.inProgress = ko.observable(0);
        
        self.isInProgress = ko.computed(function() {
            return self.inProgress() > 0;
        });
        
        self.throttledSearchPhrase.subscribe(function(value) {
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
            
            self.payload(JSON.stringify(payload, null, 2));

            $.post("http://localhost:1337/slc12qen.us.oracle.com:9200/jobs/_search", self.payload())
                .done(function (searchResult) {
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

        });

        self.results = new oj.ArrayTableDataSource(self.jobs, {idAttribute: "id"});
        
    }
});
