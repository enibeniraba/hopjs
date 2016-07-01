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

(function(window, document, $, hopjs)
{

var cp = "hopjs-button-",
	positions = ["top", "bottom", "left", "right"];

hopjs.types["button"] = "hopjs.button";

hopjs.button = function(params)
{
	hopjs.component.apply(this, arguments);
};

hopjs.inherit(hopjs.button, hopjs.component, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			extraClass: "",
			enabled: true,
			pressed: false,
			toggled: false,
			toggleOnPress: false,
			allowToggle: false,
			allowFocus: true,
			usePressedStyle: true,
			menu: null,
			menuParams: null,
			toggleMenuOnPress: false,
			arrow: null,
			arrowPosition: "right",
			tabIndex: 0,
			height: null,
			width: null,
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
			"press",
			"release",
			"toggle",
			"destroy"
		];
	},

	create: function(params)
	{
		var self = this;
		self.defaultMenuParams = self.getDefaultMenuParams();
		self.canceled = false;
		self.focused = false;
		self.toggleMenu = true;
		self.mouseOver = false;
		self.mousePressed = false;
		self.keyPressed = false;
		hopjs.component.prototype.create.apply(self, arguments);
		self.generateHtml();
		if (params.parentNode)
			params.parentNode.appendChild(self.node);
		else if (params.beforeNode)
			params.beforeNode.parentNode.insertBefore(self.node, params.beforeNode);
		else if (params.afterNode)
			hopjs.dom.insertAfter(self.node, params.afterNode);
		self.setEnabled(self.enabled);
		self.setPressed(self.pressed);
		self.setToggled(self.toggled);
		self.setAllowFocus(self.allowFocus);
		self.setUsePressedStyle(self.usePressedStyle);
		self.setArrow(self.arrow);
		self.setArrowPosition(self.arrowPosition);
		self.setTabIndex(self.tabIndex);
		self.setHeight(self.height);
		self.setWidth(self.width);
		self.setStyle(self.style);
		self.setMenu(self.menu);
		if (self.menu)
		{
			self.menu.layer.configure({
				element: self.node
			});
		}
		if (params.content)
			self.setContent(params.content);
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
			this.updateTabIndex();
			this.$node.toggleClass(cp+"enabled", this.enabled);
			this.$node.toggleClass(cp+"disabled", !this.enabled);
			this.setPressed(false);
			if (this.menu)
				this.menu.hide({animation: false});
		}
	},

	updateTabIndex: function()
	{
		if (this.enabled && this.allowFocus && this.tabIndex !== null)
			this.$node.attr("tabIndex", this.tabIndex);
		else
			this.$node.removeAttr("tabIndex");
	},

	setPressed: function(value)
	{
		var self = this,
			prev = self.pressed;
		self.pressed = !!value;
		self.mousePressed = false;
		self.keyPressed = false;
		if (self.node)
		{
			if (this.usePressedStyle)
				self.$node.toggleClass(cp+"pressed", self.pressed);
			if (self.created && self.pressed !== prev)
			{
				var data = {
					allowToggle: true
				};
				if (self.pressed)
				{
					self.onPress(data);
					if (self.allowToggle)
					{
						if (self.toggleOnPress && data.allowToggle)
							self.toggle();
					}
					else if (this.menu && this.toggleMenuOnPress)
						this.menu.toggle();
				}
				else
				{
					self.onRelease(data);
					if (!self.canceled)
					{
						if (self.allowToggle)
						{
							if (!self.toggleOnPress && data.allowToggle)
								self.toggle();
						}
						else if (this.menu && !this.toggleMenuOnPress)
							this.menu.toggle();
					}
				}
			}
		}
	},

	onPress: function(data)
	{
		this.trigger("press", data);
	},

	onRelease: function(data)
	{
		this.trigger("release", data);
	},

	setToggled: function(value)
	{
		var self = this,
			prev = self.toggled;
		self.toggled = !!value;
		if (self.node)
		{
			self.$node.toggleClass(cp+"toggled", self.toggled);
			if (self.created && self.toggled !== prev)
			{
				if (self.menu && self.toggleMenu)
				{
					if (self.toggled)
						self.menu.show();
					else
						self.menu.hide();
				}
				self.onToggle();
			}
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
		{
			this.updateTabIndex();
			this.$node.toggleClass(cp+"no-focus", !this.allowFocus);
		}
	},

	setUsePressedStyle: function(value)
	{
		this.usePressedStyle = !!value;
		if (this.node)
			this.$node.toggleClass(cp+"pressed", this.usePressedStyle && this.pressed);
	},

	setContent: function(value)
	{
		if (this.node)
			this.$content.html(value);
	},

	setArrow: function(value)
	{
		if (value !== null)
			value = !!value;
		this.arrow = value;
		this.updateArrowClass();
	},

	updateArrowClass: function()
	{
		if (this.node)
			this.$node.toggleClass(cp+"arrow", this.arrow || this.arrow === null && this.getDefaultArrow());
	},

	getDefaultArrow: function()
	{
		return (this.menu !== null);
	},

	setMenu: function(menu)
	{
		var self = this, menuParams = {};
		if (menu && !(menu instanceof hopjs.dropdownMenu))
			menu = new hopjs.dropdownMenu(menu);
		self.updateArrowClass();
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
		self.updateArrowClass();
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
		if (this.node && this.allowToggle)
		{
			this.toggleMenu = false;
			this.setToggled(true);
			this.toggleMenu = true;
		}
	},

	onMenuLayerHideBefore: function()
	{
		if (this.node && this.allowToggle)
		{
			this.toggleMenu = false;
			this.setToggled(false);
			this.toggleMenu = true;
		}
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
		if (value === "")
			value = null;
		if (value !== null)
		{
			value = parseInt(value);
			if (isNaN(value))
				return;
		}
		this.tabIndex = value;
		if (this.node)
			this.updateTabIndex();
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

	setStyle: function(value)
	{
		value = String(value);
		if (this.node && this.style !== "")
			this.$node.removeClass(cp+"style-"+this.style);
		this.style = value;
		if (this.node && value !== "")
			this.$node.addClass(cp+"style-"+value);
	},

	enable: function()
	{
		this.setEnabled(true);
	},

	disable: function()
	{
		this.setEnabled(false);
	},

	press: function()
	{
		this.setPressed(true);
	},

	release: function()
	{
		this.setPressed(false);
	},

	toggle: function(value)
	{
		if (!hopjs.def(value))
			value = !this.toggled;
		this.setToggled(value);
	},

	cancel: function()
	{
		if (this.pressed)
		{
			this.canceled = true;
			this.setPressed(false);
			this.canceled = false;
		}
	},

	generateHtml: function()
	{
		var self = this;
		self.createNode();
		self.generateInnerHtml();
		self.attachEvents();
	},

	createNode: function()
	{
		var self = this;
		self.node = document.createElement("span");
		self.node.hopButton = self;
		self.node.className = self.createClassName();
		if (self.extraClass !== "")
			self.node.className += " "+self.extraClass;
		self.$node = $(self.node);
	},

	createClassName: function()
	{
		return "hopjs-button";
	},

	generateInnerHtml: function()
	{
		var self = this;
		self.$node.html('<span><span></span></span>');
		self.$content = $("> span > span", self.node);
		self.contentNode = self.$content[0];
	},

	attachEvents: function()
	{
		var self = this;
		self.$node.on("mouseenter", function(event)
		{
			self.onNodeMouseenter(event);
		});

		self.$node.on("mouseleave", function(event)
		{
			self.onNodeMouseleave(event);
		});

		self.$node.on("mousedown", function(event)
		{
			self.onNodeMousedown(event);
		});

		self.$node.on("mouseup", function(event)
		{
			self.onNodeMouseup(event);
		});

		self.$node.on("focus", function(event)
		{
			self.onFocus();
		});

		self.$node.on("blur", function(event)
		{
			self.onBlur();
		});

		$(document).on("mouseup", function(event)
		{
			self.onDocumentMouseup(event);
		});

		$(document).on("keydown", function(event)
		{
			self.onDocumentKeydown(event);
		});

		$(document).on("keyup", function(event)
		{
			self.onDocumentKeyup(event);
		});

		$(window).on("blur", function(event)
		{
			self.onWindowBlur(event);
		});
	},

	onNodeMouseenter: function(event)
	{
		this.mouseOver = true;
	},

	onNodeMouseleave: function(event)
	{
		this.mouseOver = false;
	},

	onNodeMousedown: function(event)
	{
		if (event.which === 1 && this.enabled)
		{
			if (this.allowFocus && this.tabIndex === null)
				this.node.focus();
			if (this.menu)
				this.menu.mousedown = true;
			this.press();
			this.mousePressed = true;
		}
	},

	onNodeMouseup: function(event)
	{
		if (event.which === 1 && this.enabled && this.mousePressed)
			this.release();
	},

	onFocus: function(event)
	{
		this.focused = true;
	},

	onBlur: function(event)
	{
		this.focused = false;
		if (this.keyPressed)
			this.cancel();
	},

	onDocumentMouseup: function(event)
	{
		if (event.which === 1 && this.enabled && this.mousePressed && !this.mouseOver)
			this.cancel();
	},

	onDocumentKeydown: function(event)
	{
		if (this.enabled)
		{
			if (this.focused && (event.which === 13 || event.which === 32))
			{
				this.press();
				this.keyPressed = true;
			}
			else if (event.which === 27 && this.mousePressed)
				this.cancel();
		}
	},

	onDocumentKeyup: function(event)
	{
		if (this.enabled && this.focused && this.keyPressed && (event.which === 13 || event.which === 32))
			this.release();
	},

	onWindowBlur: function(event)
	{
		if (this.mousePressed || this.keyPressed)
			this.cancel();
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

})(window, document, jQuery, hopjs);