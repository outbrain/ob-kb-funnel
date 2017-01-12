// Create an Angular module for this plugin
var module = require('ui/modules').get('ob-kb-funnel');
var numeral = require('numeral');
var D3Funnel = require('d3-funnel');

module.directive('funnelElement', function(Private){
    
    const tabifyAggResponse = Private(require('ui/agg_response/tabify/tabify'));

    return {
        restricts : 'A',

        link : function($scope, element, attributes) {
            $scope.$watch('esResponse', function (resp) {
                if (!resp) {
                    return;
                }
                var tableGroups = tabifyAggResponse($scope.vis, resp);
                console.log(tableGroups);

                if (!tableGroups || !tableGroups.tables) {
                    return;
                }
                const table = tableGroups.tables[0];
                $scope.metricLabel = table.columns.length > 1 ? table.columns[1].title : "";

                const options = JSON.parse($scope.vis.params.funnelOptions);
                options.label = {
                    format: function(label, value) {
                        const values = $scope.processedData[label];
                        return label + ": " + values.join(", ");
                    }
                }
                options.events = {
                    click: {
                        block: function(data) {
                            console.log("Adding filter with data ", data);
                            $scope.addFilter(data.label.raw);
                        }
                    }
                }
                const data = $scope.processData(table.rows, $scope.vis.params);
                if (!data.length) {
                    return;
                }

                const unique = 'T' + new Date().getTime() + '_' + Math.floor((Math.random() * 10000) + 1);
                element.attr('funnelId', unique);
                const chart = new D3Funnel('[funnelId="' + unique + '"]');

                chart.draw(data, options);
            });
        }
    };
});

module.controller('FunnelController', function($scope, Private) {
    const filterManager = Private(require('ui/filter_manager'));

    $scope.addFilter = function(label) {
        filterManager.add(
            // The field to filter for, we can get it from the config
            $scope.vis.aggs.bySchemaName['tags'][0].params.field,
            // The value to filter for, we will read out the bucket key from the tag
            label,
            // Whether the filter is negated. If you want to create a negated filter pass '-' here
            null,
            // The index pattern for the filter
            $scope.vis.indexPattern.title
        );
    }
    $scope.processData = function(rows, params) {
        console.log("Data params: ", params);
        if (!params || !rows || !rows.length) {
            return rows;
        }
        let sum = 0;
        let top = rows[0][1];
        rows.forEach(function(row) {
            sum += row[1];
        });
        let data = {};
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let values = []
            if (params.absolute) {
                values.push(numeral(row[1]).format("0,0"));
            }
            if (params.percent) {
                let value = row[1]/sum;
                if (!value || isNaN(value)) {
                    value = 0;
                }
                values.push(numeral(value).format("0.[000]%"));
            }
            if (params.percentFromTop) {
                let value = row[1]/top;
                if (!value || isNaN(value)) {
                    value = 0;
                }
                values.push(numeral(value).format("0.[000]%"));
            }
            if (params.percentFromAbove) {
                let value = i == 0 ? 1 : row[1] / rows[i - 1][1];
                if (!value || isNaN(value)) {
                    value = 0;
                }
                values.push(numeral(value).format("0.[000]%"));
            }

            data[row[0]] = values;
        }
        $scope.processedData = data;
        return rows;
    }


  });
