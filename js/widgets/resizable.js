/*!
 * hop.resizable
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

var allHandles = ["n", "s", "w", "e", "nw", "ne", "sw", "se"],
	allLimiterSides = ["top", "bottom", "left", "right"];

hop.resizable = function(params)
{
	hop.widget.apply(this, arguments);
};

hop.inherit(hop.resizable, hop.widget, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			node: null,
			className: null,
			classPrefix: "hop-",
			extraClassName: "",
			helperClassName: null,
			enabled: true,
			handles: ["s", "e", "se"],
			minHeight: 10,
			maxHeight: null,
			minWidth: 10,
			maxWidth: null,
			helper: false,
			preserveRatio: false,
			heightIncrement: 1,
			widthIncrement: 1,
			limiter: null,
			limiterBox: "content",
			limiterRegion: null,
			limiterSides: allLimiterSides
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
			"stateChange",
			"resizeBefre",
			"resize",
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
			self.className = self.classPrefix+"resizable";
		if (self.helperClassName === null)
			self.helperClassName = self.classPrefix+"resizable-helper";
		self.activeHandle = null;
		self.resizing = false;
		self.heightChanged = false;
		self.widthChanged = false;
		self.limiterCache = null;
		self.generateHtml();
		self.setEnabled(self.enabled);
		self.setHandles(self.handles);
	},
	
	setEnabled: function(enabled)
	{
		this.enabled = !!enabled;
		if (this.$node)
		{
			this.$node.toggleClass(this.classPrefix+"resizable-disabled", !this.enabled);
			this.cancel();
		}
	},
	
	setHandles: function(handles)
	{
		var self = this, i;
		if (typeof handles === "string")
		{
			if (handles === "all")
				handles = allHandles.slice(0);
			else
				handles = handles.split(/\s+/);
		}
		self.handles = [];
		for (i in handles)
		{
			if (self.validateHandle(handles[i]))
				self.handles.push(handles[i]);
		}
		if (hop.def(self.$handles))
		{
			for (i in allHandles)
				self.$handles[allHandles[i]].detach();
			for (i in self.handles)
				self.$node.append(self.handleNodes[self.handles[i]]);
		}
	},
	
	validateHandle: function(handle)
	{
		if (typeof handle !== "string")
		{
			console.warn("hop.resizable: Invalid handle variable type. Expected string.");
			return false;
		}
		if ($.inArray(handle, allHandles) === -1)
		{
			console.warn("hop.resizable: Unknown handle "+handle+".");
			return false;
		}
		return true;
	},
	
	setMinHeight: function(value)
	{
		this.minHeight = parseFloat(value);
	},
	
	setMaxHeight: function(value)
	{
		this.maxHeight = (value === null || value === "" ? null : parseFloat(value));
	},
	
	setMinWidth: function(value)
	{
		this.minWidth = parseFloat(value);
	},
	
	setMaxWidth: function(value)
	{
		this.maxWidth = (value === null || value === "" ? null : parseFloat(value));
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
			console.warn("hop.resizable: Invalid limiter side variable type. Expected string.");
			return false;
		}
		if ($.inArray(side, allLimiterSides) === -1)
		{
			console.warn("hop.resizable: Unknown limiter side "+side+".");
			return false;
		}
		return true;
	},

	generateHtml: function()
	{
		var self = this, i;
		self.node.hopResizable = self;
		self.$node.addClass(self.className);
		if (self.extraClassName !== null)
			self.$node.addClass(self.extraClassName);

		self.handleNodes = {};
		self.$handles = {};
		for (i in allHandles)
			self.createHandle(allHandles[i]);
		
		self.windowBlur = function(event)
		{
			self.onWindowBlur(event);
		};
		$(window).on("blur", self.windowBlur);
		
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
	
	createHandle: function(handle)
	{
		var self = this,
			node = document.createElement("div"),
			$node = $(node);
		node.className = self.classPrefix+"resizable-handle "+self.classPrefix+"resizable-handle-"+handle;
		self.handleNodes[handle] = node;
		self.$handles[handle] = $node;
		$node.on("mousedown", function(event)
		{
			self.onHandleMousedown(handle, event);
		});
	},
	
	onHandleMousedown: function(handle, event)
	{
		if (event.which === 1)
		{
			this.start(handle, event);
			event.preventDefault();
		}
	},
	
	onWindowBlur: function(event)
	{
		if (this.activeHandle)
			this.cancel();
	},
	
	onDocumentMousemove: function(event)
	{
		if (this.activeHandle !== null)
			this.resize(event);
	},

	onDocumentMouseup: function(event)
	{
		if (this.activeHandle)
			this.stop();
	},
	
	onDocumentKeydown: function(event)
	{
		if (this.activeHandle && event.which === 27)
			this.cancel();
	},
	
	start: function(handle, event)
	{
		var self = this, is,
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
			parentBorderLeft = parseFloat($offsetParent.css("border-left-width")) || 0,
			rightAlign = false, node = self.node, $node, position;
		
		if (self.activeHandle !== null)
			self.stop();
		
		while (node && node.tagName !== "BODY")
		{
			$node = $(node);
			position = $node.css("position");
			if (position === "absolute" || position === "fixed")
				break;
			
			if ($node.css("float") === "right")
			{
				rightAlign = true;
				break;
			}
			node = node.parentNode;
		}
		
		self.activeHandle = handle;
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
			cssLeft: self.$node.css("left"),
			cssTop: self.$node.css("top"),
			styleTop: self.node.style.top,
			styleLeft: self.node.style.left,
			styleHeight: self.node.style.height,
			styleWidth: self.node.style.width,
			offsetTop: offset.top,
			offsetLeft: offset.left,
			parentBorderTop: parentBorderTop,
			parentBorderLeft: parentBorderLeft,
			mouseY: event.pageY,
			mouseX: event.pageX,
			heightChanged: self.heightChanged,
			widthChanged: self.widthChange,
			rightAlign: rightAlign
		};
		self.initialState = is;
		self.state = null;
		self.resizing = true;
		self.limiterCache = null;
		if (self.helper)
		{
			self.$node.addClass(self.classPrefix+"resizable-has-helper");
			self.helperNode = document.createElement("div");
			self.helperNode.className = self.helperClassName;
			self.$helper = $(self.helperNode);
			self.$node.after(self.$helper);
			self.$helper.css({
				position: "fixed",
				top: -10000,
				left: -10000,
				height: 100,
				width: 100
			});
			is.helperHeightDiff = self.$helper.outerHeight(true)-self.$helper.height();
			is.helperWidthDiff = self.$helper.outerWidth(true)-self.$helper.width();
			self.updateHelper();
			self.$node.one("mousedown", function()
			{
				self.helperNode.style.zIndex = self.node.style.zIndex;
			});
		}
		self.$node.addClass(self.classPrefix+"resizable-resizing");
		self.htmlCursor = $("html")[0].style.cursor;
		self.bodyCursor = $("body")[0].style.cursor;
		$("html").css("cursor", handle+"-resize");
		$("body").css("cursor", handle+"-resize");
		self.onStart();
	},
	
	updateHelper: function()
	{
		var is = this.initialState, s = this.state,
			$window = $(window),
			top = is.offsetTop-$window.scrollTop(),
			left = is.offsetLeft-$window.scrollLeft(),
			height = is.height, width = is.width,
			absolutePosition = (is.position === "absolute" || is.position === "fixed");
		if (s !== null)
		{
			if (s.upwards && absolutePosition && is.cssTop !== "auto")
				top -= s.height-is.height;
			if (is.rightAlign || s.leftwards && absolutePosition && is.cssLeft !== "auto")
				left -= s.width-is.width;
			height = s.height;
			width = s.width;
		}
		this.$helper.css({
			top: top,
			left: left,
			height: height-is.helperHeightDiff,
			width: width-is.helperWidthDiff
		});
	},
	
	onStart: function()
	{
		this.trigger("start");
	},
	
	resize: function(event)
	{
		var self = this, is = self.initialState,
			height = is.height, width = is.width, 
			vertical, horizontal, upwards, leftwards, value,
			limiter = self.calcLimiterRegion();
		if (self.activeHandle === null)
			return;
		
		vertical = (self.activeHandle !== "w" && self.activeHandle !== "e");
		horizontal = (self.activeHandle !== "n" && self.activeHandle !== "s");
		upwards = (vertical && (self.activeHandle === "n" || self.activeHandle === "nw" || self.activeHandle === "ne"));
		leftwards = (horizontal && (self.activeHandle === "w" || self.activeHandle === "nw" || self.activeHandle === "sw"));
		if (vertical)
		{
			height += (upwards ? -1 : 1)*(event.pageY-is.mouseY);
			if (height < 0)
				height = 0;
		}
		if (horizontal)
		{
			width += (leftwards ? -1 : 1)*(event.pageX-is.mouseX);
			if (width < 0)
				width = 0;
		}
		if (self.preserveRatio)
		{
			if (height/width < is.ratio && vertical && horizontal || !vertical)
				height = width*is.ratio;
			if (height/width > is.ratio || !horizontal)
				width = height/is.ratio;
			
			if (self.widthIncrement > 1 && horizontal)
			{
				width = self.widthIncrement*Math.round(width/self.widthIncrement);
				height = width*is.ratio;
			}
			else if (self.heightIncrement > 1)
			{
				height = self.heightIncrement*Math.round(height/self.heightIncrement);
				width = height/is.ratio;
			}
			if (limiter)
			{
				if (upwards && is.cssTop !== "auto")
				{
					if ($.inArray("top", self.limiterSides) !== -1)
					{
						value = is.offsetTop-is.marginTop-(height-is.height);
						if (value < limiter.top)
						{
							height -= limiter.top-value;
							width = height/is.ratio;
						}
					}
				}
				else if ($.inArray("bottom", self.limiterSides) !== -1)
				{
					value = is.offsetTop+is.height+is.marginBottom+(height-is.height);
					if (value > limiter.bottom)
					{
						height -= value-limiter.bottom;
						width = height/is.ratio;
					}
				}
				if (leftwards && is.cssLeft !== "auto")
				{
					if ($.inArray("left", self.limiterSides) !== -1)
					{
						value = is.offsetLeft-is.marginLeft-(width-is.width);
						if (value < limiter.left)
						{
							width -= limiter.left-value;
							height = width*is.ratio;
						}
					}
				}
				else if ($.inArray("right", self.limiterSides) !== -1)
				{
					value = is.offsetLeft+is.width+is.marginRight+(width-is.width);
					if (value > limiter.right)
					{
						width -= value-limiter.right;
						height = width*is.ratio;
					}
				}
			}
			if (self.maxWidth !== null && width > self.maxWidth)
			{
				width = self.maxWidth;
				height = width*is.ratio;
			}
			if (self.maxHeight !== null && height > self.maxHeight)
			{
				height = self.maxHeight;
				width = height/is.ratio;
			}
			value = Math.max(self.minWidth, is.widthDiff);
			if (width < value)
			{
				width = value;
				height = width*is.ratio;
			}
			value = Math.max(self.minHeight, is.heightDiff);
			if (height < value)
			{
				height = value;
				width = height/is.ratio;
			}
			self.heightChanged = true;
			self.widthChanged = true;
		}
		else
		{
			if (vertical)
			{
				if (self.heightIncrement > 1)
					height = self.heightIncrement*Math.round(height/self.heightIncrement);
				if (limiter)
				{
					if (upwards && is.cssTop !== "auto")
					{
						if ($.inArray("top", self.limiterSides) !== -1)
						{
							value = is.offsetTop-is.marginTop-(height-is.height);
							if (value < limiter.top)
								height -= limiter.top-value;
						}
					}
					else if ($.inArray("bottom", self.limiterSides) !== -1)
					{
						value = is.offsetTop+is.height+is.marginBottom+(height-is.height);
						if (value > limiter.bottom)
							height -= value-limiter.bottom;
					}
				}
				if (self.maxHeight !== null && height > self.maxHeight)
					height = self.maxHeight;
				if (height < self.minHeight)
					height = self.minHeight;
				if (height < is.heightDiff)
					height = is.heightDiff;
				self.heightChanged = true;
			}
			if (horizontal)
			{
				if (self.widthIncrement > 1)
					width = self.widthIncrement*Math.round(width/self.widthIncrement);
				if (limiter)
				{
					if (leftwards && is.cssLeft !== "auto")
					{
						if ($.inArray("left", self.limiterSides) !== -1)
						{
							value = is.offsetLeft-is.marginLeft-(width-is.width);
							if (value < limiter.left)
								width -= limiter.left-value;
						}
					}
					else if ($.inArray("right", self.limiterSides) !== -1)
					{
						value = is.offsetLeft+is.width+is.marginRight+(width-is.width);
						if (value > limiter.right)
							width -= value-limiter.right;
					}
				}
				if (self.maxWidth !== null && width > self.maxWidth)
					width = self.maxWidth;
				if (width < self.minWidth)
					width = self.minWidth;
				if (width < is.widthDiff)
					width = is.widthDiff;
				self.widthChanged = true;
			}
		}
		self.state = {
			height: height,
			width: width,
			upwards: upwards,
			leftwards: leftwards,
			mouseY: event.pageY,
			mouseX: event.pageX
		};
		self.onStateChange({
			originalState: $.extend({}, self.state)
		});
		if (self.helper)
			self.updateHelper();
		else
			self.realResize();
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
				console.log("hop.resizable: Invalid limiter ("+limiter+").");
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
				console.log("hop.resizable: Element not found.");
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
					parent: value,
					position: $element.css("position"),
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
			if (cache.parent && cache.position === "static" 
				&& (cache.overflowY === "auto" || cache.overflowY === "scroll"))
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
			if (cache.parent && cache.position === "static" 
				&& (cache.overflowX === "auto" || cache.overflowX === "scroll"))
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
	
	onStateChange: function(data)
	{
		this.trigger("stateChange", data);
	},
	
	realResize: function()
	{
		var self = this, css = {}, value,
			is = self.initialState, s = self.state,
			$parent = $(self.node.offsetParent),
			parentOffset = $parent.offset(),
			$window = $(window);
		if (!self.state)
			return;
		
		self.onResizeBefore({
			originalState: $.extend({}, self.state)
		});
		if (self.heightChanged)
			css.height = s.height-is.heightDiff;
		if (self.widthChanged)
			css.width = s.width-is.widthDiff;
		if (is.position === "absolute" || is.position === "fixed")
		{
			if (self.heightChanged && s.upwards && is.cssTop !== "auto")
			{
				value = is.offsetTop+is.height-s.height-is.marginTop;
				if (is.position === "fixed")
					css.top = value-$window.scrollTop();
				else if ($parent[0].tagName === "BODY")
					css.top = value-is.parentBorderTop;
				else
					css.top = value-parentOffset.top-is.parentBorderTop+$parent.scrollTop();
			}
			if (self.widthChanged && s.leftwards && is.cssLeft !== "auto")
			{
				value = is.offsetLeft+is.width-s.width-is.marginLeft;
				if (is.position === "fixed")
					css.left = value-$window.scrollLeft();
				else if ($parent[0].tagName === "BODY")
					css.left = value-is.parentBorderLeft;
				else
					css.left = value-parentOffset.left-is.parentBorderLeft+$parent.scrollLeft();
			}
		}
		self.$node.css(css);
		self.onResize();
	},
	
	onResizeBefore: function(data)
	{
		this.trigger("resizeBefore", data);
	},
	
	onResize: function()
	{
		this.trigger("resize");
	},
	
	stop: function()
	{
		var self = this;
		if (self.activeHandle === null)
			return;
		
		self.reset();
		if (self.helper && (self.heightChanged || self.widthChanged))
			self.realResize();
		self.onStop();
	},
	
	reset: function()
	{
		var self = this;
		self.activeHandle = null;
		self.resizing = false;
		self.$node.removeClass(self.classPrefix+"resizable-resizing");
		self.$node.removeClass(self.classPrefix+"resizable-has-helper");
		$("html")[0].style.cursor = self.htmlCursor;
		$("body")[0].style.cursor = self.bodyCursor;
		if (self.$helper)
		{
			self.$helper.remove();
			self.helperNode = null;
			self.$helper = null;
		}
	},
	
	onStop: function()
	{
		this.trigger("stop");
	},
	
	cancel: function()
	{
		var self = this, is = self.initialState;
		if (self.activeHandle === null)
			return;
		
		self.reset();
		self.heightChanged = is.heightChanged;
		self.widthChanged = is.widthChanged;
		if (!self.helper)
		{
			self.node.style.top = is.styleTop;
			self.node.style.left = is.styleLeft;
			self.node.style.height = is.styleHeight;
			self.node.style.width = is.styleWidth;
			self.onResize();
		}
		self.onCancel();
	},
	
	onCancel: function()
	{
		this.trigger("cancel");
	},

	destroy: function()
	{
		var self = this;
		self.cancel();
		delete self.node.hopResizable;
		self.$node.removeClass(self.className);
		if (self.extraClassName)
			self.$node.removeClass(self.extraClassName);
		$(">."+self.classPrefix+"handle", self.$node).remove();
		$(window).off("blur", self.windowBlur);
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