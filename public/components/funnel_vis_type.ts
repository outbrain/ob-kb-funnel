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

import { Schemas } from '../../../../src/legacy/core_plugins/vis_default_editor/public';
import { FunnelVisualizationProvider } from './funnel_vis_provider';
import { FunnelVisOption } from './funnel_vis_options';

export function FunnelVisTypeDefinition() {
  return {
    name: 'funnel',
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
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Value',
          min: 1,
          defaults: [{ type: 'count', schema: 'metric' }],
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
    },
  };
}
