/*!
 * hop.window
 *
 * This file is a part of hopjs v@VERSION
 *
 * (c) @AUTHOR
 * Released under the MIT license
 *
 * Date: @DATE
 */

(function(window, $, hop)
{

var def = hop.def;

hop.window = function(params)
{
	hop.widget.apply(this, arguments);
};

hop.window.i18n = {};

hop.window.current = function(node)
{
	while (node)
	{
		if (node.hopLayer && node.hopLayer.hopWindow)
			return node.hopLayer.hopWindow;
		node = node.parentNode;
	}
};

hop.window.hide = function(node)
{
	var window = hop.window.current(node);
	if (window)
		window.hide();
};

hop.inherit(hop.window, hop.widget, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			locale: "",
			className: null,
			classPrefix: "hop-",
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
			jail: true,
			borderElement: "window"
		};
	},

	getDefaultDraggableParams: function()
	{
		return {
			containment: "window"
		};
	},

	getDefaultResizableParams: function()
	{
		return {
			containment: "document"
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
			"draggableDrag",
			"draggableStart",
			"draggableStop",
			"resizableResize",
			"resizableStart",
			"resizableStop"
		];
	},

	create: function(params)
	{
		var self = this, data = {};
		self.defaultLayerParams = self.getDefaultLayerParams();
		self.defaultDraggableParams = self.getDefaultDraggableParams();
		self.defaultResizableParams = self.getDefaultResizableParams();
		self.defaultI18n = self.getDefaultI18n();
		self.offset = null;
		self.updatePosition = true;
		self.updatePositionOnFsOff = true;
		self.moved = false;
		self.resized = false;
		self.dragging = false;
		self.resizing = false;
		self.mousedown = false;
		hop.widget.prototype.create.apply(self, arguments);
		if (self.locale === "")
			self.setLocale();
		if (self.className === null)
			self.className = self.classPrefix+"window";
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
		hop.widget.prototype.afterCreate.apply(self, arguments);
		if (params.show)
			this.show();
	},

	setLocale: function(locale)
	{
		var self = this;
		if (!def(locale))
			locale = "";
		if (typeof locale != "string")
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
		if (hop.window.i18n[this.locale])
			$.extend(true, this.i18n, hop.window.i18n[this.locale])
	},

	updateLocaleHtml: function()
	{
		var self = this, dot_class_prefix = "."+self.classPrefix+"window-head-button-";
		$(dot_class_prefix+"full-screen", self.$head).attr("title", self.fullScreen ? self.i18n.restore : self.i18n.fullScreen);
		$(dot_class_prefix+"hide", self.$head).attr("title", self.i18n.hide);
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
			this.$title.toggleClass(this.classPrefix+"window-title-nowrap", !wrapTitle);
			this.resizeBody();
		}
	},

	setIcon: function(icon)
	{
		var self = this, className = self.classPrefix+"window-title-icon";
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
			$("."+self.classPrefix+"window-head-button-hide", self.$head).css("display", value ? "block" : "none");
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
			$("."+self.classPrefix+"window-head-button-full-screen", self.$head).css("display", value ? "block" : "none");
			self.checkButtons();
			self.updateTitleMargin();
		}
	},

	checkButtons: function()
	{
		$("."+this.classPrefix+"window-head-buttons", this.$head).css("display", this.hasButtons() ? "block" : "none");
	},

	hasButtons: function()
	{
		return (this.hideButton || this.fullScreenButton);
	},

	setFullScreen: function(fullScreen)
	{
		var self = this, classPrefix = self.classPrefix+"window-", $layer;
		fullScreen = !!fullScreen;
		self.fullScreen = fullScreen;
		if (!self.layer)
			return;

		$layer = self.layer.$node;
		$layer.toggleClass(classPrefix+"full-screen", fullScreen);
		$("."+classPrefix+"head-button-full-screen", self.layer.node).attr("title", fullScreen ? self.i18n.restore : self.i18n.fullScreen);
		if (self.draggable)
			$layer.draggable("option", "disabled", fullScreen);
		if (self.resizable)
			$layer.resizable("option", "disabled", fullScreen);
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
		if (this.maxHeight !== null && height > this.maxHeight)
			height = this.maxHeight;
		this.minHeight = height;
		if (this.height < height)
			this.setHeight(height);
	},

	setMinWidth: function(width)
	{
		if (this.maxWidth !== null && width > this.maxWidth)
			width = this.maxWidth;
		this.minWidth = width;
		if (this.width < width)
			this.setWidth(width);
	},

	setMaxHeight: function(height)
	{
		if (height < this.minHeight)
			height = this.minHeight;
		this.maxHeight = height;
		if (this.height > height)
			this.setHeight(height);
	},

	setMaxWidth: function(width)
	{
		if (width < this.minWidth)
			width = this.minWidth;
		this.maxWidth = width;
		if (this.width > width)
			this.setWidth(width);
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
		var self = this, initialized, draggableClass = self.classPrefix+"window-head-draggable";
		self.draggable = !!draggable;
		if (!self.layer)
			return;

		if (draggable)
		{
			if (!self.draggableInitialized())
			{
				params = {
					drag: function(event, ui)
					{
						self.onDraggableDrag(event, ui);
					},
					start: function(event, ui)
					{
						self.onDraggableStart(event, ui);
					},
					stop: function(event, ui)
					{
						self.onDraggableStop(event, ui);
					},
					handle: "."+self.classPrefix+"window-head",
					cancel: "."+self.classPrefix+"window-head-button",
					disabled: true
				};
				if (self.defaultDraggableParams)
					$.extend(true, params, self.defaultDraggableParams);
				if (self.draggableParams)
					$.extend(true, params, self.draggableParams);
				self.layer.$node.draggable(params);
			}
			if (!self.fullScreen)
				self.layer.$node.draggable("option", "disabled", false);
		}
		else if (self.draggableInitialized())
			self.layer.$node.draggable("option", "disabled", true);
		self.$head.toggleClass(self.classPrefix+"window-head-draggable", draggable);
	},

	draggableInitialized: function()
	{
		return (this.layer && this.layer.$node.is(".ui-draggable"));
	},

	onDraggableDrag: function(event, ui)
	{
		this.moved = true;
		if (ui.position.top < 0)
			ui.position.top = 0;
		if (ui.position.left < 0)
			ui.position.left = 0;
		this.offset = {
			top: ui.position.top,
			left: ui.position.left
		};
		this.trigger("draggableDrag", {event: event, ui: ui});
	},

	onDraggableStart: function(event, ui)
	{
		this.dragging = true;
		this.layer.$node.addClass(this.classPrefix+"window-dragging");
		this.trigger("draggableStart", {event: event, ui: ui});
	},

	onDraggableStop: function(event, ui)
	{
		this.dragging = false;
		this.layer.$node.removeClass(this.classPrefix+"window-dragging");
		this.trigger("draggableStop", {event: event, ui: ui});
	},

	setResizable: function(resizable)
	{
		var self = this, initialized;
		self.resizable = !!resizable;
		if (!self.layer)
			return;

		if (resizable)
		{
			if (!self.resizableInitialized())
			{
				params = {
					resize: function(event, ui)
					{
						self.onResizableResize(event, ui);
					},
					start: function(event, ui)
					{
						self.onResizableResizeStart(event, ui);
					},
					stop: function(event, ui)
					{
						self.onResizableResizeStop(event, ui);
					},
					handle: "."+self.classPrefix+"window-head",
					cancel: "."+self.classPrefix+"window-head-button",
					disabled: true
				};
				if (self.defaultResizableParams)
					$.extend(true, params, self.defaultResizableParams);
				if (self.resizableParams)
					$.extend(true, params, self.resizableParams);
				self.layer.$node.resizable(params);
			}
			if (!self.fullScreen)
				self.layer.$node.resizable("option", "disabled", false);
		}
		else if (self.resizableInitialized())
			self.layer.$node.resizable("option", "disabled", true);
	},

	resizableInitialized: function()
	{
		return (this.layer && this.layer.$node.is(".ui-resizable"));
	},

	onResizableResize: function(event, ui)
	{
		this.resized = true;
		this.trigger("resizableResize", {event: event, ui: ui});
		this.onResize();
	},

	onResizableResizeStart: function(event, ui)
	{
		var self = this;
		self.resizing = true;
		self.layer.$node.resizable("option", {
			maxHeight: (self.maxHeight === null ? null : self.calcInnerHeight(self.maxHeight)),
			maxWidth: (self.maxWidth === null ? null : self.calcInnerWidth(self.maxWidth)),
			minHeight: self.calcInnerHeight(self.minHeight),
			minWidth: self.calcInnerWidth(self.minWidth)
		});
		self.layer.$node.addClass(self.classPrefix+"window-resizing");
		self.trigger("resizableStart", {event: event, ui: ui});
	},

	onResizableResizeStop: function(event, ui)
	{
		var self = this;
		self.resizing = false;
		self.layer.$node.removeClass(self.classPrefix+"window-resizing");
		self.trigger("resizableStop", {event: event, ui: ui});
		self.setSize(self.layer.$node.outerHeight(), self.layer.$node.outerWidth());
	},

	generateHtml: function()
	{
		var self = this,
			classPrefix = self.classPrefix+"window-",
			dotClassPrefix = "."+classPrefix,
			node = document.createElement("div"),
			html, layer, layerParams = {};
		html = '\
<div class="{c}head-wrapper">\
	<div class="{c}head">\
		<div class="{c}title"></div>\
		<div class="{c}head-buttons">\
			<a class="{c}head-button {c}head-button-full-screen" title="'+hop.html.quoteValue(self.i18n.fullScreen)+'"></a>\
			<a class="{c}head-button {c}head-button-hide" title="'+hop.html.quoteValue(self.i18n.hide)+'"></a>\
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
		node.innerHTML = hop.string.replace("{c}", classPrefix, html);
		node.className = self.className;
		node.style.display = "none";
		document.body.appendChild(node);

		$.extend(true, layerParams, self.defaultLayerParams);
		layerParams.node = node;
		if (self.layerParams)
			$.extend(true, layerParams, self.layerParams);
		layer = new hop.layer(layerParams);
		self.layer = layer;
		layer.hopWindow = self;

		self.$headWrapper = $(dotClassPrefix+"head-wrapper", layer.node);
		self.headWrapperNode = self.$headWrapper[0];
		self.$head = $(dotClassPrefix+"head", layer.node);
		self.headNode = self.$head[0];
		self.$title = $(dotClassPrefix+"title", layer.node);
		self.titleNode = self.$title[0];
		self.$bodyWrapper = $(dotClassPrefix+"body-wrapper", layer.node);
		self.bodyWrapperNode = self.$bodyWrapper[0];
		self.$body = $(dotClassPrefix+"body", layer.node);
		self.bodyNode = self.$body[0];
		self.$top = $(dotClassPrefix+"top", layer.node);
		self.topNode = self.$top[0];
		self.$bottom = $(dotClassPrefix+"bottom", layer.node);
		self.bottomNode = self.$bottom[0];
		self.$middle = $(dotClassPrefix+"middle", layer.node);
		self.middleNode = self.$middle[0];
		self.$left = $(dotClassPrefix+"left", layer.node);
		self.leftNode = self.$left[0];
		self.$right = $(dotClassPrefix+"right", layer.node);
		self.rightNode = self.$right[0];
		self.$innerMiddle = $(dotClassPrefix+"inner-middle", layer.node);
		self.innerMiddleNode = self.$innerMiddle[0];
		self.$innerTop = $(dotClassPrefix+"inner-top", layer.node);
		self.innerTopNode = self.$innerTop[0];
		self.$innerBottom = $(dotClassPrefix+"inner-bottom", layer.node);
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

		$(dotClassPrefix+"head-button-hide", layer.node).on("click", function(event)
		{
			self.onHideClick(event);
		});

		$(dotClassPrefix+"head-button-full-screen", layer.node).on("click", function(event)
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
			this.$title.css("margin-right", $("."+this.classPrefix+"window-",+"head-buttons", this.layer.node).outerWidth());
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
		this.moved = false;
		this.resized = false;
		this.offset = this.layer.$node.offset();
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
		if (event.target == document || event.target == window)
		{
			if (this.fullScreen)
			{
				this.updateFullScreenWidth(event);
				this.onResize();
			}
			else if (this.updatePositionOnWindowResize && !this.moved && !this.resized)
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
			$buttons = $("."+self.classPrefix+"window-head-buttons", self.$head);
		style.display = "block";
		if ($buttons[0].style.display != "none")
			margin = $buttons.outerWidth();
		self.titleNode.style.marginRight = margin+"px";
		style.display = display;
		self.resizeBody();
	},

	onResize: function()
	{
		var self = this;
		if (self.updatePositionOnResize && !self.fullScreen && !self.moved && !self.resizing)
			self.layer.updatePosition(true);
		self.resizeBody();
		self.trigger("resize");
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

})(window, jQuery, hopjs);