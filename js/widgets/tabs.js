/*!
 * hop.tabs
 *
 * This file is a part of hopjs v@VERSION
 *
 * (c) @AUTHOR
 * Released under the MIT license
 *
 * Date: @DATE
 */

(function(document, $, hop)
{

hop.tabs = function(params)
{
	hop.widget.apply(this, arguments);
};

hop.inherit(hop.tabs, hop.widget, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			className: null,
			classPrefix: "hop-",
			node: null,
			event: "click",
			hash_activation: true
		};
	},

	getEvents: function()
	{
		return [
			"tabActivation"
		];
	},

	create: function(params)
	{
		var self = this;
		self.activeTab = null;
		hop.widget.prototype.create.apply(self, arguments);
		if (self.className === null)
			self.className = self.classPrefix+"tabs";
		self.generateHtml();
		if (self.tabs)
			self.activateOnCreate(params ? params.activeTab : null);
	},

	generateHtml: function()
	{
		var self = this,
			classPrefix = self.classPrefix+"tabs-",
			tabs = [], i, $children, headNode, bodyNode, event;
		if (!self.node)
			throw new Error("Node is not defined");

		$children = $(self.node).children("div");
		if (!$children || $children.length < 2)
			throw new Error("Node must have 2 child div nodes");

		headNode = $children[0];
		bodyNode = $children[1];
		$children = $(headNode).children("a");
		if (!$children || $children.length === 0)
			throw new Error("Buttons are not found");

		for (i = 0; i < $children.length; i++)
			tabs.push({button: $children[i]});

		$children = $(bodyNode).children("div");
		if (!$children || $children.length === 0 || $children.length !== tabs.length)
			throw new Error("Bodies are not found or number of bodies is not equal to number of tabs");

		$(self.node).addClass(self.className);
		$(headNode).addClass(classPrefix+"head");
		$(bodyNode).addClass(classPrefix+"body");
		$(tabs[0].button).addClass(classPrefix+"first");
		$(tabs[tabs.length-1].button).addClass(classPrefix+"last");
		for (i in tabs)
		{
			tabs[i].body = $children[i];
			tabs[i].body.style.display = "none";
			$(tabs[i].button).addClass(classPrefix+"tab-button");
			$(tabs[i].body).addClass(classPrefix+"tab-body");
			$(tabs[i].button).on(self.event, {tab: i}, function(event)
			{
				if (event.data.tab !== self.activeTab)
					self.activateTab(event.data.tab);
			});
		}
		self.tabs = tabs;
		self.node.hopTabs = self;
	},

	activateOnCreate: function(defaultActiveTab)
	{
		var self = this, activeTab = 0, key;
		if (hop.def(defaultActiveTab))
			activeTab = defaultActiveTab;
		else if (self.hash_activation && document.location.hash.length > 1)
		{
			for (key in self.tabs)
			{
				if (self.tabs[key].button.hash === document.location.hash)
				{
					activeTab = key;
					break;
				}
			}
		}
		if (activeTab < 0 || activeTab >= self.tabs.length)
			activeTab = 0;
		self.activateTab(activeTab);
	},

	activateTab: function(tab)
	{
		var self = this, classPrefix = self.classPrefix+"tabs-",
			tabs = self.tabs, prevTab = self.activeTab;
		tab = parseInt(tab);
		if (isNaN(tab) || tab < 0 || tab > tabs.length-1)
			return;

		if (prevTab !== null)
		{
			tabs[prevTab].body.style.display = "none";
			$(tabs[prevTab].button).removeClass(classPrefix+"active");
			if (prevTab > 0)
				$(tabs[prevTab-1].button).removeClass(classPrefix+"before-active");
			if (prevTab < tabs.length-1)
				$(tabs[prevTab+1].button).removeClass(classPrefix+"after-active");
		}
		tabs[tab].body.style.display = "block";
		$(tabs[tab].button).addClass(classPrefix+"active");
		if (tab > 0)
			$(tabs[tab-1].button).addClass(classPrefix+"before-active");
		if (tab < tabs.length-1)
			$(tabs[tab+1].button).addClass(classPrefix+"after-active");
		self.activeTab = tab;
		self.onTabActivation({tab: tab, prevTab: prevTab});
	},

	onTabActivation: function(data)
	{
		this.trigger("tabActivation", data);
	}
});

})(document, jQuery, hopjs);