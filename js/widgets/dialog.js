/*!
 * hop.dialog
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

hop.dialog = function(params)
{
	hop.window.apply(this, arguments);
};

hop.dialog.i18n = {};

hop.inherit(hop.dialog, hop.window, {
	getDefaults: function()
	{
		return $.extend(hop.window.prototype.getDefaults.apply(this), {
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
		return $.merge(hop.window.prototype.getEvents.apply(this), [
			"yes",
			"no",
			"cancel"
		]);
	},

	getDefaultI18n: function()
	{
		return $.extend(true, {}, hop.window.prototype.getDefaultI18n.apply(this), {
			yes: "Yes",
			no: "No",
			cancel: "Cancel"
		});
	},

	create: function(params)
	{
		var self = this;
		hop.window.prototype.create.apply(self, arguments);
		self.layer.$node.addClass(self.classPrefix+"dialog");
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
		hop.window.prototype.buildI18n.apply(this);
		if (hop.dialog.i18n[this.locale])
			$.extend(true, this.i18n, hop.dialog.i18n[this.locale]);
	},

	updateLocaleHtml: function()
	{
		var self = this;
		hop.window.prototype.updateLocaleHtml.apply(self);
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

		self.$buttons.toggleClass(self.classPrefix+"dialog-buttons-left", align === "left");
		self.$buttons.toggleClass(self.classPrefix+"dialog-buttons-center", align === "center");
		self.$buttons.toggleClass(self.classPrefix+"dialog-buttons-right", align === "right");
	},

	generateHtml: function()
	{
		hop.window.prototype.generateHtml.apply(this);
		var self = this, html;
			classPrefix = self.classPrefix+"dialog-",
			dotClassPrefix = "."+classPrefix;
		html = '\
<div class="'+classPrefix+'buttons">\
	<button class="'+classPrefix+'button-yes"></button>\
	<button class="'+classPrefix+'button-no"></button>\
	<button class="'+classPrefix+'button-cancel"></button>\
</div>';
		self.$bottom.html(html);
		self.$buttons = $("div", self.$bottom);
		self.$buttonYes = $(dotClassPrefix+"button-yes", self.$buttons);
		self.$buttonNo = $(dotClassPrefix+"button-no", self.$buttons);
		self.$buttonCancel = $(dotClassPrefix+"button-cancel", self.$buttons);

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
		hop.window.prototype.onHideClick.apply(this, arguments);
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
		hop.window.prototype.onHide.apply(this);
		if (this.destroyOnHide)
			this.destroy();
	}
});

})(jQuery, hopjs);