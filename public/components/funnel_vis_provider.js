/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { merge, isEmpty, groupBy, forEach, sum, map, round, min, max } from 'lodash';
import { FilterBarQueryFilterProvider, generateFilters } from '../../../../src/plugins/data/public';
import numeral from 'numeral';
import D3Funnel from 'd3-funnel';

export const FunnelVisualizationProvider = () => {
  const queryFilter = FilterBarQueryFilterProvider;

  return class FunnelVisualization {
    containerClassName = 'funnelview';

    constructor(el, vis) {
      this.vis = vis;
      this.el = el;

      this.container = document.createElement('div');
      this.container.className = this.containerClassName;
      this.el.appendChild(this.container);

      this.processedData = {};

      this.chart = new D3Funnel(this.container);
    }

    render(response, visparams) {
      if (!this.container) return;
      this.chart.destroy();
      this.container.innerHTML = '';

      if (!(Array.isArray(response.rows) && Array.isArray(response.columns)) ||
        this.el.clientWidth === 0 || this.el.clientHeight === 0) {
        this.showMessage('No data to display');
        return;
      }

      if (response.columns.length < 2) {
        this.showMessage('Data should include a label and a value');
        return;
      }

      let funnelOptions = visparams.funnelOptions;
      let funnelOptionsJson = {};
      try {
        funnelOptionsJson = JSON.parse(visparams.funnelOptionsJson);
      } catch (e) {
        funnelOptionsJson = {};
      }
      funnelOptions = merge({}, funnelOptions, funnelOptionsJson);

      funnelOptions.label = {
        format: (label) => {
          const values = this.processedData[label];
          if (Array.isArray(values)) {
            return `${label}: ${values.join(', ')}`;
          }
          return label;
        },
      };
      funnelOptions.events = {
        click: {
          block: (data) => {
            this._addFilter(data.label.raw);
          },
        },
      };
      
      const table = transformData(response, visparams);
      const data = getDataForProcessing(table, visparams);
      this.processedData = processData(data, visparams);

      try {
        this.chart.draw(data, funnelOptions);
      } catch (err) {
        this.showMessage("Error rendering visualization")
        console.log("Error rendering visualization", err);
      }
    }

    _addFilter(label) {
      const field = this.vis.aggs.bySchemaName['bucket'][0].params.field;
      if (!field) {
        return;
      }
      const newFilters = generateFilters(queryFilter, field, [label], null, this.vis.indexPattern.title);
    }

    showMessage(msg) {
      this.container.innerHTML = '<p>' + msg + '</p>';
    }

    destroy() {
      this.chart.destroy();
      this.chart = null;
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  };
};

function transformData(response, params) {
  if(!isEmpty(params.dimensions.data_transform) && params.sumOption == 'byBuckets') {
    return transformDataOnField(response, params);
  } else {
    return transformDataToTable(response);
  }
}

function transformDataToTable(response) {
  const result = [];
  const colNames = []
  response.columns.forEach(col => { colNames.push(col.id); });
  response.rows.forEach(row => {
    const data = [];
    colNames.forEach(colName => {
      data.push(row[colName]);
    });
    result.push(data);
  });
  return {rows: result, columns: response.columns};
}

function transformDataOnField(response, params){
  const bucket_agg = response.columns.filter(col => col.name == params.dimensions.bucket?.[0]?.label)[0];
  const data_transform_agg = response.columns.filter(col => col.name == params.dimensions.data_transform?.[0]?.label)[0];
  const metric_agg = response.columns.filter(col => col.name == params.dimensions.metric?.[0]?.label)[0];
  const data_rows = groupBy(response.rows, row => row[bucket_agg.id]);
  const result = [];
  let previous_key = undefined;
  forEach(data_rows, (value, key) => {
    const data_transform_ids = (data_rows[previous_key] || value).map(m => m[data_transform_agg.id]);
    const metric_data = map(value.filter(v => data_transform_ids.includes(v[data_transform_agg.id])), metric_agg.id);
    result.push([key, transformMetricData(metric_agg.meta.type, metric_data)]);
    previous_key = key;
  });
  return {rows: result, columns: response.columns};
}

function transformMetricData(type, data){
  let result;
  switch(type) {
    case 'count': case 'cardinality': case 'sum':
      result = sum(data);
      break;
    case 'avg':
      result = round((sum(data)/data.length), 2);
      break;
    case 'min':
      result = min(data);
      break;
    case 'max':
      result = max(data);
      break;
    default:
      result = data;
  }
  return result;
}

function processData(rows, params) {
  if (!(params && Array.isArray(rows) && rows.length)) {
    return {};
  }
  const sum = rows.reduce((acc, row) => acc + row[1], 0);
  const top = rows[0][1];
  return rows.reduce((data, row, i) => {
    const values = [];
    data[row[0]] = values;
    if (params.absolute) {
      values.push(numeral(row[1]).format('0,0'));
    }
    if (params.percent) {
      let value = row[1] / sum;
      if (!value || isNaN(value)) {
        value = 0;
      }
      values.push(numeral(value).format('0.[000]%'));
    }
    if (params.percentFromTop) {
      let value = row[1] / top;
      if (!value || isNaN(value)) {
        value = 0;
      }
      values.push(numeral(value).format('0.[000]%'));
    }
    if (params.percentFromAbove) {
      let value = i === 0 ? 1 : row[1] / rows[i - 1][1];
      if (!value || isNaN(value)) {
        value = 0;
      }
      values.push(numeral(value).format('0.[000]%'));
    }

    return data;
  }, {});
}

function getDataForProcessing(table, params) {
  if (params.sumOption === 'byBuckets') {
    return table.rows;
  } else if (params.sumOption === 'byMetrics') {
    const row = table.rows[0];
    return table.columns.map((column, i) => ([column.name, row[i]]));
  } else {
    return [];
  }
}
