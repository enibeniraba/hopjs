/*!
 * hopjs.window
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

var def = hopjs.def,
	cp = "hopjs-window-",
	_cp = "."+cp;

hopjs.types["window"] = "hopjs.window";

hopjs.window = function(params)
{
	hopjs.component.apply(this, arguments);
};

hopjs.window.i18n = {};

hopjs.window.current = function(node)
{
	while (node)
	{
		if (node.hopLayer && node.hopLayer.hopWindow)
			return node.hopLayer.hopWindow;
		node = node.parentNode;
	}
};

hopjs.window.hide = function(node)
{
	var window = hopjs.window.current(node);
	if (window)
		window.hide();
};

hopjs.inherit(hopjs.window, hopjs.component, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			locale: "",
			extraClass: "",
			title: "",
			icon: null,
			content: "",
			wrapTitle: false,
			hideButton: true,
			fullScreenButton: false,
			fullScreenOnHeadDblclick: false,
			fullScreen: false,
			height: 480,
			width: 640,
			maxHeight: null,
			maxWidth: null,
			minHeight: 100,
			minWidth: 100,
			showTop: false,
			showBottom: false,
			showLeft: false,
			showRight: false,
			showInnerTop: false,
			showInnerBottom: false,
			modal: false,
			updatePositionOnShow: true,
			updatePositionOnResize: false,
			updatePositionOnWindowResize: true,
			hideOnDocumentMousedown: false,
			layerParams: null,
			animationShow: null,
			animationShowParams: null,
			animationHide: null,
			animationHideParams: null,
			fsAnimationShow: null,
			fsAnimationShowParams: null,
			fsAnimationHide: null,
			fsAnimationHideParams: null,
			draggable: false,
			draggableParams: null,
			resizable: false,
			resizableParams: null
		};
	},

	getDefaultLayerParams: function()
	{
		return {
			position: "absolute",
			element: "window",
			elementAlignY: "center",
			elementAlignX: "center",
			alignY: "center",
			alignX: "center",
			collision: "fit",
			collisionElement: "window"
		};
	},

	getDefaultDraggableParams: function()
	{
		return {
			limiter: "window"
		};
	},

	getDefaultResizableParams: function()
	{
		return {
			limiter: "window"
		};
	},

	getDefaultI18n: function()
	{
		return {
			fullScreen: "Full screen",
			restore: "Restore",
			hide: "Close"
		};
	},

	getEvents: function()
	{
		return [
			"destroy",
			"showBefore",
			"show",
			"hideBefore",
			"hide",
			"resize",
			"bodyResize",
			"draggableDragBefore",
			"draggableDrag",
			"draggableStart",
			"draggableStop",
			"draggableCancel",
			"resizableResize",
			"resizableStart",
			"resizableStop",
			"resizableCancel"
		];
	},

	create: function(params)
	{
		var self = this;
		self.defaultLayerParams = self.getDefaultLayerParams();
		self.defaultDraggableParams = self.getDefaultDraggableParams();
		self.defaultResizableParams = self.getDefaultResizableParams();
		self.defaultI18n = self.getDefaultI18n();
		self.offset = null;
		self.updatePosition = true;
		self.updatePositionOnFsOff = true;
		self.dragged = false;
		self.resized = false;
		self.dragging = false;
		self.resizing = false;
		self.mousedown = false;
		hopjs.component.prototype.create.apply(self, arguments);
		if (self.locale === "")
			self.setLocale();
		self.generateHtml();
		self.setTitle(self.title);
		self.setWrapTitle(self.wrapTitle);
		self.setIcon(self.icon);
		self.setContent(self.content);
		self.setHideButton(self.hideButton);
		self.setFullScreenButton(self.fullScreenButton);
		self.setSize(self.height, self.width);
		self.setShowTop(self.showTop);
		self.setShowBottom(self.showBottom);
		self.setShowLeft(self.showLeft);
		self.setShowRight(self.showRight);
		self.setShowInnerTop(self.showInnerTop);
		self.setShowInnerBottom(self.showInnerBottom);
		self.setDraggable(self.draggable);
		self.setResizable(self.resizable);
		self.setFullScreen(self.fullScreen);
	},

	afterCreate: function(params)
	{
		hopjs.component.prototype.afterCreate.apply(this, arguments);
		if (params.show)
			this.show();
	},

	setLocale: function(locale)
	{
		var self = this;
		if (!def(locale))
			locale = "";
		if (typeof locale !== "string")
			return;

		self.locale = locale;
		self.i18n = {};
		$.extend(true, self.i18n, self.defaultI18n);
		if (locale !== "")
			self.buildI18n();
		if (self.layer)
			self.updateLocaleHtml();
	},

	buildI18n: function()
	{
		if (hopjs.window.i18n[this.locale])
			$.extend(true, this.i18n, hopjs.window.i18n[this.locale]);
	},

	updateLocaleHtml: function()
	{
		var self = this;
		$(_cp+"head-button-full-screen", self.$head).attr("title", self.fullScreen ? self.i18n.restore : self.i18n.fullScreen);
		$(_cp+"head-button-hide", self.$head).attr("title", self.i18n.hide);
	},

	setTitle: function(title)
	{
		this.title = title;
		if (this.layer)
		{
			this.$title.html(title === "" ? "&nbsp;" : title);
			this.resizeBody();
		}
	},

	setWrapTitle: function(wrapTitle)
	{
		this.wrapTitle = !!wrapTitle;
		if (this.layer)
		{
			this.$title.toggleClass(cp+"title-nowrap", !wrapTitle);
			this.resizeBody();
		}
	},

	setIcon: function(icon)
	{
		var self = this, className = cp+"title-icon";
		self.icon = icon;
		if (!self.layer)
			return;

		if (typeof icon === "string" && icon !== "")
		{
			self.$title.addClass(className);
			self.titleNode.style.backgroundImage = "url("+icon+")";
		}
		else
		{
			self.$title.removeClass(className);
			self.titleNode.style.backgroundImage = "none";
		}
		self.resizeBody();
	},

	setContent: function(content)
	{
		this.content = content;
		if (this.layer)
			this.$body.html(content);
	},

	setHideButton: function(value)
	{
		var self = this;
		self.hideButton = !!value;
		if (self.layer)
		{
			$(_cp+"head-button-hide", self.$head).css("display", value ? "block" : "none");
			self.checkButtons();
			self.updateTitleMargin();
		}
	},

	setFullScreenButton: function(value)
	{
		var self = this;
		self.fullScreenButton = !!value;
		if (self.layer)
		{
			$(_cp+"head-button-full-screen", self.$head).css("display", value ? "block" : "none");
			self.checkButtons();
			self.updateTitleMargin();
		}
	},

	checkButtons: function()
	{
		$(_cp+"head-buttons", this.$head).css("display", this.hasButtons() ? "block" : "none");
	},

	hasButtons: function()
	{
		return (this.hideButton || this.fullScreenButton);
	},

	setFullScreen: function(fullScreen)
	{
		var self = this, $layer, top, left, $window = $(window);
		fullScreen = !!fullScreen;
		self.fullScreen = fullScreen;
		if (!self.layer)
			return;

		$layer = self.layer.$node;
		$layer.toggleClass(cp+"full-screen", fullScreen);
		$(_cp+"head-button-full-screen", self.layer.node).attr("title", fullScreen ? self.i18n.restore : self.i18n.fullScreen);
		if (self.draggable)
			self.hopDraggable.setEnabled(!fullScreen);
		if (self.resizable)
			self.hopResizable.setEnabled(!fullScreen);
		if (fullScreen)
		{
			$layer.css({
				position: "fixed",
				top: 0,
				left: 0
			});
			self.updateFullScreenWidth();
			self.onResize();
		}
		else
		{
			$layer.css({
				position: self.layer.position
			});
			self.setSize(self.height, self.width);
			if (self.offset)
			{
				self.layer.node.style.top = self.offset.top+"px";
				self.layer.node.style.left = self.offset.left+"px";
			}
			if (self.layer.visible && self.updatePositionOnFsOff)
				self.layer.updatePosition(true);
		}
		self.layer.configure({
			animationShow: (fullScreen ? self.fsAnimationShow : self.animationShow),
			animationShowParams: (fullScreen ? self.fsAnimationShowParams : self.animationShowParams),
			animationHide: (fullScreen ? self.fsAnimationHide : self.animationHide),
			animationHideParams: (fullScreen ? self.fsAnimationHideParams : self.animationHideParams),
			overlay: (self.modal && !fullScreen)
		});
	},

	setHeight: function(height, event)
	{
		var self = this;
		height = parseFloat(height);
		if (isNaN(height))
			return;

		if (self.maxHeight !== null && height > self.maxHeight)
			height = self.maxHeight;
		if (height < self.minHeight)
			height = self.minHeight;
		self.height = height;
		if (!self.layer || self.fullScreen)
			return;

		self.layer.$node.height(self.calcInnerHeight(height));
		if (!def(event) || event)
			self.onResize();
	},

	calcInnerHeight: function(height)
	{
		return height-(this.layer.$node.outerHeight()-this.layer.$node.height());
	},

	setWidth: function(width, event)
	{
		var self = this;
		width = parseFloat(width);
		if (isNaN(width))
			return;

		if (self.maxWidth !== null && width > self.maxWidth)
			width = self.maxWidth;
		if (width < self.minWidth)
			width = self.minWidth;
		self.width = width;
		if (!self.layer || self.fullScreen)
			return;

		self.layer.$node.width(self.calcInnerWidth(width));
		if (!def(event) || event)
			self.onResize();
	},

	calcInnerWidth: function(width)
	{
		return width-(this.layer.$node.outerWidth()-this.layer.$node.width());
	},

	setSize: function(height, width)
	{
		this.setHeight(height, false);
		this.setWidth(width, false);
		this.onResize();
	},

	setMinHeight: function(height)
	{
		height = parseFloat(height);
		if (isNaN(height))
			return;

		if (this.maxHeight !== null && height > this.maxHeight)
			height = this.maxHeight;
		this.minHeight = height;
		if (this.height < height)
			this.setHeight(height);
	},

	setMinWidth: function(width)
	{
		width = parseFloat(width);
		if (isNaN(width))
			return;

		if (this.maxWidth !== null && width > this.maxWidth)
			width = this.maxWidth;
		this.minWidth = width;
		if (this.width < width)
			this.setWidth(width);
	},

	setMaxHeight: function(height)
	{
		if (height === "")
			height = null;
		if (height !== null)
		{
			height = parseFloat(height);
			if (isNaN(height))
				return;

			if (height < this.minHeight)
				height = this.minHeight;
		}
		this.maxHeight = height;
		if (height !== null && this.height > height)
			this.setHeight(height);
	},

	setMaxWidth: function(width)
	{
		if (width === "")
			width = null;
		if (width !== null)
		{
			width = parseFloat(width);
			if (isNaN(width))
				return;

			if (width < this.minWidth)
				width = this.minWidth;
		}
		this.maxWidth = width;
		if (width !== null && this.width > width)
			this.setHeight(width);
	},

	setModal: function(modal)
	{
		this.modal = !!modal;
		if (this.layer && (!this.modal || !this.fullScreen))
			this.layer.setOverlay(modal);
	},

	setShowTop: function(value)
	{
		value = !!value;
		this.showTop = value;
		if (this.layer)
		{
			this.topNode.style.display = (value ? "block" : "none");
			this.resizeBody();
		}
	},

	setShowBottom: function(value)
	{
		value = !!value;
		this.showBottom = value;
		if (this.layer)
		{
			this.bottomNode.style.display = (value ? "block" : "none");
			this.resizeBody();
		}
	},

	setShowLeft: function(value)
	{
		value = !!value;
		this.showLeft = value;
		if (this.layer)
		{
			this.leftNode.style.display = (value ? "block" : "none");
			this.resizeBody();
		}
	},

	setShowRight: function(value)
	{
		value = !!value;
		this.showRight = value;
		if (this.layer)
		{
			this.rightNode.style.display = (value ? "block" : "none");
			this.resizeBody();
		}
	},

	setShowInnerTop: function(value)
	{
		value = !!value;
		this.showInnerTop = value;
		if (this.layer)
		{
			this.innerTopNode.style.display = (value ? "block" : "none");
			this.resizeBody();
		}
	},

	setShowInnerBottom: function(value)
	{
		value = !!value;
		this.showInnerBottom = value;
		if (this.layer)
		{
			this.innerBottomNode.style.display = (value ? "block" : "none");
			this.resizeBody();
		}
	},

	setLayerParams: function(params)
	{
		this.layerParams = params;
		if (this.layer)
			this.layer.configure(params);
	},

	setDraggable: function(draggable)
	{
		var self = this, params;
		self.draggable = !!draggable;
		if (!self.layer)
			return;

		if (draggable)
		{
			if (!self.hopDraggable)
			{
				params = {
					node: self.layer.node,
					handles: _cp+"head",
					cancelHandles: _cp+"head-button",
					onStart: function(draggable)
					{
						self.onDraggableStart(draggable);
					},
					onDragBefore: function(draggable)
					{
						self.onDraggableDragBefore(draggable);
					},
					onDrag: function(draggable)
					{
						self.onDraggableDrag(draggable);
					},
					onStop: function(draggable)
					{
						self.onDraggableStop(draggable);
					},
					onCancel: function(draggable)
					{
						self.onDraggableCancel(draggable);
					}
				};
				if (self.defaultDraggableParams)
					$.extend(true, params, self.defaultDraggableParams);
				if (self.draggableParams)
					$.extend(true, params, self.draggableParams);
				self.hopDraggable = new hopjs.draggable(params);
			}
			if (self.fullScreen)
				self.hopDraggable.setEnabled(false);
		}
		else if (self.hopDraggable)
			self.hopDraggable.setEnabled(false);
		self.$head.toggleClass(cp+"head-draggable", draggable);
	},

	onDraggableStart: function(draggable)
	{
		this.dragging = true;
		this.layer.$node.addClass(cp+"dragging");
		this.trigger("draggableStart", {draggable: draggable});
	},

	onDraggableDragBefore: function(draggable)
	{
		var scroll = 0;
		if (this.layer.position === "fixed")
			scroll = $(window).scrollTop();
		if (draggable.state.top-scroll < 0)
			draggable.state.top = scroll;
		this.trigger("draggableDragBefore", {draggable: draggable});
	},

	onDraggableDrag: function(draggable)
	{
		this.dragged = true;
		this.trigger("draggableDrag", {draggable: draggable});
	},

	onDraggableStop: function(draggable)
	{
		this.draggableReset();
		this.saveOffset();
		this.trigger("draggableStop", {draggable: draggable});
	},

	saveOffset: function()
	{
		this.offset = {
			top: this.layer.node.offsetTop,
			left: this.layer.node.offsetLeft
		};
	},

	onDraggableCancel: function(draggable)
	{
		this.draggableReset();
		this.trigger("draggableCancel", {draggable: draggable});
	},

	draggableReset: function()
	{
		this.dragging = false;
		this.layer.$node.removeClass(cp+"dragging");
	},

	setResizable: function(resizable)
	{
		var self = this, params;
		self.resizable = !!resizable;
		if (!self.layer)
			return;

		if (resizable)
		{
			if (!self.hopResizable)
			{
				params = {
					node: self.layer.node,
					onStart: function(resizable)
					{
						self.onResizableStart(resizable);
					},
					onStateChange: function(resizable)
					{
						self.onStateChange(resizable);
					},
					onResize: function(resizable)
					{
						self.onResizableResize(resizable);
					},
					onStop: function(resizable)
					{
						self.onResizableStop(resizable);
					},
					onCancel: function(resizable)
					{
						self.onResizableCancel(resizable);
					}
				};
				if (self.defaultResizableParams)
					$.extend(true, params, self.defaultResizableParams);
				if (self.resizableParams)
					$.extend(true, params, self.resizableParams);
				self.hopResizable = new hopjs.resizable(params);
			}
			if (self.fullScreen)
				self.hopResizable.setEnabled(false);
		}
		else if (self.hopResizable)
			self.hopResizable.setEnabled(false);
	},

	onResizableStart: function(resizable)
	{
		var self = this;
		self.resizing = true;
		resizable.configure({
			maxHeight: self.maxHeight,
			maxWidth: self.maxWidth,
			minHeight: self.minHeight,
			minWidth: self.minWidth
		});
		self.layer.$node.addClass(cp+"resizing");
		self.trigger("resizableStart", {resizable: resizable});
	},

	onStateChange: function(resizable)
	{
		var s = resizable.state, is = resizable.initialState,
			top, scroll = 0;
		if (s.upwards)
		{
			if (this.layer.position === "fixed")
				scroll = $(window).scrollTop();
			top = is.offsetTop-scroll-s.height+is.height;
			if (top < 0)
				s.height += top;
		}
		this.trigger("resizableStateChange", {resizable: resizable});
	},

	onResizableResize: function(resizable)
	{
		this.resized = true;
		this.trigger("resizableResize", {resizable: resizable});
		this.onResize();
	},

	onResizableStop: function(resizable)
	{
		this.resizableReset();
		this.trigger("resizableStop", {resizable: resizable});
		this.saveOffset();
		this.setSize(this.layer.$node.outerHeight(), this.layer.$node.outerWidth());
	},

	onResizableCancel: function(resizable)
	{
		this.resizableReset();
		this.trigger("resizableCancel", {resizable: resizable});
		this.setSize(this.layer.$node.outerHeight(), this.layer.$node.outerWidth());
	},

	resizableReset: function()
	{
		this.resizing = false;
		this.layer.$node.removeClass(cp+"resizing");
	},

	generateHtml: function()
	{
		var self = this,
			node = document.createElement("div"),
			html, layer, layerParams = {};
		html = '\
<div class="{c}head-wrapper">\
	<div class="{c}head">\
		<div class="{c}title"></div>\
		<div class="{c}head-buttons">\
			<a class="{c}head-button {c}head-button-full-screen" title="'+hopjs.html.quoteValue(self.i18n.fullScreen)+'"></a>\
			<a class="{c}head-button {c}head-button-hide" title="'+hopjs.html.quoteValue(self.i18n.hide)+'"></a>\
		</div>\
	</div>\
</div>\
<div class="{c}body-wrapper">\
	<div class="{c}top"></div>\
	<div class="{c}middle">\
		<div class="{c}left"></div>\
		<div class="{c}inner-middle">\
			<div class="{c}inner-top"></div>\
			<div class="{c}body"></div>\
			<div class="{c}inner-bottom"></div>\
		</div>\
		<div class="{c}right"></div>\
	</div>\
	<div class="{c}bottom"></div>\
</div>';
		node.innerHTML = hopjs.string.replace("{c}", cp, html);
		node.className = "hopjs-window";
		if (self.extraClass !== "")
			node.className += " "+self.extraClass;
		node.style.display = "none";
		document.body.appendChild(node);

		$.extend(true, layerParams, self.defaultLayerParams);
		layerParams.node = node;
		if (self.layerParams)
			$.extend(true, layerParams, self.layerParams);
		layer = new hopjs.layer(layerParams);
		self.layer = layer;
		layer.hopWindow = self;

		self.$headWrapper = $(_cp+"head-wrapper", layer.node);
		self.headWrapperNode = self.$headWrapper[0];
		self.$head = $(_cp+"head", layer.node);
		self.headNode = self.$head[0];
		self.$title = $(_cp+"title", layer.node);
		self.titleNode = self.$title[0];
		self.$bodyWrapper = $(_cp+"body-wrapper", layer.node);
		self.bodyWrapperNode = self.$bodyWrapper[0];
		self.$body = $(_cp+"body", layer.node);
		self.bodyNode = self.$body[0];
		self.$top = $(_cp+"top", layer.node);
		self.topNode = self.$top[0];
		self.$bottom = $(_cp+"bottom", layer.node);
		self.bottomNode = self.$bottom[0];
		self.$middle = $(_cp+"middle", layer.node);
		self.middleNode = self.$middle[0];
		self.$left = $(_cp+"left", layer.node);
		self.leftNode = self.$left[0];
		self.$right = $(_cp+"right", layer.node);
		self.rightNode = self.$right[0];
		self.$innerMiddle = $(_cp+"inner-middle", layer.node);
		self.innerMiddleNode = self.$innerMiddle[0];
		self.$innerTop = $(_cp+"inner-top", layer.node);
		self.innerTopNode = self.$innerTop[0];
		self.$innerBottom = $(_cp+"inner-bottom", layer.node);
		self.innerBottomNode = self.$innerBottom[0];

		layer.on("showBefore", function()
		{
			self.onLayerShowBefore();
		});

		layer.on("show", function()
		{
			self.onLayerShow();
		});

		layer.on("hide", function()
		{
			self.onLayerHide();
		});

		layer.on("updatePosition", function()
		{
			self.onLayerUpdatePosition();
		});

		layer.$node.on("mousedown", function(event)
		{
			self.onLayerMousedown(event);
		});

		self.$head.on("dblclick", function(event)
		{
			self.onHeadDblclick(event);
		});

		self.$title.on("mousedown", function(event)
		{
			self.onTitleMousedown(event);
		});

		$(_cp+"head-button-hide", layer.node).on("click", function(event)
		{
			self.onHideClick(event);
		});

		$(_cp+"head-button-full-screen", layer.node).on("click", function(event)
		{
			self.onFullScreenClick(event);
		});

		$(document).on("mousedown", function(event)
		{
			self.onDocumentMousedown(event);
		});

		$(window).on("resize", function(event)
		{
			self.onWindowResize(event);
		});
	},

	onLayerShowBefore: function()
	{
		if (!this.layer.shown)
			this.$title.css("margin-right", $(_cp+"",+"head-buttons", this.layer.node).outerWidth());
		this.resizeBody();
	},

	onLayerShow: function()
	{
		this.onShow();
	},

	onShow: function()
	{
		this.trigger("show");
	},

	onLayerHide: function()
	{
		this.onHide();
	},

	onHide: function()
	{
		this.trigger("hide");
	},

	onLayerUpdatePosition: function()
	{
		this.updatePosition = false;
		this.updatePositionOnFsOff = false;
		this.dragged = false;
		this.resized = false;
		this.saveOffset();
	},

	onLayerMousedown: function(event)
	{
		this.layer.moveOnTop();
		if (this.hideOnDocumentMousedown)
			this.mousedown = true;
	},

	onHeadDblclick: function(event)
	{
		if (this.fullScreenOnHeadDblclick)
			this.toggleFullScreen();
	},

	onTitleMousedown: function(event)
	{
		if (this.fullScreenOnHeadDblclick)
			event.preventDefault();
	},

	onHideClick: function(event)
	{
		this.hide();
	},

	onFullScreenClick: function(event)
	{
		this.toggleFullScreen();
	},

	onDocumentMousedown: function(event)
	{
		if (this.hideOnDocumentMousedown)
		{
			if (this.mousedown)
				this.mousedown = false;
			else
				this.hide();
		}
	},

	onWindowResize: function(event)
	{
		if (event.target === document || event.target === window)
		{
			if (this.fullScreen)
			{
				this.updateFullScreenWidth(event);
				this.onResize(false);
			}
			else if (this.updatePositionOnWindowResize && !this.dragged && !this.resized)
			{
				this.layer.updatePosition(true);
				this.layer.updatePosition(true);
			}
		}
	},

	show: function(params)
	{
		var self = this, eventData = {};
		if (!this.layer.showingNext())
			return;

		self.onShowBefore(eventData);
		if (eventData.cancel)
			return;

		if (!params)
			params = {};
		if (!def(params.updatePosition))
			params.updatePosition = (self.updatePositionOnShow || self.updatePosition);
		if (self.fullScreen)
		{
			if (params.updatePosition)
				self.updatePositionOnFsOff = true;
			params.updatePosition = false;
		}
		self.layer.show(params);
	},

	onShowBefore: function(data)
	{
		this.trigger("showBefore", data);
	},

	hide: function(params)
	{
		if (this.layer.showingNext())
			return;

		var eventData = {};
		this.onHideBefore(eventData);
		if (!eventData.cancel)
			this.layer.hide(params);
	},

	onHideBefore: function(data)
	{
		this.trigger("hideBefore", data);
	},

	toggle: function(shopParams, hideParams)
	{
		if (this.layer.showingNext())
			this.show(shopParams);
		else
			this.hide(hideParams);
	},

	toggleFullScreen: function()
	{
		this.setFullScreen(!this.fullScreen);
	},

	updateFullScreenWidth: function()
	{
		if (!this.fullScreen)
			return;

		var $layerNode = this.layer.$node,
			$window = $(window);
		$layerNode.height($window.height()-($layerNode.outerHeight()-$layerNode.height()));
		$layerNode.width($window.width()-($layerNode.outerWidth()-$layerNode.width()));
	},

	updateTitleMargin: function()
	{
		var self = this, style = self.layer.node.style, display = style.display, margin = 0,
			$buttons = $(_cp+"head-buttons", self.$head);
		style.display = "block";
		if ($buttons[0].style.display !== "none")
			margin = $buttons.outerWidth();
		self.titleNode.style.marginRight = margin+"px";
		style.display = display;
		self.resizeBody();
	},

	onResize: function(triggerWindowResize)
	{
		var self = this;
		if (self.updatePositionOnResize && !self.fullScreen && !self.dragged && !self.resizing)
			self.layer.updatePosition(true);
		self.resizeBody();
		self.trigger("resize");
		if (!def(triggerWindowResize))
			triggerWindowResize = true;
		if (triggerWindowResize)
			$(window).trigger("resize");
	},

	resizeBody: function()
	{
		var self = this, $body = self.$body, height, topHeight, width, leftWidth;
		height = self.layer.$node.height()-self.$headWrapper.outerHeight(true);
		self.$bodyWrapper.height(height);

		if (self.showTop)
		{
			topHeight =  self.$top.outerHeight(true);
			self.$middle.css("top", topHeight);
			height -= topHeight;
		}
		if (self.showBottom)
			height -= self.$bottom.outerHeight(true);
		self.$middle.height(height);

		width = self.$middle.width();
		if (self.showLeft)
		{
			leftWidth =  self.$left.outerWidth(true);
			self.$innerMiddle.css("left", leftWidth);
			width -= leftWidth;
		}
		if (self.showRight)
			width -= self.$right.outerWidth(true);
		self.$innerMiddle.width(width);

		if (self.showInnerTop)
		{
			topHeight =  self.$innerTop.outerHeight(true);
			$body.css("top", topHeight);
			height -= topHeight;
		}
		if (self.showInnerBottom)
			height -= self.$innerBottom.outerHeight(true);
		$body.height(height);
		$body.height(2*$body.height()-$body.outerHeight(true));
		$body.width(width);
		$body.width(2*$body.width()-$body.outerWidth(true));

		self.onBodyResize({
			height: $body.height(),
			width: $body.width()
		});
	},

	onBodyResize: function(data)
	{
		this.trigger("bodyResize", data);
	},

	destroy: function()
	{
		this.layer.destroy();
		this.onDestroy();
	},

	onDestroy: function()
	{
		this.trigger("destroy");
	}
});

})(window, document, jQuery, hopjs);