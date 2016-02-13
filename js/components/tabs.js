/*!
 * hopjs.tabs
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
	
var cp = "hopjs-tabs-";

hop.tabs = function(params)
{
	hop.component.apply(this, arguments);
};

hop.inherit(hop.tabs, hop.component, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			extraClass: "",
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
		hop.component.prototype.create.apply(self, arguments);
		self.generateHtml();
		if (self.tabs)
			self.activateOnCreate(params ? params.activeTab : null);
	},

	generateHtml: function()
	{
		var self = this,
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

		$(self.node).addClass("hopjs-tabs");
		if (self.extraClass !== "")
			$(self.node).addClass(self.extraClass);
		$(headNode).addClass(cp+"head");
		$(bodyNode).addClass(cp+"body");
		$(tabs[0].button).addClass(cp+"first");
		$(tabs[tabs.length-1].button).addClass(cp+"last");
		for (i in tabs)
		{
			tabs[i].body = $children[i];
			tabs[i].body.style.display = "none";
			$(tabs[i].button).addClass(cp+"tab-button");
			$(tabs[i].body).addClass(cp+"tab-body");
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
		var self = this,
			tabs = self.tabs, prevTab = self.activeTab;
		tab = parseInt(tab);
		if (isNaN(tab) || tab < 0 || tab > tabs.length-1)
			return;

		if (prevTab !== null)
		{
			tabs[prevTab].body.style.display = "none";
			$(tabs[prevTab].button).removeClass(cp+"active");
			if (prevTab > 0)
				$(tabs[prevTab-1].button).removeClass(cp+"before-active");
			if (prevTab < tabs.length-1)
				$(tabs[prevTab+1].button).removeClass(cp+"after-active");
		}
		tabs[tab].body.style.display = "block";
		$(tabs[tab].button).addClass(cp+"active");
		if (tab > 0)
			$(tabs[tab-1].button).addClass(cp+"before-active");
		if (tab < tabs.length-1)
			$(tabs[tab+1].button).addClass(cp+"after-active");
		self.activeTab = tab;
		self.onTabActivation({tab: tab, prevTab: prevTab});
	},

	onTabActivation: function(data)
	{
		this.trigger("tabActivation", data);
	}
});

})(document, jQuery, hopjs);