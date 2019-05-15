// Include the angular controller
import './ob-kb-funnel.css';
import './funnelController';

import optionsTemplate from 'plugins/ob-kb-funnel/funnelEditor.html';
import template from 'plugins/ob-kb-funnel/ob-kb-funnel.html';

import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { Schemas } from 'ui/vis/editors/default/schemas';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';


// The provider function, which must return our new visualization type
const FunnelProvider = (Private) => {
	const VisFactory = Private(VisFactoryProvider);

	// Describe our visualization
	return VisFactory.createAngularVisualization({
		name: 'obFunnel', // The internal id of the visualization (must be unique)
		title: 'Funnel View', // The title of the visualization, shown to the user
		legacyIcon : 'fa-toggle-down', // The font awesome icon of this visualization, todo: update for k7: prop should be icon:<euicon:something
		description: 'Funnel visualization', // The description of this vis
		visConfig: {
			template: template,
			defaults: {
				sumOption: "byBuckets",
				absolute: true,
				percent: false,
				percentFromTop: false,
				percentFromAbove: false,
				funnelOptions : "\
{\n\
  \"block\": { \n\
    \"dynamicHeight\": true,\n\
    \"minHeight\": 30,\n\
    \"highlight\": true\n\
  },\n\
  \"chart\": {\n\
    \"curve\": {\n\
      \"enabled\": true\n\
    }\n\
  }\n\
}"
			}
		},	
		responseHandler: 'legacy',
		editorConfig:	{
			optionsTemplate: optionsTemplate,
			// Define the aggregation your visualization accepts
			schemas: new Schemas([
				{
					group: 'metrics',
					name: 'tagsize',
					title: 'Value',
					min: 1,
					max: 1,
					aggFilter: ['count', 'avg', 'sum', 'min', 'max', 'cardinality', 'std_dev']
				},
				{
					group: 'buckets',
					name: 'tags',
					title: 'Aggregation',
					min: 1,
					max: 1,
					aggFilter: '!geohash_grid'
				}
			]),
		},
	
	});
}
VisTypesRegistryProvider.register(FunnelProvider);

export default FunnelProvider;
