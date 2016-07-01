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

(function(document, $, hopjs)
{

var cp = "hopjs-tabs-",
	_cp = "."+cp;

hopjs.types["tabs"] = "hopjs.tabs";

hopjs.tabs = function(params)
{
	hopjs.component.apply(this, arguments);
};

hopjs.inherit(hopjs.tabs, hopjs.component, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			extraClass: "",
			event: "click",
			hashActivation: true
		};
	},

	getEvents: function()
	{
		return [
			"itemAdd",
			"itemRemove",
			"itemActivateBefore",
			"itemActivate",
			"itemDeactivateBefore",
			"itemDeactivate"
		];
	},

	create: function(params)
	{
		var self = this;
		self.items = [];
		self.activeItem = null;
		hopjs.component.prototype.create.apply(self, arguments);
		self.generateHtml();
		if (params.parentNode)
			params.parentNode.appendChild(self.node);
		else if (params.beforeNode)
			params.beforeNode.parentNode.insertBefore(self.node, params.beforeNode);
		else if (params.afterNode)
			hopjs.dom.insertAfter(self.node, params.afterNode);
		if (params && params.items)
			self.addItems(params.items);
		if (self.items)
			self.activateItemOnCreate(params && params.activeItem);
	},

	setExtraClass: function(value)
	{
		var self = this;
		if (self.node && self.extraClass !== value)
		{
			self.$node.removeClass(self.extraClass);
			self.$node.addClass(value);
		}
		self.extraClass = value;
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
		before = hopjs.ifDef(before);
		if (before !== null)
		{
			before = parseInt(before);
			if (isNaN(before))
				before = null;
			else if (before < 0)
				before = 0;
		}
		if (!(item instanceof hopjs.tabsItem))
			item = new hopjs.tabsItem(item);
		if (item.tabs)
			item.tabs.removeItem(item);
		item.tabs = self;
		if (self.items.length === 0 || before === null || before >= self.items.length)
		{
			self.headNode.appendChild(item.headNode);
			self.bodyNode.appendChild(item.bodyNode);
			self.items.push(item);
		}
		else
		{
			for (i in self.items)
			{
				if (i === before)
				{
					self.headNode.insertBefore(item.headNode, self.items[i].headNode);
					self.bodyNode.insertBefore(item.bodyNode, self.items[i].bodyNode);
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
		if (self.created && self.activeItem === null && item && item.canBeActivated())
			item.activate();
		return item;
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
		if (item instanceof hopjs.tabsItem)
		{
			index = self.getItemIndex(item);
			if (index === null)
				return;
		}
		else
		{
			index = parseInt(item);
			if (isNaN(index) || index < 0 || index > self.items.length-1)
				return;

			item = self.items[index];
			if (!item)
				return;
		}
		self.headNode.removeChild(item.headNode);
		self.bodyNode.removeChild(item.bodyNode);
		item.tabs = null;
		self.items.splice(index, 1);
		item.afterDetach({
			tabs: self,
			index: index
		});
		self.onItemRemove({
			item: item,
			index: index
		});
		if (item === self.activeItem)
			self.activateFirstSuitableItem();
		return item;
	},

	onItemRemove: function(data)
	{
		this.trigger("itemRemove", data);
	},

	generateHtml: function()
	{
		var self = this;
		self.node = document.createElement("div");
		self.node.className = "hopjs-tabs";
		if (self.extraClass !== "")
			self.node.className += " "+self.extraClass;
		self.$node = $(self.node);
		self.$node.html('<div class="'+cp+'head"></div><div class="'+cp+'body"></div>');
		self.$head = $(_cp+"head", self.node);
		self.headNode = self.$head[0];
		self.$body = $(_cp+"body", self.node);
		self.bodyNode = self.$body[0];
		self.node.hopTabs = self;
	},

	activateItem: function(item)
	{
		var self = this, itemIndex, items = self.items,
			prevItem = self.activeItem, prevItemIndex, data;

		if (item instanceof hopjs.tabsItem)
		{
			itemIndex = self.getItemIndex(item);
			if (itemIndex === null)
				return;
		}
		else if (item !== null)
		{
			itemIndex = parseInt(item);
			if (isNaN(itemIndex) || itemIndex < 0 || itemIndex > items.length-1)
				return;

			item = items[itemIndex];
		}
		if (self.activeItem === item)
			return;

		if (prevItem !== null)
		{
			data = {};
			prevItem.beforeDeactivate(data);
			if (data.cancel)
				return;

			data = {
				item: prevItem,
				itemIndex: prevItemIndex,
				nextItem: item,
				nextItemIndex: item
			};
			self.onItemDeactivateBefore(data);
			if (data.cancel)
				return;
		}
		if (item !== null)
		{
			data = {};
			item.beforeActivate(data);
			if (data.cancel)
				return;
		}
		data = {
			item: item,
			itemIndex: itemIndex,
			prevItem: prevItem,
			prevItemIndex: prevItemIndex
		};
		self.onItemActivateBefore(data);
		if (data.cancel)
			return;

		if (prevItem)
		{
			prevItem.bodyNode.style.display = "none";
			prevItem.$head.removeClass(cp+"active");
			prevItemIndex = self.getItemIndex(prevItem);
			if (prevItemIndex !== null)
			{
				if (prevItemIndex > 0)
					items[prevItemIndex-1].$head.removeClass(cp+"before-active");
				if (prevItemIndex < items.length-1)
					items[prevItemIndex+1].$head.removeClass(cp+"after-active");
			}
		}
		if (item !== null)
		{
			item.bodyNode.style.display = "block";
			item.$head.addClass(cp+"active");
			if (itemIndex > 0)
				items[itemIndex-1].$head.addClass(cp+"before-active");
			if (itemIndex < items.length-1)
				items[itemIndex+1].$head.addClass(cp+"after-active");
		}
		self.activeItem = item;

		if (prevItem)
		{
			prevItem.afterDeactivate();
			self.onItemDeactivate({
				item: prevItem,
				itemIndex: prevItemIndex,
				nextItem: item,
				nextItemIndex: item
			});
		}
		if (item !== null)
			item.afterActivate();
		self.onItemActivate({
			item: item,
			itemIndex: itemIndex,
			prevItem: prevItem,
			prevItemIndex: prevItemIndex
		});
	},

	getItemIndex: function(item)
	{
		for (var i in this.items)
		{
			if (item === this.items[i])
				return parseInt(i);
		}
		return null;
	},

	getItemById: function(id)
	{
		var index = this.getItemIndexById(id);
		return (index === null ? null : this.items[index]);
	},

	getItemIndexById: function(id)
	{
		for (var i in this.items)
		{
			if (id === this.items[i].id)
				return parseInt(i);
		}
		return null;
	},

	onItemActivateBefore: function(data)
	{
		this.trigger("itemActivateBefore", data);
	},

	onItemActivate: function(data)
	{
		this.trigger("itemActivate", data);
	},

	onItemDeactivateBefore: function(data)
	{
		this.trigger("itemDeactivateBefore", data);
	},

	onItemDeactivate: function(data)
	{
		this.trigger("itemDeactivate", data);
	},

	activateItemOnCreate: function(defaultActiveItem)
	{
		var self = this, activeItem = null, i;
		if (hopjs.def(defaultActiveItem))
		{
			if (defaultActiveItem instanceof hopjs.tabsItem)
				activeItem = self.getItemIndex(defaultActiveItem);
			else
			{
				i = parseInt(defaultActiveItem);
				if (!isNaN(i) && hopjs.def(self.items[i]))
					activeItem = i;
			}
			if (activeItem !== null && !self.items[activeItem].enabled)
				activeItem = null;
		}
		if (activeItem === null && self.hashActivation && document.location.hash.length > 1)
		{
			for (i in self.items)
			{
				if ("#"+self.items[i].hash === document.location.hash && self.items[i].enabled)
				{
					activeItem = i;
					break;
				}
			}
		}
		self.activateItem(activeItem === null ? 0: activeItem);
	},

	activateFirstSuitableItem: function()
	{
		for (var i = 0; i < this.items.length; i++)
		{
			if (this.items[i].canBeActivated())
			{
				this.items[i].activate();
				break;
			}
		}
	}
});

hopjs.tabsItem = function(params)
{
	hopjs.component.apply(this, arguments);
};

hopjs.inherit(hopjs.tabsItem, hopjs.component, {
	getDefaults: function()
	{
		return {
			tabs: null,
			enabled: true,
			id: "",
			caption: "",
			icon: "",
			title: "",
			hash: "",
			closable: false,
			extraHeadClass: "",
			extraBodyClass: ""
		};
	},

	getEvents: function()
	{
		return [
			"attach",
			"detach",
			"activateBefore",
			"activate",
			"deactivateBefore",
			"deactivate",
			"closeBefore",
			"close"
		];
	},

	create: function(params)
	{
		var self = this;
		hopjs.component.prototype.create.apply(self, arguments);
		self.active = false;
		self.closeAction = false;
		self.generateHtml();
		self.setEnabled(self.enabled);
		self.setCaption(self.caption);
		self.setIcon(self.icon);
		self.setTitle(self.title);
		self.setClosable(self.closable);
		if (params && hopjs.def(params.content))
		{
			if (typeof params.content === "string")
				self.$body.html(params.content);
			else
				self.bodyNode.appendChild(params.content);
		}
	},

	setEnabled: function(value)
	{
		this.enabled = !!value;
		if (this.$head)
		{
			this.$head.toggleClass(cp+"disabled", !this.enabled);
			if (this.tabs)
				this.tabs.activateFirstSuitableItem();
		}
	},

	setCaption: function(value)
	{
		this.caption = String(value);
		if (this.$caption)
		{
			this.$caption.html(this.caption === "" ? "&nbsp;" : this.caption);
			this.$head.toggleClass(cp+"caption", this.caption !== "");
		}
	},

	setIcon: function(icon)
	{
		this.icon = String(icon);
		if (this.$head)
		{
			$("> div", this.headNode)[0].style.backgroundImage = (this.icon === "" ? "none" : "url("+icon+")");
			this.$head.toggleClass(cp+"icon", this.icon !== "");
		}
	},

	setTitle: function(value)
	{
		this.title = String(value);
		if (this.$caption)
			this.$caption.attr("title", this.title);
	},

	setClosable: function(value)
	{
		this.closable = !!value;
		if (this.$head)
			this.$head.toggleClass(cp+"closable", this.closable);
	},

	generateHtml: function()
	{
		var self = this;
		self.headNode = document.createElement("div");
		self.headNode.className = cp+"item-head";
		if (self.extraHeadClass !== "")
			self.headNode.className += " "+self.extraHeadClass;
		self.$head = $(self.headNode);
		self.$head.html('<div><div class="'+cp+'caption"><div></div></div><div class="'+cp+'close"><div></div></div></div>');
		self.$caption = $(_cp+"caption div", self.headNode);
		self.captionNode = self.$caption[0];
		self.bodyNode = document.createElement("div");
		self.bodyNode.className = cp+"item-body";
		if (self.extraBodyClass !== "")
			self.bodyNode.className += " "+self.extraBodyClass;
		self.$body = $(self.bodyNode);
		self.headNode.hopTabsItem = self;
		self.bodyNode.hopTabsItem = self;

		self.$head.on("mouseenter", function(event)
		{
			self.onHeadMouseenter(event);
		});

		self.$head.on("mousedown", function(event)
		{
			self.onHeadMousedown(event);
		});

		self.$head.on("click", function(event)
		{
			self.onHeadClick(event);
		});

		$(_cp+"close", self.headNode).on("mousedown", function(event)
		{
			self.onCloseMousedown(event);
		});

		$(_cp+"close", self.headNode).on("click", function(event)
		{
			self.onCloseClick(event);
		});
	},

	onHeadMouseenter: function(event)
	{
		if (this.enabled && event.which === 1 && this.tabs && this.tabs.event === "mouseenter")
			this.activate();
	},

	onHeadMousedown: function(event)
	{
		if (this.closeAction)
		{
			this.closeAction = false;
			return;
		}
		if (this.enabled && event.which === 1 && this.tabs && this.tabs.event === "mousedown")
			this.activate();
	},

	onHeadClick: function(event)
	{
		if (this.closeAction)
		{
			this.closeAction = false;
			return;
		}
		if (this.enabled && event.which === 1 && this.tabs && this.tabs.event === "click")
			this.activate();
	},

	onCloseMousedown: function(event)
	{
		this.closeAction = true;
	},

	onCloseClick: function(event)
	{
		if (event.which === 1 && this.tabs)
			this.close();
		this.closeAction = true;
	},

	attach: function(tabs, before)
	{
		tabs.attach(this, before);
	},

	afterAttach: function()
	{
		this.trigger("attach");
	},

	detach: function()
	{
		if (this.tabs)
			this.tabs.removeItem(this);
	},

	afterDetach: function(data)
	{
		this.active = false;
		this.trigger("detach", data);
	},

	activate: function()
	{
		if (this.tabs)
			this.tabs.activateItem(this);
	},

	canBeActivated: function()
	{
		return this.enabled;
	},

	beforeActivate: function(data)
	{
		this.trigger("activateBefore", data);
	},

	afterActivate: function()
	{
		this.active = true;
		if (this.hash !== "")
			document.location.hash = this.hash;
		this.trigger("activate");
	},

	beforeDeactivate: function(data)
	{
		this.trigger("deactivateBefore", data);
	},

	afterDeactivate: function()
	{
		this.active = false;
		this.trigger("deactivate");
	},

	close: function()
	{
		var data = {};
		this.onCloseBefore(data);
		if (data.cancel)
			return;

		this.detach();
		this.onClose();
	},

	onCloseBefore: function(data)
	{
		this.trigger("closeBefore", data);
	},

	onClose: function()
	{
		this.trigger("close");
	}
});

var itemParamAttributeMap = {
	enabled: "enabled",
	id: "id",
	caption: "caption",
	icon: "icon",
	title: "title",
	hash: "hash",
	extraHeadClass: "extra-head-class",
	extraBodyClass: "extra-body-class"
};

hopjs.tabs.fromLayout = function(params, tabsParams)
{
	var node = null, headSelector = "> span", bodySelector = "> div",
		$head, $body, items = [], i, headNode, item, param, value, result;
	tabsParams = tabsParams || {};
	params = params || {};

	if (params.node)
		node = params.node;
	else if (params.$node)
		node = params.$node[0];
	else if (typeof params.nodeSelector === "string")
		node = $(params.nodeSelector)[0];

	if (typeof params.headSelector === "string")
		headSelector = params.headSelector;

	if (typeof params.bodySelector === "string")
		bodySelector = params.bodySelector;

	$head = $(headSelector, node);
	$body = $(bodySelector, node);

	for (i = 0; i < $head.length; i++)
	{
		headNode = $head[i];
		item = {
			caption: headNode.innerHTML
		};
		for (param in itemParamAttributeMap)
		{
			value = headNode.getAttribute("data-"+itemParamAttributeMap[param]);
			if (value !== null)
			{
				if (param === "enabled")
					value = (value === "1");
				item[param] = value;
			}
		}
		if ($body[i])
			item.content = $body[i];
		items.push(item);
	}
	tabsParams.items = items;
	result = new hopjs.tabs(tabsParams);
	node.parentNode.removeChild(node);
	return result;
};

})(document, jQuery, hopjs);