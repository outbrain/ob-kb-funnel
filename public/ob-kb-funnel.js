// Include the angular controller
import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';

require('plugins/ob-kb-funnel/funnelController');
require('plugins/ob-kb-funnel/ob-kb-funnel.css');

// The provider function, which must return our new visualization type
function FunnelProvider(Private) {
	const TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
    const Schemas = Private(VisSchemasProvider);
	// Describe our visualization
	return new TemplateVisType({
		name: 'obFunnel', // The internal id of the visualization (must be unique)
		title: 'Funnel View', // The title of the visualization, shown to the user
		description: 'Funnel visualization', // The description of this vis
		icon: 'fa-toggle-down', // The font awesome icon of this visualization
		template: require('plugins/ob-kb-funnel/ob-kb-funnel.html'), // The template, that will be rendered for this visualization
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
		params: {
			editor: require('plugins/ob-kb-funnel/funnelEditor.html'),
			defaults: {
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
		}
	});
}

require('ui/registry/vis_types').register(FunnelProvider);
