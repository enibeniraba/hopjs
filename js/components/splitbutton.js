/*!
 * hopjs.splitButton
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

var cp = "hopjs-button-",
	positions = ["top", "bottom", "left", "right"];

hop.splitButton = function(params)
{
	hop.component.apply(this, arguments);
};

hop.inherit(hop.splitButton, hop.component, {
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
			arrowPressed: false,
			arrowToggled: false,
			toggleArrowOnPress: false,
			allowArrowToggle: true,
			useArrowPressedStyle: true,
			menu: null,
			menuParams: null,
			toggleMenuOnPress: false,
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
			"arrowPress",
			"arrowRelease",
			"arrowToggle",
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
		self.arrowCanceled = false;
		self.arrowMouseOver = false;
		self.arrowMousePressed = false;
		self.arrowKeyPressed = false;
		hop.component.prototype.create.apply(self, arguments);
		self.generateHtml();
		if (params.parentNode)
			params.parentNode.appendChild(self.node);
		else if (params.beforeNode)
			params.beforeNode.parentNode.insertBefore(self.node, params.beforeNode);
		else if (params.afterNode)
			hop.dom.insertAfter(self.node, params.afterNode);
		self.setEnabled(self.enabled);
		self.setPressed(self.pressed);
		self.setToggled(self.toggled);
		self.setAllowFocus(self.allowFocus);
		self.setUsePressedStyle(self.usePressedStyle);
		self.setArrowPressed(self.arrowPressed);
		self.setArrowToggled(self.arrowToggled);
		self.setUseArrowPressedStyle(self.useArrowPressedStyle);
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
				self.onToggle();
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

	setArrowPressed: function(value)
	{
		var self = this,
			prev = self.arrowPressed;
		self.arrowPressed = !!value;
		self.arrowMousePressed = false;
		self.arrowKeyPressed = false;
		if (self.node)
		{
			if (this.useArrowPressedStyle)
				self.$node.toggleClass(cp+"arrow-pressed", self.arrowPressed);
			if (self.created && self.arrowPressed !== prev)
			{
				var data = {
					allowToggle: true
				};
				if (self.arrowPressed)
				{
					self.onArrowPress(data);
					if (self.allowArrowToggle)
					{
						if (self.toggleArrowOnPress && data.allowToggle)
							self.arrowToggle();
					}
					else if (this.menu && this.toggleMenuOnPress)
						this.menu.toggle();
				}
				else
				{
					self.onArrowRelease(data);
					if (!self.arrowCanceled)
					{
						if (self.allowArrowToggle)
						{
							if (!self.toggleArrowOnPress && data.allowToggle)
								self.arrowToggle();
						}
						else if (this.menu && !this.toggleMenuOnPress)
							this.menu.toggle();
					}
				}
			}
		}
	},

	onArrowPress: function(data)
	{
		this.trigger("arrowPress", data);
	},

	onArrowRelease: function(data)
	{
		this.trigger("arrowRelease", data);
	},

	setArrowToggled: function(value)
	{
		var self = this,
			prev = self.arrowToggled;
		self.arrowToggled = !!value;
		if (self.node)
		{
			self.$node.toggleClass(cp+"arrow-toggled", self.arrowToggled);
			if (self.created && self.arrowToggled !== prev)
			{
				if (self.menu && self.toggleMenu)
				{
					if (self.arrowToggled)
						self.menu.show();
					else
						self.menu.hide();
				}
				self.onArrowToggle();
			}
		}
	},

	onArrowToggle: function()
	{
		this.trigger("arrowToggle");
	},

	setUseArrowPressedStyle: function(value)
	{
		this.useArrowPressedStyle = !!value;
		if (this.node)
			this.$node.toggleClass(cp+"arrow-pressed", this.useArrowPressedStyle && this.arrowPressed);
	},

	setContent: function(value)
	{
		if (this.node)
			this.$content.html(value);
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
		if (this.node && this.allowArrowToggle)
		{
			this.toggleMenu = false;
			this.setArrowToggled(true);
			this.toggleMenu = true;
		}
	},

	onMenuLayerHideBefore: function()
	{
		if (this.node && this.allowArrowToggle)
		{
			this.toggleMenu = false;
			this.setArrowToggled(false);
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
		if (!hop.def(value))
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

	arrowPress: function()
	{
		this.setArrowPressed(true);
	},

	arrowRelease: function()
	{
		this.setArrowPressed(false);
	},

	arrowToggle: function(value)
	{
		if (!hop.def(value))
			value = !this.arrowToggled;
		this.setArrowToggled(value);
	},

	arrowCancel: function()
	{
		if (this.arrowPressed)
		{
			this.arrowCanceled = true;
			this.setArrowPressed(false);
			this.arrowCanceled = false;
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
		return "hopjs-splitbutton";
	},

	generateInnerHtml: function()
	{
		var self = this;
		self.$node.html('<span><span></span><div></div></span>');
		self.$content = $("> span > span", self.node);
		self.contentNode = self.$content[0];
		self.$arrow = $("> span > div", self.node);
		self.arrowNode = self.$arrow[0];
	},

	attachEvents: function()
	{
		var self = this;
		self.$content.on("mouseenter", function(event)
		{
			self.onContentMouseenter(event);
		});

		self.$content.on("mouseleave", function(event)
		{
			self.onContentMouseleave(event);
		});

		self.$content.on("mousedown", function(event)
		{
			self.onContentMousedown(event);
		});

		self.$content.on("mouseup", function(event)
		{
			self.onContentMouseup(event);
		});

		self.$arrow.on("mouseenter", function(event)
		{
			self.onArrowMouseenter(event);
		});

		self.$arrow.on("mouseleave", function(event)
		{
			self.onArrowMouseleave(event);
		});

		self.$arrow.on("mousedown", function(event)
		{
			self.onArrowMousedown(event);
		});

		self.$arrow.on("mouseup", function(event)
		{
			self.onArrowMouseup(event);
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

	onContentMouseenter: function(event)
	{
		this.mouseOver = true;
	},

	onContentMouseleave: function(event)
	{
		this.mouseOver = false;
	},

	onContentMousedown: function(event)
	{
		if (event.which === 1 && this.enabled)
		{
			if (this.allowFocus && this.tabIndex === null)
				this.node.focus();
			this.press();
			this.mousePressed = true;
		}
	},

	onContentMouseup: function(event)
	{
		if (event.which === 1 && this.enabled && this.mousePressed)
			this.release();
	},

	onArrowMouseenter: function(event)
	{
		this.arrowMouseOver = true;
	},

	onArrowMouseleave: function(event)
	{
		this.arrowMouseOver = false;
	},

	onArrowMousedown: function(event)
	{
		if (event.which === 1 && this.enabled)
		{
			if (this.allowArrowFocus && this.tabIndex === null)
				this.node.focus();
			if (this.menu)
				this.menu.mousedown = true;
			this.arrowPress();
			this.arrowMousePressed = true;
		}
	},

	onArrowMouseup: function(event)
	{
		if (event.which === 1 && this.enabled && this.arrowMousePressed)
			this.arrowRelease();
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
		if (this.arrowKeyPressed)
			this.arrowCancel();
	},

	onDocumentMouseup: function(event)
	{
		if (event.which === 1 && this.enabled)
		{
			if (this.mousePressed && !this.mouseOver)
				this.cancel();
			if (this.arrowMousePressed && !this.arrowMouseOver)
				this.arrowCancel();
		}
	},

	onDocumentKeydown: function(event)
	{
		if (this.enabled && this.focused)
		{
			if (event.which === 13)
			{
				this.press();
				this.keyPressed = true;
			}
			else if (event.which === 27 && this.mousePressed)
				this.cancel();

			if (event.which === 32)
			{
				this.arrowPress();
				this.arrowKeyPressed = true;
			}
			else if (event.which === 27 && this.arrowMousePressed)
				this.arrowCancel();
		}
	},

	onDocumentKeyup: function(event)
	{
		if (this.enabled && this.focused && (event.which === 13 || event.which === 32))
		{
			if (this.keyPressed)
				this.release();
			if (this.arrowKeyPressed)
				this.arrowRelease();
		}
	},

	onWindowBlur: function(event)
	{
		if (this.mousePressed || this.keyPressed)
			this.cancel();
		if (this.arrowMousePressed || this.arrowKeyPressed)
			this.arrowCancel();
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