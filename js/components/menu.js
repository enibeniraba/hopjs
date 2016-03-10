/*!
 * hop.menu
 *
 * This file is a part of hopjs v@VERSION
 *
 * (c) @AUTHOR
 * Released under the MIT license
 *
 * Date: @DATE
 */

(function(window, document, $, hop)
{
	
var cp = "hopjs-menu-";

hop.menu = function(params)
{
	hop.component.apply(this, arguments);
};

hop.inherit(hop.menu, hop.component, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			extraClass: "",
			type: "click",
			dropdownMenuParams: null,
			useExtraMenu: false,
			extraMenuParams: null,
			extraMenuDropdownMenuParams: null,
			parentNode: null
		};
	},

	getEvents: function()
	{
		return [
			"itemAdd",
			"itemRemove"
		];
	},

	getDefaultDropdownMenuParams: function()
	{
		return {
			layerParams: {
				elementAlignY: "bottom",
				collisionX: "fit",
				collisionY: "flipfit"
			}
		};
	},
	
	getDefaultExtraMenuParams: function()
	{
		return {
			layerParams: {
				elementAlignX: "right",
				alignX: "right"
			},
			submenuLayerParams: {
				elementAlignY: "top",
				elementAlignX: "right",
				alignY: "top",
				alignX: "left"
			}
		};
	},
	
	getDefaultExtraMenuDropdownMenuParams: function()
	{
		return {
			layerParams: {
				elementAlignY: "top",
				collisionX: "flipfit",
				collisionY: "flipfit"
			}
		};
	},

	create: function(params)
	{
		var self = this;
		self.defaultDropdownMenuParams = self.getDefaultDropdownMenuParams();
		self.defaultExtraMenuParams = self.getDefaultExtraMenuParams();
		self.defaultExtraMenuDropdownMenuParams = self.getDefaultExtraMenuDropdownMenuParams();
		self.mousedown = false;
		self.showMenu = false;
		self.showingMenu = false;
		self.setExtraMenuButtonHighlightedOnMenuHide = true;
		self.setShowMenu = true;
		self.items = [];
		hop.component.prototype.create.apply(self, arguments);
		self.generateHtml();
		self.setUseExtraMenu(self.useExtraMenu);
		if (params && params.items)
			self.addItems(params.items);
	},

	setType: function(value)
	{
		if (value !== "click" && value !== "hover" || this.type === value)
			return;

		this.type = value;
		this.updateDropdownMenuParams();
	},

	setDropdownMenuParams: function(params, update)
	{
		if (params && update && this.dropdownMenuParams)
			$.extend(true, this.dropdownMenuParams, params);
		else
			this.dropdownMenuParams = params;
		this.updateDropdownMenuParams();
	},
	
	setUseExtraMenu: function(value)
	{
		this.useExtraMenu = !!value;
		if (this.extraMenu)
		{
			this.extraMenu.hide({animate: false});
			this.extraMenuButtonNode.style.display = (value ? "block" : "none");
			this.updateSize();
		}
	},
	
	setExtraMenuParams: function(params, update)
	{
		var self = this;
		if (params && update && self.extraMenuParams)
			$.extend(true, self.extraMenuParams, params);
		else
			self.extraMenuParams = params;
		if (self.extraMenu)
			self.extraMenu.configure(self.calcExtraMenuParams());
	},
	
	calcExtraMenuParams: function()
	{
		var result = {};
		$.extend(true, result, this.defaultDropdownMenuParams, this.dropdownMenuParams, this.defaultExtraMenuParams, this.extraMenuParams);
		return result;
	},
	
	setExtraMenuDropdownMenuParams: function(params, update)
	{
		if (params && update && this.extraMenuDropdownMenuParams)
			$.extend(true, this.extraMenuDropdownMenuParams, params);
		else
			this.extraMenuDropdownMenuParams = params;
		this.updateDropdownMenuParams();
	},

	updateDropdownMenuParams: function()
	{
		for (var i in this.items)
		{
			if (this.items[i].menu)
				this.items[i].updateMenuParams();
		}
	},

	generateHtml: function()
	{
		var self = this, params = self.calcExtraMenuParams();
		self.node = document.createElement("div");
		self.node.className = "hopjs-menu";
		if (self.extraClass !== "")
			self.node.className += " ".self.extraClass;
		self.node.hopMenu = self;
		self.parentNode.appendChild(self.node);
		self.extraMenuButtonNode = document.createElement("div");
		self.extraMenuButtonNode.innerHTML = "&nbsp;";
		self.extraMenuButtonNode.className = "hopjs-menu-extra-menu-button";
		self.extraMenuButtonNode.style.display = "none";
		self.node.appendChild(self.extraMenuButtonNode);
		self.$extraMenuButton = $(self.extraMenuButtonNode);
		
		$.extend(true, params, {
			layerParams: {
				element: self.extraMenuButtonNode
			}
		});
		self.extraMenu = new hop.dropdownMenu(params);
		
		self.$extraMenuButton.on("mouseenter", function(event)
		{
			self.onExtraMenuButtonMouseenter(event);
		});

		self.$extraMenuButton.on("mouseleave", function(event)
		{
			self.onExtraMenuButtonMouseleave(event);
		});
		
		self.$extraMenuButton.on("mousedown", function(event)
		{
			self.onExtraMenuButtonMousedown(event);
		});
		
		self.extraMenu.layer.$node.on("mouseenter", function(event)
		{
			self.onExtraMenuMouseenter(event);
		});

		self.extraMenu.layer.$node.on("mousedown", function(event)
		{
			self.onExtraMenuMousedown(event);
		});

		self.extraMenu.layer.on("showBefore", function()
		{
			self.onExtraMenuShowBefore();
		});

		self.extraMenu.layer.on("hideBefore", function()
		{
			self.onExtraMenuHideBefore();
		});

		$(window).on("resize", function(event)
		{
			self.onWindowResize(event);
		});

		$(document).on("mousedown", function(event)
		{
			self.onDocumentMousedown(event);
		});
	},
	
	onExtraMenuButtonMouseenter: function(event)
	{
		var self = this, i;
		for (i in self.items)
			self.items[i].onExtraMenuButtonMouseenter(event);
		self.setExtraMenuButtonHighlighted(true);
		self.setExtraMenuButtonHighlightedOnMenuHide = false;
		if (self.type === "hover")
			self.extraMenu.showWithDelay();
		else if (self.showMenu)
		{
			self.extraMenu.layer.finishAnimation();
			self.extraMenu.show({animate: false});
		}
	},
	
	onExtraMenuButtonMouseleave: function(event)
	{
		if (this.type === "hover")
			this.extraMenu.hideWithDelay();
		this.setExtraMenuButtonHighlighted(false);
		this.setExtraMenuButtonHighlightedOnMenuHide = true;
	},
	
	onExtraMenuButtonMousedown: function(event)
	{
		if (event.which === 1)
		{
			this.extraMenu.mousedown = true;
			this.extraMenu.toggle();
			this.showingMenu = true;
		}
	},
	
	onExtraMenuMouseenter: function(event)
	{
		this.setExtraMenuButtonHighlighted(true);
	},
	
	onExtraMenuMousedown: function(event)
	{
		this.mousedown = true;
	},

	onExtraMenuShowBefore: function()
	{
		var i, item;
		for (i in this.items)
		{
			item = this.items[i];
			if (item.menu)
			{
				item.setParentMenuShowMenu = false;
				item.menu.layer.finishAnimation();
				item.menu.hide({animate: false});
				item.setParentMenuShowMenu = true;
			}
		}
		this.setExtraMenuButtonOpened(true);
		this.showMenu = true;
	},

	onExtraMenuHideBefore: function()
	{
		if (this.setExtraMenuButtonHighlightedOnMenuHide)
			this.setExtraMenuButtonHighlighted(false);
		this.setExtraMenuButtonOpened(false);
		if (this.setShowMenu)
			this.showMenu = false;
	},
	
	onWindowResize: function(event)
	{
		if (this.useExtraMenu)
			this.updateSize();
	},
	
	updateSize: function()
	{
		var self = this, i, item, top = null, hideFrom = null, hideFrom2 = null;
		if (!self.items)
			return;
		
		self.extraMenuButtonNode.style.display = "none";
		for (i in self.items)
		{
			item = self.items[i];
			if (item.extraMenuItem)
			{
				item.extraMenuItem = null;
				if (item.menu)
					item.menu.parentItem = null;
			}
			if (item.visible)
			{
				item.node.style.display = "block";
				if (top === null)
					top = $(item.node).offset().top;
			}
		}
		if (self.useExtraMenu)
		{
			for (i in self.items)
			{
				item = self.items[i];
				if (hideFrom !== null || $(item.node).offset().top > top)
				{
					if (item.menu)
						item.menu.hide({animate: false});
					 item.node.style.display = "none";
					 if (hideFrom === null)
						hideFrom = i;
				}
			}
			if (hideFrom !== null)
			{
				self.extraMenuButtonNode.style.display = "block";
				for (i = 0; i < hideFrom; i++)
				{
					item = self.items[i];
					if (hideFrom2 !== null || $(item.node).offset().top > top)
					{
						if (item.menu)
							item.menu.hide({animate: false});
						 item.node.style.display = "none";
						 if (hideFrom2 === null)
							hideFrom2 = i;
					}
				}
				if (hideFrom2 !== null)
					hideFrom = hideFrom2;

				self.extraMenu.removeItems();
				for (i = hideFrom; i < self.items.length; i++)
				{
					item = self.items[i];
					item.extraMenuItem = self.extraMenu.addItem({
						active: item.active,
						visible: item.visible,
						text: item.text,
						icon: item.icon,
						title: item.title,
						url: item.url,
						menu: item.menu
					});
				}
			}
			else
				self.extraMenu.hide({animate: false});
		}
		for (i in self.items)
			self.items[i].updateMenuParams();
	},

	onDocumentMousedown: function(event)
	{
		if (!this.mousedown && !this.showingMenu)
			this.showMenu = false;
		this.mousedown = false;
		this.showingMenu = false;
	},

	setItems: function(items)
	{
		this.removeItems();
		this.addItems(items);
	},

	addItems: function(items)
	{
		for (var i in items)
			this.addItem(items[i]);
	},

	addItem: function(item, before)
	{
		var self = this, items = [], i;
		before = hop.ifDef(before);
		if (before !== null)
		{
			before = parseInt(before);
			if (isNaN(before))
				before = null;
			else if (before < 0)
				before = 0;
		}
		if (typeof item === "string")
		{
			item = {
				text: item
			};
		}
		if (item.parentMenu)
			item.parentMenu.removeItem(item);
		item.parentMenu = self;
		if (!(item instanceof hop.menuItem))
			item = new hop.menuItem(item);
		if (self.items.length === 0 || before === null || before >= self.items.length)
		{
			self.node.appendChild(item.node);
			self.items.push(item);
		}
		else
		{
			for (i in self.items)
			{
				if (i === before)
				{
					self.node.insertBefore(item.node, self.items[i].node);
					items.push(item);
				}
				items.push(self.items[i]);
			}
			self.items = items;
		}
		self.onItemsChange();
		item.afterAttach();
		self.onItemAdd({
			item: item
		});
		return item;
	},

	onItemsChange: function()
	{
		this.updatePosition(true);
	},

	onItemAdd: function(data)
	{
		if (this.useExtraMenu)
			this.updateSize();
		this.trigger("itemAdd", data);
	},

	removeItems: function()
	{
		while (this.items.length > 0)
			this.removeItem(0);
	},

	removeItem: function(item)
	{
		var self = this, items = [], index = null, i;
		if (typeof item === "number")
		{
			index = item;
			item = self.items[index];
			if (!item)
				return;
		}
		else
		{
			for (i in self.items)
			{
				if (self.items[i] === item)
				{
					index = i;
					break;
				}
			}
		}
		if (index === null)
			return;

		item.node.parentNode.removeChild(item.node);
		item.parentMenu = null;
		self.items.splice(index, 1);
		self.onItemsChange();
		item.afterDetach(self, index);
		self.onItemRemove({
			item: item,
			index: index
		});
		return item;
	},

	onItemRemove: function(data)
	{
		if (this.useExtraMenu)
			this.updateSize();
		this.trigger("itemRemove", data);
	},

	getItemById: function(id, recursive)
	{
		var items = this.items, i, item;
		id = String(id);
		for (i in items)
		{
			item = items[i];
			if (item.id === id)
				return item;
		}
		if (recursive)
		{
			for (i in items)
			{
				item = items[i];
				if (item.menu)
				{
					item = item.menu.getItemById(id, true);
					if (item)
						return item;
				}
			}
		}
		return null;
	},

	updatePosition: function(move)
	{
		for (var i in this.items)
		{
			if (this.items[i].menu)
				this.items[i].menu.updatePosition(move);
		}
	},

	calcDropdownMenuParams: function()
	{
		var result = {};
		$.extend(true, result, this.defaultDropdownMenuParams);
		if (this.dropdownMenuParams)
			$.extend(true, result, this.dropdownMenuParams);
		return result;
	},

	calcExtraMenuDropdownMenuParams: function()
	{
		var result = {};
		$.extend(true, result, this.defaultExtraMenuDropdownMenuParams);
		if (this.extraMenuDropdownMenuParams)
			$.extend(true, result, this.extraMenuDropdownMenuParams);
		return result;
	},
	
	onItemMouseenter: function(item, event)
	{
		var self = this;
		self.setExtraMenuButtonHighlighted(false);
		if (self.type === "hover")
			self.extraMenu.hideWithDelay();
		else
		{
			self.setShowMenu = false;
			self.extraMenu.hide({animate: false});
			self.setShowMenu = true;
		}
	},
	
	setExtraMenuButtonHighlighted: function(value)
	{
		this.$extraMenuButton.toggleClass(cp+"highlighted", value);
	},

	setExtraMenuButtonOpened: function(value)
	{
		this.$extraMenuButton.toggleClass(cp+"opened", value);
	}
});

hop.menuItem = function(params)
{
	hop.component.apply(this, arguments);
};

hop.inherit(hop.menuItem, hop.component);

$.extend(hop.menuItem.prototype, {
	getDefaults: function()
	{
		return {
			parentMenu: null,
			extraClass: "",
			id: null,
			visible: true,
			active: true,
			text: "",
			icon: null,
			title: "",
			url: null,
			menuParams: null,
			extraMenuParams: null,
			extraMenuItem: null
		};
	},
	
	create: function(params)
	{
		var self = this;
		self.setHighlightedOnMenuHide = true;
		self.setParentMenuShowMenu = true;
		self.menu = null;
		hop.component.prototype.create.apply(this, arguments);
		self.generateHtml();
		self.setVisible(self.visible);
		self.setActive(self.active);
		self.setText(self.text);
		self.setIcon(self.icon);
		self.setTitle(self.title);
		self.setUrl(self.url);
		if (params && params.menu)
			self.setMenu(params.menu);
	},

	setVisible: function(visible)
	{
		var self = this;
		self.visible = !!visible;
		if (self.node)
		{
			if (self.visible)
				delete self.node.style.display;
			else
				self.node.style.display = "none";
			if (self.parentMenu)
				self.parentMenu.onItemsChange();
			if (self.menu)
				self.menu.hide({animate: false});
		}
		if (self.extraMenuItem)
			self.extraMenuItem.setVisible(visible);
	},

	setActive: function(active)
	{
		this.active = active;
		if (this.node)
			this.$node.toggleClass(cp+"inactive", !active);
		if (this.extraMenuItem)
			this.extraMenuItem.setActive(active);
	},

	setText: function(text)
	{
		this.text = text;
		if (this.node)
			this.node.innerHTML = text;
		if (this.extraMenuItem)
			this.extraMenuItem.setText(text);
	},

	setIcon: function(icon)
	{
		this.icon = icon;
		if (this.node)
		{
			this.node.style.backgroundImage = (icon === null ? "none" : "url("+icon+")");
			this.$node.toggleClass(cp+"icon", icon !== null);
		}
		if (this.extraMenuItem)
			this.extraMenuItem.setIcon(icon);
	},

	setTitle: function(title)
	{
		this.title = title;
		if (this.node)
			this.node.title = title;
		if (this.extraMenuItem)
			this.extraMenuItem.setTitle(title);
	},

	setUrl: function(url)
	{
		this.url = url;
		if (this.node)
		{
			if (url === null)
				this.node.removeAttribute("href");
			else
				this.node.href = url;
		}
		if (this.extraMenuItem)
			this.extraMenuItem.setUrl(url);
	},

	setMenuParams: function(params, update)
	{
		if (params && update && this.menuParams)
			$.extend(true, this.menuParams, params);
		else
			this.menuParams = params;
		if (this.menu)
			this.updateMenuParams();
	},
	
	setExtraMenuParams: function(params, update)
	{
		if (params && update && this.menuParams)
			$.extend(true, this.extraMenuParams, params);
		else
			this.extraMenuParams = params;
		if (this.menu)
			this.updateMenuParams();
	},

	setMenu: function(menu)
	{
		var self = this;
		if (menu && !(menu instanceof hop.dropdownMenu))
			menu = new hop.dropdownMenu(menu);
		self.menu = menu;
		if (menu)
		{
			if (self.extraMenuItem)
				self.extraMenuItem.setMenu(menu);
				
			menu.layer.$node.on("mouseenter", function(event)
			{
				self.onMenuMouseenter(event);
			});

			menu.layer.$node.on("mousedown", function(event)
			{
				self.onMenuMousedown(event);
			});

			menu.layer.on("showBefore", function()
			{
				self.onMenuShowBefore();
			});

			menu.layer.on("hideBefore", function()
			{
				self.onMenuHideBefore();
			});

			menu.on("loadStart", function()
			{
				self.onMenuLoadStart();
			});

			menu.on("loadFinish", function()
			{
				self.onMenuLoadFinish();
			});

			menu.on("itemAdd", function()
			{
				self.onMenuItemAdd();
			});

			menu.on("itemRemove", function()
			{
				self.onMenuItemRemove();
			});

			self.updateMenuParams();
			menu.updateLayerParams();
			self.updateParentMark();
		}
	},

	onMenuMouseenter: function(event)
	{
		this.setHighlighted(true);
	},
	
	onMenuMousedown: function(event)
	{
		this.parentMenu.mousedown = true;
	},

	onMenuShowBefore: function()
	{
		var i, item, parentMenu = this.parentMenu;
		for (i in parentMenu.items)
		{
			item = parentMenu.items[i];
			if (item.menu && item !== this)
			{
				item.setParentMenuShowMenu = false;
				item.menu.layer.finishAnimation();
				item.menu.hide({animate: false});
				item.setParentMenuShowMenu = true;
			}
		}
		if (!this.extraMenuItem)
		{
			parentMenu.setShowMenu = false;
			parentMenu.extraMenu.layer.finishAnimation();
			parentMenu.extraMenu.hide({animate: false});
			parentMenu.setShowMenu = true;
			parentMenu.showMenu = true;
		}
		this.setOpened(true);
	},

	onMenuHideBefore: function()
	{
		if (this.setHighlightedOnMenuHide)
			this.setHighlighted(false);
		this.setOpened(false);
		if (this.setParentMenuShowMenu && !this.extraMenuItem)
			this.parentMenu.showMenu = false;
	},

	onMenuLoadStart: function()
	{
		this.setLoading(true);
	},

	onMenuLoadFinish: function()
	{
		this.setLoading(false);
	},

	onMenuItemAdd: function()
	{
		this.updateParentMark();
	},

	onMenuItemRemove: function()
	{
		this.updateParentMark();
	},

	generateHtml: function()
	{
		var self = this;
		self.node = document.createElement("a");
		self.node.className = cp+"item";
		if (self.extraClass !== "")
			self.node.className += " ".self.extraClass;
		self.$node = $(self.node);
		self.node.hopMenuItem = self;
		
		self.$node.on("mouseenter", function(event)
		{
			self.onMouseenter(event);
		});

		self.$node.on("mouseleave", function(event)
		{
			self.onMouseleave(event);
		});

		self.$node.on("mousedown", function(event)
		{
			self.onMousedown(event);
		});
	},

	onMouseenter: function(event)
	{
		var self = this, i, item;
		for (i in self.parentMenu.items)
		{
			item = self.parentMenu.items[i];
			if (item !== self)
				item.onOtherItemMouseenter(self, event);
		}
		self.parentMenu.onItemMouseenter(self, event);
		self.setHighlighted(true);
		self.setHighlightedOnMenuHide = false;
		if (self.menu && self.active)
		{
			if (self.parentMenu.type === "hover")
				self.menu.showWithDelay();
			else if (self.parentMenu.showMenu)
			{
				self.menu.layer.finishAnimation();
				self.menu.show({animate: false});
			}
		}
	},

	onOtherItemMouseenter: function(item, event)
	{
		var self = this;
		self.setHighlighted(false);
		if (self.menu)
		{
			if (self.parentMenu.type === "hover")
				self.menu.hideWithDelay();
			else
			{
				self.setParentMenuShowMenu = false;
				self.menu.hide({animate: false});
				self.setParentMenuShowMenu = true;
			}
		}
	},

	onMouseleave: function(event)
	{
		if (this.menu && this.parentMenu.type === "hover")
			this.menu.hideWithDelay();
		this.setHighlighted(false);
		this.setHighlightedOnMenuHide = true;
	},

	onMousedown: function(event)
	{
		if (event.which === 1 && this.active && this.menu)
		{
			this.menu.mousedown = true;
			this.menu.toggle();
			this.parentMenu.showingMenu = true;
		}
	},

	afterAttach: function()
	{
		if (this.menu)
			this.updateMenuParams();
	},

	afterDetach: function(menu, i)
	{
		if (this.menu)
			this.menu.hide({animate: false});
	},
	
	updateMenuParams: function()
	{
		var self = this, params = {}, parentMenu = self.parentMenu;
		if (self.menu)
		{
			if (self.extraMenuItem)
			{
				if (parentMenu)
					$.extend(true, params, parentMenu.calcExtraMenuDropdownMenuParams());
				$.extend(true, params, {
					layerParams: {
						element: self.extraMenuItem.node
					}
				});
				if (self.extraMenuParams)
					$.extend(true, params, self.extraMenuParams);
			}
			else
			{
				if (parentMenu)
				{
					params.hideOnMouseleave = (parentMenu.type === "hover");
					$.extend(true, params, parentMenu.calcDropdownMenuParams());
				}
				$.extend(true, params, {
					layerParams: {
						element: self.node,
						parentNode: document.body
					}
				});
				if (self.menuParams)
					$.extend(true, params, self.menuParams);
			}
			self.menu.configure(params);
		}
	},

	updateParentMark: function()
	{
		var menu = this.menu,
			state = !!(menu && (menu.items.length > 0 || (menu.loader || menu.ajax) && !menu.loaded));
		this.$node.toggleClass(cp+"parent", state);
	},
	
	setHighlighted: function(value)
	{
		this.$node.toggleClass(cp+"highlighted", value);
	},

	setOpened: function(value)
	{
		this.$node.toggleClass(cp+"opened", value);
	},
	
	setLoading: function(loading)
	{
		this.$node.toggleClass(cp+"loading", loading);
	},
	
	onExtraMenuButtonMouseenter: function(event)
	{
		var self = this;
		self.setHighlighted(false);
		if (self.menu)
		{
			if (self.parentMenu.type === "hover")
				self.menu.hideWithDelay();
			else
			{
				self.setParentMenuShowMenu = false;
				self.menu.hide({animate: false});
				self.setParentMenuShowMenu = true;
			}
		}
	},
});

})(window, document, jQuery, hopjs);