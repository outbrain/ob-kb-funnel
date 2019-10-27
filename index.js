
export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'ob-kb-funnel',
    uiExports: {
      visTypes: ['plugins/ob-kb-funnel/ob-kb-funnel']
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },
  });
  
}

