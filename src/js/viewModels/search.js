/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * search module
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojinputtext', 'ojs/ojtable', 'ojs/ojarraytabledatasource',
    'ojs/ojselectcombobox'
], function (oj, ko) {
    /**
     * The view model for the main content view template
     */
    return function searchContentViewModel() {
        var self = this;

        self.searchPhrase = ko.observable();
        self.set = ko.observable();
        self.sets = ko.observableArray([
            {value: '', label: 'None set'},
            {value: 'common', label: 'COMMON'},
            {value: 'setw1', label: 'SMALL'},
            {value: 'setw2', label: 'MEDIUM'},
            {value: 'setw3', label: 'LARGE'}
          ]);
        
        self.throttledSearchPhrase = ko.computed(self.searchPhrase)
                            .extend({ throttle: 300 });
        
        self.jobs = ko.observableArray();
        self.timeTook = ko.observable("0");
        self.totalHits = ko.observable("0");
        self.payload = ko.observable();
        
        self.search = function(value) {
            var payload = {
                size: 100,
                query: {
                    bool: {
                        must: [{
                                query_string: {
                                    query: value + "*",
                                    fields: ["JobCode", "Name", "JobFamilyName", "JobFunctionCode"]
                                }
                            }
                        ]
                    }
                }
            };
            
            if (self.set()) {
                payload.query.bool["filter"] = {
                    bool: {
                        must: [{
                          term: {
                              SetCode: self.set()
                          }  
                      }]
                    }
                }
            }
            
            self.payload(JSON.stringify(payload, null, 2));

            $.post("http://localhost:1337/slc12qen.us.oracle.com:9200/jobs/_search", self.payload())
                .done(function (searchResult) {
                    self.jobs([]);
                    self.timeTook(searchResult.took);
                    self.totalHits(searchResult.hits.total);
                    
                    $.each(searchResult.hits.hits, function () {
                        self.jobs.push({
                            id: this._id,
                            jobCode: this._source.JobCode,
                            jobName: this._source.Name,
                            jobFamilyName: this._source.JobFamilyName,
                            jobFunctionCode: this._source.JobFunctionCode,
                            setCode: this._source.SetCode,
                            score: this._score
                        });
                    });
                });

        }
        
        self.triggerSearch = function (event) {
            if (self.throttledSearchPhrase()) {
                self.search(self.throttledSearchPhrase());
            }
        }
        
        self.throttledSearchPhrase.subscribe(self.triggerSearch);

        self.results = new oj.ArrayTableDataSource(self.jobs, {idAttribute: "id"});
    }
});
