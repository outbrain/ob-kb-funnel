export default kibana => new kibana.Plugin({
  id: 'ob-kb-funnel',
  uiExports: {
    visTypes: ['plugins/ob-kb-funnel/ob-kb-funnel'],
  },
});
