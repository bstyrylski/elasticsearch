/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * search module
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojinputtext', 'ojs/ojtable', 'ojs/ojarraytabledatasource'
], function (oj, ko) {
    /**
     * The view model for the main content view template
     */
    return function searchContentViewModel() {
        var self = this;

        self.searchPhrase = ko.observable("Manager");
        self.jobs = ko.observableArray();
        
        var payload = {
            query: {
                bool: {
                    must: [{
                            multi_match: {
                                query: self.searchPhrase(),
                                fields: ["JobCode", "Name", "JobFamilyName", "JobFunctionCode"]
                            }
                        }
                    ]
                }
            }
        };

        $.post("http://localhost:1337/slc12qen.us.oracle.com:9200/jobs/_search", JSON.stringify(payload))
            .done(function (searchResult) {
                $.each(searchResult.hits.hits, function () {
                    self.jobs.push({
                        id: this._id,
                        score: this._score
                    });
                });
            });

        self.results = new oj.ArrayTableDataSource(self.jobs, {idAttribute: "id"});
    }
});
