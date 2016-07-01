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

hopjs.dialog = function(params)
{
	hopjs.window.apply(this, arguments);
};

hopjs.dialog.i18n = {};

hopjs.inherit(hopjs.dialog, hopjs.window, {
	getDefaults: function()
	{
		return $.extend(hopjs.window.prototype.getDefaults.apply(this), {
			showBottom: true,
			buttonTextYes: "",
			buttonTextNo: "",
			buttonTextCancel: "",
			showYes: true,
			showNo: true,
			showCancel: false,
			buttonsAlign: "center",
			destroyOnHide: true
		});
	},

	getEvents: function()
	{
		return $.merge(hopjs.window.prototype.getEvents.apply(this), [
			"yes",
			"no",
			"cancel"
		]);
	},

	getDefaultI18n: function()
	{
		return $.extend(true, {}, hopjs.window.prototype.getDefaultI18n.apply(this), {
			yes: "Yes",
			no: "No",
			cancel: "Cancel"
		});
	},

	create: function(params)
	{
		var self = this;
		hopjs.window.prototype.create.apply(self, arguments);
		self.layer.$node.addClass("hopjs-dialog");
		self.setButtonTextYes(self.buttonTextYes);
		self.setButtonTextNo(self.buttonTextNo);
		self.setButtonTextCancel(self.buttonTextCancel);
		self.setShowYes(self.showYes);
		self.setShowNo(self.showNo);
		self.setShowCancel(self.showCancel);
		self.setButtonsAlign(self.buttonsAlign);
	},

	buildI18n: function()
	{
		hopjs.window.prototype.buildI18n.apply(this);
		if (hopjs.dialog.i18n[this.locale])
			$.extend(true, this.i18n, hopjs.dialog.i18n[this.locale]);
	},

	updateLocaleHtml: function()
	{
		var self = this;
		hopjs.window.prototype.updateLocaleHtml.apply(self);
		self.$buttonYes.html(self.getButtonTextYes());
		self.$buttonNo.html(self.getButtonTextNo());
		self.$buttonCancel.html(self.getButtonTextCancel());
	},

	setText: function(text)
	{
		this.text = text;
		if (this.$text)
			this.$text.html(text);
	},

	setButtonTextYes: function(text)
	{
		this.buttonTextYes = text;
		if (this.$buttonYes)
			this.$buttonYes.html(this.getButtonTextYes());
	},

	getButtonTextYes: function()
	{
		return (this.buttonTextYes === "" ? this.i18n.yes : this.buttonTextYes);
	},

	setButtonTextNo: function(text)
	{
		this.buttonTextNo = text;
		if (this.$buttonNo)
			this.$buttonNo.html(this.getButtonTextNo());
	},

	getButtonTextNo: function()
	{
		return (this.buttonTextNo === "" ? this.i18n.no : this.buttonTextNo);
	},

	setButtonTextCancel: function(text)
	{
		this.buttonTextCancel = text;
		if (this.$buttonCancel)
			this.$buttonCancel.html(this.getButtonTextCancel());
	},

	getButtonTextCancel: function()
	{
		return (this.buttonTextCancel === "" ? this.i18n.cancel : this.buttonTextCancel);
	},

	setShowYes: function(value)
	{
		this.showYes = !!value;
		if (this.$buttonYes)
			this.$buttonYes.css({display: value ? "inline" : "none"});
	},

	setShowNo: function(value)
	{
		this.showNo = !!value;
		if (this.$buttonNo)
			this.$buttonNo.css({display: value ? "inline" : "none"});
	},

	setShowCancel: function(value)
	{
		this.showCancel = !!value;
		if (this.$buttonCancel)
			this.$buttonCancel.css({display: value ? "inline" : "none"});
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
		hopjs.window.prototype.generateHtml.apply(this);
		var self = this, html;
		html = '\
<div class="'+cp+'buttons">\
	<button class="hopjs-button '+cp+'button-yes"></button>\
	<button class="hopjs-button '+cp+'button-no"></button>\
	<button class="hopjs-button '+cp+'button-cancel"></button>\
</div>';
		self.$bottom.html(html);
		self.$buttons = $("div", self.$bottom);
		self.$buttonYes = $(_cp+"button-yes", self.$buttons);
		self.$buttonNo = $(_cp+"button-no", self.$buttons);
		self.$buttonCancel = $(_cp+"button-cancel", self.$buttons);

		self.$buttonYes.on("click", function(event)
		{
			self.onButtonYesClick(event);
		});

		self.$buttonNo.on("click", function(event)
		{
			self.onButtonNoClick(event);
		});

		self.$buttonCancel.on("click", function(event)
		{
			self.onButtonCancelClick(event);
		});
	},

	onHideClick: function(event)
	{
		this.onCancel();
		hopjs.window.prototype.onHideClick.apply(this, arguments);
	},

	onButtonYesClick: function(event)
	{
		this.trigger("yes");
		this.hide();
	},

	onYes: function()
	{
		this.trigger("yes");
	},

	onButtonNoClick: function(event)
	{
		this.onNo();
		this.hide();
	},

	onNo: function()
	{
		this.trigger("no");
	},

	onButtonCancelClick: function(event)
	{
		this.onCancel();
		this.hide();
	},

	onCancel: function()
	{
		this.trigger("cancel");
	},

	onHide: function()
	{
		hopjs.window.prototype.onHide.apply(this);
		if (this.destroyOnHide)
			this.destroy();
	}
});

})(jQuery, hopjs);