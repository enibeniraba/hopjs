/*!
 * hopjs.menuButton
 *
 * This file is a part of hopjs v@VERSION
 *
 * (c) @AUTHOR
 * Released under the MIT license
 *
 * Date: @DATE
 */

(function(document, $, hopjs)
{

hopjs.types["menutrigger"] = "hopjs.menuTrigger";

hopjs.menuTrigger = function(params)
{
	hopjs.component.apply(this, arguments);
};

hopjs.inherit(hopjs.menuTrigger, hopjs.component, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			node: null,
			menu: null,
			menuParams: null,
			useOpenClass: true,
			openClass: "hopjs-menu-trigger-open",
			showOnMousedown: false,
			hideOnMousedown: false,
			showOnClick: true,
			hideOnClick: true,
			showOnMouseenter: false,
			hideOnMouseleave: false,
			stopActionOnMouseenter: false
		};
	},

	getDefaultMenuParams: function()
	{
		return {
			layerParams: {
				elementAlignY: "bottom",
				collision: "flipfit"
			}
		};
	},

	getEvents: function()
	{
		return [
			"destroy"
		];
	},

	create: function(params)
	{
		var self = this;
		self.defaultMenuParams = self.getDefaultMenuParams();
		hopjs.component.prototype.create.apply(self, arguments);
	},

	setNode: function(node)
	{
		var self = this;
		if (node && self.node === node)
			return;

		if (self.node)
		{
			self.node.removeAttribute("hopMenuTrigger");
			$(self.node).off("mousedown", self.nodeMousedown);
			$(self.node).off("click", self.nodeClick);
			$(self.node).off("mouseenter", self.nodeMouseenter);
			$(self.node).off("mouseleave", self.nodeMouseleave);
			$(self.node).removeClass(self.openClass);
			if (self.menu)
			{
				self.menu.layer.configure({
					element: null
				});
			}
		}
		self.node = node;
		if (!node)
			return;

		node.hopMenuTrigger = self;
		if (self.menu)
		{
			self.menu.layer.configure({
				element: node
			});
		}

		self.nodeMousedown = function(event)
		{
			self.onNodeMousedown(event);
		};
		$(node).on("mousedown", self.nodeMousedown);

		self.nodeClick = function(event)
		{
			self.onNodeClick(event);
		};
		$(node).on("click", self.nodeClick);

		self.nodeMouseenter = function(event)
		{
			self.onNodeMouseenter(event);
		};
		$(node).on("mouseenter", self.nodeMouseenter);

		self.nodeMouseleave = function(event)
		{
			self.onNodeMouseleave(event);
		};
		$(node).on("mouseleave", self.nodeMouseleave);
	},

	onNodeMousedown: function(event)
	{
		var self = this;
		if (event.which !== 1 || !self.menu)
			return;

		if (self.showOnMousedown)
		{
			if (self.hideOnMousedown)
				self.menu.toggle();
			else
				self.menu.show();
		}
		else if (self.hideOnMousedown)
			self.menu.hide();
		self.menu.mousedown = true;
	},

	onNodeClick: function(event)
	{
		var self = this;
		if (!self.menu)
			return;

		if (self.showOnClick)
		{
			if (self.hideOnClick)
				self.menu.toggle();
			else
				self.menu.show();
		}
		else if (self.hideOnClick)
			self.menu.hide();
	},

	onNodeMouseenter: function(event)
	{
		if (!this.menu)
			return;

		if (this.showOnMouseenter)
			this.menu.showWithDelay();
		else if (this.stopActionOnMouseenter)
			this.menu.stopHiding();
	},

	onNodeMouseleave: function(event)
	{
		if (this.menu && this.hideOnMouseleave)
			this.menu.hideWithDelay();
	},

	setMenu: function(menu)
	{
		var self = this, menuParams = {};
		if (menu && !(menu instanceof hopjs.dropdownMenu))
			menu = new hopjs.dropdownMenu(menu);
		if (menu === self.menu)
			return;

		if (self.menu)
		{
			self.menu.layer.off("show", self.menuLayerShow);
			self.menu.layer.off("hide", self.menuLayerHide);
			$(document).off("mousedown", self.documentMousedown);
			self.menu.layer.$node.off("mousedown", self.layerMousedown);
			self.menu.layer.configure({
				element: null
			});
		}
		self.menu = menu;
		if (!menu)
			return;

		$.extend(true, menuParams, self.defaultMenuParams);
		if (self.menuParams)
			$.extend(true, menuParams, self.menuParams);
		menu.configure(menuParams);
		if (self.node)
		{
			menu.layer.configure({
				element: self.node
			});
		}

		self.menuLayerShow = function()
		{
			self.onMenuLayerShow();
		};
		menu.layer.on("show", self.menuLayerShow);

		self.menuLayerHide = function()
		{
			self.onMenuLayerHide();
		};
		menu.layer.on("hide", self.menuLayerHide);
	},

	onMenuLayerShow: function()
	{
		if (this.node && this.useOpenClass)
			$(this.node).addClass(this.openClass);
	},

	onMenuLayerHide: function()
	{
		if (this.node && this.useOpenClass)
			$(this.node).removeClass(this.openClass);
	},

	setMenuParams: function(params, update)
	{
		var self = this, menuParams = {};
		if (params && update && self.menuParams)
			$.extend(true, self.menuParams, params);
		else
			self.menuParams = params;
		if (self.menu)
		{
			$.extend(true, menuParams, self.defaultMenuParams);
			if (self.menuParams)
				$.extend(true, menuParams, self.menuParams);
			self.menu.configure(menuParams);
		}
	},

	destroy: function()
	{
		this.setNode(null);
		if (this.menu)
			this.menu.destroy();
		this.onDestroy();
	},

	onDestroy: function()
	{
		this.trigger("destroy");
	}
});

})(document, jQuery, hopjs);