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

(function(document, $, hop)
{

hop.menu = function(params)
{
	hop.widget.apply(this, arguments);
};

hop.inherit(hop.menu, hop.widget, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			className: "hop-menu",
			type: "click",
			dropdownMenuParams: null,
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
				jailX: true,
				reverseY: true
			}
		};
	},

	create: function(params)
	{
		var self = this;
		self.defaultDropdownMenuParams = self.getDefaultDropdownMenuParams();
		self.mousedown = false;
		self.showMenu = false;
		self.showingMenu = false;
		self.items = [];
		hop.widget.prototype.create.apply(self, arguments);
		self.generateHtml();
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

	updateDropdownMenuParams: function()
	{
		var i, item;
		for (i in this.items)
		{
			item = this.items[i];
			if (item.menu)
				item.updateMenuParams();
		}
	},

	generateHtml: function()
	{
		var self = this;
		self.node = document.createElement("div");
		self.node.className = self.className;
		self.node.hopMenu = self;
		self.parentNode.appendChild(self.node);

		$(document).on("mousedown", function(event)
		{
			self.onDocumentMousedown(event);
		});
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
			if (item === "-")
				item = {type: "separator"};
			else
			{
				item = {
					type: "html",
					html: item
				};
			}
		}
		if (!item.type)
			item.type = "button";
		if (item.parentMenu)
			item.parentMenu.removeItem(item);
		item.parentMenu = self;
		if (!(item instanceof hop.menuItems[item.type]))
			item = new hop.menuItems[item.type](item);
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
		this.trigger("itemAdd", data);
	},

	removeItems: function()
	{
		while (this.items.length > 0)
			this.removeItem(0);
	},

	removeItem: function(item)
	{
		var self = this, items = [], index = null, i, animate;
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

		item.node.parentNode = null;
		item.parentMenu = null;
		delete self.items[i];
		for (i in self.items)
			items.push(self.items[i]);
		self.items = items;
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
	}
});

hop.menuItems = {};

hop.menuItem = function(params)
{
	hop.widget.apply(this, arguments);
};

hop.inherit(hop.menuItem, hop.widget);

$.extend(hop.menuItem.prototype, {
	getDefaults: function()
	{
		return {
			parentMenu: null,
			className: "hop-menu-item",
			id: null,
			visible: true
		};
	},

	create: function(params)
	{
		hop.widget.prototype.create.apply(this, arguments);
		this.generateHtml();
		this.setVisible(this.visible);
	},

	setVisible: function(visible)
	{
		var self = this;
		self.visible = !!visible;
		if (self.node)
		{
			self.node.style.display = (self.visible ? "block" : "none");
			if (self.parentMenu)
				self.parentMenu.onItemsChange();
		}
	},

	generateHtml: function()
	{
		var self = this;
		self.node = document.createElement("div");
		self.node.className = self.className;
		self.$node = $(self.node);
		self.$node.on("mouseenter", function(event)
		{
			self.onMouseenter(event);
		});
	},

	onMouseenter: function(event)
	{
		var i, item;
		for (i in this.parentMenu.items)
		{
			item = this.parentMenu.items[i];
			if (item !== this)
				item.onOtherItemMouseenter(this, event);
		}
	},

	onOtherItemMouseenter: function(item, event)
	{
	},

	afterAttach: function()
	{
	},

	afterDetach: function(menu, i)
	{
	}
});

hop.menuItems.button = function(params)
{
	hop.menuItem.apply(this, arguments);
};

hop.inherit(hop.menuItems.button, hop.menuItem, {
	getDefaults: function()
	{
		return $.extend(hop.menuItem.prototype.getDefaults.apply(this), {
			active: true,
			text: "",
			icon: null,
			title: "",
			url: null,
			menuParams: null
		});
	},

	getEvents: function()
	{
		return hop.menuItem.prototype.getEvents.apply(this).concat([
			"click"
		]);
	},

	create: function(params)
	{
		var self = this;
		self.setHighlightedOnMenuHide = true;
		self.setParentMenuShowMenu = true;
		self.menu = null;
		hop.menuItem.prototype.create.apply(self, arguments);
		self.setActive(self.active);
		self.setText(self.text);
		self.setIcon(self.icon);
		self.setTitle(self.title);
		self.setUrl(self.url);
		if (params && params.menu)
			self.setMenu(params.menu);
	},

	onOtherItemMouseenter: function(item, event)
	{
		var self = this;
		self.setHighlighted(false);
		if (self.menu)
		{
			if (self.parentMenu.type === "hover")
				self.menu.hideWithDelay();
			else if (!self.isMouseenterBug(event, self, item))
			{
				self.setParentMenuShowMenu = false;
				self.menu.hide({animate: false});
				self.setParentMenuShowMenu = true;
			}
		}
	},

	isMouseenterBug: function(event, source, target)
	{
		var layer, mouseY, mouseX, offset,
			layerTop, layerBottom, layerLeft, layerRight,
			sourceTop, sourceBottom, sourceLeft, sourceRight;

		layer = source.menu.layer;
		mouseY = event.pageY+$(document).scrollTop();
		mouseX = event.pageX+$(document).scrollLeft();
		offset = source.menu.layer.$node.offset();
		layerTop = offset.top;
		layerBottom = layerTop+layer.$node.outerHeight();
		layerLeft = offset.left;
		layerRight = layerLeft+layer.$node.outerWidth();
		offset = source.$node.offset();
		sourceTop = offset.top;
		sourceBottom = sourceTop+source.$node.outerHeight();
		sourceLeft = offset.left;
		sourceRight = sourceLeft+source.$node.outerWidth();
		if ((layer.visible || layer.isAnimation())
			&& (
				(layerTop === mouseY+1 && mouseY < sourceBottom && sourceBottom < layerTop
					&& sourceLeft <= mouseX && mouseX <= sourceRight)
				|| (layerBottom === mouseY-1 && mouseY > sourceTop && sourceTop > layerBottom
					&& sourceLeft <= mouseX && mouseX <= sourceRight)
				|| (layerLeft === mouseX+1 && mouseX < sourceRight && sourceRight < layerLeft
					&& sourceTop <= mouseY && mouseY <= sourceBottom)
				|| (layerBottom === mouseX-1 && mouseX > sourceLeft && sourceLeft > layerRight
					&& sourceTop <= mouseY && mouseY <= sourceBottom)
			))
		{
			return true;
		}
		return false;
	},

	afterAttach: function()
	{
		if (this.menu)
			this.updateMenuParams();
	},

	setVisible: function(visible)
	{
		hop.menuItem.prototype.setVisible.apply(this, arguments);
		if (this.node)
		{
			if (this.menu)
				this.menu.hide({animate: false});
		}
	},

	setActive: function(active)
	{
		this.active = active;
		if (this.node)
			$(this.$button).toggleClass("hop-menu-inactive", !active);
	},

	setText: function(text)
	{
		this.text = text;
		if (this.node)
			this.buttonTextNode.innerHTML = text;
	},

	setIcon: function(icon)
	{
		this.icon = icon;
		if (this.node)
		{
			this.buttonNode.style.backgroundImage = (icon === null ? "none" : "url("+icon+")");
			this.$button.toggleClass("hop-menu-icon", icon !== null);
		}
	},

	setTitle: function(title)
	{
		this.title = title;
		if (this.node)
			this.buttonNode.title = title;
	},

	setUrl: function(url)
	{
		this.url = url;
		if (this.node)
		{
			if (url === null)
				this.buttonNode.removeAttribute("href");
			else
				this.buttonNode.href = url;
		}
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

	setMenu: function(menu)
	{
		var self = this;
		if (menu && !(menu instanceof hop.dropdownMenu))
			menu = new hop.dropdownMenu(menu);
		self.menu = menu;
		if (menu)
		{
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

	onMenuMousedown: function(event)
	{
		this.parentMenu.mousedown = true;
	},

	onMenuMouseenter: function(event)
	{
		this.setHighlighted(true);
	},

	onMenuShowBefore: function()
	{
		var i, item;
		for (i in this.parentMenu.items)
		{
			item = this.parentMenu.items[i];
			if (item.menu && item !== this)
			{
				item.setParentMenuShowMenu = false;
				item.menu.layer.finishAnimation();
				item.menu.hide({animate: false});
				item.setParentMenuShowMenu = true;
			}
		}
		this.setOpened(true);
		this.parentMenu.showMenu = true;
	},

	onMenuHideBefore: function()
	{
		if (this.setHighlightedOnMenuHide)
			this.setHighlighted(false);
		this.setOpened(false);
		if (this.setParentMenuShowMenu)
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

	setHighlighted: function(value)
	{
		this.$button.toggleClass("hop-menu-highlighted", value);
	},

	setOpened: function(value)
	{
		this.$button.toggleClass("hop-menu-opened", value);
	},

	generateHtml: function()
	{
		var self = this;
		hop.menuItem.prototype.generateHtml.apply(this);
		self.node.innerHTML = '<a class="hop-menu-button"><div class="hop-menu-button-text"></div></a>';
		self.$button = $("a", self.node);
		self.buttonNode = self.$button[0];
		self.$buttonText = $("div", self.buttonNode);
		self.buttonTextNode = self.$buttonText[0];

		self.$button.on("mouseenter", function(event)
		{
			self.onButtonMouseenter(event);
		});

		self.$button.on("mouseleave", function(event)
		{
			self.onButtonMouseleave(event);
		});

		self.$button.on("mousedown", function(event)
		{
			self.onButtonMousedown(event);
		});

		self.$button.on("click", function(event)
		{
			self.onButtonClick(event);
		});
	},

	onButtonMouseenter: function(event)
	{
		var self = this, i, item;
		for (i in this.parentMenu.items)
		{
			item = this.parentMenu.items[i];
			if (item.menu && item !== this && item.isMouseenterBug(event, item, self))
				return;
		}
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

	onButtonMouseleave: function(event)
	{
		if (this.menu && this.parentMenu.type === "hover")
			this.menu.hideWithDelay();
		this.setHighlighted(false);
		this.setHighlightedOnMenuHide = true;
	},

	onButtonMousedown: function(event)
	{
		if (event.which === 1 && this.active && this.menu)
		{
			this.menu.mousedown = true;
			this.menu.toggle();
			this.parentMenu.showingMenu = true;
		}
	},

	onButtonClick: function(event)
	{
		if (!this.active)
			return;

		this.trigger("click");
	},

	updateMenuParams: function()
	{
		var self = this, params = {}, parentMenu = self.parentMenu;
		if (self.menu)
		{
			if (parentMenu)
			{
				params.hideOnMouseleave = (parentMenu.type === "hover");
				$.extend(true, params, parentMenu.calcDropdownMenuParams());
			}
			$.extend(true, params, {
				layerParams: {
					element: self.node
				}
			});
			if (self.menuParams)
				$.extend(true, params, self.menuParams);
			self.menu.configure(params);
		}
	},

	updateParentMark: function()
	{
		var menu = this.menu,
			state = !!(menu && (menu.items.length > 0 || (menu.loader || menu.ajax) && !menu.loaded));
		this.$button.toggleClass("hop-menu-parent", state);
	},

	setLoading: function(loading)
	{
		this.$button.toggleClass('hop-menu-loading', loading);
	}
});

hop.menuItems.html = function(params)
{
	hop.menuItem.apply(this, arguments);
};

hop.inherit(hop.menuItems.html, hop.menuItem, {
	getDefaults: function()
	{
		return $.extend(hop.menuItem.prototype.getDefaults.apply(this), {
			html: ""
		});
	},

	create: function(params)
	{
		hop.menuItem.prototype.create.apply(this, arguments);
		this.setHtml(this.html);
	},

	setHtml: function(html)
	{
		this.html = html;
		if (this.node)
			this.node.innerHTML = html;
	}
});

hop.menuItems.separator = function(params)
{
	hop.menuItem.apply(this, arguments);
};

hop.inherit(hop.menuItems.separator, hop.menuItem, {
	create: function(params)
	{
		hop.menuItem.prototype.create.apply(this, arguments);
		this.node.className = this.className+" hop-menu-separator";
		this.node.innerHTML = "<div>&nbsp;</div>";
	}
});

})(document, jQuery, hopjs);