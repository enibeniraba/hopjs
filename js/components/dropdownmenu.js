/*!
 * hopjs.dropdownMenu
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
	
var cp = "hopjs-dropdown-menu-";

hop.dropdownMenu = function(params)
{
	hop.component.apply(this, arguments);
};

hop.inherit(hop.dropdownMenu, hop.component, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			extraClass: "",
			layerParams: null,
			nodeOffset: null,
			timeoutShow: 200,
			timeoutHide: 500,
			submenuLayerParams: null,
			submenuNodeOffset: true,
			submenuTimeoutShow: 200,
			submenuTimeoutHide: 200,
			updatePositionOnResize: true,
			hideOnMouseleave: false,
			hideOnDocumentMousedown: true,
			parentItem: null,
			loader: null,
			ajax: null
		};
	},

	getEvents: function()
	{
		return [
			"destroy",
			"show",
			"hide",
			"loadStart",
			"loadFinish",
			"itemAdd",
			"itemRemove"
		];
	},

	getDefaultLayerParams: function()
	{
		return {
			position: "absolute",
			elementAlignY: "bottom",
			elementAlignX: "left",
			alignY: "top",
			alignX: "left",
			offsetTop: 0,
			offsetBottom: 0,
			offsetLeft: 0,
			offsetRight: 0,
			collision: "flipfit",
			collisionElement: "window"
		};
	},

	getDefaultSubmenuLayerParams: function()
	{
		return {
			elementAlignY: "top",
			elementAlignX: "right"
		};
	},

	create: function(params)
	{
		var self = this;
		self.defaultLayerParams = self.getDefaultLayerParams();
		self.defaultSubmenuLayerParams = self.getDefaultSubmenuLayerParams();
		self.action1 = null;
		self.action2 = null;
		self.timeout = null;
		self.loaded = false;
		self.loading = false;
		self.showOnLoad = false;
		self.mousedown = false;
		self.hideOnParentShow = true;
		self.items = [];
		hop.component.prototype.create.apply(self, arguments);
		self.generateHtml();
		if (params && params.items)
			self.addItems(params.items);
	},

	setLayerParams: function(params, update)
	{
		if (params && update && this.layerParams)
			$.extend(true, this.layerParams, params);
		else
			this.layerParams = params;
		if (this.layer)
			this.updateLayerParams();
	},

	setSubmenuLayerParams: function(params, update)
	{
		var self = this;
		if (params && update && self.submenuLayerParams)
			$.extend(true, self.submenuLayerParams, params);
		else
			self.submenuLayerParams = params;
		if (self.layer)
			self.updateLayerParams();
	},

	generateHtml: function()
	{
		var self = this, layer,
			layerParams = $.extend(true, {}, self.defaultLayerParams);
		if (self.layerParams)
			$.extend(true, layerParams, self.layerParams);
		layer = new hop.layer(layerParams);
		self.layer = layer;
		layer.node.className = "hopjs-dropdown-menu";
		if (self.extraClass !== "")
			layer.node.className += " "+self.extraClass;
		layer.node.innerHTML = '<div class="'+cp+'background"></div><div class="'+cp+'offset"></div>';
		layer.hopDropdownMenu = self;

		layer.on("showBefore", function()
		{
			self.onLayerShowBefore();
		});

		layer.on("show", function()
		{
			self.onLayerShow();
		});

		layer.on("hideBefore", function()
		{
			self.onLayerHideBefore();
		});

		layer.on("hide", function()
		{
			self.onLayerHide();
		});

		layer.$node.on("mouseenter", function(event)
		{
			self.onLayerMouseenter(event);
		});

		layer.$node.on("mouseleave", function(event)
		{
			self.onLayerMouseleave(event);
		});

		layer.$node.on("mousedown", function(event)
		{
			self.onLayerMousedown(event);
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

	onLayerShowBefore: function()
	{
		if (this.parentItem)
			this.parentItem.setOpened(true);
	},

	onLayerShow: function()
	{
		var self = this;
		self.action1 = self.action2;
		self.action2 = null;
		if (self.action1 === null)
			self.clearTimeout();
		self.onShow();
	},

	onShow: function()
	{
		this.trigger("show");
	},

	onLayerHideBefore: function()
	{
		if (this.parentItem)
			this.parentItem.setOpened(false);
	},

	onLayerHide: function()
	{
		var self = this, i;
		self.action1 = self.action2;
		self.action2 = null;
		if (self.action1 === null)
			self.clearTimeout();
		for (i in self.items)
			self.items[i].onParentMenuHide();
		if (self.parentItem)
			self.parentItem.onMenuHide();
		self.onHide();
	},

	onHide: function()
	{
		this.trigger("hide");
	},

	onLayerMouseenter: function(event)
	{
		var self = this, i, item;
		self.layer.moveOnTop();
		self.stopHiding();
		if (event.target === event.currentTarget)
		{
			for (i in self.items)
			{
				item = self.items[i];
				if (item.menu)
					item.menu.hideWithDelay();
			}
			if (self.parentItem)
				self.parentItem.setHighlighted(true);
		}
	},

	onLayerMouseleave: function(event)
	{
		if (!this.parentItem && this.hideOnMouseleave)
			this.hideWithDelay();
	},

	onLayerMousedown: function(event)
	{
		if (this.hideOnDocumentMousedown && !this.parentItem)
			this.mousedown = true;
	},

	onWindowResize: function(event)
	{
		if (this.updatePositionOnResize)
			this.layer.updatePosition(true);
	},

	onDocumentMousedown: function(event)
	{
		var self = this;
		if (self.hideOnDocumentMousedown && !self.parentItem)
		{
			if (self.mousedown)
			{
				self.mousedown = false;
				self.layer.moveOnTop();
			}
			else
				self.hide();
		}
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
		if (!(item instanceof hop.dropdownMenuItems[item.type]))
			item = new hop.dropdownMenuItems[item.type](item);
		if (self.items.length === 0 || before === null || before >= self.items.length)
		{
			self.layer.node.appendChild(item.node);
			self.items.push(item);
		}
		else
		{
			for (i in self.items)
			{
				if (i === before)
				{
					self.layer.node.insertBefore(item.node, self.items[i].node);
					items.push(item);
				}
				items.push(self.items[i]);
			}
			self.items = items;
		}
		item.afterAttach();
		self.onItemAdd({
			item: item
		});
		return item;
	},

	onItemsChange: function()
	{
		if (this.parentItem)
			this.parentItem.updateParentMark();
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

		item.node.parentNode.removeChild(item.node);
		item.parentMenu = null;
		delete self.items[i];
		for (i in self.items)
			items.push(self.items[i]);
		self.items = items;
		if (items.length === 0)
		{
			animate = self.layer.animate;
			self.layer.animate = false;
			self.hide();
			self.layer.animate = animate;
		}
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

	show: function(params)
	{
		var self = this, layer = self.layer;
		self.showOnLoad = true;
		self.clearTimeout();
		self.action2 = null;
		layer.queue = false;
		if (self.action1 === 1)
		{
			if (layer.isAnimation())
				return;
		}
		else if (self.action1 === 0)
		{
			if (!layer.isAnimation() && layer.visible)
			{
				layer.moveOnTop();
				return;
			}
		}
		else if (self.action1 === null)
		{
			if (layer.visible)
			{
				layer.moveOnTop();
				return;
			}
		}
		self.pushAction(1);
		self.realShow(params);
	},

	realShow: function(params)
	{
		var self = this, i, item;
		for (i in self.items)
		{
			item = self.items[i];
			if (item.menu && item.menu.hideOnParentShow)
				item.menu.hideWithDelay();
		}
		self.hideOnParentShow = false;
		if (self.parentItem && self.parentItem.parentMenu)
			self.parentItem.parentMenu.show();
		self.hideOnParentShow = true;
		self.showOnLoad = true;
		if (self.items.length > 0)
		{
			self.layer.show(params);
			if (self.parentItem && self.parentItem.parentMenu)
			{
				for (i in self.parentItem.parentMenu.items)
				{
					item = self.parentItem.parentMenu.items[i];
					if (item.menu && item.menu !== self)
						item.menu.hide();
				}
			}
		}
		else
			self.load(params);
	},

	hide: function(params)
	{
		var self = this, layer = self.layer;
		self.showOnLoad = false;
		self.clearTimeout();
		self.action2 = null;
		layer.queue = false;
		if (self.action1 === 0)
		{
			if (layer.isAnimation())
				return;
		}
		else if (self.action1 === 1)
		{
			if (!layer.isAnimation() && !layer.visible)
				return;
		}
		else if (self.action1 === null)
		{
			if (!layer.visible)
				return;
		}
		self.pushAction(0);
		self.realHide(params);
	},

	realHide: function(params)
	{
		var i, item;
		this.showOnLoad = false;
		this.layer.hide(params);
		for (i in this.items)
		{
			item = this.items[i];
			if (item.menu)
				item.menu.hide();
		}
	},

	toggle: function(showParams, hideParams)
	{
		if (this.layer.showingNext())
			this.show(showParams);
		else
			this.hide(hideParams);
	},

	showWithDelay: function(params)
	{
		var self = this, timeout = self.timeoutShow,
			topMenu = self.getTopMenu(), i;
		for (i in self.items)
		{
			if (self.items[i].menu)
				self.items[i].menu.hideWithDelay();
		}
		if (self.action1 === 1)
		{
			if (self.action2 === 0)
			{
				self.clearTimeout();
				self.action2 = null;
			}
			self.layer.queue = false;
			return;
		}
		else if (self.action1 === 0)
		{
			if (self.action2 === 1)
				return;

			if (!self.layer.isAnimation())
			{
				self.clearTimeout();
				self.action1 = null;
				return;
			}
		}
		else if (self.action1 === null)
		{
			if (self.layer.visible)
			{
				self.layer.moveOnTop();
				return;
			}
		}
		if (topMenu && topMenu !== self)
		{
			timeout = topMenu.submenuTimeoutShow;
			if (timeout < 1)
				timeout = 1;
		}
		self.pushAction(1);
		if (timeout)
		{
			self.timeout = setTimeout(
				function()
				{
					self.realShow(params);
				},
				timeout
			);
		}
		else
			self.realShow(params);
	},

	hideWithDelay: function(params)
	{
		var self = this, timeout = self.timeoutHide,
			topMenu = self.getTopMenu();
		self.showOnLoad = false;
		if (self.action1 === 0)
		{
			if (self.action2 === 1)
			{
				self.clearTimeout();
				self.action2 = null;
			}
			self.layer.queue = false;
			return;
		}
		else if (self.action1 === 1)
		{
			if (self.action2 === 0)
				return;

			if (!self.layer.isAnimation())
			{
				self.clearTimeout();
				self.action1 = null;
				return;
			}
		}
		else if (self.action1 === null)
		{
			if (!self.layer.visible)
				return;
		}
		if (topMenu && topMenu !== self)
		{
			timeout = topMenu.submenuTimeoutHide;
			if (timeout < 1)
				timeout = 1;
		}
		self.pushAction(0);
		if (timeout)
		{
			self.timeout = setTimeout(
				function()
				{
					self.realHide(params);
				},
				timeout
			);
		}
		else
			self.realHide(params);
	},

	pushAction: function(action)
	{
		if (this.action1 === null)
			this.action1 = action;
		else if (this.action1 !== action)
			this.action2 = action;
	},

	stopHiding: function()
	{
		var self = this;
		if (self.action1 === 0 && !self.layer.isAnimation())
		{
			self.action1 = null;
			self.action2 = null;
			self.clearTimeout();
			self.layer.queue = false;
		}
		if (self.action2 === 0)
		{
			self.action2 = null;
			self.clearTimeout();
			self.layer.queue = false;
		}
		if (self.parentItem && self.parentItem.parentMenu)
			self.parentItem.parentMenu.stopHiding();
	},

	clearTimeout: function()
	{
		if (this.timeout)
		{
			clearTimeout(this.timeout);
			this.timeout = null;
		}
	},

	getTopMenu: function()
	{
		var menu = this;
		while (menu.parentItem)
		{
			menu = menu.parentItem.parentMenu;
			if (!menu)
				break;
		}
		return menu;
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

	updateLayerParams: function()
	{
		var self = this, topMenu = self.getTopMenu(),
			layerParams = {}, $offset, offset, i;
		$.extend(true, layerParams, self.defaultLayerParams);
		if (topMenu && topMenu !== self)
			$.extend(true, layerParams, topMenu.defaultSubmenuLayerParams, topMenu.submenuLayerParams);
		if (self.layerParams)
			$.extend(true, layerParams, self.layerParams);
		if (self.parentItem)
		{
			$.extend(true, layerParams, {
				element: self.parentItem.buttonNode,
				parentNode: self.parentItem.node
			});
		}
		if (self.nodeOffset || self.nodeOffset === null
			&& topMenu && topMenu !== self && topMenu.submenuNodeOffset)
		{
			$offset = $(">."+cp+"offset", self.layer.node);
			offset = parseInt($offset.css("top"));
			if (!isNaN(offset))
				layerParams.offsetTop = offset;
			offset = parseInt($offset.css("bottom"));
			if (!isNaN(offset))
				layerParams.offsetBottom = offset;
			offset = parseInt($offset.css("left"));
			if (!isNaN(offset))
				layerParams.offsetLeft = offset;
			offset = parseInt($offset.css("right"));
			if (!isNaN(offset))
				layerParams.offsetRight = offset;
		}
		self.layer.configure(layerParams);
		for (i in self.items)
		{
			if (self.items[i].menu)
				self.items[i].menu.updateLayerParams();
		}
	},

	updatePosition: function(move)
	{
		this.layer.updatePosition(move);
		for (var i in this.items)
		{
			if (this.items[i].menu)
				this.items[i].menu.updatePosition(move);
		}
	},

	load: function(params)
	{
		var self = this;
		if (self.loaded || self.loading)
			return;

		if (self.loader)
			self.loader(params);
		else if (self.ajax)
			self.ajaxLoader(params);
	},

	ajaxLoader: function(params)
	{
		var self = this, settings = {};
		$.extend(settings, self.ajax);
		if (settings.dataType !== "jsonp")
			settings.dataType = "json";
		self.loadStart();
		$.ajax(settings).done(function(data)
		{
			self.setItems(data);
			self.loadFinish(params);
		}).fail(function(data, status, exception)
		{
			self.loadFinish(params);
			throw exception;
		});
	},

	loadStart: function()
	{
		this.loaded = false;
		this.loading = true;
		if (this.parentItem)
			this.parentItem.setLoading(true);
		this.onLoadStart();
	},

	onLoadStart: function()
	{
		this.trigger("loadStart");
	},

	loadFinish: function(params)
	{
		var self = this;
		self.loaded = true;
		self.loading = false;
		if (self.parentItem)
		{
			self.parentItem.setLoading(false);
			self.parentItem.updateParentMark();
		}
		if (self.showOnLoad)
			self.show(params);
		self.onLoadFinish();
	},

	onLoadFinish: function()
	{
		this.trigger("loadFinish");
	},

	destroy: function()
	{
		this.layer.destroy();
		this.onDestroy();
	},

	onDestroy: function()
	{
		this.trigger("destroy");
	}
});

hop.dropdownMenuItems = {};

hop.dropdownMenuItem = function(params)
{
	hop.component.apply(this, arguments);
};

hop.inherit(hop.dropdownMenuItem, hop.component);

$.extend(hop.dropdownMenuItem.prototype, {
	getDefaults: function()
	{
		return {
			parentMenu: null,
			extraClass: "",
			id: null,
			visible: true
		};
	},

	create: function(params)
	{
		hop.component.prototype.create.apply(this, arguments);
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
		self.node.className = cp+"item";
		if (self.extraClass !== "")
			self.node.className += " "+self.extraClass;
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
			{
				if (item.menu)
					item.menu.hideWithDelay();
				item.onOtherItemMouseenter(this);
			}
		}
	},

	onOtherItemMouseenter: function(item)
	{
	},

	onParentMenuHide: function()
	{
	},

	afterAttach: function()
	{
	},

	afterDetach: function(menu, i)
	{
	}
});

hop.dropdownMenuItems.button = function(params)
{
	hop.dropdownMenuItem.apply(this, arguments);
};

hop.inherit(hop.dropdownMenuItems.button, hop.dropdownMenuItem, {
	getDefaults: function()
	{
		return $.extend(hop.dropdownMenuItem.prototype.getDefaults.apply(this), {
			active: true,
			text: "",
			icon: null,
			title: "",
			url: null,
			checkable: false,
			checked: false,
			radioGroup: null,
			uncheckable: false,
			hideOnClick: null
		});
	},

	getEvents: function()
	{
		return hop.dropdownMenuItem.prototype.getEvents.apply(this).concat([
			"check",
			"click"
		]);
	},

	create: function(params)
	{
		var self = this;
		self.setHighlightedOnMenuHide = true;
		self.menu = null;
		hop.dropdownMenuItem.prototype.create.apply(self, arguments);
		self.setActive(self.active);
		self.setText(self.text);
		self.setIcon(self.icon);
		self.setTitle(self.title);
		self.setUrl(self.url);
		self.setCheckable(self.checkable);
		self.setChecked(self.checked);
		self.setRadioGroup(self.radioGroup);
		if (params && params.menu)
			self.setMenu(params.menu);
	},

	onOtherItemMouseenter: function(item)
	{
		this.setHighlighted(false);
	},

	onParentMenuHide: function()
	{
		this.setHighlighted(false);
	},

	afterAttach: function()
	{
		if (this.menu)
			this.menu.updateLayerParams();
	},

	onMenuHide: function()
	{
		if (this.setHighlightedOnMenuHide)
			this.setHighlighted(false);
	},

	setVisible: function(visible)
	{
		hop.dropdownMenuItem.prototype.setVisible.apply(this, arguments);
		if (this.node)
		{
			if (this.menu)
				this.menu.hide({animate: false});
		}
	},

	setActive: function(active)
	{
		var self = this;
		self.active = !!active;
		if (self.node)
		{
			$(self.$button).toggleClass(cp+"inactive", !self.active);
			if (self.menu)
				self.menu.hide({animate: false});
		}
	},

	setText: function(text)
	{
		text = String(text);
		this.text = text;
		if (this.node)
			this.buttonTextNode.innerHTML = (text === "" ? "&nbsp;" : text);
	},

	setIcon: function(icon)
	{
		this.icon = icon;
		if (this.node)
			this.buttonNode.style.backgroundImage = (icon === null ? "none" : "url("+icon+")");
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

	setCheckable: function(checkable)
	{
		this.checkable = !!checkable;
		if (this.node)
			$(this.$button).toggleClass(cp+"checkable", this.checkable);
	},

	setChecked: function(checked)
	{
		var self = this, i, item;
		checked = !!checked;
		if (self.created && self.checked === checked)
			return;

		self.checked = checked;
		if (self.node)
		{
			if (checked && self.parentMenu && self.radioGroup !== null)
			{
				for (i in self.parentMenu.items)
				{
					item = self.parentMenu.items[i];
					if (item !== self && item.radioGroup === self.radioGroup && item.checked)
						item.setChecked(false);
				}
			}
			$(self.$button).toggleClass(cp+"checked", self.checked);
		}
		if (self.created)
			self.onCheck();
	},

	onCheck: function()
	{
		this.trigger("check");
	},

	setRadioGroup: function(radioGroup)
	{
		var self = this;
		if (radioGroup !== null && typeof radioGroup !== "string")
			return;

		self.radioGroup = radioGroup;
		if (self.node)
			$(self.$button).toggleClass(cp+"radio", self.radioGroup !== null);
	},

	setMenu: function(menu)
	{
		var self = this;
		if (menu && !(menu instanceof hop.dropdownMenu))
			menu = new hop.dropdownMenu(menu);
		if (self.menu && self.menu !== menu)
			self.menu.parentItem = null;
		self.menu = menu;
		if (menu)
		{
			menu.parentItem = self;
			menu.updateLayerParams();
			self.updateParentMark();
		}
	},

	setHighlighted: function(value)
	{
		var self = this, item = self.parentMenu.parentItem, i;
		value = !!value;
		self.$button.toggleClass(cp+"highlighted", value);
		if (self.menu)
		{
			for (i in self.menu.items)
			{
				if (self.menu.items[i] instanceof hop.dropdownMenuItems.button)
					self.menu.items[i].setHighlighted(false);
			}
		}
		if (value)
		{
			while (item)
			{
				item.$button.toggleClass(cp+"highlighted", value);
				item = item.parentMenu.parentItem;
			}
		}
	},

	setOpened: function(value)
	{
		this.$button.toggleClass(cp+"opened", !!value);
	},

	generateHtml: function()
	{
		var self = this;
		hop.dropdownMenuItem.prototype.generateHtml.apply(self, arguments);
		self.node.innerHTML = '<a class="'+cp+'button"><div class="'+cp+'button-text"></div></a>';
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
		var self = this, parentMenu = self.parentMenu;
		if (self.menu && self.active && !(parentMenu.action1 === 0 && parentMenu.layer.isAnimation()))
			self.menu.showWithDelay();
		self.setHighlighted(true);
		self.setHighlightedOnMenuHide = false;
	},

	onButtonMouseleave: function(event)
	{
		if (this.menu)
			this.menu.hideWithDelay();
		this.setHighlighted(false);
		this.setHighlightedOnMenuHide = true;
	},

	onButtonMousedown: function(event)
	{
		var self = this;
		if (event.which === 1 && self.active && self.menu)
			self.menu.toggle();
	},

	onButtonClick: function(event)
	{
		var self = this;
		if (!self.active)
			return;

		if (self.checkable && (self.radioGroup === null || !self.checked || self.uncheckable))
			self.setChecked(!self.checked);
		if (!self.menu && (self.hideOnClick === true || self.hideOnClick === null && !self.checkable))
			self.parentMenu.getTopMenu().hide();
		self.onClick();
	},

	onClick: function()
	{
		this.trigger("click");
	},

	updateParentMark: function()
	{
		var menu = this.menu,
			state = !!(menu && (menu.items.length > 0 || (menu.loader || menu.ajax) && !menu.loaded));
		this.$button.toggleClass(cp+"parent", state);
	},

	setLoading: function(loading)
	{
		this.$button.toggleClass(cp+"loading", !!loading);
	}
});

hop.dropdownMenuItems.group = function(params)
{
	hop.dropdownMenuItems.html.apply(this, arguments);
};

hop.inherit(hop.dropdownMenuItems.group, hop.dropdownMenuItem, {
	getDefaults: function()
	{
		return $.extend(hop.dropdownMenuItem.prototype.getDefaults.apply(this), {
			text: "",
			icon: null,
			title: ""
		});
	},

	create: function(params)
	{
		var self = this;
		hop.dropdownMenuItem.prototype.create.apply(self, arguments);
		self.$node.addClass(cp+"group");
		self.setText(self.text);
		self.setIcon(self.icon);
		self.setTitle(self.title);
	},

	setText: function(text)
	{
		this.text = text;
		if (this.node)
			this.node.innerHTML = text;
	},

	setIcon: function(icon)
	{
		this.icon = icon;
		if (this.node)
			this.node.style.backgroundImage = (icon === null ? "none" : "url("+icon+")");
	},

	setTitle: function(title)
	{
		this.title = title;
		if (this.node)
			this.node.title = title;
	}
});

hop.dropdownMenuItems.html = function(params)
{
	hop.dropdownMenuItem.apply(this, arguments);
};

hop.inherit(hop.dropdownMenuItems.html, hop.dropdownMenuItem, {
	getDefaults: function()
	{
		return $.extend(hop.dropdownMenuItem.prototype.getDefaults.apply(this), {
			html: ""
		});
	},

	create: function(params)
	{
		hop.dropdownMenuItem.prototype.create.apply(this, arguments);
		this.setHtml(this.html);
	},

	setHtml: function(html)
	{
		this.html = html;
		if (this.node)
			this.node.innerHTML = html;
	}
});

hop.dropdownMenuItems.separator = function(params)
{
	hop.dropdownMenuItem.apply(this, arguments);
};

hop.inherit(hop.dropdownMenuItems.separator, hop.dropdownMenuItem, {
	create: function(params)
	{
		hop.dropdownMenuItem.prototype.create.apply(this, arguments);
		this.$node.addClass(cp+"separator");
		this.node.innerHTML = "<div></div>";
	}
});

})(window, document, jQuery, hopjs);