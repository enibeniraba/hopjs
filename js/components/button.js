/*!
 * hopjs.button
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
	
var cp = "hopjs-button-",
	_cp = "."+cp,
	aligns = ["left", "center", "right"],
	verticalAligns = ["top", "middle", "bottom"],
	positions = ["top", "bottom", "left", "right"];

hop.button = function(params)
{
	hop.component.apply(this, arguments);
};

hop.inherit(hop.button, hop.component, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			extraClass: "",
			enabled: true,
			pressed: false,
			allowToggle: false,
			allowFocus: true,
			text: "",
			textAlign: "center",
			wrapText: true,
			icon: "",
			iconPosition: "left",
			iconSize: "16",
			simulateIconHeight: false,
			fixedIcon: false,
			menu: null,
			menuParams: null,
			arrow: null,
			arrowPosition: "right",
			tabIndex: 0,
			height: null,
			width: null,
			align: "center",
			verticalAlign: "middle",
			size: "",
			style: ""
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
			"click",
			"toggle",
			"destroy"
		];
	},

	create: function(params)
	{
		var self = this;
		self.defaultMenuParams = self.getDefaultMenuParams();
		hop.component.prototype.create.apply(self, arguments);
		self.generateHtml();
		if (params.parentNode)
			params.parentNode.appendChild(self.node);
		else if (params.beforeNode)
			params.beforeNode.parentNode.insertBefore(self.node, params.beforeNode);
		else if (params.afterNode)
			hop.dom.insertAfter(self.node, params.afterNode);
		if (self.menu)
		{
			self.menu.layer.configure({
				element: self.node
			});
		}
		self.setEnabled(self.enabled);
		self.setPressed(self.pressed);
		self.setAllowFocus(self.allowFocus);
		self.setText(self.text);
		self.setTextAlign(self.textAlign);
		self.setWrapText(self.wrapText);
		self.setIcon(self.icon);
		self.setIconPosition(self.iconPosition);
		self.setIconSize(self.iconSize);
		self.setSimulateIconHeight(self.simulateIconHeight);
		self.setFixedIcon(self.fixedIcon);
		self.setArrow(self.arrow);
		self.setArrowPosition(self.arrowPosition);
		self.setTabIndex(self.tabIndex);
		self.setHeight(self.height);
		self.setWidth(self.width);
		self.setAlign(self.align);
		self.setVerticalAlign(self.verticalAlign);
		self.setSize(self.size);
		self.setStyle(self.style);
		self.setMenu(self.menu);
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
	
	setEnabled: function(value)
	{
		this.enabled = !!value;
		if (this.node)
		{
			this.$node.attr("tabIndex", this.enabled ? this.tabIndex : -1);
			this.$node.toggleClass(cp+"enabled", this.enabled);
			this.$node.toggleClass(cp+"disabled", !this.enabled);
			this.$node.removeClass(cp+"active");
			if (this.menu)
				this.menu.hide({animation: false});
		}
	},
	
	setPressed: function(value)
	{
		var prev = this.pressed;
		this.pressed = !!value;
		if (this.node)
		{
			this.$node.toggleClass(cp+"pressed", this.pressed);
			if (this.created && this.pressed !== prev)
				this.onToggle();
		}
	},
	
	onToggle: function()
	{
		this.trigger("toggle");
	},
	
	setAllowFocus: function(value)
	{
		this.allowFocus = !!value;
		if (this.node)
			this.$node.toggleClass(cp+"no-focus", !this.allowFocus);
	},
	
	setText: function(value)
	{
		this.text = String(value);
		if (this.node)
		{
			this.$text.html(this.text);
			this.$node.toggleClass(cp+"text", this.text !== "");
		}
	},
	
	setTextAlign: function(value)
	{
		value = String(value);
		if ($.inArray(value, aligns) !== -1)
		{
			if (this.node)
				this.$node.removeClass(cp+"text-align-"+this.textAlign);
			this.textAlign = value;
			if (this.node)
				this.$node.addClass(cp+"text-align-"+value);
		}
	},
	
	setWrapText: function(value)
	{
		this.wrapText = !!value;
		if (this.node)
			this.$node.toggleClass(cp+"text-nowrap", !this.wrapText);
	},
	
	setIcon: function(icon)
	{
		this.icon = String(icon);
		if (this.$node)
		{
			this.iconNode.style.backgroundImage = (this.icon === "" ? "" : "url("+this.icon+")");
			this.$node.toggleClass(cp+"icon", this.icon !== "");
			this.$node.toggleClass(cp+"icon-"+this.iconPosition, this.icon !== "");
		}
	},
	
	setIconPosition: function(value)
	{
		value = String(value);
		if ($.inArray(value, positions) !== -1)
		{
			if (this.node)
				this.$node.removeClass(cp+"icon-"+this.iconPosition);
			this.iconPosition = value;
			if (this.node && this.icon !== "")
				this.$node.addClass(cp+"icon-"+value);
		}
	},
	
	setIconSize: function(value)
	{
		value = String(value);
		if (this.$node)
			this.$node.removeClass(cp+"icon-size-"+this.iconSize);
		this.iconSize = String(value);
		if (this.$node && value !== "16")
			this.$node.addClass(cp+"icon-size-"+value);
	},
	
	setSimulateIconHeight: function(value)
	{
		this.simulateIconHeight = !!value;
		if (this.$node)
			this.$node.toggleClass(cp+"simulate-icon-height", this.simulateIconHeight);
	},
	
	setFixedIcon: function(value)
	{
		this.fixedIcon = !!value;
		if (this.$node)
			this.$node.toggleClass(cp+"fixed-icon", this.fixedIcon);
	},
	
	setArrow: function(value)
	{
		if (value !== null)
			value = !!value;
		this.arrow = value;
		if (this.node)
			this.$node.toggleClass(cp+"arrow", this.arrow || this.arrow === null && this.menu !== null);
	},

	setMenu: function(menu)
	{
		var self = this, menuParams = {};
		if (menu && !(menu instanceof hop.dropdownMenu))
			menu = new hop.dropdownMenu(menu);
		if (self.node)
			self.$node.toggleClass(cp+"arrow", self.arrow || self.arrow === null && menu !== null);
		if (menu === self.menu)
			return;

		if (self.menu)
		{
			self.menu.layer.off("showBefore", self.menuLayerShowBefore);
			self.menu.layer.off("hideBefore", self.menuLayerHideBefore);
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
		
		self.menuLayerShowBefore = function()
		{
			self.onMenuLayerShowBefore();
		};
		menu.layer.on("showBefore", self.menuLayerShowBefore);

		self.menuLayerHideBefore = function()
		{
			self.onMenuLayerHideBefore();
		};
		menu.layer.on("hideBefore", self.menuLayerHideBefore);
	},
	
	onMenuLayerShowBefore: function()
	{
		if (this.node)
			this.$node.addClass(cp+"open");
	},

	onMenuLayerHideBefore: function()
	{
		if (this.node)
			this.$node.removeClass(cp+"open");
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
	
	setArrowPosition: function(value)
	{
		value = String(value);
		if ($.inArray(value, positions) !== -1)
		{
			if (this.node)
				this.$node.removeClass(cp+"arrow-"+this.arrowPosition);
			this.arrowPosition = value;
			if (this.node)
				this.$node.addClass(cp+"arrow-"+value);
		}
	},
	
	setTabIndex: function(value)
	{
		value = parseInt(value);
		if (isNaN(value))
			return;
		
		this.tabIndex = value;
		if (this.node && this.enabled)
			this.$node.attr("tabIndex", this.tabIndex);
	},
	
	setHeight: function(value)
	{
		if (value !== null)
		{
			value = parseInt(value) || 0;
			if (value <= 0)
				return;
		}
		this.height = value;
		if (this.node)
			this.node.style.height = (value === null ? "" : value+"px");
	},
	
	setWidth: function(value)
	{
		if (value !== null)
		{
			value = parseInt(value) || 0;
			if (value <= 0)
				return;
		}
		this.width = value;
		if (this.node)
			this.node.style.width = (value === null ? "" : value+"px");
	},
	
	setAlign: function(value)
	{
		value = String(value);
		if ($.inArray(value, aligns) !== -1)
		{
			if (this.node)
				this.$node.removeClass(cp+"align-"+this.align);
			this.align = value;
			if (this.node)
				this.$node.addClass(cp+"align-"+value);
		}
	},
	
	setVerticalAlign: function(value)
	{
		value = String(value);
		if ($.inArray(value, verticalAligns) !== -1)
		{
			if (this.node)
				this.$node.removeClass(cp+"vertical-align-"+this.verticalAlign);
			this.verticalAlign = value;
			if (this.node)
				this.$node.addClass(cp+"vertical-align-"+value);
		}
	},
	
	setSize: function(value)
	{
		value = String(value);
		if (this.node && this.size !== "")
			this.$node.removeClass(cp+"size-"+this.size);
		this.size = value;
		if (this.node && value !== "")
			this.$node.addClass(cp+"size-"+value);
	},
	
	setStyle: function(value)
	{
		value = String(value);
		if (this.node && this.style !== "")
			this.$node.removeClass(cp+"style-"+this.style);
		this.style = value;
		if (this.node && value !== "")
			this.$node.addClass(cp+"style-"+value);
	},
	
	generateHtml: function()
	{
		var self = this;
		self.node = document.createElement("span");
		self.node.hopButton = self;
		self.node.className = "hopjs-button";
		if (self.extraClass !== "")
			self.node.className += " "+self.extraClass;
		self.$node = $(self.node);
		self.$node.html('<span><span><span><span><i></i><span><span><span><span></span></span></span></span></span></span></span></span>');
		self.$text = $("> span > span > span > span > span > span > span > span", self.node);
		self.textNode = self.$text[0];
		self.$icon = $("i", self.node);
		self.iconNode = self.$icon[0];
		
		self.$node.on("mousedown", function(event)
		{
			self.onNodeMousedown(event);
		});
		
		self.$node.on("click", function(event)
		{
			self.onNodeClick(event);
		});
		
		$(document).on("mouseup", function(event)
		{
			self.onDocumentMouseup(event);
		});
	},
	
	onNodeMousedown: function(event)
	{
		if (event.which === 1 && this.enabled)
		{
			if (this.menu)
				this.menu.mousedown = true;
			this.$node.addClass(cp+"active");
		}
	},
	
	onNodeClick: function(event)
	{
		if (event.which === 1 && this.enabled)
		{
			if (this.menu)
				this.menu.toggle();
			if (this.allowToggle)
				this.toggle();
			this.onClick(event);
		}
	},
	
	onClick: function(event)
	{
		this.trigger("click", {event: event});
	},
	
	toggle: function()
	{
		this.setPressed(!this.pressed);
	},
	
	onDocumentMouseup: function(event)
	{
		if (event.which === 1)
			this.$node.removeClass(cp+"active");
	},

	destroy: function()
	{
		this.$node.remove();
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