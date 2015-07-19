/*!
 * hop.datepicker
 *
 * This file is a part of hopjs v@VERSION
 *
 * (c) @AUTHOR
 * Released under the MIT license
 *
 * Date: @DATE
 */

(function(window, $, hop, undefined)
{

var def = hop.def, ifDef = hop.ifDef;

hop.datepicker = function(params)
{
	hop.widget.apply(this, arguments);
};

hop.datepicker.i18n = {};

hop.inherit(hop.datepicker, hop.widget, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			locale: null,
			className: null,
			classPrefix: "hop-",
			otherMonths: true,
			firstWeekDay: null,
			maxDateScale: 2,
			showWeekNumber: false,
			showTime: false,
			timeDetail: 2,
			timeFormat: null,
			titleAnimations: {},
			pickerAnimations: {},
			todayButton: false,
			applyButton: false,
			cleanButton: false,
			hideButton: false,
			date: null,
			dateFormat: null,
			datetimeFormat: null,
			titleFormat: "%m% %y%",
			minDate: null,
			maxDate: null,
			minDatePicker: false,
			maxDatePicker: false,
			picked: true,
			timePickerHolding: true,
			timePickerTimeout: 400,
			timePickerInterval: 50,
			container: null,
			layerParams: null,
			applyOnDayPick: true,
			hideOnApply: true,
			hideOnDocumentMousedown: true,
			updatePositionOnWindowResize: true,
			resetOnHidePickedOnly: false,
			input: null,
			inputButton: true,
			attachToInput: true,
			updateInputOnChange: true,
			updateInputOnApply: true,
			unpickOnInputClean: true,
			unpickOnBadInput: true,
			hideOnInputMousedown: false,
			hideOnCleanClick: true,
			cleanOnHideClick: false,
			button: null,
			attachToButton: true,
			showOnButtonMousedown: false,
			hideOnButtonMousedown: false,
			showOnButtonClick: true,
			hideOnButtonClick: true
		};
	},

	getEvents: function()
	{
		return [
			"destroy",
			"show",
			"hide",
			"dateChange",
			"apply",
			"dayPickerCreateDay",
			"monthPickerCreateMonth",
			"yearPickerCreateYear"
		];
	},

	getDefaultLayerParams: function()
	{
		return {
			position: "absolute",
			elementAlignY: "bottom",
			alignX: "right",
			alignY: "bottom",
			jailX: true,
			reverseY: true,
			borderElement: "window"
		};
	},

	getDefaultI18n: function()
	{
		return {
			dateFormat: "m/d/Y",
			timeFormat: 12,
			firstWeekDay: 0,
			monthNames: [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December"
			],
			monthNamesShort: [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec"
			],
			dayNames: [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday"
			],
			dayNamesShort: [
				"Su",
				"Mo",
				"Tu",
				"We",
				"Th",
				"Fr",
				"Sa"
			],
			week: "Week",
			weekShort: "W",
			today: "Today",
			currentTime: "Current time",
			apply: "Apply",
			clean: "Clean",
			hide: "Hide"
		};
	},

	create: function(params)
	{
		var self = this;
		self.defaultLayerParams = self.getDefaultLayerParams();
		self.defaultI18n = self.getDefaultI18n();
		self.mousedown = false;
		self.keyupInput = false;
		self.picker = null;
		self.titleNode = null;
		self.pickerNode = null;
		self.dayPickerYear = null;
		self.dayPickerMonth = null;
		self.monthPickerYear = null;
		self.yearPickerScale = 0;
		self.yearPickerYear = null;
		self.titleAnimation = null;
		self.pickerAnimation = null;
		hop.widget.prototype.create.apply(self, arguments);
		if (self.className === null)
			self.className = self.classPrefix+"datepicker";
		if (!self.locale)
			self.setLocale();
		if (self.input)
		{
			try
			{
				self.setDateStr(self.input.value);
			}
			catch (exception)
			{
			}
			if (!self.button && self.inputButton)
				self.setButton(self.input);
		}
		if (self.date === null)
		{
			self.setDate(new Date());
			self.picked = false;
		}
		if (params && def(params.picked))
			self.picked = !!params.picked;
		self.generateHtml();
		self.showDayPicker();
		self.setShowTime(self.showTime);
		self.setTimeDetail(self.timeDetail);
		self.setTimeFormat(self.timeFormat);
		self.setTodayButton(self.todayButton);
		self.setApplyButton(self.applyButton);
		self.setCleanButton(self.cleanButton);
		self.setHideButton(self.hideButton);
		self.updateHtml();
		if (self.picked && self.input)
			self.updateInput();
	},

	setLocale: function(locale)
	{
		var self = this;
		if (!def(locale) || locale === "" || locale === "default")
			locale = null;
		if (locale !== null && (typeof locale !== "string" || !hop.datepicker.i18n[locale]))
			return;

		self.locale = locale;
		self.i18n = {};
		$.extend(true, self.i18n, self.defaultI18n);
		if (locale !== null)
			$.extend(true, self.i18n, hop.datepicker.i18n[locale]);
		if (self.node)
		{
			self.updateLocaleHtml();
			if (self.picker === "day")
				self.recreateDayPicker();
			self.updateHtml();
			self.updateInput();
		}
	},

	updateLocaleHtml: function()
	{
		var self = this, dot_class_prefix = "."+self.classPrefix+"datepicker-";
		$(dot_class_prefix+"button-current-time", self.node).attr("title", self.i18n.currentTime);
		$(dot_class_prefix+"button-today", self.node).attr("title", self.i18n.today);
		$(dot_class_prefix+"button-apply", self.node).attr("title", self.i18n.apply);
		$(dot_class_prefix+"button-clean", self.node).attr("title", self.i18n.clean);
		$(dot_class_prefix+"button-hide", self.node).attr("title", self.i18n.hide);
	},

	setOtherMonths: function(value)
	{
		this.otherMonths = !!value;
		if (this.node && this.picker === "day")
			this.updateDayPicker();
	},

	getFirstWeekDay: function()
	{
		return (this.firstWeekDay === null ? this.i18n.firstWeekDay : this.firstWeekDay);
	},

	setFirstWeekDay: function(value)
	{
		this.firstWeekDay = value;
		if (this.node && this.picker === "day")
			this.recreateDayPicker();
	},

	setShowWeekNumber: function(value)
	{
		var self = this;
		self.showWeekNumber = !!value;
		if (self.node)
		{
			$(self.node).toggleClass(self.classPrefix+"datepicker-show-week-number");
			if (self.picker === "day")
				self.recreateDayPicker();
		}
	},

	setShowTime: function(value)
	{
		var self = this;
		self.showTime = !!value;
		if (self.node)
		{
			$("."+self.classPrefix+"datepicker-time-wrapper", self.node).css("display", value ? "block" : "none");
			if (self.picker === "time")
				self.showDayPicker();
			self.updateInput();
		}
	},

	setTimeDetail: function(value)
	{
		var self = this;
		self.timeDetail = value;
		if (self.node)
		{
			if (self.picker === "time")
				self.recreateTimePicker();
			self.updateTimeHtml();
			self.updateInput();
		}
	},

	getTimeFormat: function()
	{
		return (this.timeFormat === null ? (def(this.i18n) ? this.i18n.timeFormat : 24) : this.timeFormat);
	},

	setTimeFormat: function(value)
	{
		var self = this;
		self.timeFormat = value;
		if (self.node)
		{
			self.updateTimeHtml();
			if (self.picker === "time")
				self.recreateTimePicker();
			self.updateInput();
		}
	},

	setTodayButton: function(value)
	{
		this.todayButton = !!value;
		if (this.node)
		{
			$("."+this.classPrefix+"datepicker-button-today", this.node).css("display", value ? "block" : "none");
			this.checkButtons();
		}
	},

	setApplyButton: function(value)
	{
		this.applyButton = !!value;
		if (this.node)
		{
			$("."+this.classPrefix+"datepicker-button-apply", this.node).css("display", value ? "block" : "none");
			this.checkButtons();
		}
	},

	setCleanButton: function(value)
	{
		this.cleanButton = !!value;
		if (this.node)
		{
			$("."+this.classPrefix+"datepicker-button-clean", this.node).css("display", value ? "block" : "none");
			this.checkButtons();
		}
	},

	setHideButton: function(value)
	{
		this.hideButton = !!value;
		if (this.node)
		{
			$("."+this.classPrefix+"datepicker-button-hide", this.node).css("display", value ? "block" : "none");
			this.checkButtons();
		}
	},

	checkButtons: function()
	{
		$("."+this.classPrefix+"datepicker-buttons-wrapper", this.node).css("display", this.hasButtons() ? "block" : "none");
	},

	hasButtons: function()
	{
		return (this.todayButton || this.applyButton || this.cleanButton || this.hideButton);
	},

	setDate: function(date, pick)
	{
		var self = this;
		date = self.validateDate(date);
		if (!self.date)
			self.date = new Date();
		if (self.minDate !== null && date.getTime() < self.minDate.getTime()
			|| self.maxDate !== null && date.getTime() > self.maxDate.getTime())
		{
			return;
		}
		self.date.setTime(date.getTime());
		if (pick)
			self.picked = true;
		if (self.node && self.picked)
		{
			self.dateChange();
			self.updateHtml();
		}
	},

	validateDate: function(date)
	{
		var formats, i, parsedDate;
		if (typeof date === "string")
		{
			formats = ["", " H", " H:i", " H:i:s"];
			for (i in formats)
			{
				parsedDate = hop.time.parse(date, "Y-m-d"+formats[i]);
				if (parsedDate)
					break;
			}
			if (parsedDate)
				date = parsedDate;
		}
		if (!(date instanceof Date))
			throw new Error("Invalid date: "+date);

		return date;
	},

	setMinDate: function(date)
	{
		var self = this, prevTime, picked = self.picked;
		if (date === null)
			self.minDate = date;
		else
		{
			date = self.validateDate(date);
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			if (self.maxDate !== null && date > self.maxDate)
				return;

			self.minDate = new Date();
			self.minDate.setTime(date.getTime());
			if (self.date !== null && self.date.getTime() < self.minDate.getTime())
				self.setDay(self.minDate.getFullYear(), self.minDate.getMonth(), self.minDate.getDate());
		}
		self.updateHtml();
	},

	setMaxDate: function(date)
	{
		var self = this, prevTime, picked = self.picked;
		if (date === null)
			self.maxDate = date;
		else
		{
			date = self.validateDate(date);
			date.setHours(23);
			date.setMinutes(59);
			date.setSeconds(59);
			if (self.minDate !== null && date < self.minDate)
				return;

			self.maxDate = new Date();
			self.maxDate.setTime(date.getTime());
			if (self.date !== null && self.date.getTime() > self.maxDate.getTime())
				self.setDay(self.maxDate.getFullYear(), self.maxDate.getMonth(), self.maxDate.getDate());
		}
		self.updateHtml();
	},

	setInput: function(input)
	{
		var self = this;
		if (input && self.input == input)
			return;

		if (self.input)
		{
			if (self.button && self.button != self.input)
				self.input.removeAttribute("hopDatepicker");
			$(self.input).off("mousedown", self.inputMousedown);
			$(self.input).off("change", self.inputChange);
			$(self.input).off("keyup", self.inputKeyup);
			if (self.layer && !self.attachToButton && self.attachToInput)
			{
				self.layer.configure({
					element: null
				});
			}
		}
		self.input = input;
		if (!input)
			return;

		input.hopDatepicker = self;
		if (self.layer && !self.attachToButton && self.attachToInput)
		{
			self.layer.configure({
				element: input
			});
		}

		self.inputMousedown = function(event)
		{
			self.onInputMousedown(event);
		};
		$(self.input).on("mousedown", self.inputMousedown);

		self.inputChange = function(event)
		{
			self.onInputChange(event);
		};
		$(self.input).on("change", self.inputChange);

		self.inputKeyup = function(event)
		{
			self.onInputKeyup(event);
		};
		$(self.input).on("keyup", self.inputKeyup);
	},

	onInputMousedown: function(event)
	{
		if (event.which == 1 && !this.hideOnInputMousedown)
			this.mousedown = true;
	},

	onInputChange: function(event)
	{
		this.setDateStr(this.input.value, true);
	},

	onInputKeyup: function(event)
	{
		var self = this;
		self.keyupInput = true;
		if (!self.setDateStr(self.input.value, true) && self.unpickOnBadInput)
		{
			self.picked = false;
			self.updateHtml();
			self.keyupInput = false;
		}
	},

	setButton: function(button)
	{
		var self = this;
		if (button && self.button == button)
			return;

		if (self.button)
		{
			if (self.input && self.input != self.button)
				self.button.removeAttribute("hopDatepicker");
			$(self.button).off("mousedown", self.buttonMousedown);
			$(self.button).off("click", self.buttonClick);
			if (self.layer && self.attachToButton)
			{
				if (!self.attachToInput)
				{
					self.layer.configure({
						element: null
					});
				}
				else if (self.input)
				{
					self.layer.configure({
						element: self.input
					});
				}
			}
		}
		self.button = button;
		if (!button)
			return;

		button.hopDatepicker = self;
		if (self.layer)
		{
			self.layer.configure({
				element: button
			});
		}

		self.buttonMousedown = function(event)
		{
			self.onButtonMousedown(event);
		};
		$(self.button).on("mousedown", self.buttonMousedown);

		self.buttonClick = function(event)
		{
			self.onButtonClick(event);
		};
		$(self.button).on("click", self.buttonClick);
	},

	onButtonMousedown: function(event)
	{
		if (event.which != 1)
			return;

		var self = this;
		if (self.showOnDblclick || self.hideOnDblclick)
			event.preventDefault();
		if (self.showOnButtonMousedown)
		{
			if (self.hideOnButtonMousedown)
				self.toggle();
			else
				self.show();
		}
		else if (self.hideOnButtonMousedown)
			self.hide();
		self.mousedown = true;
	},

	onButtonClick: function(event)
	{
		var self = this;
		if (self.showOnButtonClick)
		{
			if (self.hideOnButtonClick)
				self.toggle();
			else
				self.show();
		}
		else if (self.hideOnButtonClick)
			self.hide();
	},

	generateHtml: function()
	{
		var self = this, node, layer, layerParams = {}, element, html, daysDead = '', i, j,
			dotClassPrefix = "."+self.classPrefix+"datepicker-";
		if (self.container)
		{
			layer = null;
			node = document.createElement("div");
			self.container.appendChild(node);
		}
		else
		{
			layerParams = $.extend(true, {}, self.defaultLayerParams);
			if (self.layerParams)
				$.extend(true, layerParams, self.layerParams);
			if (self.button && self.attachToButton)
				element = self.button;
			else if (self.input && self.attachToInput)
				element = self.input;
			if (element)
			{
				$.extend(true, layerParams, {
					element: element
				});
			}
			if (self.layerParams)
				$.extend(true, layerParams, self.layerParams);
			layer = new hop.layer(layerParams);
			layer.hopDatepicker = self;
			node = layer.node;
		}
		node.hopDatepicker = self;
		self.node = node;
		self.layer = layer;
		node.className = self.className;
		if (self.showWeekNumber)
			node.className += " "+self.classPrefix+"datepicker-show-week-number";
		html = '\
<div class="%c%inner">\
	<div class="%c%head-wrapper">\
		<div class="%c%head">\
			<div class="%c%button %c%button-prev"></div>\
			<div class="%c%title-wrapper">\
				<div class="%c%title"></div>\
			</div>\
			<div class="%c%button %c%button-next"></div>\
		</div>\
	</div>\
	<div class="%c%body-wrapper">\
		<div class="%c%body"></div>\
	</div>\
	<div class="%c%time-wrapper">\
		<div class="%c%time">\
			<div class="%c%button %c%button-current-time" title="'+hop.html.quoteValue(self.i18n.currentTime)+'"></div>\
			<div class="%c%time-title">\
				<span class="%c%time-hours"></span><span class="%c%time-sep %c%time-sep-minutes">:</span><span class="%c%time-minutes"></span><span class="%c%time-sep %c%time-sep-seconds">:</span><span class="%c%time-seconds"></span><span class="%c%time-ampm"></span>\
			</div>\
			<div class="%c%button %c%button-zero-time" title="00:00:00"></div>\
		</div>\
	</div>\
	<div class="%c%buttons-wrapper">\
		<div class="%c%buttons">\
			<div class="%c%buttons-left">\
				<div class="%c%button %c%button-today" title="'+hop.html.quoteValue(self.i18n.today)+'"></div>\
			</div>\
			<div class="%c%buttons-right">\
				<div class="%c%button %c%button-apply" title="'+hop.html.quoteValue(self.i18n.apply)+'"></div>\
				<div class="%c%button %c%button-clean" title="'+hop.html.quoteValue(self.i18n.clean)+'"></div>\
				<div class="%c%button %c%button-hide" title="'+hop.html.quoteValue(self.i18n.hide)+'"></div>\
			</div>\
		</div>\
	</div>\
</div>';
		self.node.innerHTML = hop.string.replace("%c%", self.classPrefix+"datepicker-", html);
		self.$title = $(dotClassPrefix+"title", self.node);
		self.$body = $(dotClassPrefix+"body", self.node);
		self.bodyNode = self.$body[0];

		$(dotClassPrefix+"button-prev", node).on("click", function(event)
		{
			self.onPrevClick(event);
		});

		$(dotClassPrefix+"button-next", node).on("click", function(event)
		{
			self.onNextClick(event);
		});

		$(dotClassPrefix+"button-prev", node).on("mousedown", function(event)
		{
			self.onPrevMousedown(event);
		});

		$(dotClassPrefix+"button-next", node).on("mousedown", function(event)
		{
			self.onNextMousedown(event);
		});

		$(dotClassPrefix+"title-wrapper", node).on("mousedown", function(event)
		{
			self.onTitleMousedown(event);
		});

		$(dotClassPrefix+"title-wrapper", node).on("click", function(event)
		{
			self.onTitleClick(event);
		});

		$(dotClassPrefix+"button-current-time", node).on("click", function(event)
		{
			self.onCurrentTimeClick(event);
		});

		$(dotClassPrefix+"button-zero-time", node).on("click", function(event)
		{
			self.onZeroTimeClick(event);
		});

		$(dotClassPrefix+"time-title", node).on("mousedown", function(event)
		{
			self.onTimeMousedown(event);
		});

		$(dotClassPrefix+"time-title", node).on("click", function(event)
		{
			self.onTimeClick(event);
		});

		$(dotClassPrefix+"button-today", node).on("click", function(event)
		{
			self.onTodayClick(event);
		});

		$(dotClassPrefix+"button-apply", node).on("click", function(event)
		{
			self.onApplyClick(event);
		});

		$(dotClassPrefix+"button-clean", node).on("click", function(event)
		{
			self.onCleanClick(event);
		});

		$(dotClassPrefix+"button-hide", node).on("click", function(event)
		{
			self.onHideClick(event);
		});

		if (layer)
		{
			layer.on("show", function(event)
			{
				self.onLayerShow();
			});

			layer.on("hide", function(event)
			{
				self.onLayeHide();
			});

			$(self.node).on("mousedown", function(event)
			{
				self.onLayerMousedown(event);
			});

			$(document).on("mousedown", function(event)
			{
				self.onDocumentMousedown(event);
			});

			$(window).on("resize", function(event)
			{
				self.onWindowResize(event);
			});
		}

		$(document).on("mouseup", function(event)
		{
			self.onDocumentMouseup(event);
		});
	},

	onPrevClick: function(event)
	{
		var self = this;
		switch (self.picker)
		{
			case "day":
				this.dayPickerPrev();
				break;
			case "month":
				self.monthPickerPrev();
				break;
			case "year":
				self.yearPickerPrev();
				break;
		}
	},

	onNextClick: function(event)
	{
		var self = this;
		switch (self.picker)
		{
			case "day":
				this.dayPickerNext();
				break;
			case "month":
				self.monthPickeNext();
				break;
			case "year":
				self.yearPickerNext();
				break;
		}
	},

	onPrevMousedown: function(event)
	{
		event.preventDefault();
	},

	onNextMousedown: function(event)
	{
		event.preventDefault();
	},

	onTitleClick: function(event)
	{
		var self = this;
		switch (self.picker)
		{
			case "day":
				if (self.maxDateScale > 0)
					self.showMonthPicker();
				break;
			case "month":
				if (self.maxDateScale > 1)
					self.showYearPicker(0);
				else
					self.showDayPicker();
				break;
			case "year":
				if (self.maxDateScale > 2+self.yearPickerScale)
					self.showYearPicker(self.yearPickerScale+1);
				else
					self.showDayPicker();
				break;
			case "time":
				self.showDayPicker();
				break;
		}
	},

	onTitleMousedown: function(event)
	{
		event.preventDefault();
	},

	onCurrentTimeClick: function(event)
	{
		this.currentTime();
	},

	onZeroTimeClick: function(event)
	{
		this.zeroTime();
	},

	onTimeClick: function(event)
	{
		this.toggleTimePicker();
	},

	onTimeMousedown: function(event)
	{
		event.preventDefault();
	},

	onTodayClick: function(event)
	{
		this.today();
	},

	onApplyClick: function(event)
	{
		this.apply();
	},

	onCleanClick: function(event)
	{
		this.cleanInput();
		if (this.hideOnCleanClick)
			this.hide();
	},

	onHideClick: function(event)
	{
		if (this.cleanOnHideClick && this.input)
			this.cleanInput();
		this.hide();
	},

	onLayerShow: function()
	{
		this.onShow();
	},

	onShow: function()
	{
		this.trigger("show");
	},

	onLayeHide: function()
	{
		this.finishAnimations();
		if (this.picked || !this.resetOnHidePickedOnly)
			this.resetDateHtml();
		this.onHide();
	},

	onHide: function()
	{
		this.trigger("hide");
	},

	onLayerMousedown: function(event)
	{
		this.layer.moveOnTop();
		if (this.hideOnDocumentMousedown)
			this.mousedown = true;
	},

	onDocumentMousedown: function(event)
	{
		if (this.hideOnDocumentMousedown)
		{
			if (this.mousedown)
			{
				this.mousedown = false;
				this.layer.moveOnTop();
			}
			else
				this.hide();
		}
	},

	onDocumentMouseup: function(event)
	{
		this.stopTimePickerTimer();
	},

	onWindowResize: function(event)
	{
		if (this.updatePositionOnWindowResize)
			this.layer.updatePosition(true);
	},

	show: function(params)
	{
		if (this.layer)
			this.layer.show(params);
	},

	hide: function(params)
	{
		if (this.layer)
			this.layer.hide(params);
	},

	toggle: function(showParams, hideParams)
	{
		if (this.layer)
			this.layer.toggle(showParams, hideParams);
	},

	apply: function()
	{
		var self = this;
		if (self.updateInputOnApply && self.input)
			self.updateInput();
		if (self.hideOnApply && self.layer)
			self.hide();
		self.onApply();
	},

	onApply: function()
	{
		this.trigger("apply");
	},

	setDay: function(year, month, day, pick)
	{
		var date = new Date(this.date.getTime());
		date.setDate(1);
		date.setFullYear(year);
		date.setMonth(month);
		date.setDate(day);
		this.setDate(date, pick);
	},

	today: function()
	{
		var date = new Date();
		this.setDay(date.getFullYear(), date.getMonth(), date.getDate(), true);
	},

	setTime: function(hours, minutes, seconds)
	{
		var date = new Date(this.date.getTime());
		date.setHours(hours);
		date.setMinutes(minutes);
		date.setSeconds(seconds);
		this.setDate(date);
		if (!self.picked)
			this.updateTimeHtml();
	},

	setHours: function(hours)
	{
		this.setTime(hours, this.date.getMinutes(), this.date.getSeconds());
	},

	setMinutes: function(minutes)
	{
		this.setTime(this.date.getHours(), minutes, this.date.getSeconds());
	},

	setSeconds: function(seconds)
	{
		this.setTime(this.date.getHours(), this.date.getMinutes(), seconds);
	},

	currentTime: function()
	{
		var date = new Date();
		this.setTime(date.getHours(), date.getMinutes(), date.getSeconds());
	},

	zeroTime: function()
	{
		this.setTime(0, 0, 0);
	},

	updateInput: function()
	{
		if (this.input && this.picked)
			this.input.value = this.formatDate();
	},

	formatDate: function()
	{
		return hop.time.format(this.date, this.getFormat());
	},

	getDateFormat: function()
	{
		return (this.dateFormat ? this.dateFormat : this.i18n.dateFormat);
	},

	getDatetimeFormat: function()
	{
		return (this.datetimeFormat ? this.datetimeFormat : this.buildDatetimeFormat());
	},

	buildDatetimeFormat: function()
	{
		var self = this, result = self.getDateFormat()+", ";
		result += (self.getTimeFormat() == 12 ? "h" : "H");
		if (self.timeDetail > 0)
			result += ":i";
		if (self.timeDetail > 1)
			result += ":s";
		if (self.getTimeFormat() == 12)
			result += " a";
		return result;
	},

	getFormat: function()
	{
		return (this.showTime ? this.getDatetimeFormat() : this.getDateFormat());
	},

	cleanInput: function()
	{
		if (this.input)
		{
			this.input.value = "";
			if (this.unpickOnInputClean)
			{
				this.picked = false;
				this.updateHtml();
			}
		}
	},

	setDateStr: function(str, pick)
	{
		var date = hop.time.parse(str, this.getFormat());
		if (!date)
			return false;

		this.setDate(date, pick);
		return true;
	},

	dateChange: function()
	{
		var self = this;
		if (self.input)
		{
			if (self.keyupInput)
				self.keyupInput = false;
			else if (self.updateInputOnChange)
				self.updateInput();
		}
		self.onDateChange();
	},

	onDateChange: function()
	{
		this.trigger("dateChange");
	},

	updateHtml: function()
	{
		this.updateDateHtml();
		this.updateTimeHtml();
	},

	updateDateHtml: function()
	{
		if (!this.node)
			return;

		var self = this, year = self.date.getFullYear(), month = self.date.getMonth();
		switch (self.picker)
		{
			case "day":
				if (year != self.dayPickerYear || month != self.dayPickerMonth)
					self.changeDayPickerMonth(year, month);
				else
				{
					self.updateDayPickerTitle();
					self.updateDayPicker();
				}
				break;
			case "month":
				self.updateMonthPicker();
				break;
			case "year":
				self.updateYearPicker();
				break;
		}
	},

	updateTimeHtml: function(updatePicker)
	{
		if (!this.node)
			return;

		var self = this, dotClassPrefix = "."+self.classPrefix+"datepicker-",
			hours = self.date.getHours(), value;
		if (!def(updatePicker))
			updatePicker = true;
		value = (self.getTimeFormat() == 12 ? hop.time.hours12(hours) : hours);
		$(dotClassPrefix+"time-sep-minutes, "+dotClassPrefix+"time-minutes", self.node).css("display", self.timeDetail > 0 ? "inline" : "none");
		$(dotClassPrefix+"time-sep-seconds, "+dotClassPrefix+"time-seconds", self.node).css("display", self.timeDetail > 1 ? "inline" : "none");
		$(dotClassPrefix+"time-ampm", self.node).css("display", self.getTimeFormat() == 12 ? "inline" : "none");
		$(dotClassPrefix+"time-hours", self.node).html(value);
		$(dotClassPrefix+"time-minutes", self.node).html(hop.string.padLeft(self.date.getMinutes(), 2, "0"));
		$(dotClassPrefix+"time-seconds", self.node).html(hop.string.padLeft(self.date.getSeconds(), 2, "0"));
		$(dotClassPrefix+"time-ampm", self.node).html(hop.time.am(hours) ? 'am' : 'pm');
		if (updatePicker && self.picker === "time")
			self.updateTimePicker();
	},

	resetDateHtml: function()
	{
		var self = this, year = self.date.getFullYear(), month = self.date.getMonth();
		if (self.picker != "day")
			self.showDayPicker(year, month);
		else if (year != self.dayPickerYear || month != self.dayPickerMonth)
			self.changeDayPickerMonth(year, month);
	},

	createTitleInstance: function()
	{
		var node = document.createElement("div");
		node.className = this.classPrefix+"datepicker-title-instance";
		this.$title.append(node);
		return node;
	},

	showDayPicker: function(year, month)
	{
		var self = this, titleNode, pickerNode, animationId, prevPicker = self.picker,
			prevTitleNode = self.titleNode, prevPickerNode = self.pickerNode;
		if (self.picker === "day")
			return;

		self.finishAnimations();
		if (!def(year))
			year = (self.dayPickerYear === null ? self.date.getFullYear() : self.dayPickerYear);
		if (!def(month))
			month = (self.dayPickerMonth === null ? self.date.getMonth() : self.dayPickerMonth);
		titleNode = self.createTitleInstance();
		self.setDayPickerTitleDate(titleNode, year, month);
		pickerNode = self.createDayPicker();
		self.setDayPickerDate(pickerNode, year, month);
		self.titleNode = titleNode;
		self.pickerNode = pickerNode;
		self.picker = "day";
		self.dayPickerYear = year;
		self.dayPickerMonth = month;
		if (prevPicker === "month")
			animationId = "monthDay";
		if (prevPicker === "year")
			animationId = "yearDay";
		if (prevPicker === "time")
			animationId = "timeHide";
		if (animationId)
			self.animate(animationId, prevTitleNode, prevPickerNode);
		else
		{
			$(prevTitleNode).remove();
			$(prevPickerNode).remove();
		}
	},

	setDayPickerTitleDate: function(node, year, month)
	{
		var self = this, html = self.titleFormat;
		html = hop.string.replace("%y%", year, html);
		html = hop.string.replace("%m%", self.i18n.monthNames[month], html);
		node.innerHTML = html;
	},

	createDayPicker: function()
	{
		var self = this, node = document.createElement("div"),
			html, head = "", i, j, classPrefix = self.classPrefix+"datepicker-";
		node.className = classPrefix+"days";
		if (self.showWeekNumber)
			head += '<div class="%c%week-header" title="'+hop.html.quoteValue(self.i18n.week)+'"><div>'+self.i18n.weekShort+'</div></div>';
		for (i = 0; i < 7; i++)
		{
			j = (i+self.getFirstWeekDay())%7;
			head += '<div class="%c%day-header" title="'+hop.html.quoteValue(self.i18n.dayNames[j])+'"><div>'+self.i18n.dayNamesShort[j]+'</div></div>';
		}
		html = '<div class="%c%head">'+head+'</div><div class="%c%body"></div>';
		node.innerHTML = hop.string.replace("%c%", classPrefix+"days-", html);
		self.$body.append(node);
		return node;
	},

	setDayPickerDate: function(node, year, month)
	{
		var self = this, classPrefix = self.classPrefix+"datepicker-days-",
			pickedYear = (self.picked ? self.date.getFullYear() : null),
			pickedMonth = (self.picked ? self.date.getMonth() : null),
			pickedDay = (self.picked ? self.date.getDate() : null),
			todayDate = new Date(),
			todayYear = todayDate.getFullYear(),
			todayMonth = todayDate.getMonth(),
			todayDay = todayDate.getDate(),
			date = new Date(year, month, 1),
			weekDayOfFirstMonthDay = (7+date.getDay()-self.getFirstWeekDay())%7,
			dayCount = 1-weekDayOfFirstMonthDay,
			minDate = self.minDate, maxDate = self.maxDate,
			minYear = minMonth = minDay = maxYear = maxMonth = maxDay = null,
			monthLastDay, prevMonthLastDay, prevYear, prevMonth, nextYear, nextMonth,
			day, dayYear, dayMonth, today, picked, pickedWeek, currentWeek, weekNode,
			weekNumberNode, dayNode, disabled, eventData, i, j,
			$body = $("."+classPrefix+"body", node);

		date = new Date(year, month+1, 1, -12, 0, 0);
		monthLastDay = date.getDate();

		date = new Date(year, month, 1, -12, 0, 0);
		prevMonthLastDay = date.getDate();
		prevYear = date.getFullYear();
		prevMonth = date.getMonth();

		date = new Date(year, month+1, 1);
		nextYear = date.getFullYear();
		nextMonth = date.getMonth();

		if (minDate !== null)
		{
			minYear = minDate.getFullYear();
			minMonth = minDate.getMonth();
			minDay = minDate.getDate();
		}
		if (maxDate !== null)
		{
			maxYear = maxDate.getFullYear();
			maxMonth = maxDate.getMonth();
			maxDay = maxDate.getDate();
		}

		$body.empty();
		for (i = 0; i < 6; i++)
		{
			weekNode = document.createElement("div");
			weekNode.className = classPrefix+"week-"+i;
			currentWeek = false;
			pickedWeek = false;
			for (j = 0; j < 7; j++)
			{
				today = false;
				picked = false;
				if (dayCount < 1)
				{
					day = prevMonthLastDay+dayCount;
					dayYear = prevYear;
					dayMonth = prevMonth;
				}
				else if (dayCount > monthLastDay)
				{
					day = dayCount-monthLastDay;
					dayYear = nextYear;
					dayMonth = nextMonth;
				}
				else
				{
					day = dayCount;
					dayYear = year;
					dayMonth = month;
				}
				if (self.showWeekNumber && j == 0)
				{
					date = new Date(dayYear, dayMonth, day);
					weekNumberNode = document.createElement("div");
					weekNumberNode.className = classPrefix+"week-number";
					weekNumberNode.innerHTML = hop.time.weekNumber(date).week;
					weekNode.appendChild(weekNumberNode);
				}
				if (day == todayDay && dayMonth == todayMonth && dayYear == todayYear)
				{
					today = true;
					currentWeek = true;
				}
				if (day === pickedDay && pickedMonth == dayMonth && pickedYear == dayYear)
				{
					picked = true;
					pickedWeek = true;
				}
				dayNode = document.createElement("div");
				if (dayCount > 0 && dayCount <= monthLastDay || self.otherMonths)
				{
					disabled = (minDate !== null && (dayYear < minYear || dayYear == minYear && (dayMonth < minMonth || dayMonth == minMonth && day < minDay))
						|| maxDate !== null && (dayYear > maxYear || dayYear == maxYear && (dayMonth > maxMonth || dayMonth == maxMonth && day > maxDay)));
					dayNode.innerHTML = day;
					dayNode.className = classPrefix+"day "+classPrefix+"week-day-"+j
						+" "+classPrefix+(day == dayCount ? "current-month" : "other-month");
					if (today)
					{
						dayNode.className += " "+classPrefix+"today";
						dayNode.title = self.i18n.today;
					}
					if (picked)
						dayNode.className += " "+classPrefix+"picked";
					eventData = {
						node: dayNode,
						year: dayYear,
						month: dayMonth,
						day: day,
						today: today,
						picked: picked,
						disabled: disabled
					};
					self.onDayPickerCreateDay(eventData);
					if (eventData.disabled)
						dayNode.className += " "+classPrefix+"disabled";
					else
					{
						$(dayNode).on("click", {year: dayYear, month: dayMonth, day: day}, function(event)
						{
							self.onDayClick(event);
						});
					}
				}
				weekNode.appendChild(dayNode);
				dayCount++;
			}
			if (currentWeek)
				weekNode.className += " "+classPrefix+"current";
			if (pickedWeek)
				weekNode.className += " "+classPrefix+"picked";
			$body.append(weekNode);
		}
	},

	recreateDayPicker: function()
	{
		var self = this, titleNode, pickerNode,
			prevTitleNode = self.titleNode, prevPickerNode = self.pickerNode;
		self.finishAnimations();
		titleNode = self.createTitleInstance();
		self.setDayPickerTitleDate(titleNode, self.dayPickerYear, self.dayPickerMonth);
		pickerNode = self.createDayPicker();
		self.setDayPickerDate(pickerNode, self.dayPickerYear, self.dayPickerMonth);
		self.titleNode = titleNode;
		self.pickerNode = pickerNode;
		self.picker = "day";
		$(prevTitleNode).remove();
		$(prevPickerNode).remove();
	},

	onDayPickerCreateDay: function(data)
	{
		this.trigger("dayPickerCreateDay", data);
	},

	onDayClick: function(event)
	{
		var data = event.data;
		this.setDay(data.year, data.month, data.day, true);
		if (this.applyOnDayPick)
			this.apply();
	},

	pickDate: function()
	{
		this.picked = true;
	},

	dayPickerPrev: function()
	{
		var self = this, month = self.dayPickerMonth-1, year = self.dayPickerYear;
		if (month < 0)
		{
			month = 11;
			year--;
			if (year < 0)
				return;
		}
		if (self.minDate !== null && !self.minDatePicker && (year < self.minDate.getFullYear() || year == self.minDate.getFullYear() && month < self.minDate.getMonth()))
			return;

		self.changeDayPickerMonth(year, month);
	},

	dayPickerNext: function()
	{
		var self = this, month = self.dayPickerMonth+1, year = self.dayPickerYear;
		if (month > 11)
		{
			month = 0;
			year++;
		}
		if (self.maxDate !== null && !self.maxDatePicker && (year > self.maxDate.getFullYear() || year == self.maxDate.getFullYear() && month > self.maxDate.getMonth()))
			return;

		self.changeDayPickerMonth(year, month);
	},

	changeDayPickerMonth: function(year, month)
	{
		var self = this, titleNode, pickerNode, animationId,
			prevTitleNode = self.titleNode, prevPickerNode = self.pickerNode;
		self.finishAnimations();
		titleNode = self.createTitleInstance();
		self.setDayPickerTitleDate(titleNode, year, month);
		pickerNode = self.createDayPicker();
		self.setDayPickerDate(pickerNode, year, month);
		self.titleNode = titleNode;
		self.pickerNode = pickerNode;
		animationId = (year*12+month > self.dayPickerYear*12+self.dayPickerMonth ? "dayNext" : "dayPrev");
		self.dayPickerYear = year;
		self.dayPickerMonth = month;
		self.animate(animationId, prevTitleNode, prevPickerNode);
	},

	updateDayPickerTitle: function()
	{
		this.setDayPickerTitleDate(this.titleNode, this.dayPickerYear, this.dayPickerMonth);
	},

	updateDayPicker: function()
	{
		this.setDayPickerDate(this.pickerNode, this.dayPickerYear, this.dayPickerMonth);
	},

	showMonthPicker: function(year)
	{
		var self = this, titleNode, pickerNode, animationId, prevPicker = self.picker,
			prevTitleNode = self.titleNode, prevPickerNode = self.pickerNode;
		if (self.picker === "month")
			return;

		self.finishAnimations();
		if (!def(year))
			year = self.dayPickerYear;
		titleNode = self.createTitleInstance();
		self.setMonthPickerTitleDate(titleNode, year);
		pickerNode = self.createMonthPicker();
		self.setMonthPickerDate(pickerNode, year);
		self.titleNode = titleNode;
		self.pickerNode = pickerNode;
		self.monthPickerYear = year;
		self.picker = "month";
		if (prevPicker === "day")
			animationId = "dayMonth";
		if (prevPicker === "year")
			animationId = "yearMonth";
		if (animationId)
			self.animate(animationId, prevTitleNode, prevPickerNode);
		else
		{
			$(prevTitleNode).remove();
			$(prevPickerNode).remove();
		}
	},

	setMonthPickerTitleDate: function(node, year)
	{
		node.innerHTML = year;
	},

	createMonthPicker: function()
	{
		var node = document.createElement("div");
		node.className = this.classPrefix+"datepicker-months";
		this.$body.append(node);
		return node;
	},

	setMonthPickerDate: function(node, year)
	{
		var self = this, classPrefix = self.classPrefix+"datepicker-months-",
			pickedYear = (self.picked ? self.date.getFullYear() : null),
			pickedMonth = (self.picked ? self.date.getMonth() : null),
			todayDate = new Date(),
			todayYear = todayDate.getFullYear(),
			todayMonth = todayDate.getMonth(),
			minDate = self.minDate, maxDate = self.maxDate,
			minYear = minMonth = maxYear = maxMonth = null,
			month = 0, current, picked, rowNode, monthNode, disabled, eventData,
			$node = $(node);
		if (minDate !== null)
		{
			minYear = minDate.getFullYear();
			minMonth = minDate.getMonth();
		}
		if (maxDate !== null)
		{
			maxYear = maxDate.getFullYear();
			maxMonth = maxDate.getMonth();
		}
		$node.empty();
		for (i = 0; i < 3; i++)
		{
			rowNode = document.createElement("div");
			for (j = 0; j < 4; j++)
			{
				current = (month === todayMonth && todayYear === year);
				picked = (month === pickedMonth && pickedYear === year);
				disabled = (minDate !== null && (year < minYear || year == minYear && month < minMonth)
					|| maxDate !== null && (year > maxYear || year == maxYear && month > maxMonth));
				monthNode = document.createElement("div");
				monthNode.innerHTML = self.i18n.monthNamesShort[month];
				monthNode.className = classPrefix+"month-"+month;
				if (current)
					monthNode.className += " "+classPrefix+"current";
				if (picked)
					monthNode.className += " "+classPrefix+"picked";
				monthNode.title = self.i18n.monthNames[month];
				eventData = {
					node: monthNode,
					year: year,
					month: month,
					current: current,
					picked: picked,
					disabled: disabled
				};
				self.onMonthPickerCreateMonth(eventData);
				if (eventData.disabled)
					monthNode.className += " "+classPrefix+"disabled";
				else
				{
					$(monthNode).on("click", {year: year, month: month}, function(event)
					{
						self.onMonthClick(event);
					});
				}
				rowNode.appendChild(monthNode);
				month++;
			}
			$node.append(rowNode);
		}
	},

	onMonthPickerCreateMonth: function(data)
	{
		this.trigger("monthPickerCreateMonth", data);
	},

	onMonthClick: function(event)
	{
		this.showDayPicker(event.data.year, event.data.month);
	},

	monthPickerPrev: function()
	{
		var year = this.monthPickerYear-1;
		if (this.minDate !== null && !this.minDatePicker && year < this.minDate.getFullYear())
			return;

		if (year >= 0)
			this.changeMonthPickerYear(year);
	},

	monthPickeNext: function()
	{
		var year = this.monthPickerYear+1;
		if (this.maxDate !== null && !this.maxDatePicker && year > this.maxDate.getFullYear())
			return;

		this.changeMonthPickerYear(year);
	},

	changeMonthPickerYear: function(year)
	{
		var self = this, titleNode, pickerNode, animationId,
			prevTitleNode = self.titleNode, prevPickerNode = self.pickerNode;
		self.finishAnimations();
		titleNode = self.createTitleInstance();
		self.setMonthPickerTitleDate(titleNode, year);
		pickerNode = self.createMonthPicker();
		self.setMonthPickerDate(pickerNode, year);
		self.titleNode = titleNode;
		self.pickerNode = pickerNode;
		animationId = (year > self.monthPickerYear ? "monthNext" : "monthPrev");
		self.monthPickerYear = year;
		self.animate(animationId, prevTitleNode, prevPickerNode);
	},

	updateMonthPickerTitle: function()
	{
		this.setMonthPickerTitleDate(this.titleNode, this.monthPickerYear);
	},

	updateMonthPicker: function()
	{
		this.setMonthPickerDate(this.pickerNode, this.monthPickerYear);
	},

	showYearPicker: function(scale, year)
	{
		var self = this, titleNode, pickerNode, animationId, prevPicker = self.picker,
			prevTitleNode = self.titleNode, prevPickerNode = self.pickerNode,
			prevScale = self.yearPickerScale;
		if (!def(scale))
			scale = 0;
		if (self.picker === "year" && scale == prevScale)
			return;

		self.finishAnimations();
		if (!def(year))
		{
			if (self.picker === "year")
				year = self.yearPickerYear;
			else if (self.picker === "month")
				year = self.monthPickerYear;
			else
				year = self.dayPickerYear;
		}
		year = self.calcFirstYear(scale, year);
		titleNode = self.createTitleInstance();
		self.setYearPickerTitleDate(titleNode, scale, year);
		pickerNode = self.createYearPicker();
		self.setYearPickerDate(pickerNode, scale, year);
		self.titleNode = titleNode;
		self.pickerNode = pickerNode;
		self.yearPickerScale = scale;
		self.yearPickerYear = year;
		self.picker = "year";
		if (prevPicker === "month")
			animationId = "monthYear";
		else if (prevPicker === "year")
			animationId = "year"+(scale > prevScale ? "Out" : "In");
		if (animationId)
			self.animate(animationId, prevTitleNode, prevPickerNode);
		else
		{
			$(prevTitleNode).remove();
			$(prevPickerNode).remove();
		}
	},

	setYearPickerTitleDate: function(node, scale, year)
	{
		firstYear = this.calcFirstYear(scale, year);
		lastYear = firstYear+Math.pow(10, scale+1);
		node.innerHTML = firstYear+' &ndash; '+lastYear;
	},

	createYearPicker: function()
	{
		var node = document.createElement("div");
		node.className = this.classPrefix+"datepicker-years";
		this.$body.append(node);
		return node;
	},

	setYearPickerDate: function(node, scale, startYear)
	{
		var self = this, classPrefix = self.classPrefix+"datepicker-years-",
			pickedYear = (self.picked ? self.date.getFullYear() : null),
			todayDate = new Date(),
			todayYear = todayDate.getFullYear(),
			minDate = self.minDate, maxDate = self.maxDate,
			minYear = maxYear = null,
			count = -1, year, current, picked, rowNode, yearNode,
			multiplier = Math.pow(10, scale), disabled, eventData,
			$node = $(node);
		if (minDate !== null)
			minYear = minDate.getFullYear();
		if (maxDate !== null)
			maxYear = maxDate.getFullYear();
		startYear = self.calcFirstYear(scale, startYear);
		if (scale > 0)
		{
			if (pickedYear !== null)
				pickedYear = self.calcFirstYear(scale-1, pickedYear);
			todayYear = self.calcFirstYear(scale-1, todayYear);
		}
		$node.empty();
		for (i = 0; i < 3; i++)
		{
			rowNode = document.createElement("div");
			for (j = 0; j < 4; j++)
			{
				year = startYear+count*multiplier;
				yearNode = document.createElement("div");
				if (year >= 0)
				{
					current = (year === todayYear);
					picked = (year === pickedYear);
					disabled = (minDate !== null && year+multiplier-1 < minYear || maxDate !== null && year > maxYear);
					yearNode.innerHTML = year;
					yearNode.className = classPrefix+"year "+classPrefix+"year-"+year+" "+classPrefix+"year-count-"+count;
					if (current)
						yearNode.className += " "+classPrefix+"current";
					if (picked)
						yearNode.className += " "+classPrefix+"picked";
					eventData = {
						node: yearNode,
						year: year,
						scale: scale,
						multiplier: multiplier,
						current: current,
						picked: picked,
						disabled: disabled
					};
					self.onYearPickerCreateYear(eventData);
					if (eventData.disabled)
						yearNode.className += " "+classPrefix+"disabled";
					else
					{
						$(yearNode).on("click", {year: year}, function(event)
						{
							self.onYearClick(event);
						});
					}
				}
				rowNode.appendChild(yearNode);
				count++;
			}
			$node.append(rowNode);
		}
	},

	onYearPickerCreateYear: function(data)
	{
		this.trigger("yearPickerCreateYear", data);
	},

	onYearClick: function(event)
	{
		var year = event.data.year;
		if (this.yearPickerScale > 0)
			this.showYearPicker(this.yearPickerScale-1, year);
		else
			this.showMonthPicker(year);
	},

	yearPickerPrev: function()
	{
		var self = this, year = self.yearPickerYear-Math.pow(10, self.yearPickerScale+1);
		if (self.minDate !== null && !self.minDatePicker && self.yearPickerYear <= self.minDate.getFullYear())
			return;

		if (year >= 0)
			self.changeYearPickerYear(year);
	},

	yearPickerNext: function()
	{
		var self = this, year = self.yearPickerYear+Math.pow(10, self.yearPickerScale+1);
		if (self.maxDate !== null && !self.maxDatePicker && year > self.maxDate.getFullYear())
			return;

		self.changeYearPickerYear(year);
	},

	changeYearPickerYear: function(year)
	{
		var self = this, scale = self.yearPickerScale, titleNode, pickerNode, animationId,
			prevTitleNode = self.titleNode, prevPickerNode = self.pickerNode;
		self.finishAnimations();
		year = self.calcFirstYear(scale, year);
		titleNode = self.createTitleInstance();
		self.setYearPickerTitleDate(titleNode, scale, year);
		pickerNode = self.createYearPicker();
		self.setYearPickerDate(pickerNode, scale, year);
		self.titleNode = titleNode;
		self.pickerNode = pickerNode;
		animationId = (year > self.yearPickerYear ? "yearNext" : "yearPrev");
		self.yearPickerYear = year;
		self.animate(animationId, prevTitleNode, prevPickerNode);
	},

	updateYearPickerTitle: function()
	{
		this.setYearPickerTitleDate(this.titleNode, this.yearPickerScale, this.yearPickerYear);
	},

	updateYearPicker: function()
	{
		this.setYearPickerDate(this.pickerNode, this.yearPickerScale, this.yearPickerYear);
	},

	calcFirstYear: function(scale, year)
	{
		var multiplier = Math.pow(10, scale+1);
		return Math.floor(year/multiplier)*multiplier;
	},

	toggleTimePicker: function()
	{
		if (this.picker === "time")
			this.showDayPicker();
		else
			this.showTimePicker();
	},

	showTimePicker: function()
	{
		var self = this, titleNode, pickerNode,
			prevTitleNode = self.titleNode, prevPickerNode = self.pickerNode;
		if (self.picker === "time")
			return;

		self.finishAnimations();
		titleNode = self.createTitleInstance();
		self.setDayPickerTitleDate(titleNode, self.dayPickerYear, self.dayPickerMonth);
		pickerNode = self.createTimePicker();
		self.setTimePickerDate(pickerNode, self.date);
		self.titleNode = titleNode;
		self.pickerNode = pickerNode;
		self.picker = "time";
		self.animate("timeShow", prevTitleNode, prevPickerNode);
	},

	createTimePicker: function()
	{
		var self = this, node = document.createElement("div"),
			html, head = "", i, j, classPrefix = self.classPrefix+"datepicker-", $elem;
		node.className = classPrefix+"time-picker "+classPrefix+"time-picker-"+self.timeDetail;
		html = '<div class="%c%inner">';
		html += '<div class="%c%hours"><div class="%c%button %c%plus" tabindex="-1"></div><div class="%c%value"><input type="text" maxlength="2" /></div><div class="%c%button %c%minus"></div></div>';
		if (self.timeDetail > 0)
			html += '<div class="%c%minutes"><div class="%c%button %c%plus"></div><div class="%c%value"><input type="text" maxlength="2" /><div class="%c%colon">:</div></div><div class="%c%button %c%minus"></div></div>';
		if (self.timeDetail > 1)
			html += '<div class="%c%seconds"><div class="%c%button %c%plus"></div><div class="%c%value"><input type="text" maxlength="2" /><div class="%c%colon">:</div></div><div class="%c%button %c%minus"></div></div>';
		if (self.getTimeFormat() == 12)
			html += '<div class="%c%ampm"><div class="%c%button"></div></div>';
		html += '</div>';
		node.innerHTML = hop.string.replace("%c%", classPrefix+"time-picker-", html);
		self.$body.append(node);

		$elem = $("."+classPrefix+"time-picker-hours ."+classPrefix+"time-picker-plus", node);
		$elem.on("mousedown", function(event)
		{
			self.onTimePickerHoursPlusMousedown(event);
		});
		$elem.on("click", function(event)
		{
			self.onTimePickerHoursPlusClick(event);
		});

		$elem = $("."+classPrefix+"time-picker-hours ."+classPrefix+"time-picker-minus", node);
		$elem.on("mousedown", function(event)
		{
			self.onTimePickerHoursMinusMousedown(event);
		});
		$elem.on("click", function(event)
		{
			self.onTimePickerHoursMinusClick(event);
		});

		$elem = $("."+classPrefix+"time-picker-hours input", node);
		$elem.on("focus click", function(event)
		{
			self.onTimePickerHoursFocus(event);
		});
		$elem.on("blur", function(event)
		{
			self.onTimePickerHoursBlur(event);
		});
		$elem.on("keyup change", function(event)
		{
			self.onTimePickerHoursKeyup(event);
		});
		if (self.timeDetail > 0)
		{
			$elem = $("."+classPrefix+"time-picker-minutes ."+classPrefix+"time-picker-plus", node);
			$elem.on("mousedown", function(event)
			{
				self.onTimePickerMinutesPlusMousedown(event);
			});
			$elem.on("click", function(event)
			{
				self.onTimePickerMinutesPlusClick(event);
			});

			$elem = $("."+classPrefix+"time-picker-minutes ."+classPrefix+"time-picker-minus", node);
			$elem.on("mousedown", function(event)
			{
				self.onTimePickerMinutesMinusMousedown(event);
			});
			$elem.on("click", function(event)
			{
				self.onTimePickerMinutesMinusClick(event);
			});

			$elem = $("."+classPrefix+"time-picker-minutes input", node);
			$elem.on("focus click", function(event)
			{
				self.onTimePickerMinutesFocus(event);
			});
			$elem.on("blur", function(event)
			{
				self.onTimePickerMinutesBlur(event);
			});
			$elem.on("keyup change", function(event)
			{
				self.onTimePickerMinutesKeyup(event);
			});
		}
		if (self.timeDetail > 1)
		{
			$elem = $("."+classPrefix+"time-picker-seconds ."+classPrefix+"time-picker-plus", node);
			$elem.on("mousedown", function(event)
			{
				self.onTimePickerSecondsPlusMousedown(event);
			});
			$elem.on("click", function(event)
			{
				self.onTimePickerSecondsPlusClick(event);
			});

			$elem = $("."+classPrefix+"time-picker-seconds ."+classPrefix+"time-picker-minus", node);
			$elem.on("mousedown", function(event)
			{
				self.onTimePickerSecondsMinusMousedown(event);
			});
			$elem.on("click", function(event)
			{
				self.onTimePickerSecondsMinusClick(event);
			});

			$elem = $("."+classPrefix+"time-picker-seconds input", node);
			$elem.on("focus click", function(event)
			{
				self.onTimePickerSecondsFocus(event);
			});
			$elem.on("blur", function(event)
			{
				self.onTimePickerSecondsBlur(event);
			});
			$elem.on("keyup change", function(event)
			{
				self.onTimePickerSecondsKeyup(event);
			});
		}
		if (self.getTimeFormat() == 12)
		{
			$("."+classPrefix+"time-picker-ampm ."+classPrefix+"time-picker-button", node).on("click", function(event)
			{
				self.onTimePickerAmPmClick(event);
			});
		}
		return node;
	},

	setTimePickerDate: function(node, date)
	{
		var self = this, classPrefix = self.classPrefix+"datepicker-time-picker-", value;
		value = (self.getTimeFormat() === 24 ? date.getHours() : hop.time.hours12(date.getHours()));
		$('.'+classPrefix+'hours .'+classPrefix+'value input', node).val(value);
		if (self.timeDetail > 0)
		{
			value = hop.string.padLeft(date.getMinutes(), 2, "0");
			$('.'+classPrefix+'minutes .'+classPrefix+'value input', node).val(value);
			if (self.timeDetail > 1)
			{
				value = hop.string.padLeft(date.getSeconds(), 2, "0");
				$('.'+classPrefix+'seconds .'+classPrefix+'value input', node).val(value);
			}
		}
		if (self.getTimeFormat() == 12)
			$('.'+classPrefix+'ampm div', node).html(hop.time.am(date.getHours()) ? 'am' : 'pm');
	},

	recreateTimePicker: function()
	{
		var self = this, titleNode, pickerNode,
			prevTitleNode = self.titleNode, prevPickerNode = self.pickerNode;
		self.finishAnimations();
		titleNode = self.createTitleInstance();
		self.setDayPickerTitleDate(titleNode, self.dayPickerYear, self.dayPickerMonth);
		pickerNode = self.createTimePicker();
		self.setTimePickerDate(pickerNode, self.date);
		self.titleNode = titleNode;
		self.pickerNode = pickerNode;
		self.picker = "time";
		self.animate("timeTime", prevTitleNode, prevPickerNode);
	},

	updateTimePicker: function()
	{
		this.setTimePickerDate(this.pickerNode, this.date);
	},

	onTimePickerHoursPlusMousedown: function(event)
	{
		if (event.which != 1)
			return;

		var self = this;
		document.activeElement.blur();
		event.preventDefault();
		if (self.timePickerHolding)
		{
			self.runTimePickerTimer(function()
			{
				self.timePickerHoursPlus();
			});
		}
	},

	onTimePickerHoursPlusClick: function(event)
	{
		if (!this.timePickerHolding)
			this.timePickerHoursPlus();
	},

	timePickerHoursPlus: function()
	{
		var hours = this.date.getHours();
		hours++;
		if (hours > 23)
			hours = 0;
		this.setTimePickerHours(hours);
	},

	setTimePickerHours: function(hours)
	{
		var self = this;
		self.date.setHours(hours);
		if (self.getTimeFormat() == 12)
		{
			hours = hop.time.hours12(self.date.getHours());
			self.timePickerUpdateAmPm();
		}
		$("."+self.classPrefix+"datepicker-time-picker-hours input", self.pickerNode).val(hours);
		self.dateChange();
		self.updateTimeHtml(false);
	},

	timePickerUpdateAmPm: function()
	{
		$("."+this.classPrefix+"datepicker-time-picker-ampm div", this.pickerNode).html(hop.time.am(this.date.getHours()) ? 'am' : 'pm');
	},

	onTimePickerHoursMinusMousedown: function(event)
	{
		if (event.which != 1)
			return;

		var self = this;
		document.activeElement.blur();
		event.preventDefault();
		if (self.timePickerHolding)
		{
			self.runTimePickerTimer(function()
			{
				self.timePickerHoursMinus();
			});
		}
	},

	onTimePickerHoursMinusClick: function(event)
	{
		if (!this.timePickerHolding)
			this.timePickerHoursMinus();
	},

	timePickerHoursMinus: function()
	{
		var hours = this.date.getHours();
		hours--;
		if (hours < 0)
			hours = 23;
		this.setTimePickerHours(hours);
	},

	onTimePickerHoursFocus: function(event)
	{
		var self = this;
		setTimeout(function()
		{
			$("."+self.classPrefix+"datepicker-time-picker-hours input", self.pickerNode)[0].select();
		}, 10);
	},

	onTimePickerHoursBlur: function(event)
	{
		var self = this, hours = self.date.getHours();
		if (self.getTimeFormat() == 12)
			hours = hop.time.hours12(hours);
		$("."+self.classPrefix+"datepicker-time-picker-hours input", self.pickerNode).val(hours);
	},

	onTimePickerHoursKeyup: function(event)
	{
		var self = this, $elem = $("."+self.classPrefix+"datepicker-time-picker-hours input", self.pickerNode),
			value = $elem.val(), re = /^\d{0,2}$/, error = false;
		if (value === "")
			return;

		if (!re.exec(value))
			error = true;
		else
		{
			value = parseInt(value);
			if (value < (self.getTimeFormat() == 12 ? 1 : 0) || value > (self.getTimeFormat() == 12 ? 12 : 23))
				error = true;
			else
			{
				if (self.getTimeFormat() == 12)
					value = hop.time.hours24(value, hop.time.pm(self.date.getHours()));
				self.date.setHours(value);
				self.dateChange();
				self.updateTimeHtml(false);
			}
		}
		if (error)
			$elem.val(self.getTimeFormat() == 12 ? hop.time.hours12(self.date.getHours()) : self.date.getHours());
	},

	onTimePickerMinutesPlusMousedown: function(event)
	{
		if (event.which != 1)
			return;

		var self = this;
		document.activeElement.blur();
		event.preventDefault();
		if (self.timePickerHolding)
		{
			self.runTimePickerTimer(function()
			{
				self.timePickerMinutesPlus();
			});
		}
	},

	onTimePickerMinutesPlusClick: function(event)
	{
		if (!this.timePickerHolding)
			this.timePickerMinutesPlus();
	},

	timePickerMinutesPlus: function()
	{
		var minutes = this.date.getMinutes();
		minutes++;
		if (minutes > 59)
			minutes = 0;
		this.setTimePickerMinutes(minutes);
	},

	setTimePickerMinutes: function(minutes)
	{
		var self = this;
		self.date.setMinutes(minutes);
		$("."+self.classPrefix+"datepicker-time-picker-minutes input", self.pickerNode).val(hop.string.padLeft(minutes, 2, "0"));
		self.dateChange();
		self.updateTimeHtml(false);
	},

	onTimePickerMinutesMinusMousedown: function(event)
	{
		if (event.which != 1)
			return;

		var self = this;
		document.activeElement.blur();
		event.preventDefault();
		if (self.timePickerHolding)
		{
			self.runTimePickerTimer(function()
			{
				self.timePickerMinutesMinus();
			});
		}
	},

	onTimePickerMinutesMinusClick: function(event)
	{
		if (!this.timePickerHolding)
			this.timePickerMinutesMinus();
	},

	timePickerMinutesMinus: function()
	{
		var minutes = this.date.getMinutes();
		minutes--;
		if (minutes < 0)
			minutes = 59;
		this.setTimePickerMinutes(minutes);
	},

	onTimePickerMinutesFocus: function(event)
	{
		var self = this;
		setTimeout(function()
		{
			$("."+self.classPrefix+"datepicker-time-picker-minutes input", self.pickerNode)[0].select();
		}, 10);
	},

	onTimePickerMinutesBlur: function(event)
	{
		$("."+this.classPrefix+"datepicker-time-picker-minutes input", this.pickerNode).val(hop.string.padLeft(this.date.getMinutes(), 2, "0"));
	},

	onTimePickerMinutesKeyup: function(event)
	{
		var self = this, $elem = $("."+self.classPrefix+"datepicker-time-picker-minutes input", self.pickerNode),
			value = $elem.val(), re = /^\d{0,2}$/, error = false;
		if (value === "")
			return;

		if (!re.exec(value))
			error = true;
		else
		{
			value = parseInt(value);
			if (value < 0 || value > 59)
				error = true;
			else
			{
				self.date.setMinutes(value);
				self.dateChange();
				self.updateTimeHtml(false);
			}
		}
		if (error)
			$elem.val(self.date.getMinutes());
	},

	onTimePickerSecondsPlusMousedown: function(event)
	{
		if (event.which != 1)
			return;

		var self = this;
		document.activeElement.blur();
		event.preventDefault();
		if (self.timePickerHolding)
		{
			self.runTimePickerTimer(function()
			{
				self.timePickerSecondsPlus();
			});
		}
	},

	onTimePickerSecondsPlusClick: function(event)
	{
		if (!this.timePickerHolding)
			this.timePickerSecondsPlus();
	},

	timePickerSecondsPlus: function()
	{
		var seconds = this.date.getSeconds();
		seconds++;
		if (seconds > 59)
			seconds = 0;
		this.setTimePickerSeconds(seconds);
	},

	setTimePickerSeconds: function(seconds)
	{
		var self = this;
		self.date.setSeconds(seconds);
		$("."+self.classPrefix+"datepicker-time-picker-seconds input", self.pickerNode).val(hop.string.padLeft(seconds, 2, "0"));
		self.dateChange();
		self.updateTimeHtml(false);
	},

	onTimePickerSecondsMinusMousedown: function(event)
	{
		if (event.which != 1)
			return;

		var self = this;
		document.activeElement.blur();
		event.preventDefault();
		if (self.timePickerHolding)
		{
			self.runTimePickerTimer(function()
			{
				self.timePickerSecondsMinus();
			});
		}
	},

	onTimePickerSecondsMinusClick: function(event)
	{
		if (!this.timePickerHolding)
			this.timePickerSecondsMinus();
	},

	timePickerSecondsMinus: function()
	{
		var seconds = this.date.getSeconds();
		seconds--;
		if (seconds < 0)
			seconds = 59;
		this.setTimePickerSeconds(seconds);
	},

	onTimePickerSecondsFocus: function(event)
	{
		var self = this;
		setTimeout(function()
		{
			$("."+self.classPrefix+"datepicker-time-picker-seconds input", self.pickerNode)[0].select();
		}, 10);
	},

	onTimePickerSecondsBlur: function(event)
	{
		$("."+this.classPrefix+"datepicker-time-picker-seconds input", this.pickerNode).val(hop.string.padLeft(this.date.getSeconds(), 2, "0"));
	},

	onTimePickerSecondsKeyup: function(event)
	{
		var self = this, $elem = $("."+self.classPrefix+"datepicker-time-picker-seconds input", self.pickerNode),
			value = $elem.val(), re = /^\d{0,2}$/, error = false;
		if (value === "")
			return;

		if (!re.exec(value))
			error = true;
		else
		{
			value = parseInt(value);
			if (value < 0 || value > 59)
				error = true;
			else
			{
				self.date.setSeconds(value);
				self.dateChange();
				self.updateTimeHtml(false);
			}
		}
		if (error)
			$elem.val(self.date.getSeconds());
	},

	onTimePickerAmPmClick: function(event)
	{
		var hours = this.date.getHours();
		this.setTimePickerHours(hours+(hop.time.am(hours) ? 12 : -12));
	},

	animate: function(animationId, prevTitleNode, prevPickerNode)
	{
		var self = this, animation, type, data, params = {}, animate = true, node = self.node;
		while (def(node.style))
		{
			if (node.style.display === "none")
			{
				animate = false;
				break;
			}
			node = node.parentNode;
		}
		if (animate && self.titleAnimations[animationId])
		{
			animation = self.titleAnimations[animationId];
			if (typeof animation === "string")
				type = animation;
			else
			{
				type = animation.type;
				if (animation.params)
					params = animation.params;
			}
			if (hop.datepickerTitleAnimations[type])
			{
				data = {
					prevNode: prevTitleNode,
					nextNode: self.titleNode
				};
				self.titleAnimation = new hop.datepickerAnimation(self, animationId, data, params);
				$.extend(self.titleAnimation, hop.datepickerTitleAnimations[type]);
				self.titleAnimation.start();
			}
		}
		if (!self.titleAnimation)
			$(prevTitleNode).remove();

		if (animate && self.pickerAnimations[animationId])
		{
			animation = self.pickerAnimations[animationId];
			if (typeof animation === "string")
				type = animation;
			else
			{
				type = animation.type;
				if (animation.params)
					params = animation.params;
			}
			if (hop.datepickerPickerAnimations[type])
			{
				data = {
					prevNode: prevPickerNode,
					nextNode: self.pickerNode
				};
				self.pickerAnimation = new hop.datepickerAnimation(self, animationId, data, params);
				$.extend(self.pickerAnimation, hop.datepickerPickerAnimations[type]);
				self.pickerAnimation.start();
			}
		}
		if (!self.pickerAnimation)
			$(prevPickerNode).remove();
	},

	finishAnimations: function()
	{
		var self = this;
		if (self.titleAnimation)
		{
			self.titleAnimation.finish();
			self.titleAnimation = null;
		}
		if (self.pickerAnimation)
		{
			self.pickerAnimation.finish();
			self.pickerAnimation = null;
		}
	},

	runTimePickerTimer: function(func)
	{
		var self = this;
		self.stopTimePickerTimer();
		func();
		self.timePickerTimeoutInstance = setTimeout(function()
		{
			func();
			self.timePickerIntervalInstance = setInterval(function()
			{
				func();
			}, self.timePickerInterval);
		}, self.timePickerTimeout);
	},

	stopTimePickerTimer: function()
	{
		var self = this;
		if (self.timePickerTimeoutInstance)
		{
			clearTimeout(self.timePickerTimeoutInstance);
			self.timePickerTimeoutInstance = null;
		}
		if (self.timePickerIntervalInstance)
		{
			clearInterval(self.timePickerIntervalInstance);
			self.timePickerIntervalInstance = null;
		}
	},

	destroy: function()
	{
		var self = this;
		self.setInput(null);
		self.setButton(null);
		if (self.layer)
			self.layer.destroy();
		else
			$(self.node).remove();
		self.onDestroy();
	},

	onDestroy: function()
	{
		this.trigger("destroy");
	}
});

hop.datepickerAnimation = function(datepicker, id, data, params)
{
	this.id = id;
	this.datepicker = datepicker;
	this.data = data || {};
	this.params = params || {};
};

hop.datepickerAnimation.prototype = {
	start: function()
	{
	},

	finish: function()
	{
	}
};

hop.datepickerTitleAnimations = {
	fade: {
		defaultParams: {
			hideAnimation: false,
			duration: 200,
			easing: "swing",
			interval: 5
		},

		start: function()
		{
			var self = this, params = self.params, defaultParams = self.defaultParams,
				$prevNode = $(self.data.prevNode),
				$nextNode = $(self.data.nextNode),
				hideAnimation = defaultParams.hideAnimation,
				duration = defaultParams.duration,
				easing = defaultParams.easing,
				interval = defaultParams.interval,
				completeCount = 0, complete, intervalOrig = $.fx.interval,
				hideOptions = {}, showOptions = {}, hideDuration, showDuration, hideEasing, showEasing;

			complete = function()
			{
				completeCount++;
				if (completeCount > 1)
				{
					$prevNode.remove();
					self.datepicker.titleAnimation = null;
					$nextNode.removeAttr("style");
					self.datepicker.$title.removeAttr("style");
				}
			};

			if (def(params.hideAnimation))
				hideAnimation = !!params.hideAnimation;

			if (def(params.duration))
				duration = params.duration;
			hideDuration = duration;
			if (def(params.hideDuration))
				hideDuration = params.hideDuration;
			showDuration = duration;
			if (def(params.showDuration))
				showDuration = params.showDuration;

			if (def(params.easing))
				easing = params.easing;
			hideEasing = easing;
			if (def(params.hideEasing))
				hideEasing = params.hideEasing;
			showEasing = easing;
			if (def(params.showEasing))
				showEasing = params.showEasing;

			if (def(params.interval))
				interval = params.interval;

			hideOptions = {
				duration: hideDuration,
				easing: hideEasing,
				complete: complete
			};
			showOptions = {
				duration: showDuration,
				easing: showEasing,
				complete: complete
			};

			$nextNode.hide();
			self.datepicker.$title.css({
				height: self.datepicker.$title.height(),
				width: self.datepicker.$title.width()
			});
			$nextNode.show();
			$prevNode.css({
				height: $prevNode.height(),
				width: $prevNode.width(),
				position: "absolute",
				top: 0,
				left: 0,
				"z-index": 0
			});
			$nextNode.css({
				height: $nextNode.height(),
				width: $nextNode.width(),
				position: "absolute",
				top: 0,
				left: 0,
				"z-index": 1
			});
			$.fx.interval = interval;
			if (hideAnimation)
				$prevNode.fadeOut(hideOptions);
			$nextNode.hide();
			$nextNode.fadeIn(showOptions);
			$.fx.interval = intervalOrig;
		},

		finish: function()
		{
			var self = this, data = self.data;
			$(data.prevNode).stop(true, true);
			$(data.nextNode).stop(true, true);
			$(data.prevNode).remove();
			$(data.nextNode).removeAttr("style");
			self.datepicker.$title.removeAttr("style");
			self.datepicker.titleAnimation = null;
		}
	}
};

hop.datepickerPickerAnimations = {
	fade: {
		defaultParams: {
			hideAnimation: false,
			duration: 200,
			easing: "swing",
			interval: 5
		},

		start: function()
		{
			var self = this, params = self.params, defaultParams = self.defaultParams,
				$prevNode = $(self.data.prevNode),
				$nextNode = $(self.data.nextNode),
				hideAnimation = defaultParams.hideAnimation,
				duration = defaultParams.duration,
				easing = defaultParams.easing,
				interval = defaultParams.interval,
				completeCount = 0, complete, intervalOrig = $.fx.interval,
				options = {}, hideOptions = {}, showOptions = {}, hideDuration, showDuration, hideEasing, showEasing;

			complete = function()
			{
				completeCount++;
				if (completeCount > 1)
				{
					$prevNode.remove();
					self.datepicker.pickerAnimation = null;
					$nextNode.removeAttr("style");
					self.datepicker.$body.removeAttr("style");
				}
			};

			if (def(params.hideAnimation))
				hideAnimation = !!params.hideAnimation;

			if (def(params.duration))
				duration = params.duration;
			hideDuration = duration;
			if (def(params.hideDuration))
				hideDuration = params.hideDuration;
			showDuration = duration;
			if (def(params.showDuration))
				showDuration = params.showDuration;

			if (def(params.easing))
				easing = params.easing;
			hideEasing = easing;
			if (def(params.hideEasing))
				hideEasing = params.hideEasing;
			showEasing = easing;
			if (def(params.showEasing))
				showEasing = params.showEasing;

			if (def(params.interval))
				interval = params.interval;

			hideOptions = {
				duration: hideDuration,
				easing: hideEasing,
				complete: complete
			};
			showOptions = {
				duration: showDuration,
				easing: showEasing,
				complete: complete
			};

			$nextNode.hide();
			self.datepicker.$body.css({
				height: self.datepicker.$body.height(),
				width: self.datepicker.$body.width()
			});
			$nextNode.show();
			$prevNode.css({
				height: $prevNode.height(),
				width: $prevNode.width(),
				position: "absolute",
				top: 0,
				left: 0,
				"z-index": 0
			});
			$nextNode.css({
				height: $nextNode.height(),
				width: $nextNode.width(),
				position: "absolute",
				top: 0,
				left: 0,
				"z-index": 1
			});
			$.fx.interval = interval;
			if (hideAnimation)
				$prevNode.fadeOut(hideOptions);
			$nextNode.hide();
			$nextNode.fadeIn(showOptions);
			$.fx.interval = intervalOrig;
		},

		finish: function()
		{
			var self = this, data = self.data;
			$(data.prevNode).stop(true, true);
			$(data.nextNode).stop(true, true);
			$(data.prevNode).remove();
			$(data.nextNode).removeAttr("style");
			self.datepicker.$body.removeAttr("style");
			self.datepicker.pickerAnimation = null;
		}
	}
};

hop.datepickerAnimationPresets = {
	fade: function(params)
	{
		var types = [
				"dayPrev",
				"dayNext",
				"dayMonth",
				"monthDay",
				"monthPrev",
				"monthNext",
				"monthYear",
				"yearMonth",
				"yearPrev",
				"yearNext",
				"yearOut",
				"yearIn",
				"yearDay",
				"timeShow",
				"timeHide"
			],
			animationParams, result = {}, i, animation;
		if (!params)
			params = {};
		if (params.animationParams)
			animationParams = params.animationParams;
		for (i in types)
		{
			animation = {
				type: "fade"
			};
			if (animationParams)
				animation.params = animationParams;
			result[types[i]] = animation;
		}
		return result;
	}
};

})(window, jQuery, hopjs);