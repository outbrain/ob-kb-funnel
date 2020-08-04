# Kibana Funnel Visualization

![example image](https://raw.githubusercontent.com/outbrain/ob-kb-funnel/master/docs/image1.png)

Kibana Visualization plugin for displaying a funnel.   
Based on D3 Funnel lib - https://github.com/jakezatecky/d3-funnel   

### version
Kibana version v7.7.0   

### Installation
Run `node ./scripts/kibana_plugin.js install https://github.com/outbrain/ob-kb-funnel/releases/download/v7.7.0/ob-kb-funnel-7.7.0.zip`

### Usage
Once installed, you'll see an additional type of visualization, named "Funnel View". 
The funnel can be constructed from two types of aggregations: 'By Buckets' and 'By Metrics'

* 'By Buckets' - Every slice in the funnel is a bucket. You should define 1 metric and 1 bucket Aggregation.
![example image](https://raw.githubusercontent.com/outbrain/ob-kb-funnel/master/docs/funnel-buckets.png)

* 'By Metrics' - Every slice in the funnel is a different metric. You should define several metrics, without bucket aggregations.
![example image](https://raw.githubusercontent.com/outbrain/ob-kb-funnel/master/docs/funnel-metrics.png)

Advanced D3-funnel options can be set in the Options tab, along with other funnel options.

