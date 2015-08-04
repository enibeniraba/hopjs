/*!
 * hop.layer
 *
 * This file is a part of hopjs v@VERSION
 *
 * (c) @AUTHOR
 * Released under the MIT license
 *
 * Date: @DATE
 */

(function(window, $, hop, undefined)
{

var def = hop.def;

hop.layer = function(params)
{
	hop.widget.apply(this, arguments);
};

hop.layer.current = function(node)
{
	while (node)
	{
		if (node.hopLayer)
			return node.hopLayer;

		node = node.parentNode;
	}
};

hop.layer.hide = function(node)
{
	var layer = hop.layer.current(node);
	if (layer)
		layer.hide();
};

hop.inherit(hop.layer, hop.widget, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			position: "absolute",
			element: "document",
			virtualElement: {
				top: 0,
				left: 0,
				height: 0,
				width: 0
			},
			elementAlignY: "top",
			elementAlignX: "left",
			alignY: "bottom",
			alignX: "right",
			offsetY: 0,
			offsetX: 0,
			reverseY: false,
			reverseX: false,
			reverseOffsetY: 0,
			reverseOffsetX: 0,
			jailTop: false,
			jailBottom: false,
			jailLeft: false,
			jailRight: false,
			borderElement: "document",
			virtualBorderElement: {
				top: 0,
				left: 0,
				height: 0,
				width: 0
			},
			paramsFunction: null,
			overlay: false,
			overlayClass: "hop-layer-overlay",
			overlayTransparentClass: "hop-layer-overlay-transparent",
			overlayTransparent: false,
			moveOnTopOnShow: true,
			animationShow: null,
			animationShowParams: null,
			animationHide: null,
			animationHideParams: null,
			overlayAnimationShow: null,
			overlayAnimationShowParams: null,
			overlayAnimationHide: null,
			overlayAnimationHideParams: null,
			animate: true,
			parentNode: null
		};
	},

	getVirtualParams: function()
	{
		return [
			"reverse",
			"jail",
			"jailY",
			"jailX"
		];
	},

	getUpdatePositionParams: function()
	{
		return [
			"element",
			"virtualElement",
			"elementAlignY",
			"elementAlignX",
			"alignY",
			"alignX",
			"offsetY",
			"offsetX",
			"reverseY",
			"reverseX",
			"reverseOffsetY",
			"reverseOffsetX",
			"jailTop",
			"jailBottom",
			"jailLeft",
			"jailRight",
			"borderElement",
			"virtualBorderElement",
			"reverse",
			"jail",
			"jailX",
			"jailY",
			"paramsFunction",
			"parentNode"
		];
	},

	getEvents: function()
	{
		return [
			"destroy",
			"showCall",
			"showBefore",
			"showAnimationBefore",
			"show",
			"hideCall",
			"hideBefore",
			"hideAnimationBefore",
			"hide",
			"updatePosition",
			"moveOnTop"
		];
	},

	create: function(params)
	{
		var self = this, node;
		self.updatePositionParams = self.getUpdatePositionParams();
		self.visible = false;
		self.animation = null;
		self.overlayAnimation = null;
		self.shown = false;
		self.state = {};
		self.resetState();
		self.queue = false;
		self.queueParams = {};
		hop.widget.prototype.create.apply(self, arguments);
		if (self.parentNode === null)
			self.parentNode = document.body;
		if (!params)
			params = {};
		node = (params.node ? params.node : document.createElement("div"));
		$(node).css({
			position: self.position,
			top: "0px",
			left: "-10000px",
			display: "none"
		});
		if (node.parentNode != self.parentNode)
			self.parentNode.appendChild(node);
		if (def(params.content))
			node.innerHTML = params.content;
		self.node = node;
		self.$node = $(node);
		self.node.hopLayer = self;
		self.setOverlay(self.overlay);
	},

	configure: function(params)
	{
		if (!params)
			return;

		var self = this, key;
		hop.widget.prototype.configure.apply(self, arguments);
		if (self.shown)
		{
			for (key in self.updatePositionParams)
			{
				if (def(params[self.updatePositionParams[key]]))
				{
					self.updatePosition();
					break;
				}
			}
		}
	},

	setVirtualElement: function(value)
	{
		$.extend(this.virtualElement, value);
	},

	setVirtualBorderElement: function(value)
	{
		$.extend(this.virtualBorderElement, value);
	},

	setReverse: function(value)
	{
		this.reverseY = this.reverseX = value;
	},

	setJail: function(value)
	{
		this.jailTop = this.jailBottom = this.jailLeft = this.jailRight = value;
	},

	setJailY: function(value)
	{
		this.jailTop = this.jailBottom = value;
	},

	setJailX: function(value)
	{
		this.jailLeft = this.jailRight = value;
	},

	setOverlay: function(value)
	{
		var self = this, node;
		self.overlay = !!value;
		if (!self.node)
			return;

		if (self.overlay)
		{
			if (!self.overlayNode)
			{
				node = document.createElement("div");
				node.className = self.overlayClass;
				self.overlayNode = self.parentNode.insertBefore(node, self.node);
				self.$overlay = $(self.overlayNode);
				self.setOverlayTransparent(self.overlayTransparent);
			}
			self.setOverlayParams();
			if (self.visible && !self.isAnimation())
				self.overlayNode.style.display = "block";
		}
		else if (self.overlayNode)
		{
			if (self.overlayAnimation)
				self.overlayAnimation.finish();
			self.overlayNode.style.display = "none";
		}
	},

	setOverlayParams: function()
	{
		$(this.overlayNode).css({
			position: "fixed",
			left: "0px",
			top: "0px",
			width: "100%",
			height: "100%",
			display: "none"
		});
	},

	setOverlayClass: function(value)
	{
		var self = this, prevClass = self.overlayClass;
		self.overlayClass = value;
		if (self.overlayNode)
			self.overlayNode.className = value;
	},

	setOverlayTransparent: function(transparent)
	{
		var self = this;
		self.transparent = !!transparent;
		if (self.$overlay)
			self.$overlay.toggleClass(self.overlayTransparentClass, transparent);
	},

	setParentNode: function(node)
	{
		if (this.parentNode != node)
		{
			this.parentNode = node;
			if (this.overlayNode)
				node.appendChild(this.overlayNode);
			if (this.node)
				node.appendChild(this.node);
		}
	},

	show: function(params)
	{
		var self = this, animate;
		if (!params)
			params = {};
		if (!def(params.moveOnTop))
			params.moveOnTop = null;
		if (!def(params.updatePosition))
			params.updatePosition = true;
		if (!def(params.animate))
			params.animate = null;
		self.onShowCall(params);
		if (self.visible)
		{
			if (self.isAnimation())
			{
				self.queue = true;
				self.queueParams = params;
			}
			return;
		}
		else if (self.isAnimation())
		{
			self.queue = false;
			return;
		}
		if (params.moveOnTop || params.moveOnTop === null && self.moveOnTopOnShow)
			self.moveOnTop();
		if (self.overlay)
		{
			self.setOverlayParams();
			self.overlayNode.style.display = "block";
		}
		if (params.updatePosition)
		{
			self.node.style.top = "0px";
			self.node.style.left = "-10000px";
		}
		self.node.style.display = "block";
		if (params.updatePosition)
		{
			self.updatePosition();
			self.updatePosition();
		}
		self.onShowBefore(params);
		animate = (params.animate || params.animate === null && self.animate);
		if (!animate || !self.animateShowing())
			self.onShow(params);
	},

	onShowCall: function(params)
	{
		this.trigger("showCall", params);
	},

	onShowBefore: function(params)
	{
		this.trigger("showBefore");
	},

	isAnimation: function()
	{
		return (this.animation !== null || this.overlayAnimation !== null);
	},

	animateShowing: function()
	{
		var self = this, animation = {}, overlayAnimation = {};
		if (self.animationShow !== null && hop.layer.showAnimations[self.animationShow])
			$.extend(true, animation, hop.layer.showAnimations[self.animationShow]);
		if (self.overlay && self.overlayAnimationShow !== null && hop.layer.showAnimations[self.overlayAnimationShow])
			$.extend(true, overlayAnimation, hop.layer.showAnimations[self.overlayAnimationShow]);
		if (!animation.start && !overlayAnimation.start)
			return false;

		self.onShowAnimationBefore();
		if (animation.start)
		{
			self.animation = new hop.layerAnimation(self, false, self.animationShowParams);
			$.extend(true, self.animation, animation);
			self.animation.start(function()
			{
				self.animationShowComplete();
			});
		}
		if (overlayAnimation.start)
		{
			self.overlayAnimation = new hop.layerAnimation(self, true, self.overlayAnimationShowParams);
			$.extend(true, self.overlayAnimation, overlayAnimation);
			self.overlayAnimation.start(function()
			{
				self.overlayAnimationShowComplete();
			});
		}
		return true;
	},

	onShowAnimationBefore: function()
	{
		this.trigger("showAnimationBefore");
	},

	onShow: function()
	{
		var self = this;
		self.visible = true;
		self.animation = null;
		self.overlayAnimation = null;
		self.trigger("show");
		self.shown = true;
		if (self.queue)
		{
			self.queue = false;
			self.hide(self.queueParams);
		}
	},

	animationShowComplete: function()
	{
		this.animation = null;
		if (!this.overlayAnimation)
			this.onShow();
	},

	overlayAnimationShowComplete: function()
	{
		this.overlayAnimation = null;
		if (!this.animation)
			this.onShow();
	},

	hide: function(params)
	{
		var self = this;
		if (!params)
			params = {};
		if (!def(params.animate))
			params.animate = null;
		self.onHideCall(params);
		if (!self.visible)
		{
			if (self.isAnimation())
			{
				self.queue = true;
				self.queueParams = params;
			}
			return;
		}
		else if (self.isAnimation())
		{
			self.queue = false;
			return;
		}
		if (self.overlay)
			self.overlayNode.style.display = "none";
		self.node.style.display = "none";
		self.onHideBefore(params);
		animate = (params.animate || params.animate === null && self.animate);
		if (!animate || !self.animateHiding())
			self.onHide();
	},

	onHideCall: function(params)
	{
		this.trigger("hideCall", params);
	},

	onHideBefore: function(params)
	{
		this.trigger("hideBefore", params);
	},

	animateHiding: function()
	{
		var self = this, animation = {}, overlayAnimation = {};
		if (self.animationHide !== null && hop.layer.hideAnimations[self.animationHide])
			$.extend(true, animation, hop.layer.hideAnimations[self.animationHide]);
		if (self.overlay && self.overlayAnimationHide !== null && hop.layer.hideAnimations[self.overlayAnimationHide])
			$.extend(true, overlayAnimation, hop.layer.hideAnimations[self.overlayAnimationHide]);
		if (!animation.start && !overlayAnimation.start)
			return false;

		self.onHideAnimationBefore();
		if (animation.start)
		{
			self.animation = new hop.layerAnimation(self, false, self.animationHideParams);
			$.extend(true, self.animation, animation);
			self.animation.start(function()
			{
				self.animationHideComplete();
			});
		}
		if (overlayAnimation.start)
		{
			self.overlayAnimation = new hop.layerAnimation(self, true, self.overlayAnimationHideParams);
			$.extend(true, self.overlayAnimation, overlayAnimation);
			self.overlayAnimation.start(function()
			{
				self.overlayAnimationHideComplete();
			});
		}
		return true;
	},

	onHideAnimationBefore: function()
	{
		this.trigger("hideAnimationBefore");
	},

	onHide: function()
	{
		var self = this;
		self.visible = false;
		self.animation = null;
		self.overlayAnimation = null;
		self.trigger("hide");
		if (self.queue)
		{
			self.queue = false;
			self.show(self.queueParams);
		}
	},

	animationHideComplete: function()
	{
		this.animation = null;
		if (!self.overlayAnimation)
			this.onHide();
	},

	overlayAnimationHideComplete: function()
	{
		this.overlayAnimation = null;
		if (!this.animation)
			this.onHide();
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
		var self = this, animation = self.isAnimation();
		return (self.visible && animation && !self.queue || !self.visible && (animation && self.queue || !animation));
	},

	finishAnimation: function(overlay)
	{
		if (!def(overlay))
			overlay = true;
		if (this.animation && this.animation.finish)
			this.animation.finish();
		if (overlay)
			this.finishOverlayAnimation();
	},

	finishOverlayAnimation: function()
	{
		if (this.overlayAnimation && this.overlayAnimation.finish)
			this.overlayAnimation.finish();
	},

	updatePosition: function(move)
	{
		var self = this,
			element = self.element,
			virtualElement = self.virtualElement,
			elementAlignY = self.elementAlignY,
			elementAlignX = self.elementAlignX,
			alignY = self.alignY,
			alignX = self.alignX,
			offsetY = self.offsetY,
			offsetX = self.offsetX,
			reverseY = self.reverseY,
			reverseX = self.reverseX,
			reverseOffsetY = self.reverseOffsetY,
			reverseOffsetX = self.reverseOffsetX,
			jailTop = self.jailTop,
			jailBottom = self.jailBottom,
			jailLeft = self.jailLeft,
			jailRight = self.jailRight,
			borderElement = self.borderElement,
			virtualBorderElement = self.virtualBorderElement,
			$document = $(document),
			$window = $(window),
			$node = self.$node,
			height = $node.outerHeight(),
			width = $node.outerWidth(),
			elementTop = 0, elementLeft = 0, elementHeight = 0, elementWidth = 0,
			eay = 0, eax = 0, ay = 0, ax = 0,
			borderTop = 0, borderBottom = 0, borderLeft = 0, borderRight = 0,
			params, rect, $element, offset, top, left, calcBorderY, calcBorderX,
			reverseTop, reverseLeft, parentOffset, rawTop, rawLeft, layerOffset;

		if (self.paramsFunction)
		{
			params = self.paramsFunction(self);
			if (params)
			{
				if (def(params.element))
					element = params.element;
				if (def(params.virtualElement))
					$.extend(virtualElement, params.virtualElement);
				if (def(params.elementAlignY))
					elementAlignY = params.elementAlignY;
				if (def(params.elementAlignX))
					elementAlignX = params.elementAlignX;
				if (def(params.alignY))
					alignY = params.alignY;
				if (def(params.alignX))
					alignX = params.alignX;
				if (def(params.offsetX))
					offsetX = params.offsetX;
				if (def(params.offsetY))
					offsetY = params.offsetY;
				if (def(params.reverseX))
					reverseX = params.reverseX;
				if (def(params.reverseY))
					reverseY = params.reverseY;
				if (def(params.reverseOffsetX))
					reverseOffsetX = params.reverseOffsetX;
				if (def(params.reverseOffsetY))
					reverseOffsetY = params.reverseOffsetY;
				if (def(params.jailTop))
					jailTop = params.jailTop;
				if (def(params.jailBottom))
					jailBottom = params.jailBottom;
				if (def(params.jailLeft))
					jailLeft = params.jailLeft;
				if (def(params.jailRight))
					jailRight = params.jailRight;
				if (def(params.borderElement))
					borderElement = params.borderElement;
				if (def(params.virtualBorderElement))
					$.extend(virtualBorderElement, params.virtualBorderElement);
			}
		}

		self.resetState();

		if (typeof element === "string")
		{
			if (element === "document")
			{
				elementHeight = $document.outerHeight();
				elementWidth = $document.outerWidth();
			}
			else if (element === "window")
			{
				elementTop = $window.scrollTop();
				elementLeft = $window.scrollLeft();
				elementHeight = $window.outerHeight();
				elementWidth = $window.outerWidth();
			}
			else if (element === "virtual")
			{
				elementTop = virtualElement.top;
				elementLeft = virtualElement.left;
				elementHeight = virtualElement.height;
				elementWidth = virtualElement.width;
			}
		}
		else if (typeof element === "function")
		{
			rect = element(self);
			elementTop = rect.top;
			elementLeft = rect.left;
			elementHeight = rect.height;
			elementWidth = rect.width;
		}
		else
		{
			$element = $(element);
			offset = $element.offset();
			elementTop = offset.top;
			elementLeft = offset.left;
			elementHeight = $element.outerHeight();
			elementWidth = $element.outerWidth();
		}

		if (elementAlignY === "top")
			eay = -1;
		else if (elementAlignY === "bottom")
			eay = 1;

		if (elementAlignX === "left")
			eax = -1;
		else if (elementAlignX === "right")
			eax = 1;

		if (alignY === "top")
			ay = -1;
		else if (alignY === "bottom")
			ay = 1;

		if (alignX === "left")
			ax = -1;
		else if (alignX === "right")
			ax = 1;

		top = elementTop+height*(ay-1)/2+offsetY*ay+elementHeight*(eay+1)/2;
		left = elementLeft+width*(ax-1)/2+offsetX*ax+elementWidth*(eax+1)/2;

		calcBorderY = (reverseY || jailTop || jailBottom);
		calcBorderX = (reverseX || jailLeft || jailRight);
		if (calcBorderY || calcBorderX)
		{
			if (typeof borderElement === "string")
			{
				if (borderElement === "document")
				{
					if (calcBorderY)
						borderBottom = borderTop+$document.height();
					if (calcBorderX)
						borderRight = borderLeft+$document.width();
				}
				else if (borderElement === "window")
				{
					if (calcBorderY)
					{
						borderTop = $window.scrollTop();
						borderBottom = borderTop+$window.height();
					}
					if (calcBorderX)
					{
						borderLeft = $window.scrollLeft();
						borderRight = borderLeft+$window.width();
					}
				}
				else if (borderElement === "virtual")
				{
					if (calcBorderY)
					{
						borderTop = virtualBorderElement.top;
						borderBottom = borderTop+virtualBorderElement.height;
					}
					if (calcBorderX)
					{
						borderLeft = virtualBorderElement.left;
						borderRight = borderLeft+virtualBorderElement.width;
					}
				}
			}
			else if (typeof borderElement === "function")
			{
				rect = borderElement(self);
				if (calcBorderY)
				{
					borderTop = rect.top;
					borderLeft = rect.left;
				}
				if (calcBorderX)
				{
					borderBottom = borderTop+rect.height;
					borderRight = borderLeft+rect.width;
				}
			}
			else
			{
				$element = $(borderElement);
				offset = $element.offset();
				if (calcBorderY)
				{
					borderTop = offset.top;
					borderBottom = borderTop+$element.outerHeight();
				}
				if (calcBorderX)
				{
					borderLeft = offset.left;
					borderRight = borderLeft+$element.outerWidth();
				}
			}
		}

		if (reverseY && (ay != 0 || eay != 0) && (top+height > borderBottom || top < borderTop))
		{
			reverseTop = elementTop-height*(ay+1)/2-reverseOffsetY*ay-elementHeight*(eay-1)/2;
			if (reverseTop+height <= borderBottom && reverseTop >= borderTop)
			{
				top = reverseTop;
				if (top < borderTop)
					self.state.reverse.top = true;
				else
					self.state.reverse.bottom = true;
			}
		}

		if (reverseX && (ax != 0 || eax != 0) && (left+width > borderRight || left < borderLeft))
		{
			reverseLeft = elementLeft-width*(ax+1)/2-reverseOffsetX*ax-elementWidth*(eax-1)/2;
			if (reverseLeft+width <= borderRight && reverseLeft >= borderLeft)
			{
				left = reverseLeft;
				if (left < borderLeft)
					self.state.reverse.left = true;
				else
					self.state.reverse.right = true;
			}
		}

		if (jailBottom && top+height > borderBottom)
		{
			top = borderBottom-height;
			self.state.jail.bottom = true;
		}

		if (jailTop && top < borderTop)
		{
			top = borderTop;
			self.state.jail.top = true;
		}

		if (jailRight && left+width > borderRight)
		{
			left = borderRight-width;
			self.state.jail.right = true;
		}

		if (jailLeft && left < borderLeft)
		{
			left = borderLeft;
			self.state.jail.left = true;
		}

		if (self.position === "fixed")
		{
			top -= $window.scrollTop();
			left -= $window.scrollLeft();
		}

		if (move)
		{
			self.node.style.top = "0px";
			self.node.style.left = "-10000px";
		}

		if (self.position === "absolute" && self.parentNode != document.body)
		{
			parentOffset = $(self.parentNode).offset();
			rawTop = top-parentOffset.top;
			rawLeft = left-parentOffset.left;
			self.node.style.top = rawTop+"px";
			self.node.style.left = rawLeft+"px";
			layerOffset = $node.offset();
			if (layerOffset.top != top)
				self.node.style.top = self.round(rawTop-(layerOffset.top-top))+"px";
			if (layerOffset.left != left)
				self.node.style.left = self.round(rawLeft-(layerOffset.left-left))+"px";
		}
		else
		{
			self.node.style.top = self.round(top)+"px";
			self.node.style.left = self.round(left)+"px";
		}

		$.extend(self.state, {
			top: top,
			left: left,
			height: height,
			width: width
		});

		self.onUpdatePosition();
	},

	onUpdatePosition: function()
	{
		this.trigger("updatePosition");
	},

	round: function(value)
	{
		return (hop.browser.isChrome() ? value : Math.round(value));
	},

	moveOnTop: function()
	{
		var self = this, maxZIndex = hop.dom.maxZIndex(self.node);
		if (maxZIndex.node != self.node)
		{
			self.node.style.zIndex = maxZIndex.zIndex+1;
			if (self.overlay)
				self.overlayNode.style.zIndex = maxZIndex.zIndex+1;
		}
		self.onMoveOnTop(maxZIndex);
	},

	onMoveOnTop: function(maxZIndex)
	{
		this.trigger("moveOnTop", {
			maxZIndex: maxZIndex
		});
	},

	resetState: function()
	{
		this.state.reverse = {
			top: false,
			bottom: false,
			left: false,
			right: false
		},
		this.state.jail = {
			top: false,
			bottom: false,
			left: false,
			right: false
		};
	},

	destroy: function()
	{
		this.finishAnimation();
		this.$node.remove();
		if (this.$overlay)
			$overlay.remove();
		this.onDestroy();
	},

	onDestroy: function()
	{
		this.trigger("destroy");
	}
});

hop.layerAnimation = function(layer, overlay, params)
{
	this.layer = layer;
	if (!params)
		params = {};
	this.params = params;
	this.overlay = !!overlay;
	this.data = {};
};

hop.layerAnimation.prototype = {
	globals: {
		duration: 200,
		easing: "swing",
		interval: $.fx.interval
	},

	start: function()
	{
	},

	finish: function()
	{
	},

	getNode: function()
	{
		return (this.overlay ? this.layer.overlayNode : this.layer.node);
	},

	get$node: function()
	{
		return (this.overlay ? this.layer.$overlay : this.layer.$node);
	},

	getParamValue: function(param)
	{
		var self = this, functionName = "getParamValue"+hop.string.upperCaseFirstChar(param);
		if (typeof self[functionName] === "function")
			return self[functionName]();

		if (def(self.params[param]))
			return self.params[param];

		if (def(self.defaults[param]))
			return self.defaults[param];

		if (def(self.globals[param]))
			return self.globals[param];
	}
};

hop.layer.showAnimations = {
	def: {
		defaults: {
			transfer: "",
			distance: 20,
			angle: 90,
			scale: 1,
			opacity: true
		},

		start: function(callback)
		{
			var self = this, params = self.params,
				node = self.getNode(), $node = self.get$node(),
				duration = self.getParamValue("duration"),
				easing = self.getParamValue("easing"),
				transfer = self.getParamValue("transfer"),
				distance = self.getParamValue("distance"),
				angle = self.getParamValue("angle"),
				scale = self.getParamValue("scale"),
				opacity = self.getParamValue("opacity"),
				interval = self.getParamValue("interval"),
				intervalOrig = $.fx.interval,
				options, properties = {}, fakeProperty = true,
				position = $node.position(), startPosition,
				element, $element, scaleY, scaleX,
				animationInfo = hop.browser.animationInfo(),
				transformProperty = animationInfo.transformProperty;
			if (transfer === "" && scale == 1 && !opacity)
				return;

			options = {
				duration: duration,
				easing: easing,
				complete: function()
				{
					if (transfer === "element" || scale != 1)
					{
						node.style[transformProperty] = "scale(1, 1)";
						node.style[transformProperty] = null;
					}
					callback();
				}
			};
			if (transfer !== "")
			{
				properties.top = position.top;
				properties.left = position.left;
				if (transfer === "border")
					startPosition = self.calcPositionBorder($node, angle);
				else if (transfer === "distance")
					startPosition = self.calcPositionDistance($node, angle, distance);
				else if (transfer === "element")
				{
					if (!def(params.element))
						throw new Error("Element is not defined");
					if (typeof params.element === "function")
						params.element = params.element(self);
					$element = $(params.element);
					if ($element.length == 0)
						throw new Error("Element is not found");
					element = $element[0];
					startPosition = self.calcPositionElement($node, $element);
				}
				else
					throw new Error("Invalid transfer");
				if (startPosition.top !== null)
				{
					node.style.top = startPosition.top+"px";
					node.style.left = startPosition.left+"px";
					fakeProperty = false;
				}
			}
			if (transfer === "element")
			{
				scaleY = $element.outerHeight()/$node.outerHeight();
				scaleX = $element.outerWidth()/$node.outerWidth();
				options.progress = function(animation, progress, remaining)
				{
					var shift = $.easing[easing](progress, duration*progress, 0, 1, duration);
					node.style[transformProperty] = "scale("+(scaleX+(1-scaleX)*shift)+", "+(scaleY+(1-scaleY)*shift)+")";
				};
			}
			else if (scale != 1)
			{
				options.progress = function(animation, progress, remaining)
				{
					var shift = $.easing[easing](progress, duration*progress, 0, 1, duration);
					node.style[transformProperty] = "scale("+(scale+(1-scale)*shift)+", "+(scale+(1-scale)*shift)+")";
				};
			}
			if (opacity)
			{
				properties.opacity = $node.css("opacity");
				$node.css("opacity", 0);
				fakeProperty = false;
			}
			if (fakeProperty)
				properties.fakeProperty = 0;
			$.fx.interval = interval;
			$node.animate(properties, options);
			$.fx.interval = intervalOrig;
		},

		finish: function()
		{
			this.get$node().stop(true, true);
		},

		calcPositionBorder: function($node, angle)
		{
			var nodePosition = $node.position(),
				nodeOffset = $node.offset(),
				nodeHeight = $node.outerHeight(),
				nodeWidth = $node.outerWidth(),
				windowHeight = $(window).height(),
				windowWidth = $(window).width(),
				scrollTop = $(document).scrollTop(),
				scrollLeft = $(document).scrollLeft(),
				y = x = null, yw, xw, y1, x1, y2, x2,
				result = {
					top: null,
					left: null
				};
			angle = angle%360;
			if (angle == 0)
			{
				result.top = nodePosition.top;
				result.left = scrollLeft+windowWidth;
			}
			else if (angle == 90)
			{
				result.top = scrollTop-nodeHeight;
				result.left = nodePosition.left;
			}
			else if (angle == 180)
			{
				result.top = nodePosition.top;
				result.left = scrollLeft-nodeWidth;
			}
			else if (angle == 270)
			{
				result.top = scrollTop+windowHeight;
				result.left = nodePosition.left;
			}
			else
			{
				yw = nodeOffset.top+nodeHeight/2-scrollTop;
				xw = scrollLeft-nodeOffset.left-nodeWidth/2;
				if (angle < 90)
				{
					y1 = yw+nodeHeight/2;
					x2 = xw+windowWidth+nodeWidth/2;
				}
				else if (angle < 180)
				{
					y1 = yw+nodeHeight/2;
					x2 = xw-nodeWidth/2;
				}
				else if (angle < 270)
				{
					y1 = yw-windowHeight-nodeHeight/2;
					x2 = xw-nodeWidth/2;
				}
				else
				{
					y1 = yw-windowHeight-nodeHeight/2;
					x2 = xw+windowWidth+nodeWidth/2;
				}
				a = angle*Math.PI/180;
				y2 = x2*Math.tan(a);
				x1 = y1/Math.tan(a);
				if (y2 > yw-windowHeight-nodeHeight/2 && y2 < yw+nodeHeight/2)
				{
					x = x2;
					y = y2;
				}
				else if (x1 > xw-nodeWidth/2 && x1 < xw+windowWidth+nodeWidth/2)
				{
					x = x1;
					y = y1;
				}
				if (x !== null)
				{
					result.top = nodeOffset.top-y;
					result.left = nodeOffset.left+x;
				}
			}
			return result;
		},

		calcPositionDistance: function($node, angle, distance)
		{
			var position = $node.position();
			return {
				top: position.top-(distance*Math.sin(angle*Math.PI/180)),
				left: position.left+(distance*Math.cos(angle*Math.PI/180))
			};
		},

		calcPositionElement: function($node, $element)
		{
			var position = $node.position(),
				offset = $node.offset(),
				offsetElement = $element.offset(),
				height = $node.outerHeight(),
				width = $node.outerWidth(),
				elementHeight = $element.outerHeight(),
				elementWidth = $element.outerWidth();
			return {
				top: position.top-offset.top+offsetElement.top+(elementHeight-height)/2,
				left: position.left-offset.left+offsetElement.left+(elementWidth-width)/2
			};
		}
	}
};

hop.layer.hideAnimations = {
	def: {
		defaults: {
			transfer: "",
			distance: 20,
			angle: 90,
			scale: 1,
			opacity: true
		},

		start: function(callback)
		{
			var self = this, params = self.params,
				node = self.getNode(), $node = self.get$node(),
				duration = self.getParamValue("duration"),
				easing = self.getParamValue("easing"),
				transfer = self.getParamValue("transfer"),
				distance = self.getParamValue("distance"),
				angle = self.getParamValue("angle"),
				scale = self.getParamValue("scale"),
				opacity = self.getParamValue("opacity"),
				interval = self.getParamValue("interval"),
				intervalOrig = $.fx.interval,
				opacityOrig = $node.css("opacity"),
				options, properties = {}, fakeProperty = true,
				position, finishPosition, element, $element, scaleY, scaleX,
				animationInfo = hop.browser.animationInfo(),
				transformProperty = animationInfo.transformProperty;
			if (transfer === "" && scale == 1 && !opacity)
				return;

			self.get$node().show();
			position = $node.position();
			options = {
				duration: duration,
				easing: easing,
				complete: function()
				{
					if (transfer === "element" || scale != 1)
					{
						node.style[transformProperty] = "scale(1, 1)";
						node.style[transformProperty] = null;
					}
					$node.css({
						top: position.top,
						left: position.left,
						opacity: opacityOrig,
						display: "none"
					});
					callback();
				}
			};
			if (transfer !== "")
			{
				if (transfer === "border")
					finishPosition = hop.layer.showAnimations.def.calcPositionBorder($node, angle);
				else if (transfer === "distance")
					finishPosition = hop.layer.showAnimations.def.calcPositionDistance($node, angle, distance);
				else if (transfer === "element")
				{
					if (!def(params.element))
						throw new Error("Element is not defined");
					if (typeof params.element === "function")
						params.element = params.element(self);
					$element = $(params.element);
					if ($element.length == 0)
						throw new Error("Element is not found");
					element = $element[0];
					finishPosition = hop.layer.showAnimations.def.calcPositionElement($node, $element);
				}
				else
					throw new Error("Invalid transfer");
				if (finishPosition.top !== null)
				{
					properties.top = finishPosition.top;
					properties.left = finishPosition.left;
					fakeProperty = false;
				}
			}
			if (transfer === "element")
			{
				scaleY = $element.outerHeight()/$node.outerHeight();
				scaleX = $element.outerWidth()/$node.outerWidth();
				options.progress = function(animation, progress, remaining)
				{
					var shift = $.easing[easing](progress, duration*progress, 0, 1, duration);
					node.style[transformProperty] = "scale("+(1-(1-scaleX)*shift)+", "+(1-(1-scaleY)*shift)+")";
				};
			}
			else if (scale != 1)
			{
				options.progress = function(animation, progress, remaining)
				{
					var shift = $.easing[easing](progress, duration*progress, 0, 1, duration);
					node.style[transformProperty] = "scale("+(1-(1-scale)*shift)+", "+(1-(1-scale)*shift)+")";
				};
			}
			if (opacity)
			{
				properties.opacity = 0;
				fakeProperty = false;
			}
			if (fakeProperty)
				properties.fakeProperty = 0;
			$.fx.interval = interval;
			$node.animate(properties, options);
			$.fx.interval = intervalOrig;
		},

		finish: function()
		{
			this.get$node().stop(true, true);
		}
	}
};

})(window, jQuery, hopjs);