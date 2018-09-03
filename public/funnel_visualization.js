import { merge } from 'lodash';
import { TabifyResponseHandlerProvider } from 'ui/vis/response_handlers/tabify';
import { FilterManagerProvider } from 'ui/filter_manager';
import { Notifier } from 'ui/notify';

import numeral from 'numeral';
import D3Funnel from 'd3-funnel';

export const FunnelVisualizationProvider = (Private) => {
  const filterManager = Private(FilterManagerProvider);
  const responseHandler = Private(TabifyResponseHandlerProvider).handler;
  const notify = new Notifier({ location: 'Funnel' });

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
      this.filterManager = filterManager;
    }

    async render(esResponse) {
      if (!this.container) return;
      this.chart.destroy();
      this.container.innerHTML = '';

      let visData = {};
      try {
        visData = await responseHandler(this.vis, esResponse);
      } catch (e) {
        console.error(e);
      }

      if (!(Array.isArray(visData.tables) && visData.tables.length) ||
        this.el.clientWidth === 0 || this.el.clientHeight === 0) {
        return;
      }

      const table = visData.tables[0];
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

      const data = getDataForProcessing(table, this.vis.params);
      this.processedData = processData(data, this.vis.params);
      if (!(data.length && data[0].length >= 2)) {
        return;
      }

      try {
        this.chart.draw(data, funnelOptions);
      } catch (err) {
        notify.error(err);
      }
    }

    _addFilter(label) {
      const field = this.vis.aggs.bySchemaName['bucket'][0].params.field;
      if (!field) {
        return;
      }
      this.filterManager.add(
        // The field to filter for, we can get it from the config
        field,
        // The value to filter for, we will read out the bucket key from the tag
        label,
        // Whether the filter is negated. If you want to create a negated filter pass '-' here
        null,
        // The index pattern for the filter
        this.vis.indexPattern.title,
      );
    }

    destroy() {
      this.chart.destroy();
      this.chart = null;
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  };
};

/**
 *
 * @param {array} rows
 * @param {object} params
 * @returns {object}
 */
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
    return table.columns.map((column, i) => ([column.title, row[i]]));
  } else {
    return [];
  }
}
