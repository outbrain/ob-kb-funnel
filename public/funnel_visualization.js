import { merge } from 'lodash';
import { FilterBarQueryFilterProvider } from 'ui/filter_manager/query_filter';
import { getFilterGenerator } from 'ui/filter_manager';
import { Notifier } from 'ui/notify';

import numeral from 'numeral';
import D3Funnel from 'd3-funnel';

export const FunnelVisualizationProvider = (Private) => {
  const queryFilter = Private(FilterBarQueryFilterProvider);
  const filterGen = getFilterGenerator(queryFilter);
  // const notify = new Notifier({ location: 'Funnel' });

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
      // this.filterManager = filterManager;
    }

    async render(response) {
      console.log("Renering ", response);
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

      let funnelOptions = this.vis.params.funnelOptions;
      let funnelOptionsJson = {};
      try {
        funnelOptionsJson = JSON.parse(this.vis.params.funnelOptionsJson);
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
      const table = transformDataToTable(response);
      console.log("Transformed Data ", table);
      const data = getDataForProcessing(table, this.vis.params);
      console.log("Data - ", data);
      this.processedData = processData(data, this.vis.params);
      console.log("processedData ", this.processedData)

      try {
        this.chart.draw(data, funnelOptions);
      } catch (err) {
        this.showMessage("Error rendering visualization")
        console.log("Error rendering visualization", err);
        // notify.error(err);
      }
    }

    _addFilter(label) {
      const field = this.vis.aggs.bySchemaName['bucket'][0].params.field;
      console.log(field);
      if (!field) {
        return;
      }
    //const indexPatternId = state.queryParameters.indexPatternId;
      const newFilters = filterGen.add(field, [label], null, this.vis.indexPattern.title);
      // this.filterManager.add(field,label,null,this.vis.indexPattern.title);
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
/**
 *
 * @param {array} rows
 * @param {object} params
 * @returns {object}
 */
function _processData(rows, params) {
  if (!(params && Array.isArray(rows) && rows.length)) {
    return {};
  }
  const sum = rows.reduce((acc, row) => acc + row[1], 0);
  const top = rows[0][1];
  return rows.map((row, i) => {
    let struct = {};
    let value = row[1];
    switch (params.selectValueDisplay) {
      default:
      case 'absolute':
        struct.formattedValue = (numeral(value).format('0,0'));
        struct.value = value;
        break;
      case 'percent':
        value = row[1] / sum;
        if (!value || isNaN(value)) {
          value = 0;
        }
        struct.formattedValue = (numeral(value).format('0.[000]%'));
        struct.value = value;
        break;
      case 'percentFromTop':
        value = row[1] / top;
        if (!value || isNaN(value)) {
          value = 0;
        }
        struct.formattedValue = (numeral(value).format('0.[000]%'));
        struct.value = value;
        break;
      case 'percentFromAbove':
        value = i === 0 ? 1 : row[1] / rows[i - 1][1];
        if (!value || isNaN(value)) {
          value = 0;
        }
        struct.formattedValue = (numeral(value).format('0.[000]%'));
        struct.value = value;
    }
    
    return { 
      label: row[0] + ' - ' + struct.formattedValue, 
      formattedValue: struct.formattedValue,
      value: struct.value
    };
  }, {});
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

/**
 * @param {object} table
 * @param {object} params
 * @returns {array}
 */
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
