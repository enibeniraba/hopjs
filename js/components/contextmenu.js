/*!
 * hopjs.contextMenu
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

hop.contextMenu = function(params)
{
	hop.component.apply(this, arguments);
};

hop.inherit(hop.contextMenu, hop.component, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			node: null,
			menu: null,
			menuParams: null,
			useOpenClass: true,
			openClass: "hopjs-context-menu-open",
			switchKey: true,
			showOnSwitchKey: false
		};
	},

	getDefaultMenuParams: function()
	{
		return {
			layerParams: {
				position: "fixed",
				elementAlignY: "top",
				elementAlignX: "left",
				alignY: "top",
				alignX: "left",
				collision: "flipfit",
				collisionElement: "window"
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
		hop.component.prototype.create.apply(self, arguments);
	},

	setNode: function(node)
	{
		var self = this;
		if (node && self.node === node)
			return;

		if (self.node)
		{
			self.node.removeAttribute("hopContextMenu");
			$(self.node).off("contextmenu", self.nodeContextMenu);
			$(self.node).removeClass(self.openClass);
		}
		self.node = node;
		if (!node)
			return;

		node.hopContextMenu = self;

		self.nodeContextMenu = function(event)
		{
			self.onNodeContextMenu(event);
		};
		$(node).on("contextmenu", self.nodeContextMenu);
	},

	onNodeContextMenu: function(event)
	{
		if (!this.menu)
			return;

		if (!this.switchKey || this.showOnSwitchKey && event.ctrlKey
			|| !this.showOnSwitchKey && !event.ctrlKey)
		{
			event.preventDefault();
			this.menu.layer.configure({
				element: "region",
				elementRegion: {
					top: event.pageY,
					left: event.pageX
				}
			});
			this.menu.show();
		}
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