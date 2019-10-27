import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { Schemas, VisSchemasProvider } from 'ui/vis/editors/default/schemas';
import { Status } from 'ui/vis/update_status';

import { FunnelVisualizationProvider } from './funnel_visualization';

import './ob-kb-funnel.css';
import optionsTemplate from './options_template.html';

export function FunnelProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const _Schemas = Schemas || Private(VisSchemasProvider);

  return new VisFactory.createBaseVisualization({
    name: 'ob-kb-funnel',
    title: 'Funnel View',
    icon: 'logstashFilter',
    description: 'Funnel visualization',
    visualization: Private(FunnelVisualizationProvider),
    visConfig: {
      defaults: {
        absolute: true,
        percent: false,
        percentFromTop: false,
        percentFromAbove: false,
        sumOption: 'byBuckets',
        funnelOptions: {
          block: {
            dynamicHeight: true,
            minHeight: 30,
            highlight: true,
          },
          chart: {
            curve: {
              enabled: true,
            },
          },
        },
        funnelOptionsJson: '{}',
      },
    },

    editorConfig: {
      optionsTemplate: optionsTemplate,
      schemas: new _Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Value',
          min: 1,
          // aggFilter: ['count', 'avg', 'sum', 'min', 'max', 'cardinality', 'std_dev'],
        }, {
          group: 'buckets',
          name: 'bucket',
          title: 'Aggregation',
          min: 0,
          max: 1,
          aggFilter: ['!geohash_grid'],
        },
      ]),
    },
    defaults: [
      { schema: 'metric', type: 'count' }
    ],
    requiresUpdateStatus: [
      Status.AGGS,
      Status.DATA,
      Status.PARAMS,
      Status.RESIZE,
      Status.TIME,
      Status.UI_STATE
    ]
  });
}

VisTypesRegistryProvider.register(FunnelProvider);
