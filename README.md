# Kibana Funnel Visualization

![example image](https://raw.githubusercontent.com/outbrain/ob-kb-funnel/master/docs/image1.png)

Kibana Visualization plugin for displaying a funnel
Based on D3 Funnel lib - https://github.com/jakezatecky/d3-funnel

### Installation
Run `bin/kibana-plugin install https://github.com/outbrain/ob-kb-funnel/releases/download/v7.4.0/ob-kb-funnel-7.4.0.zip`

Inside the plugin dir run `yarn kbn bootstrap`

### Usage
Once installed, you'll see an additional type of visualization, named "Funnel View". The funnel is created from the buckets of the aggregation or from metrics. Advanced D3-funnel options can be set in the Options tab, along with other funnel metrics.

