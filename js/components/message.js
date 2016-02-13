/*!
 * hopjs.message
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
	
var cp = "hopjs-message-";

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
		self.layer.$node.addClass("hopjs-message");
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

		self.$buttons.toggleClass(cp+"buttons-left", align === "left");
		self.$buttons.toggleClass(cp+"buttons-center", align === "center");
		self.$buttons.toggleClass(cp+"buttons-right", align === "right");
	},

	generateHtml: function()
	{
		var self = this;
		hop.window.prototype.generateHtml.apply(self);
		self.$bottom.html('<div class="'+cp+'buttons"><button></button></div>');
		self.$buttons = $("div", self.$bottom);
		self.$button = $("button", self.$buttons);
		self.$button.addClass("hopjs-button");
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

})(jQuery, hopjs);