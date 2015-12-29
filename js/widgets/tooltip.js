/*!
 * hop.tooltip
 *
 * This file is a part of hopjs v@VERSION
 *
 * (c) @AUTHOR
 * Released under the MIT license
 *
 * Date: @DATE
 */

(function($, hop)
{

hop.tooltip = function(params)
{
	hop.widget.apply(this, arguments);
};

hop.inherit(hop.tooltip, hop.widget, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			className: "hop-tooltip",
			content: "",
			width: null,
			layerParams: null,
			cursorPosition: true,
			followCursor: false,
			timeoutShow: 500,
			timeoutHide: 0,
			target: null
		};
	},

	getDefaultLayerParams: function()
	{
		return {
			position: "fixed",
			elementAlignY: "bottom",
			elementAlignX: "left",
			alignY: "top",
			alignX: "left",
			reverse: true,
			jail: true,
			borderElement: "window"
		};
	},

	getDefaultLayerParamsCursor: function()
	{
		return {
			element: "virtual",
			offsetTop: -15,
			offsetBottom: 15,
			offsetLeft: 15,
			offsetRight: -15
		};
	},

	getDefaultLayerParamsTarget: function()
	{
		return {
			offsetTop: -5,
			offsetBottom: 5
		};
	},

	getEvents: function()
	{
		return [
			"destroy",
			"show",
			"hide"
		];
	},

	create: function(params)
	{
		var self = this, event;
		self.defaultLayerParams = self.getDefaultLayerParams();
		self.defaultLayerParamsCursor = self.getDefaultLayerParamsCursor();
		self.defaultLayerParamsTarget = self.getDefaultLayerParamsTarget();
		self.showing = false;
		self.hiding = false;
		self.timeout = null;
		self.queue = false;
		hop.widget.prototype.create.apply(self, arguments);
		self.generateHtml();
		self.setContent(self.content);
		self.setWidth(self.width);
		if (!params)
			params = {};
		if (params.show)
		{
			if (self.target && self.cursorPosition && params.event)
			{
				event = $.event.fix(params.event);
				self.layer.virtualElement.top = event.pageY;
				self.layer.virtualElement.left = event.pageX;
			}
			self.showWithDelay();
		}
	},

	setContent: function(value)
	{
		this.content = value;
		if (this.layer)
			this.layer.$node.html(value);
	},

	setWidth: function(width)
	{
		this.width = width;
		if (!this.layer)
			return;

		if (width === null)
			this.layer.$node.width("auto");
		else
		{
			this.layer.$node.width(width);
			width = width-(this.layer.$node.outerWidth()-width);
			if (width > 0)
				this.layer.$node.width(width);
		}
	},

	setCursorPosition: function(cursorPosition)
	{
		this.cursorPosition = !!cursorPosition;
		if (this.layer && this.target)
		{
			this.layer.configure({
				element: (cursorPosition ? "virtual" : this.target)
			});
		}
	},

	setTarget: function(target)
	{
		var self = this, params;
		if (target && self.target === target)
			return;

		if (self.target)
		{
			self.target.removeAttribute("hopTooltip");
			$(self.target).off("mouseenter", self.targetMouseenter);
			$(self.target).off("mouseleave", self.targetMouseleave);
			$(self.target).off("mousemove", self.targetMousemove);
		}
		self.target = target;
		if (!target)
			return;

		target.hopTooltip = self;
		if (self.layer)
		{
			self.layer.configure({
				element: (self.cursorPosition ? "virtual" : self.target)
			});
		}

		self.targetMouseenter = function(event)
		{
			self.onTargetMouseenter(event);
		};
		$(target).on("mouseenter", self.targetMouseenter);

		self.targetMouseleave = function(event)
		{
			self.onTargetMouseleave(event);
		};
		$(target).on("mouseleave", self.targetMouseleave);

		self.targetMousemove = function(event)
		{
			self.onTargetMousemove(event);
		};
		$(target).on("mousemove", self.targetMousemove);
	},

	onTargetMouseenter: function(event)
	{
		if (!this.layer)
			return;

		if (this.cursorPosition)
		{
			this.layer.virtualElement.top = event.pageY;
			this.layer.virtualElement.left = event.pageX;
		}
		this.showWithDelay();
	},

	onTargetMouseleave: function(event)
	{
		if (this.layer && event.relatedTarget !== this.layer.node)
			this.hideWithDelay();
	},

	onTargetMousemove: function(event)
	{
		var self = this;
		if (self.layer && self.cursorPosition && (self.followCursor || self.showing || self.layer.animation))
		{
			self.layer.virtualElement.top = event.pageY;
			self.layer.virtualElement.left = event.pageX;
			if (self.followCursor)
				self.layer.updatePosition();
		}
	},

	generateHtml: function()
	{
		var self = this, layerParams = {}, width;
		$.extend(true, layerParams, self.defaultLayerParams, self.cursorPosition ? self.defaultLayerParamsCursor : self.defaultLayerParamsTarget);
		if (self.target && !self.cursorPosition)
			layerParams.element = self.target;
		if (self.layerParams)
			$.extend(true, layerParams, self.layerParams);
		self.layer = new hop.layer(layerParams);
		self.layer.hopTooltip = self;
		self.layer.$node.addClass(self.className);

		self.layer.on("show", function()
		{
			self.onLayerShow();
		});

		self.layer.on("hide", function()
		{
			self.onLayerHide();
		});

		$(self.layer.node).on("mouseleave", function(event)
		{
			self.onLayerMouseleave(event);
		});
	},

	onLayerShow: function()
	{
		this.stopAction();
		this.onShow();
		if (this.queue)
		{
			this.queue = false;
			this.hide();
		}
	},

	onShow: function()
	{
		this.trigger("show");
	},

	onLayerHide: function()
	{
		this.stopAction();
		this.onHide();
		if (this.queue)
		{
			this.queue = false;
			this.show();
		}
	},

	onHide: function()
	{
		this.trigger("hide");
	},

	onLayerMouseleave: function(event)
	{
		if (event.relatedTarget !== this.layer.node)
			this.hideWithDelay();
	},

	show: function(params)
	{
		var self = this, layer = self.layer;
		if (layer.visible)
		{
			if (self.hiding)
			{
				if (layer.isAnimation())
					self.queue = true;
				else
				{
					self.queue = false;
					self.stopAction();
				}
			}
			return;
		}
		else
		{
			if (self.showing)
			{
				self.queue = false;
				if (layer.isAnimation())
					return;
				else
					self.stopAction();
			}
		}
		self.showing = true;
		layer.show(params);
	},

	hide: function(params)
	{
		var self = this, layer = self.layer;
		if (!layer.visible)
		{
			if (self.showing)
			{
				if (layer.isAnimation())
					self.queue = true;
				else
				{
					self.queue = false;
					self.stopAction();
				}
			}
			return;
		}
		else
		{
			if (self.hiding)
			{
				self.queue = false;
				if (layer.isAnimation())
					return;
				else
					self.stopAction();
			}
		}
		self.hiding = true;
		layer.hide(params);
	},

	toggle: function(showParams, hideParams)
	{
		if (this.showingNext())
			this.show(showParams);
		else
			this.hide(hideParams);
	},

	showingNext: function()
	{
		var self = this;
		return (!self.layer.visible && (!self.showing || self.queue) || self.layer.visible && self.hiding && !self.queue);
	},

	showWithDelay: function(params)
	{
		var self = this;
		if (self.showing)
		{
			self.queue = false;
			self.layer.moveOnTop();
			return;
		}
		self.clearTimeout();
		if (self.hiding)
		{
			if (self.layer.isAnimation())
				self.show(params);
			else
			{
				self.hiding = false;
				self.layer.moveOnTop();
			}
			return;
		}
		if (self.layer.visible)
		{
			self.layer.moveOnTop();
			return;
		}
		if (self.timeoutShow)
		{
			self.showing = true;
			self.timeout = setTimeout(
				function()
				{
					self.show(params);
				},
				self.timeoutShow
			);
		}
		else
			self.show(params);
	},

	hideWithDelay: function(params)
	{
		var self = this;
		if (self.hiding)
		{
			self.queue = false;
			return;
		}
		self.clearTimeout();
		if (self.showing)
		{
			if (self.layer.isAnimation())
				self.hide(params);
			else
				self.showing = false;
			return;
		}
		if (!self.layer.visible)
			return;

		if (self.timeoutHide)
		{
			self.hiding = true;
			self.timeout = setTimeout(
				function()
				{
					self.hide(params);
				},
				self.timeoutHide
			);
		}
		else
			self.hide(params);
	},

	stopAction: function()
	{
		this.showing = false;
		this.hiding = false;
		this.clearTimeout();
	},

	clearTimeout: function()
	{
		if (this.timeout)
		{
			clearTimeout(this.timeout);
			this.timeout = null;
		}
	},

	destroy: function()
	{
		this.setTarget(null);
		this.layer.destroy();
		this.onDestroy();
	},

	onDestroy: function()
	{
		this.trigger("destroy");
	}
});

})(jQuery, hopjs);