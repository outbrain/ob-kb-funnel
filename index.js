module.exports = function(kibana) {
	return new kibana.Plugin({
		uiExports: {
			visTypes: ['plugins/ob-kb-funnel/ob-kb-funnel']
		}
	});
};