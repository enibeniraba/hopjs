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
			elementAlignY: 0,
			elementAlignX: 0,
			alignY: 0,
			alignX: 0,
			offsetTop: 0,
			offsetBottom: 0,
			offsetLeft: 0,
			offsetRight: 0,
			reverseTop: false,
			reverseBottom: false,
			reverseLeft: false,
			reverseRight: false,
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
			parentNode: null,
			altUpdatePosition: null
		};
	},

	getVirtualParams: function()
	{
		return [
			"reverse",
			"reverseY",
			"reverseX",
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
			"parentNode",
			"altUpdatePosition"
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
			"updatePositionBefore",
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
		if (node.parentNode !== self.parentNode)
			self.parentNode.appendChild(node);
		if (def(params.content))
			node.innerHTML = params.content;
		self.node = node;
		self.$node = $(node);
		self.node.hopLayer = self;
		self.setOverlay(self.overlay);
	},

	afterCreate: function(params)
	{
		hop.widget.prototype.afterCreate.apply(this, arguments);
		if (params.show)
			this.show();
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

	setElementAlignY: function(align)
	{
		if (align === "top")
			align = -0.5;
		else if (align === "center")
			align = 0;
		else if (align === "bottom")
			align = 0.5;
		this.elementAlignY = align;
	},

	setElementAlignX: function(align)
	{
		if (align === "left")
			align = -0.5;
		else if (align === "center")
			align = 0;
		else if (align === "right")
			align = 0.5;
		this.elementAlignX = align;
	},

	setAlignY: function(align)
	{
		if (align === "top")
			align = 0.5;
		else if (align === "center")
			align = 0;
		else if (align === "bottom")
			align = -0.5;
		this.alignY = align;
	},

	setAlignX: function(align)
	{
		if (align === "left")
			align = 0.5;
		else if (align === "center")
			align = 0;
		else if (align === "right")
			align = -0.5;
		this.alignX = align;
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
		this.reverseTop = this.reverseBottom = this.reverseLeft = this.reverseRight = value;
	},

	setReverseY: function(value)
	{
		this.reverseTop = this.reverseBottom = value;
	},

	setReverseX: function(value)
	{
		this.reverseLeft = this.reverseRight = value;
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

	setOverlayTransparent: function(transparent)
	{
		var self = this;
		self.transparent = !!transparent;
		if (self.$overlay)
			self.$overlay.toggleClass(self.overlayTransparentClass, transparent);
	},

	setParentNode: function(node)
	{
		if (this.parentNode !== node)
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
			if (!self.isAnimation())
				return;

			if (params.force)
				self.finishAnimation(true);
			else
			{
				self.queue = true;
				self.queueParams = params;
				return;
			}
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
		this.trigger("showBefore", params);
	},

	isAnimation: function()
	{
		return (this.animation !== null || this.overlayAnimation !== null);
	},

	animateShowing: function()
	{
		var self = this, params, animationClass = null, overlayAnimationClass = null;
		if (self.animationShow !== null && hop.layerShowAnimations[self.animationShow])
			animationClass = hop.layerShowAnimations[self.animationShow];
		if (self.overlay && self.overlayAnimationShow !== null && hop.layerShowAnimations[self.overlayAnimationShow])
			overlayAnimationClass = hop.layerShowAnimations[self.overlayAnimationShow];
		if (!animationClass && !overlayAnimationClass)
			return false;

		self.onShowAnimationBefore();
		if (animationClass)
		{
			params = $.extend(true, {}, self.animationShowParams, {
				layer: self
			});
			self.animation = new animationClass(params);
			self.animation.start();
		}
		if (overlayAnimationClass && (!self.animation || !self.animation.overlayAnimation))
		{
			params = $.extend(true, {}, self.overlayAnimationShowParams, {
				layer: self,
				overlay: true
			});
			self.overlayAnimation = new overlayAnimationClass(params);
			self.overlayAnimation.start();
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
		var self = this, animate;
		if (!params)
			params = {};
		if (!def(params.animate))
			params.animate = null;
		self.onHideCall(params);
		if (!self.visible)
		{
			if (!self.isAnimation())
				return;

			if (params.force)
				self.finishAnimation(true);
			else
			{
				self.queue = true;
				self.queueParams = params;
				return;
			}
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
		var self = this, params, animationClass = null, overlayAnimationClass = null;
		if (self.animationHide !== null && hop.layerHideAnimations[self.animationHide])
			animationClass = hop.layerHideAnimations[self.animationHide];
		if (self.overlay && self.overlayAnimationHide !== null && hop.layerHideAnimations[self.overlayAnimationHide])
			overlayAnimationClass = hop.layerHideAnimations[self.overlayAnimationHide];
		if (!animationClass && !overlayAnimationClass)
			return false;

		self.onHideAnimationBefore();
		if (animationClass)
		{
			params = $.extend(true, {}, self.animationHideParams, {
				layer: self
			});
			self.animation = new animationClass(params);
			self.animation.start();
		}
		if (overlayAnimationClass && (!self.animation || !self.animation.overlayAnimation))
		{
			params = $.extend(true, {}, self.overlayAnimationHideParams, {
				layer: self,
				overlay: true
			});
			self.overlayAnimation = new overlayAnimationClass(params);
			self.overlayAnimation.start();
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
		if (!this.overlayAnimation)
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
		var self = this;
		if (self.node.style.display === "none")
			return;

		self.finishAnimation(true);
		self.onUpdatePositionBefore();
		self.resetState();
		if (typeof self.altUpdatePosition === "function")
			self.altUpdatePosition(self, move);
		else
			self.updatePositionDefault(move);
		self.onUpdatePosition();
	},

	resetState: function()
	{
		this.state = {
			top: null,
			left: null,
			height: null,
			width: null,
			reverseTop: false,
			reverseBottom: false,
			reverseLeft: false,
			reverseRight: false,
			jailTop: false,
			jailBottom: false,
			jailLeft: false,
			jailRight: false
		};
	},

	updatePositionDefault: function(move)
	{
		var self = this, $window = $(window),
			height = self.$node.outerHeight(),
			width = self.$node.outerWidth(),
			elementRect, borderRect, top, left, reverse,
			parentOffset, rawTop, rawLeft, layerOffset;

		elementRect = self.calcRect(self.element, self.virtualElement);
		borderRect = self.calcRect(self.borderElement, self.virtualBorderElement);

		top = elementRect.top+elementRect.height*(self.elementAlignY+0.5)+height*(self.alignY-0.5);
		if (self.elementAlignY < 0)
			top += self.offsetTop;
		else if (self.elementAlignY > 0)
			top += self.offsetBottom;
		if (self.reverseTop && top < borderRect.top || self.reverseBottom && top+height > borderRect.bottom)
		{
			reverse = elementRect.top+elementRect.height*(-self.elementAlignY+0.5)+height*(-self.alignY-0.5);
			if (self.elementAlignY < 0)
				reverse += self.offsetBottom;
			else if (self.elementAlignY > 0)
				reverse += self.offsetTop;
			if (reverse >= borderRect.top && reverse+height <= borderRect.bottom)
			{
				if (top < borderRect.top)
					self.state.reverseTop = true;
				else
					self.state.reverseBottom = true;
				top = reverse;
			}
		}
		if (self.jailBottom && top+height > borderRect.bottom)
		{
			top = borderRect.bottom-height;
			self.state.jailBottom = true;
		}
		if (self.jailTop && top < borderRect.top)
		{
			top = borderRect.top;
			self.state.jailTop = true;
		}

		left = elementRect.left+elementRect.width*(self.elementAlignX+0.5)+width*(self.alignX-0.5);
		if (self.elementAlignX < 0)
			left += self.offsetLeft;
		else if (self.elementAlignX > 0)
			left += self.offsetRight;
		if (self.reverseLeft && left < borderRect.left || self.reverseRight && left+width > borderRect.right)
		{
			reverse = elementRect.left+elementRect.width*(-self.elementAlignX+0.5)+width*(-self.alignX-0.5);
			if (self.elementAlignX < 0)
				reverse += self.offsetRight;
			else if (self.elementAlignX > 0)
				reverse += self.offsetLeft;
			if (reverse >= borderRect.left && reverse+width <= borderRect.right)
			{
				if (left < borderRect.left)
					self.state.reverseLeft = true;
				else
					self.state.reverseRight = true;
				left = reverse;
			}
		}
		if (self.jailRight && left+width > borderRect.right)
		{
			left = borderRect.right-width;
			self.state.jailRight = true;
		}
		if (self.jailLeft && left < borderRect.left)
		{
			left = borderRect.left;
			self.state.jailLeft = true;
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

		if (self.position === "absolute" && self.parentNode !== document.body)
		{
			parentOffset = $(self.parentNode).offset();
			rawTop = top-parentOffset.top;
			rawLeft = left-parentOffset.left;
			self.node.style.top = rawTop+"px";
			self.node.style.left = rawLeft+"px";
			layerOffset = self.$node.offset();
			if (layerOffset.top !== top)
				self.node.style.top = Math.round(rawTop-(layerOffset.top-top))+"px";
			if (layerOffset.left !== left)
				self.node.style.left = Math.round(rawLeft-(layerOffset.left-left))+"px";
		}
		else
		{
			self.node.style.top = Math.round(top)+"px";
			self.node.style.left = Math.round(left)+"px";
		}

		self.state.top = top;
		self.state.left = left;
		self.state.height = height;
		self.state.width = width;
	},

	calcRect: function(element, virtualElement)
	{
		var $document = $(document),
			$window = $(window),
			top = 0, left = 0, height = 0, width = 0,
			$element, rect, offset;
		if (typeof element === "string")
		{
			if (element === "document")
			{
				height = $document.outerHeight();
				width = $document.outerWidth();
			}
			else if (element === "window")
			{
				top = $window.scrollTop();
				left = $window.scrollLeft();
				height = $window.outerHeight();
				width = $window.outerWidth();
			}
			else if (element === "virtual")
			{
				top = virtualElement.top;
				left = virtualElement.left;
				height = virtualElement.height;
				width = virtualElement.width;
			}
		}
		else if (typeof element === "function")
		{
			rect = element(this);
			top = rect.top;
			left = rect.left;
			height = rect.height;
			width = rect.width;
		}
		else
		{
			$element = $(element);
			offset = $element.offset();
			top = offset.top;
			left = offset.left;
			height = $element.outerHeight();
			width = $element.outerWidth();
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

	onUpdatePositionBefore: function()
	{
		this.trigger("updatePositionBefore");
	},

	onUpdatePosition: function()
	{
		this.trigger("updatePosition");
	},

	moveOnTop: function()
	{
		var self = this, maxZIndex = hop.dom.maxZIndex(self.node);
		if (maxZIndex.node !== self.node)
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

	destroy: function()
	{
		this.finishAnimation();
		this.$node.remove();
		if (this.$overlay)
			this.$overlay.remove();
		this.onDestroy();
	},

	onDestroy: function()
	{
		this.trigger("destroy");
	}
});

hop.layerAnimation = function(params)
{
	hop.configurable.apply(this, arguments);
};

hop.inherit(hop.layerAnimation, hop.configurable, {
	getDefaults: function()
	{
		return {
			layer: null,
			overlay: false,
			overlayAnimation: false,
			duration: 200,
			easing: "swing",
			interval: $.fx.interval
		};
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
	}
});

if (!def(hop.layerShowAnimations))
	hop.layerShowAnimations = {};

hop.layerShowAnimations.def = function(params)
{
	hop.layerAnimation.apply(this, arguments);
};

hop.inherit(hop.layerShowAnimations.def, hop.layerAnimation, {
	getDefaults: function()
	{
		return $.extend(hop.layerAnimation.prototype.getDefaults.apply(this), {
			transfer: "",
			distance: 20,
			angle: 90,
			scale: 1,
			element: null,
			opacity: true
		});
	},

	start: function()
	{
		var self = this, node = self.getNode(), $node = self.get$node(),
			intervalOrig = $.fx.interval,
			options, properties = {}, fakeProperty = true,
			position = $node.position(), startPosition,
			element, $element, scaleY, scaleX,
			animationInfo = hop.browser.animationInfo(),
			transformProperty = animationInfo.transformProperty;
		if (self.transfer === "" && self.scale === 1 && !self.opacity)
			return;

		options = {
			duration: self.duration,
			easing: self.easing,
			complete: function()
			{
				if (self.transfer === "element" || self.scale !== 1)
				{
					node.style[transformProperty] = "scale(1, 1)";
					node.style[transformProperty] = null;
				}
				if (self.overlay)
					self.layer.overlayAnimationShowComplete();
				else
					self.layer.animationShowComplete();
			}
		};
		if (self.transfer !== "")
		{
			properties.top = position.top;
			properties.left = position.left;
			if (self.transfer === "border")
				startPosition = self.calcPositionBorder($node, self.angle);
			else if (self.transfer === "distance")
				startPosition = self.calcPositionDistance($node, self.angle, self.distance);
			else if (self.transfer === "element")
			{
				if (!self.element)
					throw new Error("Element is not defined");
				
				element = self.element;
				if (typeof self.element === "function")
					element = self.element(self);
				$element = $(element);
				if ($element.length === 0)
					throw new Error("Element is not found");
				
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
		if (self.transfer === "element")
		{
			scaleY = $element.outerHeight()/$node.outerHeight();
			scaleX = $element.outerWidth()/$node.outerWidth();
			options.progress = function(animation, progress, remaining)
			{
				var shift = $.easing[self.easing](progress, self.duration*progress, 0, 1, self.duration);
				node.style[transformProperty] = "scale("+(scaleX+(1-scaleX)*shift)+", "+(scaleY+(1-scaleY)*shift)+")";
			};
		}
		else if (self.scale !== 1)
		{
			options.progress = function(animation, progress, remaining)
			{
				var shift = $.easing[self.easing](progress, self.duration*progress, 0, 1, self.duration);
				node.style[transformProperty] = "scale("+(self.scale+(1-self.scale)*shift)+", "+(self.scale+(1-self.scale)*shift)+")";
			};
		}
		if (self.opacity)
		{
			properties.opacity = $node.css("opacity");
			$node.css("opacity", 0);
			fakeProperty = false;
		}
		if (fakeProperty)
			properties.fakeProperty = 0;
		$.fx.interval = self.interval;
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
			y = null, x = null, yw, xw, y1, x1, y2, x2, a,
			result = {
				top: null,
				left: null
			};
		angle = angle%360;
		if (angle === 0)
		{
			result.top = nodePosition.top;
			result.left = scrollLeft+windowWidth;
		}
		else if (angle === 90)
		{
			result.top = scrollTop-nodeHeight;
			result.left = nodePosition.left;
		}
		else if (angle === 180)
		{
			result.top = nodePosition.top;
			result.left = scrollLeft-nodeWidth;
		}
		else if (angle === 270)
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
});

if (!def(hop.layerHideAnimations))
	hop.layerHideAnimations = {};

hop.layerHideAnimations.def = function(params)
{
	hop.layerShowAnimations.def.apply(this, arguments);
};

hop.inherit(hop.layerHideAnimations.def, hop.layerShowAnimations.def, {
	start: function()
	{
		var self = this, node = self.getNode(), $node = self.get$node(),
			intervalOrig = $.fx.interval,
			opacityOrig = $node.css("opacity"),
			options, properties = {}, fakeProperty = true,
			position, finishPosition, element, $element, scaleY, scaleX,
			animationInfo = hop.browser.animationInfo(),
			transformProperty = animationInfo.transformProperty;
		if (self.transfer === "" && self.scale === 1 && !self.opacity)
			return;

		self.get$node().show();
		position = $node.position();
		options = {
			duration: self.duration,
			easing: self.easing,
			complete: function()
			{
				if (self.transfer === "element" || self.scale !== 1)
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
				if (self.overlay)
					self.layer.overlayAnimationHideComplete();
				else
					self.layer.animationHideComplete();
			}
		};
		if (self.transfer !== "")
		{
			if (self.transfer === "border")
				finishPosition = self.calcPositionBorder($node, self.angle);
			else if (self.transfer === "distance")
				finishPosition = self.calcPositionDistance($node, self.angle, self.distance);
			else if (self.transfer === "element")
			{
				if (!self.element)
					throw new Error("Element is not defined");
				
				element = self.element;
				if (typeof self.element === "function")
					element = self.element(self);
				$element = $(element);
				if ($element.length === 0)
					throw new Error("Element is not found");
				
				finishPosition = self.calcPositionElement($node, $element);
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
		if (self.transfer === "element")
		{
			scaleY = $element.outerHeight()/$node.outerHeight();
			scaleX = $element.outerWidth()/$node.outerWidth();
			options.progress = function(animation, progress, remaining)
			{
				var shift = $.easing[self.easing](progress, self.duration*progress, 0, 1, self.duration);
				node.style[transformProperty] = "scale("+(1-(1-scaleX)*shift)+", "+(1-(1-scaleY)*shift)+")";
			};
		}
		else if (self.scale !== 1)
		{
			options.progress = function(animation, progress, remaining)
			{
				var shift = $.easing[self.easing](progress, self.duration*progress, 0, 1, self.duration);
				node.style[transformProperty] = "scale("+(1-(1-self.scale)*shift)+", "+(1-(1-self.scale)*shift)+")";
			};
		}
		if (self.opacity)
		{
			properties.opacity = 0;
			fakeProperty = false;
		}
		if (fakeProperty)
			properties.fakeProperty = 0;
		$.fx.interval = self.interval;
		$node.animate(properties, options);
		$.fx.interval = intervalOrig;
	},

	finish: function()
	{
		this.get$node().stop(true, true);
	}
});

})(window, jQuery, hopjs);