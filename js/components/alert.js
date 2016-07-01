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

(function($, hopjs)
{

var cp = "hopjs-message-";

hopjs.types["message"] = "hopjs.message";

hopjs.message = function(params)
{
	hopjs.window.apply(this, arguments);
};

hopjs.inherit(hopjs.message, hopjs.window, {
	getDefaults: function()
	{
		return $.extend(hopjs.window.prototype.getDefaults.apply(this), {
			showBottom: true,
			buttonText: "OK",
			buttonsAlign: "center",
			destroyOnHide: true
		});
	},

	create: function(params)
	{
		var self = this;
		hopjs.window.prototype.create.apply(self, arguments);
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
		hopjs.window.prototype.generateHtml.apply(self);
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
		hopjs.window.prototype.onHide.apply(this);
		if (this.destroyOnHide)
			this.destroy();
	}
});

})(jQuery, hopjs);