hop.browser = {
	animationInfo: function()
	{
		if (!def(hop.browser.animationInfoCache))
		{
			var elem = document.createElement("div"), key,
				transitions = {
					transition: "transitionend",
					OTransition: "oTransitionEnd",
					MozTransition: "transitionend",
					WebkitTransition: "webkitTransitionEnd",
					msTransition: 'MSTransitionEnd'
				},
				transforms = {
					transform: "transform",
					OTransform: "-o-transform",
					MozTransform: "-moz-transform",
					WebkitTransform: "-webkit-transform",
					msTransform: "-ms-transform"
				},
				result = {
					transitionProperty: null,
					transitionendEvent: null,
					transformProperty: null,
					transformCssProperty: null
				};
			for (key in transitions)
			{
				if (def(elem.style[key]))
				{
					result.transitionProperty = key;
					result.transitionendEvent = transitions[key];
					break;
				}
			}
			for (key in transforms)
			{
				if (def(elem.style[key]))
				{
					result.transformProperty = key;
					result.transformCssProperty = transforms[key];
					break;
				}
			}
			hop.browser.animationInfoCache = result;
		}
		return hop.browser.animationInfoCache;
	},

	isChrome: function()
	{
		return def(window.chrome);
	},

	isOldOpera: function()
	{
		if (!def(hop.browser.isOldOperaCache))
			hop.browser.isOldOperaCache = /^Opera\//.test(navigator.userAgent);
		return hop.browser.isOldOperaCache;
	}
};