/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * jobsLovSearch module
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojtable', 'ojs/ojarraytabledatasource',
    'ojs/ojselectcombobox', 'ojs/ojcollapsible'
], function (oj, ko) {
    /**
     * The view model for the main content view template
     */
    function jobsLovSearchContentViewModel() {
        var self = this;

        self.searchPhrase = ko.observable()

        self.set = ko.observable('1');
        self.sets = ko.observableArray([
            {value: '0', label: 'COMMON'},
            {value: '300100125703917', label: 'SMALL'},
            {value: '300100125703918', label: 'MEDIUM'},
            {value: '300100125703919', label: 'LARGE'}
        ]);

        self.fields = ko.observableArray([
            {value: 'JOB_CODE', label: 'Job Code'},
            {value: 'NAME', label: 'Job Name'},
            {value: 'JOB_FAMILY_NAME', label: 'Job Family Name'},
            {value: 'JOB_FUNCTION_CODE', label: 'Job Function Code'}
        ]);

        self.selectedFields = ko.observableArray(["JOB_CODE", "NAME", "JOB_FAMILY_NAME", "JOB_FUNCTION_CODE"]);

        self.throttledSearchPhrase = ko.computed(self.searchPhrase)
                .extend({throttle: 300});

        self.jobs = ko.observableArray();
        self.totalHits = ko.observable("0");
        self.payload = ko.observable();

        self.search = function (value) {        
            var url = "http://localhost:1338/fuscdrmsmc124-fa-ext.us.oracle.com/hcmRestApi/resources/latest/jobsLov?finder=findByWord;pSetId=" + self.set() + ",";
            
            var fields = "";
            
            for (var i = 0; i < self.selectedFields().length; i++) {
                fields += self.selectedFields()[i];
                if (i + 1 < self.selectedFields().length) {
                    fields += " ";
                }
            }
            
            url += "pSearchTerms=" + value + ",pFilterAttributes=" + fields + "&limit=100";

            self.payload(url);

            $.ajax({
                url: url,
                type: 'GET',
                headers: {'Authorization': 'Basic VE0tTUZJVFpJTU1PTlM6V2VsY29tZTE='},
                success: function(searchResult) {
                        self.jobs([]);
                        self.totalHits(searchResult.items.length);

                        $.each(searchResult.items, function () {
                            self.jobs.push({
                                id: this.JobId,
                                jobCode: this.JobCode,
                                jobName: this.JobName,
                                jobFamilyName: this.JobFamilyName,
                                jobFunctionCode: this.JobFunctionCode,
                                setCode: this.SetCode
                            });
                        });
                    }
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

    return jobsLovSearchContentViewModel;
});
