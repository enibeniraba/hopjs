/*!
 * hop.draggable
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

var def = hop.def,
	allLimiterSides = ["top", "bottom", "left", "right"];

hop.draggable = function(params)
{
	hop.widget.apply(this, arguments);
};

hop.inherit(hop.draggable, hop.widget, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			node: null,
			className: null,
			classPrefix: "hop-",
			extraClassName: "",
			enabled: true,
			handles: [],
			cancelHandles: [],
			axis: null,
			cellHeight: 1,
			cellWidth: 1,
			limiter: null,
			limiterBox: "content",
			limiterRegion: null,
			limiterSides: allLimiterSides,
			changeCursor: true,
			cursor: null
		};
	},
	
	getVirtualParams: function()
	{
		return [
			"increment"
		];
	},

	getEvents: function()
	{
		return [
			"destroy",
			"start",
			"dragBefore",
			"drag",
			"stop",
			"cancel"
		];
	},

	create: function(params)
	{
		var self = this;
		hop.widget.prototype.create.apply(self, arguments);
		if (!self.node)
			throw new Error("Node is not defiend.");
		
		self.$node = $(self.node);
		if (self.className === null)
			self.className = self.classPrefix+"draggable";
		self.dragging = false;
		self.canceled = false;
		self.limiterCache = null;
		self.handleItems = [];
		self.handleMousedown = function(event)
		{
			self.onHandleMousedown(event);
		};
		self.cancelHandleMousedown = null;
		self.generateHtml();
		self.setEnabled(self.enabled);
		self.setHandles(self.handles);
		self.setCancelHandles(self.cancelHandles);
	},
	
	setEnabled: function(enabled)
	{
		this.enabled = !!enabled;
		if (this.$node)
		{
			this.$node.toggleClass(this.classPrefix+"draggable-disabled", !this.enabled);
			this.cancel();
		}
	},
	
	setHandles: function(handles)
	{
		var self = this, i;
		if (typeof handles === "string")
		{
			if (handles === "")
				handles = [];
			else
				handles = [handles];
		}
		self.handles = [];
		for (i in handles)
			self.handles.push(handles[i]);
		self.updateHandles();
	},
	
	setCancelHandles: function(handles)
	{
		var self = this, i;
		if (typeof handles === "string")
		{
			if (handles === "")
				handles = [];
			else
				handles = [handles];
		}
		self.cancelHandles = [];
		for (i in handles)
			self.cancelHandles.push(handles[i]);
		self.updateHandles();
	},
	
	updateHandles: function()
	{
		var self = this, i, $element;
		if (!def(self.$node))
			return;
		
		for (i in self.handleItems)
			$(self.handleItems[i].node).off("mousedown", self.handleMousedown);
		
		self.handleItems = [];
		for (i in self.handles)
		{
			$element = (self.handles[i] === "self" ? self.$node : $(self.handles[i], self.$node));
			$element.each(function()
			{
				for (var i in self.handleItems)
				{
					if (this === self.handleItems[i].node)
						return;
				}
				self.handleItems.push({
					node: this,
					cancel: false
				});
			});
		}
		if (self.handles.length === 0)
		{
			self.handleItems.push({
				node: self.node,
				cancel: false
			});
		}
		for (i in self.cancelHandles)
		{
			$(self.cancelHandles[i], self.$node).each(function()
			{
				for (var i in self.handleItems)
				{
					if (this === self.handleItems[i].node)
						return;
				}
				self.handleItems.push({
					node: this,
					cancel: true
				});
			});
		}
		for (i in self.handleItems)
			$(self.handleItems[i].node).on("mousedown", {index: i}, self.handleMousedown);
	},
	
	onHandleMousedown: function(event)
	{
		var self = this;
		if (event.which !== 1 || !self.enabled || self.dragging || self.canceled)
			return;
		
		if (self.handleItems[event.data.index].cancel)
			self.canceled = true;
		else
		{
			event.preventDefault();
			self.start(event);
		}
	},
	
	setIncrement: function(increment)
	{
		this.heightIncrement = increment;
		this.widthIncrement = increment;
	},
	
	setLimiter: function(value)
	{
		this.limiter = (value === null || value === "" ? null : value);
		this.limiterCache = null;
	},
	
	setLimiterSides: function(sides)
	{
		var self = this, i;
		if (typeof sides === "string")
		{
			if (sides === "all")
				sides = allLimiterSides.slice(0);
			else
				sides = sides.split(/\s+/);
		}
		self.limiterSides = [];
		for (i in sides)
		{
			if (self.validateLimiterSide(sides[i]))
				self.limiterSides.push(sides[i]);
		}
	},
	
	validateLimiterSide: function(side)
	{
		if (typeof side !== "string")
		{
			console.warn("hop.draggable: Invalid limiter side variable type. Expected string.");
			return false;
		}
		if ($.inArray(side, allLimiterSides) === -1)
		{
			console.warn("hop.draggable: Unknown limiter side "+side+".");
			return false;
		}
		return true;
	},

	generateHtml: function()
	{
		var self = this;
		self.node.hopDraggable = self;
		self.$node.addClass(self.className);
		if (self.extraClassName !== null)
			self.$node.addClass(self.extraClassName);
		
		self.windowBlur = function(event)
		{
			self.onWindowBlur(event);
		};
		$(window).on("blur", self.windowBlur);
		
		self.documentMousedown = function(event)
		{
			self.onDocumentMousedown(event);
		};
		$(document).on("mousedown", self.documentMousedown);
		
		self.documentMousemove = function(event)
		{
			self.onDocumentMousemove(event);
		};
		$(document).on("mousemove", self.documentMousemove);
		
		self.documentMouseup = function(event)
		{
			self.onDocumentMouseup(event);
		};
		$(document).on("mouseup", self.documentMouseup);
		
		self.documentKeydown = function(event)
		{
			self.onDocumentKeydown(event);
		};
		$(document).on("keydown", self.documentKeydown);
	},
	
	onDocumentMousedown: function(event)
	{
		if (event.which === 1)
			this.canceled = false;
	},
	
	onWindowBlur: function(event)
	{
		if (this.dragging)
			this.cancel();
	},
	
	onDocumentMousemove: function(event)
	{
		if (this.dragging)
			this.drag(event);
	},

	onDocumentMouseup: function(event)
	{
		if (this.dragging)
			this.stop();
	},
	
	onDocumentKeydown: function(event)
	{
		if (this.dragging && event.which === 27)
			this.cancel();
	},
	
	start: function(event)
	{
		var self = this, is, cursor,
			height = self.$node.outerHeight(),
			width = self.$node.outerWidth(),
			innerHeight = self.$node.height(),
			innerWidth = self.$node.width(),
			offset = self.$node.offset(),
			marginTop = parseFloat(self.$node.css("margin-top")) || 0,
			marginBottom = parseFloat(self.$node.css("margin-bottom")) || 0,
			marginLeft = parseFloat(self.$node.css("margin-left")) || 0,
			marginRight = parseFloat(self.$node.css("margin-right")) || 0,
			$offsetParent = $(self.node.offsetParent),
			parentBorderTop = parseFloat($offsetParent.css("border-top-width")) || 0,
			parentBorderLeft = parseFloat($offsetParent.css("border-left-width")) || 0;
		
		is = {
			height: height,
			width: width,
			ratio: height/width,
			innerHeight: innerHeight,
			innerWidth: innerWidth,
			heightDiff: height-innerHeight,
			widthDiff: width-innerWidth,
			marginTop: marginTop,
			marginBottom: marginBottom,
			marginLeft: marginLeft,
			marginRight: marginRight,
			position: self.$node.css("position"),
			top: parseFloat(self.$node.css("top")) || 0,
			left: parseFloat(self.$node.css("left")) || 0,
			stylePosition: self.node.style.position,
			styleTop: self.node.style.top,
			styleLeft: self.node.style.left,
			offsetTop: offset.top,
			offsetLeft: offset.left,
			parentBorderTop: parentBorderTop,
			parentBorderLeft: parentBorderLeft,
			mouseY: event.pageY,
			mouseX: event.pageX
		};
		self.initialState = is;
		self.state = null;
		self.dragging = true;
		self.limiterCache = null;
		if (is.position === "static")
		{
			self.$node.css({
				position: "relative",
				top: 0,
				left: 0
			});
			is.position = "relative";
			is.top = 0;
			is.left = 0;
		}
		self.$node.addClass(self.classPrefix+"draggable-dragging");
		if (self.changeCursor)
		{
			self.htmlCursor = $("html").css("cursor");
			self.bodyCursor = $("body").css("cursor");
			if (self.cursor !== null)
				cursor = self.cursor;
			else
				cursor = (self.axis === "y" ? "n-resize" : (self.axis === "x" ? "e-resize" : "move"));
			$("html").css("cursor", cursor);
			$("body").css("cursor", cursor);
		}
		self.onStart();
	},
	
	onStart: function()
	{
		this.trigger("start");
	},
	
	drag: function(event)
	{
		var self = this, is = self.initialState, value,
			top = is.offsetTop, left = is.offsetLeft,
			dy = event.pageY-is.mouseY,
			dx = event.pageX-is.mouseX,
			limiter = self.calcLimiterRegion();
		if (!self.dragging)
			return;
		
		if (self.axis !== "x")
		{
			top += dy;
			if (self.cellHeight > 1)
				top = self.cellHeight*Math.round(top/self.cellHeight);
			if (limiter)
			{
				if ($.inArray("bottom", self.limiterSides) !== -1)
				{
					value = top+is.height+is.marginBottom;
					if (value > limiter.bottom)
						top -= value-limiter.bottom;
				}
				if ($.inArray("top", self.limiterSides) !== -1)
				{
					if (top-is.marginTop < limiter.top)
						top = limiter.top+is.marginTop;
				}
			}
		}
		if (self.axis !== "y")
		{
			left += dx;
			if (self.cellWidth > 1)
				left = self.cellWidth*Math.round(left/self.cellWidth);
			if (limiter)
			{
				if ($.inArray("right", self.limiterSides) !== -1)
				{
					value = left+is.width+is.marginRight;
					if (value > limiter.right)
						left -= value-limiter.right;
				}
				if ($.inArray("left", self.limiterSides) !== -1)
				{
					if (left-is.marginLeft < limiter.left)
						left = limiter.left+is.marginLeft;
				}
			}
		}
		self.state = {
			top: top,
			left: left,
			mouseY: event.pageY,
			mouseX: event.pageX
		};
		self.originalState = $.extend({}, self.state);
		self.realDrag();
	},
	
	calcLimiterRegion: function()
	{
		if (this.limiter === null)
			return;
		
		var self = this, limiter = self.limiter,
			$document = $(document),
			$window = $(window),
			top = 0, left = 0, height = 0, width = 0,
			region, element = null, $element, offset, node, value, cache;
		if (typeof limiter === "string")
		{
			if (limiter === "document")
			{
				height = $document.height();
				width = $document.width();
			}
			else if (limiter === "window")
			{
				top = $window.scrollTop();
				left = $window.scrollLeft();
				height = $window.height();
				width = $window.width();
			}
			else if (limiter === "parent")
				element = self.node.parentNode;
			else if (limiter === "region")
			{
				top = self.limiterRegion.top;
				left = self.limiterRegion.left;
				height = self.limiterRegion.height;
				width = self.limiterRegion.width;
			}
			else
			{
				console.log("hop.draggable: Invalid limiter ("+limiter+").");
				return;
			}
		}
		else if (typeof limiter === "function")
		{
			region = limiter();
			if (region !== null)
			{
				top = region.top;
				left = region.left;
				height = region.height;
				width = region.width;
			}
		}
		else
			element = limiter;
		if (element !== null)
		{
			$element = $(element);
			if ($element.length !== 1)
			{
				console.log("hop.draggable: Element not found.");
				console.log(element);
				return;
			}
			offset = $element.offset();
			top = offset.top;;
			left = offset.left;
			height = $element.outerHeight();
			width = $element.outerWidth();
			if (self.limiterCache === null)
			{
				value = false;
				node = self.node.parentNode;
				while (node && node.tagName !== "BODY")
				{
					if (node === element)
					{
						value = true;
						break;
					}
					node = node.parentNode;
				}
				self.limiterCache = {
					isParent: value,
					overflowY: $element.css("overflow-y"),
					overflowX: $element.css("overflow-x"),
					borderTop: parseFloat($element.css("border-top-width")) || 0,
					borderBottom: parseFloat($element.css("border-bottom-width")) || 0,
					borderLeft: parseFloat($element.css("border-left-width")) || 0,
					borderRight: parseFloat($element.css("border-right-width")) || 0,
					paddingTop: parseFloat($element.css("padding-top")) || 0,
					paddingBottom: parseFloat($element.css("padding-bottom")) || 0,
					paddingLeft: parseFloat($element.css("padding-left")) || 0,
					paddingRight: parseFloat($element.css("padding-right")) || 0
				};
			}
			cache = self.limiterCache;
			if (cache.isParent && (cache.overflowY === "auto" || cache.overflowY === "scroll"))
			{
				top += cache.borderTop-element.scrollTop;
				height = element.scrollHeight;
				if (self.limiterBox === "content")
				{
					top += cache.paddingTop;
					height -= cache.paddingTop+cache.paddingBottom;
				}
			}
			else if (self.limiterBox === "padding" || self.limiterBox === "content")
			{
				top += cache.borderTop;
				height -= cache.borderTop+cache.borderBottom;
				if (self.limiterBox === "content")
				{
					top += cache.paddingTop;
					height -= cache.paddingTop+cache.paddingBottom;
				}
			}
			if (cache.isParent && (cache.overflowX === "auto" || cache.overflowX === "scroll"))
			{
				left += cache.borderLeft-element.scrollLeft;
				width = element.scrollWidth;
				if (self.limiterBox === "content")
				{
					left += cache.paddingLeft;
					width -= cache.paddingLeft+cache.paddingRight;
				}
			}
			else if (self.limiterBox === "padding" || self.limiterBox === "content")
			{
				left += cache.borderLeft;
				width -= cache.borderLeft+cache.borderRight;
				if (self.limiterBox === "content")
				{
					left += cache.paddingLeft;
					width -= cache.paddingLeft+cache.paddingRight;
				}
			}
		}
		return {
			top: top,
			bottom: top+height,
			left: left,
			right: left+width,
			height: height,
			width: width
		};
	},
	
	realDrag: function()
	{
		var self = this, css = {},
			is = self.initialState, s = self.state,
			parent = self.node.offsetParent,
			$parent = $(parent),
			parentOffset = $parent.offset(),
			$window = $(window);
		if (!self.state)
			return;
		
		self.onDragBefore();
		if (is.position === "relative")
		{
			if (self.axis !== "x")
				css.top = is.top+s.top-is.offsetTop;
			if (self.axis !== "y")
				css.left = is.left+s.left-is.offsetLeft;
		}
		else if (is.position === "absolute")
		{
			if (self.axis !== "x")
			{
				if (parent === null || parent.tagName === "BODY")
					css.top = s.top-is.marginTop-is.parentBorderTop;
				else
					css.top = s.top-is.marginTop-parentOffset.top-is.parentBorderTop+$parent.scrollTop();
			}
			if (self.axis !== "y")
			{
				if (parent === null || parent.tagName === "BODY")
					css.left = s.left-is.marginLeft-is.parentBorderLeft;
				else
					css.left = s.left-is.marginLeft-parentOffset.left-is.parentBorderLeft+$parent.scrollLeft();
			}
		}
		else
		{
			if (self.axis !== "x")
				css.top = s.top-is.marginTop-$window.scrollTop();
			if (self.axis !== "y")
				css.left = s.left-is.marginLeft-$window.scrollLeft();
		}
		self.$node.css(css);
		self.onDrag();
	},
	
	onDragBefore: function()
	{
		this.trigger("dragBefore");
	},
	
	onDrag: function()
	{
		this.trigger("drag");
	},
	
	stop: function()
	{
		var self = this;
		if (!self.dragging)
			return;
		
		self.reset();
		self.onStop();
	},
	
	reset: function()
	{
		var self = this;
		self.dragging = false;
		self.canceled = false;
		self.$node.removeClass(self.classPrefix+"draggable-dragging");
		if (self.changeCursor)
		{
			$("html").css("cursor", self.htmlCursor);
			$("body").css("cursor", self.bodyCursor);
		}
	},
	
	onStop: function()
	{
		this.trigger("stop");
	},
	
	cancel: function()
	{
		var self = this, is = self.initialState;
		if (!self.dragging)
			return;
		
		self.reset();
		self.node.style.position = is.stylePosition;
		self.node.style.top = is.styleTop;
		self.node.style.left = is.styleLeft;
		self.onDrag();
		self.onCancel();
	},
	
	onCancel: function()
	{
		this.trigger("cancel");
	},

	destroy: function()
	{
		var self = this, i;
		self.cancel();
		delete self.node.hopDraggable;
		self.$node.removeClass(self.className);
		if (self.extraClassName)
			self.$node.removeClass(self.extraClassName);
		for (i in self.handleItems)
			$(self.handleItems[i].node).off("mousedown", self.handleMousedown);
		$(window).off("blur", self.windowBlur);
		$(document).off("mousedown", self.documentMousedown);
		$(document).off("mousemove", self.documentMousemove);
		$(document).off("mouseup", self.documentMouseup);
		$(document).off("keydown", self.documentKeydown);
		self.onDestroy();
	},

	onDestroy: function()
	{
		this.trigger("destroy");
	}
});

})(window, document, jQuery, hopjs);