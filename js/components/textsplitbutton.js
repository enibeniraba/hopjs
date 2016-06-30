/*!
 * hopjs.textSplitButton
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

var cp = "hopjs-button-",
	aligns = ["left", "center", "right"],
	verticalAligns = ["top", "middle", "bottom"],
	positions = ["top", "bottom", "left", "right"];

hop.textSplitButton = function(params)
{
	hop.splitButton.apply(this, arguments);
};

hop.inherit(hop.textSplitButton, hop.splitButton, {
	version: "@VERSION",

	getDefaults: function()
	{
		return $.extend(hop.splitButton.prototype.getDefaults.apply(this), {
			text: "",
			textAlign: "center",
			wrapText: true,
			icon: "",
			iconPosition: "left",
			iconSize: "16",
			simulateIconHeight: false,
			fixedIcon: false,
			align: "center",
			verticalAlign: "middle",
			size: ""
		});
	},

	create: function(params)
	{
		var self = this;
		hop.splitButton.prototype.create.apply(self, arguments);
		self.setText(self.text);
		self.setTextAlign(self.textAlign);
		self.setWrapText(self.wrapText);
		self.setIcon(self.icon);
		self.setIconPosition(self.iconPosition);
		self.setIconSize(self.iconSize);
		self.setSimulateIconHeight(self.simulateIconHeight);
		self.setFixedIcon(self.fixedIcon);
		self.setAlign(self.align);
		self.setVerticalAlign(self.verticalAlign);
		self.setSize(self.size);
	},

	setText: function(value)
	{
		this.text = String(value);
		if (this.node)
		{
			this.$text.html(this.text);
			this.$node.toggleClass(cp+"text", this.text !== "");
		}
	},

	setTextAlign: function(value)
	{
		value = String(value);
		if ($.inArray(value, aligns) !== -1)
		{
			if (this.node)
				this.$node.removeClass(cp+"text-align-"+this.textAlign);
			this.textAlign = value;
			if (this.node)
				this.$node.addClass(cp+"text-align-"+value);
		}
	},

	setWrapText: function(value)
	{
		this.wrapText = !!value;
		if (this.node)
			this.$node.toggleClass(cp+"text-nowrap", !this.wrapText);
	},

	setIcon: function(icon)
	{
		this.icon = String(icon);
		if (this.$node)
		{
			this.iconNode.style.backgroundImage = (this.icon === "" ? "" : "url("+this.icon+")");
			this.$node.toggleClass(cp+"icon", this.icon !== "");
			this.$node.toggleClass(cp+"icon-"+this.iconPosition, this.icon !== "");
		}
	},

	setIconPosition: function(value)
	{
		value = String(value);
		if ($.inArray(value, positions) !== -1)
		{
			if (this.node)
				this.$node.removeClass(cp+"icon-"+this.iconPosition);
			this.iconPosition = value;
			if (this.node && this.icon !== "")
				this.$node.addClass(cp+"icon-"+value);
		}
	},

	setIconSize: function(value)
	{
		value = String(value);
		if (this.$node)
			this.$node.removeClass(cp+"icon-size-"+this.iconSize);
		this.iconSize = String(value);
		if (this.$node && value !== "16")
			this.$node.addClass(cp+"icon-size-"+value);
	},

	setSimulateIconHeight: function(value)
	{
		this.simulateIconHeight = !!value;
		if (this.$node)
			this.$node.toggleClass(cp+"simulate-icon-height", this.simulateIconHeight);
	},

	setFixedIcon: function(value)
	{
		this.fixedIcon = !!value;
		if (this.$node)
			this.$node.toggleClass(cp+"fixed-icon", this.fixedIcon);
	},

	setAlign: function(value)
	{
		value = String(value);
		if ($.inArray(value, aligns) !== -1)
		{
			if (this.node)
				this.$node.removeClass(cp+"align-"+this.align);
			this.align = value;
			if (this.node)
				this.$node.addClass(cp+"align-"+value);
		}
	},

	setVerticalAlign: function(value)
	{
		value = String(value);
		if ($.inArray(value, verticalAligns) !== -1)
		{
			if (this.node)
				this.$node.removeClass(cp+"vertical-align-"+this.verticalAlign);
			this.verticalAlign = value;
			if (this.node)
				this.$node.addClass(cp+"vertical-align-"+value);
		}
	},

	setSize: function(value)
	{
		value = String(value);
		if (this.node && this.size !== "")
			this.$node.removeClass(cp+"size-"+this.size);
		this.size = value;
		if (this.node && value !== "")
			this.$node.addClass(cp+"size-"+value);
	},

	setContent: function(value)
	{
	},

	createClassName: function()
	{
		return hop.splitButton.prototype.createClassName()+" hopjs-textsplitbutton";
	},

	generateInnerHtml: function()
	{
		var self = this;
		self.$node.html('<span><span><span><span><i></i><span><span><span><span></span></span></span></span></span></span></span><div></div></span>');
		self.$content = $("> span > span", self.node);
		self.contentNode = self.$content[0];
		self.$arrow = $("> span > div", self.node);
		self.arrowNode = self.$arrow[0];
		self.$text = $("> span > span > span > span > span > span > span > span", self.node);
		self.textNode = self.$text[0];
		self.$icon = $("i", self.node);
		self.iconNode = self.$icon[0];
	}
});

})(jQuery, hopjs);