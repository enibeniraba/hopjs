/*!
 * hop.message
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

hop.message = function(params)
{
	hop.window.apply(this, arguments);
};

hop.inherit(hop.message, hop.window, {
	getDefaults: function()
	{
		return $.extend(hop.window.prototype.getDefaults.apply(this), {
			showBottom: true,
			buttonText: "OK",
			buttonsAlign: "center",
			destroyOnHide: true
		});
	},

	create: function(params)
	{
		var self = this;
		hop.window.prototype.create.apply(self, arguments);
		self.layer.$node.addClass(self.classPrefix+"message");
		self.setButtonText(self.buttonText);
		self.setButtonsAlign(self.buttonsAlign);
	},

	setButtonText: function(text)
	{
		this.buttonText = text;
		if (this.$button)
			this.$button.html(text);
	},

	setButtonsAlign: function(align)
	{
		if (align !== "left" && align !== "center" && align !== "right")
			return;

		var self = this;
		self.buttonsAlign = align;
		if (!self.$buttons)
			return;

		self.$buttons.toggleClass(self.classPrefix+"message-buttons-left", align === "left");
		self.$buttons.toggleClass(self.classPrefix+"message-buttons-center", align === "center");
		self.$buttons.toggleClass(self.classPrefix+"message-buttons-right", align === "right");
	},

	generateHtml: function()
	{
		hop.window.prototype.generateHtml.apply(this);
		var self = this;
			classPrefix = self.classPrefix+"message-",
			dotClassPrefix = "."+classPrefix;
		self.$bottom.html('<div class="'+classPrefix+'buttons"><button></button></div>');
		self.$buttons = $("div", self.$bottom);
		self.$button = $("button", self.$buttons);
		self.$button.on("click", function(event)
		{
			self.onButtonClick(event);
		});
	},

	onButtonClick: function(event)
	{
		this.hide();
	},

	onHide: function()
	{
		hop.window.prototype.onHide.apply(this);
		if (this.destroyOnHide)
			this.destroy();
	}
});

})(window, jQuery, hopjs);