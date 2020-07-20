import { Schemas, VisSchemasProvider } from 'ui/vis/editors/default/schemas';
import { setup as visualizations } from '../../../src/legacy/core_plugins/visualizations/public/np_ready/public/legacy';
import { FunnelVisualizationProvider } from './funnel_vis_provider';
import { FunnelVisOption } from './funnel_vis_options'
import './ob-kb-funnel.css';

export function FunnelVisTypeDefinition() {
  const _Schemas = Schemas || VisSchemasProvider;

  return {
    name: 'ob-kb-funnel',
    title: 'Funnel View',
    icon: 'logstashFilter',
    description: 'Funnel visualization',
    visualization: FunnelVisualizationProvider(),
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
      optionsTemplate: FunnelVisOption,
      schemas: new _Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Value',
          min: 1,
          defaults: [{ schema: 'metric', type: 'count' }]
        }, {
          group: 'buckets',
          name: 'bucket',
          title: 'Aggregation',
          min: 0,
          max: 1,
          aggFilter: ['!geohash_grid', '!geotile_grid'],
        }, {
          group: 'buckets',
          name: 'data_transform',
          title: 'Data Transform',
          min: 0,
          max: 1,
          aggFilter: ['terms'],
        }
      ]),
    }
  }
}
visualizations.types.createBaseVisualization(FunnelVisTypeDefinition());
