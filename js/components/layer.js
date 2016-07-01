/*!
 * hopjs.layer
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

var def = hopjs.def;

hopjs.types["layer"] = "hopjs.layer";

hopjs.layer = function(params)
{
	hopjs.component.apply(this, arguments);
};

hopjs.layer.current = function(node)
{
	while (node)
	{
		if (node.hopLayer)
			return node.hopLayer;

		node = node.parentNode;
	}
};

hopjs.layer.hide = function(node)
{
	var layer = hopjs.layer.current(node);
	if (layer)
		layer.hide();
};

hopjs.inherit(hopjs.layer, hopjs.component, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			position: "absolute",
			element: "document",
			elementBox: "border",
			elementRegion: {
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
			collisionTop: "none",
			collisionBottom: "none",
			collisionLeft: "none",
			collisionRight: "none",
			collisionElement: "document",
			collisionElementBox: "border",
			collisionRegion: {
				top: 0,
				left: 0,
				height: 0,
				width: 0
			},
			overlay: false,
			overlayClass: null,
			overlayTransparent: true,
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
			"collision",
			"collisionY",
			"collisionX"
		];
	},

	getUpdatePositionParams: function()
	{
		return [
			"element",
			"elementBox",
			"elementRegion",
			"elementAlignY",
			"elementAlignX",
			"alignY",
			"alignX",
			"offsetTop",
			"offsetBottom",
			"offsetLeft",
			"offsetRight",
			"collisionTop",
			"collisionBottom",
			"collisionLeft",
			"collisionRight",
			"collisionElement",
			"collisionElementBox",
			"collisionRegion",
			"collision",
			"collisionX",
			"collisionY",
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
		hopjs.component.prototype.create.apply(self, arguments);
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
		hopjs.component.prototype.afterCreate.apply(this, arguments);
		if (params.show)
			this.show();
	},

	configure: function(params)
	{
		if (!params)
			return;

		var self = this, key;
		hopjs.component.prototype.configure.apply(self, arguments);
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

	setElementRegion: function(value)
	{
		$.extend(this.elementRegion, value);
	},

	setCollisionRegion: function(value)
	{
		$.extend(this.collisionRegion, value);
	},

	setCollision: function(value)
	{
		this.collisionTop = this.collisionBottom = this.collisionLeft = this.collisionRight = value;
	},

	setCollisionY: function(value)
	{
		this.collisionTop = this.collisionBottom = value;
	},

	setCollisionX: function(value)
	{
		this.collisionLeft = this.collisionRight = value;
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
				node.className = "hopjs-layer-overlay";
				self.overlayNode = self.parentNode.insertBefore(node, self.node);
				self.$overlay = $(self.overlayNode);
				self.setOverlayTransparent(self.overlayTransparent);
			}
			self.setOverlayParams();
			if (self.visible && !self.isAnimation())
				self.overlayNode.style.display = "block";
			self.overlayNode.style.zIndex = self.node.style.zIndex;
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
			self.$overlay.toggleClass("hopjs-layer-overlay-transparent", transparent);
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
		if (self.animationShow !== null && hopjs.layerShowAnimations[self.animationShow])
			animationClass = hopjs.layerShowAnimations[self.animationShow];
		if (self.overlay && self.overlayAnimationShow !== null && hopjs.layerShowAnimations[self.overlayAnimationShow])
			overlayAnimationClass = hopjs.layerShowAnimations[self.overlayAnimationShow];
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
		if (self.animationHide !== null && hopjs.layerHideAnimations[self.animationHide])
			animationClass = hopjs.layerHideAnimations[self.animationHide];
		if (self.overlay && self.overlayAnimationHide !== null && hopjs.layerHideAnimations[self.overlayAnimationHide])
			overlayAnimationClass = hopjs.layerHideAnimations[self.overlayAnimationHide];
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
			collisionTop: "none",
			collisionBottom: "none",
			collisionLeft: "none",
			collisionRight: "none"
		};
	},

	updatePositionDefault: function(move)
	{
		var self = this, $window = $(window),
			height = self.$node.outerHeight(),
			width = self.$node.outerWidth(),
			elementRegion, collisionRegion, top, left, value,
			parentOffset, rawTop, rawLeft, layerOffset;

		elementRegion = self.calcRegion(self.element, self.elementBox, self.elementRegion);
		collisionRegion = self.calcRegion(self.collisionElement, self.collisionElementBox, self.collisionRegion);

		top = elementRegion.top+elementRegion.height*(self.elementAlignY+0.5)+height*(self.alignY-0.5);
		if (self.elementAlignY < 0)
			top += self.offsetTop;
		else if (self.elementAlignY > 0)
			top += self.offsetBottom;
		if ((self.collisionTop === "flip" || self.collisionTop === "flipfit") && top < collisionRegion.top
			|| (self.collisionBottom === "flip" || self.collisionBottom === "flipfit") && top+height > collisionRegion.bottom)
		{
			value = elementRegion.top+elementRegion.height*(-self.elementAlignY+0.5)+height*(-self.alignY-0.5);
			if (self.elementAlignY < 0)
				value += self.offsetBottom;
			else if (self.elementAlignY > 0)
				value += self.offsetTop;
			if (value >= collisionRegion.top && value+height <= collisionRegion.bottom)
			{
				if (top < collisionRegion.top)
					self.state.collisionTop = "flip";
				else
					self.state.collisionBottom = "flip";
				top = value;
			}
		}
		if ((self.collisionBottom === "fit" || self.collisionBottom === "flipfit") && top+height > collisionRegion.bottom)
		{
			top = collisionRegion.bottom-height;
			self.state.collisionBottom = (self.state.collisionBottom === "flip" ? "flipfit" : "fit");
		}
		if ((self.collisionTop === "fit" || self.collisionTop === "flipfit") && top < collisionRegion.top)
		{
			top = collisionRegion.top;
			self.state.collisionTop = (self.state.collisionTop === "flip" ? "flipfit" : "fit");
		}

		left = elementRegion.left+elementRegion.width*(self.elementAlignX+0.5)+width*(self.alignX-0.5);
		if (self.elementAlignX < 0)
			left += self.offsetLeft;
		else if (self.elementAlignX > 0)
			left += self.offsetRight;
		if ((self.collisionLeft === "flip" || self.collisionLeft === "flipfit") && left < collisionRegion.left
			|| (self.collisionRight === "flip" || self.collisionRight === "flipfit") && left+width > collisionRegion.right)
		{
			value = elementRegion.left+elementRegion.width*(-self.elementAlignX+0.5)+width*(-self.alignX-0.5);
			if (self.elementAlignX < 0)
				value += self.offsetRight;
			else if (self.elementAlignX > 0)
				value += self.offsetLeft;
			if (value >= collisionRegion.left && value+width <= collisionRegion.right)
			{
				if (left < collisionRegion.left)
					self.state.collisionLeft = "flip";
				else
					self.state.collisionRight = "flip";
				left = value;
			}
		}
		if ((self.collisionRight === "fit" || self.collisionRight === "flipfit") && left+width > collisionRegion.right)
		{
			left = collisionRegion.right-width;
			self.state.collisionRight = (self.state.collisionRight === "flip" ? "flipfit" : "fit");
		}
		if ((self.collisionLeft === "fit" || self.collisionLeft === "flipfit") && left < collisionRegion.left)
		{
			left = collisionRegion.left;
			self.state.collisionLeft = (self.state.collisionLeft === "flip" ? "flipfit" : "fit");
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
				self.node.style.top = rawTop-(layerOffset.top-top)+"px";
			if (layerOffset.left !== left)
				self.node.style.left = rawLeft-(layerOffset.left-left)+"px";
		}
		else
		{
			self.node.style.top = top+"px";
			self.node.style.left = left+"px";
		}

		self.state.top = top;
		self.state.left = left;
		self.state.height = height;
		self.state.width = width;
	},

	calcRegion: function(element, box, region)
	{
		var $document = $(document),
			$window = $(window),
			top = 0, left = 0, height = 0, width = 0,
			region, $element, offset,
			borderTop, borderBottom, borderLeft, borderRight,
			paddingTop, paddingBottom, paddingLeft, paddingRight;
		if (typeof element === "string")
		{
			if (element === "document")
			{
				height = $document.height();
				width = $document.width();
			}
			else if (element === "window")
			{
				top = $window.scrollTop();
				left = $window.scrollLeft();
				height = $window.height();
				width = $window.width();
			}
			else if (element === "region")
			{
				if (region !== null)
				{
					top = region.top;
					left = region.left;
					height = region.height;
					width = region.width;
				}
			}
			else
			{
				console.log("hopjs.layer: Invalid element ("+element+").");
				return;
			}
		}
		else if (typeof element === "function")
		{
			region = element(this);
			if (region !== null)
			{
				top = region.top;
				left = region.left;
				height = region.height;
				width = region.width;
			}
		}
		else
		{
			$element = $(element);
			if ($element.length !== 1)
			{
				console.log("hopjs.layer: Element not found.");
				console.log(element);
				return;
			}
			offset = $element.offset();
			top = offset.top;;
			left = offset.left;
			height = $element.outerHeight();
			width = $element.outerWidth();
			if (box === "padding" || box === "content")
			{
				borderTop = parseFloat($element.css("border-top-width")) || 0;
				borderBottom = parseFloat($element.css("border-bottom-width")) || 0;
				borderLeft = parseFloat($element.css("border-left-width")) || 0;
				borderRight = parseFloat($element.css("border-right-width")) || 0;
				top += borderTop;
				left += borderLeft;
				height -= borderTop+borderBottom;
				width -= borderLeft+borderRight;
				if (box === "content")
				{
					paddingTop = parseFloat($element.css("padding-top")) || 0;
					paddingBottom = parseFloat($element.css("padding-bottom")) || 0;
					paddingLeft = parseFloat($element.css("padding-left")) || 0;
					paddingRight = parseFloat($element.css("padding-right")) || 0;
					top += paddingTop;
					left += paddingLeft;
					height -= paddingTop+paddingBottom;
					width -= paddingLeft+paddingRight;
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
		var self = this, maxZIndex = hopjs.dom.maxZIndex(self.node);
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

hopjs.layerAnimation = function(params)
{
	hopjs.configurable.apply(this, arguments);
};

hopjs.inherit(hopjs.layerAnimation, hopjs.configurable, {
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

if (!def(hopjs.layerShowAnimations))
	hopjs.layerShowAnimations = {};

hopjs.layerShowAnimations.def = function(params)
{
	hopjs.layerAnimation.apply(this, arguments);
};

hopjs.inherit(hopjs.layerShowAnimations.def, hopjs.layerAnimation, {
	getDefaults: function()
	{
		return $.extend(hopjs.layerAnimation.prototype.getDefaults.apply(this), {
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
			animationInfo = hopjs.browser.animationInfo(),
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

if (!def(hopjs.layerHideAnimations))
	hopjs.layerHideAnimations = {};

hopjs.layerHideAnimations.def = function(params)
{
	hopjs.layerShowAnimations.def.apply(this, arguments);
};

hopjs.inherit(hopjs.layerHideAnimations.def, hopjs.layerShowAnimations.def, {
	start: function()
	{
		var self = this, node = self.getNode(), $node = self.get$node(),
			intervalOrig = $.fx.interval,
			opacityOrig = $node.css("opacity"),
			options, properties = {}, fakeProperty = true,
			position, finishPosition, element, $element, scaleY, scaleX,
			animationInfo = hopjs.browser.animationInfo(),
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

})(window, document, jQuery, hopjs);