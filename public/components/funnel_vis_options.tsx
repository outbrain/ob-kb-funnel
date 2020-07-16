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

import React, { useCallback } from 'react';
import { EuiPanel, EuiTextArea } from '@elastic/eui';
import { VisOptionsProps } from '../../../../src/plugins/vis_default_editor/public';
import { SwitchOption, SelectOption, NumberInputOption } from '../../../../src/plugins/charts/public';
import { FunnelVisParams } from '../types';

export function FunnelVisOption({
  stateParams,
  setValue,
}: VisOptionsProps<FunnelVisParams>) {

  const aggTypeOptions: any = [
    { label: 'By Buckets', value: 'byBuckets', text: 'By Buckets' },
    { label: 'By Metrics', value: 'byMetrics', text: 'By Metrics' },
  ];

  const setFunnelOptionsValue = useCallback( (paramName, value) =>
      setValue('funnelOptions', {
        ...stateParams.funnelOptions,
        [paramName]: value,
      }),
    [setValue, stateParams.funnelOptions]
  );

  const setFunnelChartOptionsValue = useCallback( (paramName, value) =>
    setFunnelOptionsValue('chart', {
      ...stateParams.funnelOptions.chart,
      [paramName]: value,
    }),
    [setValue, stateParams.funnelOptions.chart]
  );

  // Render the application DOM.
  return (
    <EuiPanel paddingSize="s">
      <SelectOption
        label='Select aggregation type:'
        options={aggTypeOptions}
        paramName="sumOption"
        value={stateParams.sumOption}
        setValue={setValue}
      />
      
      <SwitchOption
        label='Absolute value'
        paramName="absolute"
        value={stateParams.absolute}
        setValue={setValue}
      />
      
      <SwitchOption
        label='Percent from sum'
        paramName="percent"
        value={stateParams.percent}
        setValue={setValue}
      />

      <SwitchOption
        label='Percent from top item'
        paramName="percentFromTop"
        value={stateParams.percentFromTop}
        setValue={setValue}
      />

      <SwitchOption
        label='Percent from above item'
        paramName="percentFromAbove"
        value={stateParams.percentFromAbove}
        setValue={setValue}
      />

      <SwitchOption
        label='Dynamic height'
        paramName="dynamicHeight"
        value={stateParams.funnelOptions.block.dynamicHeight}
        setValue={(paramName, value) =>
          setFunnelOptionsValue('block', { ...stateParams.funnelOptions.block, [paramName]: value })
        }
      />
      
      <NumberInputOption
        label='Min height'
        min={1}
        paramName="minHeight"
        value={stateParams.funnelOptions.block.minHeight}
        setValue={(paramName, value) =>
          setFunnelOptionsValue('block', { ...stateParams.funnelOptions.block, [paramName]: value })
        }
      />

      <SwitchOption
        label='Highlight on hover'
        paramName="highlight"
        value={stateParams.funnelOptions.block.highlight}
        setValue={(paramName, value) =>
          setFunnelOptionsValue('block', { ...stateParams.funnelOptions.block, [paramName]: value })
        }
      />

      <SwitchOption
        label='Chart curve'
        paramName="enabled"
        value={stateParams.funnelOptions.chart.curve.enabled}
        setValue={(paramName, value) =>
          setFunnelChartOptionsValue('curve', { ...stateParams.funnelOptions.chart.curve, [paramName]: value })
        }
      />

      <EuiTextArea
        autoFocus
        aria-label='Funnel Options JSON:'
        fullWidth={true}
        value={stateParams.funnelOptionsJson}
        onChange={(e) => setValue('funnelOptionsJson', e.target.value)}
      />
    </EuiPanel> 
  );
};
