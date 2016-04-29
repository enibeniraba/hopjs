/*!
 * hopjs.menuButton
 *
 * This file is a part of hopjs v@VERSION
 *
 * (c) @AUTHOR
 * Released under the MIT license
 *
 * Date: @DATE
 */

(function(document, $, hop)
{
	
var cp = "hopjs-button-",
	_cp = "."+cp,
	positions = ["top", "bottom", "left", "right"];

hop.splitButton = function(params)
{
	hop.button.apply(this, arguments);
};

hop.inherit(hop.splitButton, hop.button, {
	getEvents: function()
	{
		return $.merge(hop.button.prototype.getEvents.apply(this), [
			"arrowClick"
		]);
	},
	
	generateHtml: function()
	{
		var self = this;
		self.node = document.createElement("span");
		self.node.hopButton = self;
		self.node.className = "hopjs-splitbutton";
		if (self.extraClass !== "")
			self.node.className += " "+self.extraClass;
		self.$node = $(self.node);
		self.$node.html('<span><span><i></i><span></span></span><div></div></span>');
		self.$main = $("> span > span", self.node);
		self.mainNode = self.$main[0];
		self.$text = $("> span > span > span", self.node);
		self.textNode = self.$text[0];
		self.$icon = $("i", self.node);
		self.iconNode = self.$icon[0];
		self.$arrow = $("div", self.node);
		self.arrowNode = self.$arrow[0];
		
		self.$main.on("mousedown", function(event)
		{
			self.onMainNodeMousedown(event);
		});
		
		self.$main.on("click", function(event)
		{
			self.onMainNodeClick(event);
		});
		
		self.$arrow.on("mousedown", function(event)
		{
			self.onArrowNodeMousedown(event);
		});
		
		self.$arrow.on("click", function(event)
		{
			self.onArrowNodeClick(event);
		});
		
		$(document).on("mouseup", function(event)
		{
			self.onDocumentMouseup(event);
		});
	},
	
	onMainNodeMousedown: function(event)
	{
		if (event.which === 1 && this.enabled)
			this.$node.addClass(cp+"active");
	},
	
	onMainNodeClick: function(event)
	{
		if (event.which === 1 && this.enabled)
		{
			if (this.allowToggle)
				this.toggle();
			this.onClick(event);
		}
	},
	
	onClick: function(event)
	{
		this.trigger("click", {event: event});
	},
	
	onArrowNodeMousedown: function(event)
	{
		if (event.which === 1 && this.enabled)
		{
			if (this.menu)
				this.menu.mousedown = true;
			this.$node.addClass(cp+"arrow-active");
		}
	},
	
	onArrowNodeClick: function(event)
	{
		if (event.which === 1 && this.enabled)
		{
			if (this.menu)
				this.menu.toggle();
			this.onArrowClick(event);
		}
	},
	
	onArrowClick: function(event)
	{
		this.trigger("arrowClick", {event: event});
	},
	
	onDocumentMouseup: function(event)
	{
		if (event.which === 1)
		{
			this.$node.removeClass(cp+"active");
			this.$node.removeClass(cp+"arrow-active");
		}
	}
});

})(document, jQuery, hopjs);