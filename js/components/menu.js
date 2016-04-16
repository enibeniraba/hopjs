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

var pointRectangleSector = function(x0, y0, x1, y1, x2, y2, x3, y3, x4, y4)
{
	var X1 = x1-x0, X2 = x2-x0, X3 = x3-x0, X4 = x4-x0,
		Y1 = y1-y0, Y2 = y2-y0, Y3 = y3-y0, Y4 = y4-y0,
		m1 = Math.sqrt(X1*X1+Y1*Y1),
		m2 = Math.sqrt(X2*X2+Y2*Y2),
		m3 = Math.sqrt(X3*X3+Y3*Y3),
		m4 = Math.sqrt(X4*X4+Y4*Y4),
		a = [
			[Math.acos((X1*X2+Y1*Y2)/(m1*m2)), x1, y1, x2, y2],
			[Math.acos((X1*X3+Y1*Y3)/(m1*m3)), x1, y1, x3, y3],
			[Math.acos((X1*X4+Y1*Y4)/(m1*m4)), x1, y1, x4, y4],
			[Math.acos((X2*X3+Y2*Y3)/(m2*m3)), x2, y2, x3, y3],
			[Math.acos((X2*X4+Y2*Y4)/(m2*m4)), x2, y2, x4, y4],
			[Math.acos((X3*X4+Y3*Y4)/(m3*m4)), x3, y3, x4, y4]
		],
		i, maxAngle = Number.NEGATIVE_INFINITY, result = {};
		for (i in a)
		{
			if (a[i][0] > maxAngle)
			{
				maxAngle = a[i][0];
				result.x1 = a[i][1];
				result.y1 = a[i][2];
				result.x2 = a[i][3];
				result.y2 = a[i][4];
			}
		}
		return result;
};

var pointInsideTriangle = function(x0, y0, x1, y1, x2, y2, x3, y3)
{
	var a = (x1-x0)*(y2-y1)-(x2-x1)*(y1-y0),
		b = (x2-x0)*(y3-y2)-(x3-x2)*(y2-y0),
		c = (x3-x0)*(y1-y3)-(x1-x3)*(y3-y0);
	return (a >= 0 && b >= 0 && c >= 0 || a <= 0 && b <= 0 && c <= 0);
};

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
			parentMarks: true,
			dropdownMenuParams: null,
			smartMouse: true,
			smartMouseTimeout: 500,
			smartMouseTrackSize: 3,
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
		self.items = [];
		self.openedMenu = null;
		self.smartMouseTrack = [];
		self.extraMenuButtonSmartMouseTimeout = null;
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
	
	setParentMarks: function(value)
	{
		this.parentMarks = !!value;
		for (var i in this.items)
			this.items[i].updateParentMark();
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
		self.$node = $(self.node);
		self.parentNode.appendChild(self.node);
		self.extraMenuButtonNode = document.createElement("div");
		self.extraMenuButtonNode.innerHTML = "&nbsp;";
		self.extraMenuButtonNode.className = "hopjs-menu-extra-menu-button";
		self.extraMenuButtonNode.style.display = "none";
		self.node.appendChild(self.extraMenuButtonNode);
		self.$extraMenuButton = $(self.extraMenuButtonNode);
		
		self.$node.on("mousemove", function(event)
		{
			self.onMousemove(event);
		});
		
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

		self.$extraMenuButton.on("mousemove", function(event)
		{
			self.onExtraMenuButtonMousemove(event);
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

		self.extraMenu.layer.on("hideBefore", function(layer, params)
		{
			self.onExtraMenuHideBefore(params);
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
	
	onMousemove: function(event)
	{
		this.smartMouseTrack.push({
			y: event.pageY,
			x: event.pageX
		});
		if (this.smartMouseTrack.length > this.smartMouseTrackSize)
			this.smartMouseTrack.shift();
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
			if (self.smartMouse && self.openedMenu && self.openedMenu !== self.extraMenu)
			{
				self.extraMenuButtonSmartMouseTimeout = setTimeout(function()
				{
					self.extraMenuButtonSmartMouseTimeoutHandler();
				}, self.smartMouseTimeout);
			}
			else if (self.extraMenu)
			{
				self.extraMenu.layer.finishAnimation();
				self.extraMenu.show({animate: false});
			}
		}
	},
	
	extraMenuButtonSmartMouseTimeoutHandler: function()
	{
		var self = this, i;
		for (i in self.items)
			self.items[i].onExtraMenuButtonSmartMouseTimeoutHandler();
		if (self.extraMenu)
		{
			self.extraMenu.layer.finishAnimation();
			self.extraMenu.show({animate: false});
		}
		clearTimeout(self.extraMenuButtonSmartMouseTimeout);
		self.extraMenuButtonSmartMouseTimeout = null;
	},
	
	onExtraMenuButtonMousemove: function(event)
	{
		var self = this, $node, offset, height, width, x, y, s;
		if (self.extraMenuButtonSmartMouseTimeout !== null && self.smartMouseTrack.length > 0)
		{
			$node = self.openedMenu.layer.$node;
			offset = $node.offset();
			height = $node.outerHeight();
			width = $node.outerWidth();
			x = self.smartMouseTrack[0].x;
			y = self.smartMouseTrack[0].y;
			s = pointRectangleSector(x, y, offset.left, offset.top, offset.left+width, offset.top,
				offset.left+width, offset.top+height, offset.left, offset.top+height);
			if (!pointInsideTriangle(event.pageX, event.pageY, x, y, s.x1, s.y1, s.x2, s.y2))
				self.extraMenuButtonSmartMouseTimeoutHandler();
		}
	},
	
	onExtraMenuButtonMouseleave: function(event)
	{
		var self = this;
		if (self.type === "hover")
			self.extraMenu.hideWithDelay();
		self.setExtraMenuButtonHighlighted(false);
		self.setExtraMenuButtonHighlightedOnMenuHide = true;
		if (self.extraMenuButtonSmartMouseTimeout)
			clearTimeout(self.extraMenuButtonSmartMouseTimeout);
		self.extraMenuButtonSmartMouseTimeout = null;
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
				item.menu.layer.finishAnimation();
				item.menu.hide({animate: false});
			}
		}
		this.setExtraMenuButtonOpened(true);
		this.showMenu = true;
		this.openedMenu = this.extraMenu;
	},

	onExtraMenuHideBefore: function(params)
	{
		if (this.setExtraMenuButtonHighlightedOnMenuHide)
			this.setExtraMenuButtonHighlighted(false);
		this.setExtraMenuButtonOpened(false);
		if (params.setShowMenu)
			this.showMenu = false;
		if (this.openedMenu === this.extraMenu)
			this.openedMenu = null;
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
		else if (!self.smartMouse)
		{
			self.extraMenu.hide({
				animate: false,
				setShowMenu: false
			});
		}
	},
	
	onItemSmartMouseTimeoutHandler: function(item)
	{
		if (this.extraMenu)
		{
			this.extraMenu.hide({
				animate: false,
				setShowMenu: false
			});
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
		self.menu = null;
		self.smartMouseTimeout = null;
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

			menu.layer.on("hideBefore", function(layer, params)
			{
				self.onMenuHideBefore(params);
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
		var self = this, i, item, parentMenu = self.parentMenu;
		for (i in parentMenu.items)
		{
			item = parentMenu.items[i];
			if (item.menu && item !== self)
			{
				item.menu.layer.finishAnimation();
				item.menu.hide({
					animate: false,
					setParentMenuShowMenu: false
				});
			}
		}
		if (!self.extraMenuItem)
		{
			parentMenu.extraMenu.layer.finishAnimation();
			parentMenu.extraMenu.hide({animate: false});
			parentMenu.showMenu = true;
		}
		self.setOpened(true);
		self.parentMenu.openedMenu = self.menu;
	},

	onMenuHideBefore: function(params)
	{
		var self = this;
		if (self.setHighlightedOnMenuHide)
			self.setHighlighted(false);
		self.setOpened(false);
		if (params.setParentMenuShowMenu && !self.extraMenuItem)
			self.parentMenu.showMenu = false;
		if (self.parentMenu.openedMenu === self.menu)
			self.parentMenu.openedMenu = null;
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
		
		self.$node.on("mousemove", function(event)
		{
			self.onMousemove(event);
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
		if (self.parentMenu.type === "hover")
		{
			if (self.menu && self.active)
				self.menu.showWithDelay();
		}
		else if (self.parentMenu.showMenu)
		{
			if (self.parentMenu.smartMouse && self.parentMenu.openedMenu
				&& self.parentMenu.openedMenu !== self.menu)
			{
				self.smartMouseTimeout = setTimeout(function()
				{
					self.smartMouseTimeoutHandler();
				}, self.parentMenu.smartMouseTimeout);
			}
			else if (self.menu && self.active)
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
			else if (!self.parentMenu.smartMouse)
			{
				self.menu.hide({
					animate: false,
					setParentMenuShowMenu: false
				});
			}
		}
	},
	
	smartMouseTimeoutHandler: function()
	{
		var self = this, i, item;
		for (i in self.parentMenu.items)
		{
			item = self.parentMenu.items[i];
			if (item !== self)
				item.onOtherItemSmartMouseTimeoutHandler(self);
		}
		self.parentMenu.onItemSmartMouseTimeoutHandler(self);
		if (self.menu)
		{
			self.menu.layer.finishAnimation();
			self.menu.show({animate: false});
		}
		clearTimeout(self.smartMouseTimeout);
		self.smartMouseTimeout = null;
	},
	
	onOtherItemSmartMouseTimeoutHandler: function(item)
	{
		if (this.menu)
		{
			this.menu.hide({
				animate: false,
				setParentMenuShowMenu: false
			});
		}
	},
	
	onMousemove: function(event)
	{
		var self = this, parentMenu = self.parentMenu,
			$node, offset, height, width, x, y, s;
		if (self.smartMouseTimeout !== null && parentMenu.smartMouseTrack.length > 0)
		{
			$node = parentMenu.openedMenu.layer.$node;
			offset = $node.offset();
			height = $node.outerHeight();
			width = $node.outerWidth();
			x = parentMenu.smartMouseTrack[0].x;
			y = parentMenu.smartMouseTrack[0].y;
			s = pointRectangleSector(x, y, offset.left, offset.top, offset.left+width, offset.top,
				offset.left+width, offset.top+height, offset.left, offset.top+height);
			if (!pointInsideTriangle(event.pageX, event.pageY, x, y, s.x1, s.y1, s.x2, s.y2))
				self.smartMouseTimeoutHandler();
		}
	},

	onMouseleave: function(event)
	{
		var self = this;
		if (self.menu && self.parentMenu.type === "hover")
			self.menu.hideWithDelay();
		self.setHighlighted(false);
		self.setHighlightedOnMenuHide = true;
		if (self.smartMouseTimeout)
			clearTimeout(self.smartMouseTimeout);
		self.smartMouseTimeout = null;
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
			state = !!(this.parentMenu && this.parentMenu.parentMarks && menu && (menu.items.length > 0 || (menu.loader || menu.ajax) && !menu.loaded));
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
			else if (!self.parentMenu.smartMouse)
			{
				self.menu.hide({
					animate: false,
					setParentMenuShowMenu: false
				});
			}
		}
	},
	
	onExtraMenuButtonSmartMouseTimeoutHandler: function()
	{
		if (this.menu)
		{
			this.menu.hide({
				animate: false,
				setParentMenuShowMenu: false
			});
		}
	}
});

})(window, document, jQuery, hopjs);