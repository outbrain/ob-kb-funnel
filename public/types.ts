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

import { VisualizationsSetup } from '../../../src/plugins/visualizations/public';

export interface FunnelPluginSetup {
  visualizations: VisualizationsSetup;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FunnelPluginStart {}

export interface FunnelVisParams {
  absolute: boolean;
  percent: boolean;
  percentFromTop: boolean;
  percentFromAbove: boolean;
  dataTransformFromAbove: boolean;
  sumOption: string | null;
  funnelOptions: {
    block: {
      dynamicHeight: boolean;
      minHeight: number | null;
      highlight: boolean;
    };
    chart: {
      curve: {
        enabled: boolean;
      };
    };
  };
  funnelOptionsJson: string | null;
}

