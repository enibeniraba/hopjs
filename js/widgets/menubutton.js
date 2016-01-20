/*!
 * hop.menuButton
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

hop.menuButton = function(params)
{
	hop.widget.apply(this, arguments);
};

hop.inherit(hop.menuButton, hop.widget, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			node: null,
			menu: null,
			menuParams: null,
			openClass: true,
			openClassName: "hop-menu-button-open",
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
		this.defaultMenuParams = this.getDefaultMenuParams();
		hop.widget.prototype.create.apply(this, arguments);
	},

	setNode: function(node)
	{
		var self = this;
		if (node && self.node === node)
			return;

		if (self.node)
		{
			self.node.removeAttribute("hopMenuButton");
			$(self.node).off("mousedown", self.nodeMousedown);
			$(self.node).off("click", self.nodeClick);
			$(self.node).off("mouseenter", self.nodeMouseenter);
			$(self.node).off("mouseleave", self.nodeMouseleave);
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

		node.hopMenuButton = self;
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
			this.menu.stopAction();
	},

	onNodeMouseleave: function(event)
	{
		if (this.menu && this.hideOnMouseleave)
			this.menu.hideWithDelay();
	},

	setMenu: function(menu)
	{
		var self = this, menuParams = {};
		if (menu && !(menu instanceof hop.dropdownMenu))
			menu = new hop.dropdownMenu(menu);
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
		if (this.node && this.openClass)
			$(this.node).addClass(this.openClassName);
	},

	onMenuLayerHide: function()
	{
		if (this.node && this.openClass)
			$(this.node).removeClass(this.openClassName);
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
		this.setButton(null);
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