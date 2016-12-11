// Create an Angular module for this plugin
var module = require('ui/modules').get('ob-kb-funnel');
var numeral = require('numeral');
var D3Funnel = require('d3-funnel');

module.controller('FunnelController', function($scope, Private) {

    const tabifyAggResponse = Private(require('ui/agg_response/tabify/tabify'));

    $scope.getData = function(rows, params) {
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
                values.push(numeral(row[1]/sum).format("0.000%"));
            }
            if (params.percentFromTop) {
                values.push(numeral(row[1]/top).format("0.000%"));
            }
            if (params.percentFromAbove) {
                let value = i == 0 ? 1 : row[1] / rows[i - 1][1];
                values.push(numeral(value).format("0.000%"));
            }

            data[row[0]] = values;
        }
        $scope.processedData = data;
        return rows;
    }

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

        const chart = new D3Funnel('#funnel');
        const data = $scope.getData(table.rows, $scope.vis.params);

        chart.draw(data, options);
    });
  });
