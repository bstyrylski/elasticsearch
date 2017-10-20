/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * jobsSearch module
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojinputtext', 'ojs/ojtable', 'ojs/ojarraytabledatasource',
    'ojs/ojselectcombobox', 'ojs/ojcollapsible', 'ojs/ojslider', 'ojs/ojprogress'
], function (oj, ko) {
    /**
     * The view model for the main content view template
     */
    return function jobsSearchContentViewModel() {
        var self = this;

        self.searchPhrase = ko.observable()
        
        self.set = ko.observable();
        self.sets = ko.observableArray([
            {value: '', label: 'All'},
            {value: 'common', label: 'COMMON'},
            {value: 'setw1', label: 'SMALL'},
            {value: 'setw2', label: 'MEDIUM'},
            {value: 'setw3', label: 'LARGE'}
          ]);
          
        self.fields = ko.observableArray([
            {value: 'JobCode', label: 'Job Code'},
            {value: 'Name', label: 'Job Name'},
            {value: 'JobFamilyName', label: 'Job Family Name'},
            {value: 'JobFunctionCode', label: 'Job Function Code'}
          ]);
          
        self.selectedFields = ko.observableArray(["JobCode", "Name", "JobFamilyName", "JobFunctionCode"]);
        
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
            
            var fields = new Array(); 
            
            for (var i = 0; i < self.selectedFields().length; i++) {
                var fieldName = self.selectedFields()[i];
                
                var boost = 0;
                
                for (var j = 0; j < self.boosters.length; j++) {
                    if (self.boosters[j].value == fieldName) {
                        boost = self.boosters[j].boost();
                    }
                }
                
                if (boost > 1) {
                    fieldName = fieldName + "^" + boost;
                }
                
                fields.push(fieldName);
            }
           
            var payload = {
                size: 100,
                query: {
                    bool: {
                        must: [{
                                query_string: {
                                    query: value + "*",
                                    fields: fields
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
            
            var url = "slc12qen.us.oracle.com:9200/jobs/_search";
            self.payload("POST http://" + url + "\n\n" + JSON.stringify(payload, null, 2));

            url = "http://localhost:1337/" + url;

            var responseTime = Date.now();
            $.post(url, JSON.stringify(payload))
                .done(function (searchResult) {
                    self.timeTookOverall(Date.now() - responseTime);
            
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
                    
                    self.inProgress(self.inProgress() - 1);
                });

        }
        
        self.triggerSearch = function (event) {
            if (self.throttledSearchPhrase()) {
                self.search(self.throttledSearchPhrase());
            }
        }
        
        self.throttledSearchPhrase.subscribe(self.triggerSearch);
        
        self.boosters = [
            {value: 'JobCode', label: 'Job Code', boost: ko.observable(1), triggerSearch: self.triggerSearch},
            {value: 'Name', label: 'Job Name', boost: ko.observable(1), triggerSearch: self.triggerSearch},
            {value: 'JobFamilyName', label: 'Job Family Name', boost: ko.observable(1), triggerSearch: self.triggerSearch},
            {value: 'JobFunctionCode', label: 'Job Function Code', boost: ko.observable(1), triggerSearch: self.triggerSearch}
        ];

        self.results = new oj.ArrayTableDataSource(self.jobs, {idAttribute: "id"});
    }
});
