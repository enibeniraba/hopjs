/*!
 * hopjs.dialog
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

var cp = "hopjs-dialog-",
	_cp = "."+cp;

hopjs.types["dialog"] = "hopjs.dialog";

hopjs.dialog = function(params)
{
	hopjs.window.apply(this, arguments);
};

hopjs.inherit(hopjs.dialog, hopjs.window, {
	getDefaults: function()
	{
		return $.extend(hopjs.window.prototype.getDefaults.apply(this), {
			showBottom: true,
			buttonsAlign: "center",
			destroyOnHide: true
		});
	},

	create: function(params)
	{
		var self = this;
		hopjs.window.prototype.create.apply(self, arguments);
		self.layer.$node.addClass("hopjs-dialog");
		self.setButtonsAlign(self.buttonsAlign);
		if (params && params.buttons)
			self.setButtons(params.buttons);
	},

	setText: function(text)
	{
		this.text = text;
		if (this.$text)
			this.$text.html(text);
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

	setButtons: function(buttons)
	{
		this.removeButtons();
		for (var id in buttons)
			this.addButton(id, buttons[id]);
	},

	addButton: function(id, button)
	{
		var constructor, node;
		if (!(button instanceof hopjs.component))
		{
			var constructor = hopjs.getConstructor(button);
			if (constructor === null)
				throw console.log("Button's constructor is not found (id: "+id+").");

			button = new constructor(button);
		}
		if (!(button instanceof hopjs.button || button instanceof hopjs.splitButton))
			throw console.log("Invalid button instance. Expected instance of hopjs.button, hopjs.splitButton.");

		button.$node.addClass(cp+"button");
		this.$buttons.append(button.node);
		this.buttons[id] = button;
	},

	removeButtons: function()
	{
		for (var id in this.buttons)
			 this.buttons[id].$node.removeClass(cp+"button").detach();
		this.buttons = [];
	},

	generateHtml: function()
	{
		hopjs.window.prototype.generateHtml.apply(this);
		var self = this, html;
		html = '<div class="'+cp+'buttons"></div>';
		self.$bottom.html(html);
		self.$buttons = $("div", self.$bottom);
	},

	onHide: function()
	{
		hopjs.window.prototype.onHide.apply(this);
		if (this.destroyOnHide)
			this.destroy();
	}
});

})(jQuery, hopjs);