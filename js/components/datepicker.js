/*!
 * hopjs.datepicker
 *
 * This file is a part of hopjs v@VERSION
 *
 * (c) @AUTHOR
 * Released under the MIT license
 *
 * Date: @DATE
 */

(function(window, document, $, hop)
{

var def = hop.def,
	cp = "hopjs-datepicker-",
	_cp = "."+cp;

hop.datepicker = function(params)
{
	hop.component.apply(this, arguments);
};

hop.datepicker.i18n = {};

hop.inherit(hop.datepicker, hop.component, {
	version: "@VERSION",

	getDefaults: function()
	{
		return {
			locale: "",
			extraClass: "",
			container: null,
			layerParams: null,
			date: null,
			minDate: null,
			maxDate: null,
			minDatePicker: false,
			maxDatePicker: false,
			picked: true,
			titleFormat: "{m} {y}",
			otherMonths: true,
			firstWeekDay: null,
			showWeekNumber: false,
			maxDateScale: 2,
			showTime: false,
			shortTimeFormat: false,
			time12HourFormat: null,
			timePickerTimeout: 400,
			timePickerInterval: 50,
			todayButton: false,
			doneButton: false,
			cleanButton: false,
			titleAnimations: {},
			pickerAnimations: {},
			dateFormat: null,
			timeFormat: null,
			timeFormatShort: null,
			dateTimeFormat: null,
			input: null,
			inputButton: true,
			attachToInput: true,
			updateInputOnChange: true,
			updateInputOnDone: true,
			unpickOnInputClean: true,
			unpickOnInvalidInput: true,
			hideOnInputMousedown: false,
			button: null,
			attachToButton: true,
			useInputOpenClass: true,
			useButtonOpenClass: true,
			openClass: cp+"open",
			buttonMousedownAction: "",
			buttonClickAction: "toggle",
			hideOnDone: true,
			hideOnDocumentMousedown: true,
			updatePositionOnWindowResize: true,
			resetOnHidePickedOnly: false,
			doneOnDayPick: true,
			hideOnCleanClick: true
		};
	},

	getEvents: function()
	{
		return [
			"destroy",
			"show",
			"hide",
			"dateChange",
			"done",
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
			elementAlignX: "left",
			alignX: "left",
			alignY: "top",
			collisionX: "fit",
			collisionY: "flip",
			collisionElement: "window"
		};
	},

	getDefaultI18n: function()
	{
		return {
			dateFormat: "m/d/Y",
			timeFormat: "g:i:s a",
			timeFormatShort: "g:i a",
			dateTimeFormat: "{d}, {t}",
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
			done: "Done",
			clean: "Clean"
		};
	},

	create: function(params)
	{
		var self = this, date;
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
		self.time12HourFormatCache = null;
		self.time12HourFormatCacheFormat = "";
		self.dontUpdateDateHtml = false;
		hop.component.prototype.create.apply(self, arguments);
		if (self.locale === "")
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
			date = new Date();
			if (self.minDate !== null && date.getTime() < self.minDate.getTime())
			{
				date.setYear(self.minDate.getFullYear());
				date.setMonth(self.minDate.getMonth());
				date.setDate(self.minDate.getDate());
			}
			else if (self.maxDate !== null && date.getTime() > self.maxDate.getTime())
			{
				date.setYear(self.maxDate.getFullYear());
				date.setMonth(self.maxDate.getMonth());
				date.setDate(self.maxDate.getDate());
			}
			self.setDate(date);
			self.picked = false;
		}
		if (params && def(params.picked))
			self.picked = !!params.picked;
		self.generateHtml();
		self.showDayPicker();
		self.setShowTime(self.showTime);
		self.setShortTimeFormat(self.shortTimeFormat);
		self.setTime12HourFormat(self.time12HourFormat);
		self.setTodayButton(self.todayButton);
		self.setDoneButton(self.doneButton);
		self.setCleanButton(self.cleanButton);
		self.updateHtml();
		self.updateInput();
	},

	setLocale: function(locale)
	{
		var self = this;
		if (!def(locale))
			locale = "";
		if (typeof locale !== "string")
			return;

		self.locale = locale;
		self.i18n = {};
		$.extend(true, self.i18n, self.defaultI18n);
		if (locale !== "")
			self.buildI18n();
		if (self.node)
		{
			self.updateLocaleHtml();
			if (self.picker === "day")
				self.recreateDayPicker();
			self.updateHtml();
			self.updateInput();
		}
	},

	buildI18n: function()
	{
		if (hop.datepicker.i18n[this.locale])
			$.extend(true, this.i18n, hop.datepicker.i18n[this.locale]);
	},

	updateLocaleHtml: function()
	{
		var self = this;
		$(_cp+"button-current-time", self.node).attr("title", self.i18n.currentTime);
		$(_cp+"button-today", self.node).attr("title", self.i18n.today);
		$(_cp+"button-done", self.node).attr("title", self.i18n.done);
		$(_cp+"button-clean", self.node).attr("title", self.i18n.clean);
	},

	configureDate: function(date)
	{
		try
		{
			this.setDate(date);
		}
		catch (error)
		{
		}
	},

	setDate: function(date, pick)
	{
		var self = this;
		date = self.validateDate(date);
		if (self.minDate !== null && date.getTime() < self.minDate.getTime()
			|| self.maxDate !== null && date.getTime() > self.maxDate.getTime())
		{
			throw new Error("Date is out of range: "+date);
		}
		if (!self.date)
			self.date = new Date();
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

	configureMinDate: function(date)
	{
		try
		{
			this.setMinDate(date);
		}
		catch (error)
		{
		}
	},

	setMinDate: function(date)
	{
		var self = this, picked = self.picked;
		if (date === null)
			self.minDate = date;
		else
		{
			date = self.validateDate(date);
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			if (self.maxDate !== null && date.getTime() > self.maxDate.getTime())
				throw new Error("minDate can't be more than maxDate");

			self.minDate = new Date();
			self.minDate.setTime(date.getTime());
			if (self.date !== null && self.date.getTime() < self.minDate.getTime())
				self.setDay(self.minDate.getFullYear(), self.minDate.getMonth(), self.minDate.getDate());
		}
		self.updateHtml();
	},

	configureMaxDate: function(date)
	{
		try
		{
			this.setMaxDate(date);
		}
		catch (error)
		{
		}
	},

	setMaxDate: function(date)
	{
		var self = this, picked = self.picked;
		if (date === null)
			self.maxDate = date;
		else
		{
			date = self.validateDate(date);
			date.setHours(23);
			date.setMinutes(59);
			date.setSeconds(59);
			if (self.minDate !== null && date.getTime() < self.minDate.getTime())
				throw new Error("maxDate can't be less than minDate");

			self.maxDate = new Date();
			self.maxDate.setTime(date.getTime());
			if (self.date !== null && self.date.getTime() > self.maxDate.getTime())
				self.setDay(self.maxDate.getFullYear(), self.maxDate.getMonth(), self.maxDate.getDate());
		}
		self.updateHtml();
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
			$(self.node).toggleClass(cp+"show-week-number");
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
			$(_cp+"time-wrapper", self.node).css("display", value ? "block" : "none");
			if (self.picker === "time")
				self.showDayPicker();
			self.updateInput();
		}
	},

	setShortTimeFormat: function(value)
	{
		var self = this;
		self.shortTimeFormat = !!value;
		if (self.node)
		{
			if (self.picker === "time")
				self.recreateTimePicker();
			self.updateTimeHtml();
			self.updateInput();
		}
	},

	getTime12HourFormat: function()
	{
		var self = this;
		if (self.time12HourFormat !== null)
			return self.time12HourFormat;

		var format = self.getCurrentTimeFormat();
		if (self.time12HourFormatCacheFormat !== format)
		{
			self.time12HourFormatCache = self.formatIs12Hour(format);
			self.time12HourFormatCacheFormat = format;
		}
		return self.time12HourFormatCache;
	},

	setTime12HourFormat: function(value)
	{
		var self = this;
		if (value !== null)
			value = !!value;
		self.time12HourFormat = value;
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
			$(_cp+"button-today", this.node).css("display", value ? "block" : "none");
			this.checkButtons();
		}
	},

	setDoneButton: function(value)
	{
		this.doneButton = !!value;
		if (this.node)
		{
			$(_cp+"button-done", this.node).css("display", value ? "block" : "none");
			this.checkButtons();
		}
	},

	setCleanButton: function(value)
	{
		this.cleanButton = !!value;
		if (this.node)
		{
			$(_cp+"button-clean", this.node).css("display", value ? "block" : "none");
			this.checkButtons();
		}
	},

	checkButtons: function()
	{
		$(_cp+"buttons-wrapper", this.node).css("display", this.hasButtons() ? "block" : "none");
	},

	hasButtons: function()
	{
		return (this.todayButton || this.doneButton || this.cleanButton);
	},

	setInput: function(input)
	{
		var self = this;
		if (input && self.input === input)
			return;

		if (self.input)
		{
			if (self.button && self.button !== self.input)
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
		if (event.which === 1 && !this.hideOnInputMousedown)
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
		if (!self.setDateStr(self.input.value, true) && self.unpickOnInvalidInput)
		{
			self.picked = false;
			self.updateHtml();
			self.keyupInput = false;
		}
	},

	setButton: function(button)
	{
		var self = this;
		if (button && self.button === button)
			return;

		if (self.button)
		{
			if (self.input && self.input !== self.button)
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
		if (event.which !== 1)
			return;

		if (this.hideOnDocumentMousedown)
			this.mousedown = true;
		if (this.buttonMousedownAction === "show")
			this.show();
		else if (this.buttonMousedownAction === "hide")
			this.hide();
		else if (this.buttonMousedownAction === "toggle")
			this.toggle();
	},

	onButtonClick: function(event)
	{
		if (this.buttonMousedownAction !== "")
			return;

		if (this.buttonClickAction === "show")
			this.show();
		else if (this.buttonClickAction === "hide")
			this.hide();
		else if (this.buttonClickAction === "toggle")
			this.toggle();
	},

	generateHtml: function()
	{
		var self = this, node, layer, layerParams = {}, element, html;
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
		node.className = "hopjs-datepicker";
		if (self.extraClass !== "")
			node.className += " "+self.extraClass;
		if (self.showWeekNumber)
			node.className += " "+cp+"show-week-number";
		html = '\
<div class="{c}inner">\
	<div class="{c}head-wrapper">\
		<div class="{c}head">\
			<div class="{c}button {c}button-prev"></div>\
			<div class="{c}title-wrapper">\
				<div class="{c}title"></div>\
			</div>\
			<div class="{c}button {c}button-next"></div>\
		</div>\
	</div>\
	<div class="{c}body-wrapper">\
		<div class="{c}body"></div>\
	</div>\
	<div class="{c}time-wrapper">\
		<div class="{c}time">\
			<div class="{c}button {c}button-current-time" title="'+hop.html.quoteValue(self.i18n.currentTime)+'"></div>\
			<div class="{c}time-title">\
				<span class="{c}time-hours"></span><span class="{c}time-sep {c}time-sep-minutes">:</span><span class="{c}time-minutes"></span><span class="{c}time-sep {c}time-sep-seconds">:</span><span class="{c}time-seconds"></span><span class="{c}time-ampm"></span>\
			</div>\
			<div class="{c}button {c}button-zero-time" title="00:00:00"></div>\
		</div>\
	</div>\
	<div class="{c}buttons-wrapper">\
		<div class="{c}buttons">\
			<div class="{c}buttons-left">\
				<div class="{c}button {c}button-today" title="'+hop.html.quoteValue(self.i18n.today)+'"></div>\
			</div>\
			<div class="{c}buttons-right">\
				<div class="{c}button {c}button-clean" title="'+hop.html.quoteValue(self.i18n.clean)+'"></div>\
				<div class="{c}button {c}button-done" title="'+hop.html.quoteValue(self.i18n.done)+'"></div>\
			</div>\
		</div>\
	</div>\
</div>';
		self.node.innerHTML = hop.string.replace("{c}", cp, html);
		self.$title = $(_cp+"title", self.node);
		self.$body = $(_cp+"body", self.node);
		self.bodyNode = self.$body[0];

		$(_cp+"button-prev", node).on("click", function(event)
		{
			self.onPrevClick(event);
		});

		$(_cp+"button-next", node).on("click", function(event)
		{
			self.onNextClick(event);
		});

		$(_cp+"button-prev", node).on("mousedown", function(event)
		{
			self.onPrevMousedown(event);
		});

		$(_cp+"button-next", node).on("mousedown", function(event)
		{
			self.onNextMousedown(event);
		});

		$(_cp+"title-wrapper", node).on("mousedown", function(event)
		{
			self.onTitleMousedown(event);
		});

		$(_cp+"title-wrapper", node).on("click", function(event)
		{
			self.onTitleClick(event);
		});

		$(_cp+"button-current-time", node).on("click", function(event)
		{
			self.onCurrentTimeClick(event);
		});

		$(_cp+"button-zero-time", node).on("click", function(event)
		{
			self.onZeroTimeClick(event);
		});

		$(_cp+"time-title", node).on("mousedown", function(event)
		{
			self.onTimeMousedown(event);
		});

		$(_cp+"time-title", node).on("click", function(event)
		{
			self.onTimeClick(event);
		});

		$(_cp+"button-today", node).on("click", function(event)
		{
			self.onTodayClick(event);
		});

		$(_cp+"button-done", node).on("click", function(event)
		{
			self.onDoneClick(event);
		});

		$(_cp+"button-clean", node).on("click", function(event)
		{
			self.onCleanClick(event);
		});

		if (layer)
		{
			layer.on("show", function(event)
			{
				self.onLayerShow();
			});

			layer.on("hide", function(event)
			{
				self.onLayerHide();
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

	onDoneClick: function(event)
	{
		this.done();
	},

	onCleanClick: function(event)
	{
		this.cleanInput();
		if (this.hideOnCleanClick)
			this.hide();
	},

	onLayerShow: function()
	{
		this.onShow();
	},

	onShow: function()
	{
		var self = this;
		if (self.input && self.useInputOpenClass)
			$(self.input).addClass(self.openClass);
		if (self.button && self.useButtonOpenClass)
			$(self.button).addClass(self.openClass);
		self.trigger("show");
	},

	onLayerHide: function()
	{
		this.onHide();
	},

	onHide: function()
	{
		var self = this;
		self.finishAnimations();
		if (self.picked || !self.resetOnHidePickedOnly)
			self.resetDateHtml();
		if (self.input && self.useInputOpenClass)
			$(self.input).removeClass(self.openClass);
		if (self.button && self.useButtonOpenClass)
			$(self.button).removeClass(self.openClass);
		self.trigger("hide");
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
		{
			if (this.layer.showingNext())
				this.show(showParams);
			else
				this.hide(hideParams);
		}
	},

	done: function()
	{
		var self = this;
		if (self.updateInputOnDone)
			self.updateInput();
		if (self.hideOnDone && self.layer)
			self.hide();
		self.onDone();
	},

	onDone: function()
	{
		this.trigger("done");
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
		this.dontUpdateDateHtml = true;
		this.setDate(date);
		this.dontUpdateDateHtml = false;
		if (!this.picked)
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

	parseDate: function(date, format)
	{
		return hop.time.parse(date, format);
	},

	formatIs12Hour: function(format)
	{
		return hop.time.formatIs12Hour(format);
	},

	getFormat: function()
	{
		return (this.showTime ? this.buildDateTimeFormat() : this.getDateFormat());
	},

	buildDateTimeFormat: function()
	{
		var result = this.getDateTimeFormat();
		result = hop.string.replace("{d}", this.getDateFormat(), result);
		return hop.string.replace("{t}", this.getCurrentTimeFormat(), result);
	},

	getDateTimeFormat: function()
	{
		return (this.dateTimeFormat ? this.dateTimeFormat : this.i18n.dateTimeFormat);
	},

	getDateFormat: function()
	{
		return (this.dateFormat ? this.dateFormat : this.i18n.dateFormat);
	},

	getCurrentTimeFormat: function()
	{
		return (this.shortTimeFormat ? this.getTimeFormatShort() : this.getTimeFormat());
	},

	getTimeFormat: function()
	{
		return (this.timeFormat ? this.timeFormat : this.i18n.timeFormat);
	},

	getTimeFormatShort: function()
	{
		return (this.timeFormatShort ? this.timeFormatShort : this.i18n.timeFormatShort);
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
		var date = this.parseDate(str, this.getFormat());
		if (!date)
			return false;

		this.setDate(date, pick);
		return true;
	},

	updateHtml: function()
	{
		this.updateDateHtml();
		this.updateTimeHtml();
	},

	updateDateHtml: function()
	{
		if (!this.node || this.dontUpdateDateHtml)
			return;

		var self = this, year = self.date.getFullYear(), month = self.date.getMonth();
		switch (self.picker)
		{
			case "day":
				if (year !== self.dayPickerYear || month !== self.dayPickerMonth)
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

		var self = this,
			hours = self.date.getHours();
		if (!def(updatePicker))
			updatePicker = true;
		$(_cp+"time-sep-seconds, "+_cp+"time-seconds", self.node).css("display", self.shortTimeFormat ? "none" : "inline");
		$(_cp+"time-ampm", self.node).css("display", self.getTime12HourFormat() ? "inline" : "none");
		$(_cp+"time-hours", self.node).html(self.getTime12HourFormat() ? hop.time.hours12(hours) : hours);
		$(_cp+"time-minutes", self.node).html(hop.string.padLeft(self.date.getMinutes(), 2, "0"));
		$(_cp+"time-seconds", self.node).html(hop.string.padLeft(self.date.getSeconds(), 2, "0"));
		$(_cp+"time-ampm", self.node).html(hop.time.am(hours) ? "am" : "pm");
		if (updatePicker && self.picker === "time")
			self.updateTimePicker();
	},

	resetDateHtml: function()
	{
		var self = this, year = self.date.getFullYear(), month = self.date.getMonth();
		if (self.picker !== "day")
			self.showDayPicker(year, month);
		else if (year !== self.dayPickerYear || month !== self.dayPickerMonth)
			self.changeDayPickerMonth(year, month);
	},

	createTitleInstance: function()
	{
		var node = document.createElement("div");
		node.className = cp+"title-instance";
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
		html = hop.string.replace("{y}", year, html);
		html = hop.string.replace("{m}", self.i18n.monthNames[month], html);
		node.innerHTML = html;
	},

	createDayPicker: function()
	{
		var self = this, node = document.createElement("div"),
			html, head = "", i, j;
		node.className = cp+"days";
		if (self.showWeekNumber)
			head += '<div class="{c}week-header" title="'+hop.html.quoteValue(self.i18n.week)+'"><div>'+self.i18n.weekShort+'</div></div>';
		for (i = 0; i < 7; i++)
		{
			j = (i+self.getFirstWeekDay())%7;
			head += '<div class="{c}day-header" title="'+hop.html.quoteValue(self.i18n.dayNames[j])+'"><div>'+self.i18n.dayNamesShort[j]+'</div></div>';
		}
		html = '<div class="{c}head">'+head+'</div><div class="{c}body"></div>';
		node.innerHTML = hop.string.replace("{c}", cp+"days-", html);
		self.$body.append(node);
		return node;
	},

	setDayPickerDate: function(node, year, month)
	{
		var self = this,
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
			minYear = null, minMonth = null, minDay = null,
			maxYear = null, maxMonth = null, maxDay = null,
			monthLastDay, prevMonthLastDay, prevYear, prevMonth, nextYear, nextMonth,
			day, dayYear, dayMonth, today, picked, pickedWeek, currentWeek, weekNode,
			weekNumberNode, dayNode, disabled, eventData, i, j,
			$body = $(_cp+"days-body", node);

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
			weekNode.className = cp+"days-week-"+i;
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
				if (self.showWeekNumber && j === 0)
				{
					date = new Date(dayYear, dayMonth, day);
					weekNumberNode = document.createElement("div");
					weekNumberNode.className = cp+"days-week-number";
					weekNumberNode.innerHTML = hop.time.weekNumber(date).week;
					weekNode.appendChild(weekNumberNode);
				}
				if (day === todayDay && dayMonth === todayMonth && dayYear === todayYear)
				{
					today = true;
					currentWeek = true;
				}
				if (day === pickedDay && pickedMonth === dayMonth && pickedYear === dayYear)
				{
					picked = true;
					pickedWeek = true;
				}
				dayNode = document.createElement("div");
				if (dayCount > 0 && dayCount <= monthLastDay || self.otherMonths)
				{
					disabled = (minDate !== null && (dayYear < minYear || dayYear === minYear && (dayMonth < minMonth || dayMonth === minMonth && day < minDay))
						|| maxDate !== null && (dayYear > maxYear || dayYear === maxYear && (dayMonth > maxMonth || dayMonth === maxMonth && day > maxDay)));
					dayNode.innerHTML = day;
					dayNode.className = cp+"days-day "+cp+"days-week-day-"+j
						+" "+cp+(day === dayCount ? "days-current-month" : "days-other-month");
					if (today)
					{
						dayNode.className += " "+cp+"days-today";
						dayNode.title = self.i18n.today;
					}
					if (picked)
						dayNode.className += " "+cp+"days-picked";
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
						dayNode.className += " "+cp+"days-disabled";
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
				weekNode.className += " "+cp+"days-current";
			if (pickedWeek)
				weekNode.className += " "+cp+"days-picked";
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
		if (this.doneOnDayPick)
			this.done();
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
		if (self.minDate !== null && !self.minDatePicker && (year < self.minDate.getFullYear() || year === self.minDate.getFullYear() && month < self.minDate.getMonth()))
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
		if (self.maxDate !== null && !self.maxDatePicker && (year > self.maxDate.getFullYear() || year === self.maxDate.getFullYear() && month > self.maxDate.getMonth()))
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
		node.className = cp+"months";
		this.$body.append(node);
		return node;
	},

	setMonthPickerDate: function(node, year)
	{
		var self = this,
			pickedYear = (self.picked ? self.date.getFullYear() : null),
			pickedMonth = (self.picked ? self.date.getMonth() : null),
			todayDate = new Date(),
			todayYear = todayDate.getFullYear(),
			todayMonth = todayDate.getMonth(),
			minDate = self.minDate, maxDate = self.maxDate,
			minYear = null, minMonth = null, maxYear = null, maxMonth = null,
			month = 0, current, picked, rowNode, monthNode, disabled, eventData, i, j,
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
				disabled = (minDate !== null && (year < minYear || year === minYear && month < minMonth)
					|| maxDate !== null && (year > maxYear || year === maxYear && month > maxMonth));
				monthNode = document.createElement("div");
				monthNode.innerHTML = self.i18n.monthNamesShort[month];
				monthNode.className = cp+"months-month-"+month;
				if (current)
					monthNode.className += " "+cp+"months-current";
				if (picked)
					monthNode.className += " "+cp+"months-picked";
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
					monthNode.className += " "+cp+"months-disabled";
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
		if (self.picker === "year" && scale === prevScale)
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
		self.yearPickerYearPrev = self.yearPickerYear;
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
		var firstYear = this.calcFirstYear(scale, year),
			lastYear = firstYear+Math.pow(10, scale+1);
		node.innerHTML = firstYear+" &ndash; "+lastYear;
	},

	createYearPicker: function()
	{
		var node = document.createElement("div");
		node.className = cp+"years";
		this.$body.append(node);
		return node;
	},

	setYearPickerDate: function(node, scale, startYear)
	{
		var self = this,
			pickedYear = (self.picked ? self.date.getFullYear() : null),
			todayDate = new Date(),
			todayYear = todayDate.getFullYear(),
			minDate = self.minDate, maxDate = self.maxDate,
			minYear = null, maxYear = null,
			count = -1, year, current, picked, rowNode, yearNode,
			multiplier = Math.pow(10, scale), disabled, eventData, i, j,
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
					yearNode.className = cp+"years-year "+cp+"years-year-"+year+" "+cp+"years-year-count-"+(count+1);
					if (current)
						yearNode.className += " "+cp+"years-current";
					if (picked)
						yearNode.className += " "+cp+"years-picked";
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
						yearNode.className += " "+cp+"years-disabled";
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
		var self = this, node = document.createElement("div"), html, $elem;
		node.className = cp+"time-picker";
		if (self.shortTimeFormat)
			node.className += " "+cp+"time-picker-short";
		html = '<div class="{c}inner">';
		html += '<div class="{c}hours"><div class="{c}button {c}plus" tabindex="-1"></div><div class="{c}value"><input type="text" maxlength="2" /></div><div class="{c}button {c}minus"></div></div>';
		html += '<div class="{c}minutes"><div class="{c}button {c}plus"></div><div class="{c}value"><input type="text" maxlength="2" /><div class="{c}colon">:</div></div><div class="{c}button {c}minus"></div></div>';
		if (!self.shortTimeFormat)
			html += '<div class="{c}seconds"><div class="{c}button {c}plus"></div><div class="{c}value"><input type="text" maxlength="2" /><div class="{c}colon">:</div></div><div class="{c}button {c}minus"></div></div>';
		if (self.getTime12HourFormat())
			html += '<div class="{c}ampm"><div class="{c}button"></div></div>';
		html += '</div>';
		node.innerHTML = hop.string.replace("{c}", cp+"time-picker-", html);
		self.$body.append(node);

		$elem = $(_cp+"time-picker-hours "+_cp+"time-picker-plus", node).on("mousedown", function(event)
		{
			self.onTimePickerHoursPlusMousedown(event);
		});
		$(_cp+"time-picker-hours "+_cp+"time-picker-minus", node).on("mousedown", function(event)
		{
			self.onTimePickerHoursMinusMousedown(event);
		});

		$elem = $(_cp+"time-picker-hours input", node);
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

		$(_cp+"time-picker-minutes "+_cp+"time-picker-plus", node).on("mousedown", function(event)
		{
			self.onTimePickerMinutesPlusMousedown(event);
		});
		$(_cp+"time-picker-minutes "+_cp+"time-picker-minus", node).on("mousedown", function(event)
		{
			self.onTimePickerMinutesMinusMousedown(event);
		});

		$elem = $(_cp+"time-picker-minutes input", node);
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

		if (!self.timeShort)
		{
			$(_cp+"time-picker-seconds "+_cp+"time-picker-plus", node).on("mousedown", function(event)
			{
				self.onTimePickerSecondsPlusMousedown(event);
			});
			$(_cp+"time-picker-seconds "+_cp+"time-picker-minus", node).on("mousedown", function(event)
			{
				self.onTimePickerSecondsMinusMousedown(event);
			});

			$elem = $(_cp+"time-picker-seconds input", node);
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

		if (self.getTime12HourFormat())
		{
			$(_cp+"time-picker-ampm "+_cp+"time-picker-button", node).on("click", function(event)
			{
				self.onTimePickerAmPmClick(event);
			});
		}

		return node;
	},

	setTimePickerDate: function(node, date)
	{
		var self = this, value;
		value = (self.getTime12HourFormat() ? hop.time.hours12(date.getHours()) : date.getHours());
		$(_cp+"time-picker-hours "+_cp+"time-picker-value input", node).val(value);
		value = hop.string.padLeft(date.getMinutes(), 2, "0");
		$(_cp+"time-picker-minutes "+_cp+"time-picker-value input", node).val(value);
		if (!self.timeShort)
		{
			value = hop.string.padLeft(date.getSeconds(), 2, "0");
			$(_cp+"time-picker-seconds "+_cp+"time-picker-value input", node).val(value);
		}
		if (self.getTime12HourFormat())
			$(_cp+"time-picker-ampm div", node).html(hop.time.am(date.getHours()) ? "am" : "pm");
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
		if (event.which !== 1)
			return;

		var self = this;
		document.activeElement.blur();
		event.preventDefault();
		self.runTimePickerTimer(function()
		{
			self.timePickerHoursPlus();
		});
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
		if (self.getTime12HourFormat())
		{
			hours = hop.time.hours12(self.date.getHours());
			self.timePickerUpdateAmPm();
		}
		$(_cp+"time-picker-hours input", self.pickerNode).val(hours);
		self.dateChange();
		self.updateTimeHtml(false);
	},

	timePickerUpdateAmPm: function()
	{
		$(_cp+"time-picker-ampm div", this.pickerNode).html(hop.time.am(this.date.getHours()) ? "am" : "pm");
	},

	onTimePickerHoursMinusMousedown: function(event)
	{
		if (event.which !== 1)
			return;

		var self = this;
		document.activeElement.blur();
		event.preventDefault();
		self.runTimePickerTimer(function()
		{
			self.timePickerHoursMinus();
		});
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
			$(_cp+"time-picker-hours input", self.pickerNode)[0].select();
		}, 10);
	},

	onTimePickerHoursBlur: function(event)
	{
		var self = this, hours = self.date.getHours();
		if (self.getTime12HourFormat())
			hours = hop.time.hours12(hours);
		$(_cp+"time-picker-hours input", self.pickerNode).val(hours);
	},

	onTimePickerHoursKeyup: function(event)
	{
		var self = this, $elem = $(_cp+"time-picker-hours input", self.pickerNode),
			value = $elem.val(), re = /^\d{0,2}$/, error = false;
		if (value === "")
			return;

		if (!re.exec(value))
			error = true;
		else
		{
			value = parseInt(value);
			if (value < (self.getTime12HourFormat() ? 1 : 0) || value > (self.getTime12HourFormat() ? 12 : 23))
				error = true;
			else
			{
				if (self.getTime12HourFormat())
					value = hop.time.hours24(value, hop.time.pm(self.date.getHours()));
				self.date.setHours(value);
				self.dateChange();
				self.updateTimeHtml(false);
			}
		}
		if (error)
			$elem.val(self.getTime12HourFormat() ? hop.time.hours12(self.date.getHours()) : self.date.getHours());
	},

	onTimePickerMinutesPlusMousedown: function(event)
	{
		if (event.which !== 1)
			return;

		var self = this;
		document.activeElement.blur();
		event.preventDefault();
		self.runTimePickerTimer(function()
		{
			self.timePickerMinutesPlus();
		});
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
		$(_cp+"time-picker-minutes input", self.pickerNode).val(hop.string.padLeft(minutes, 2, "0"));
		self.dateChange();
		self.updateTimeHtml(false);
	},

	onTimePickerMinutesMinusMousedown: function(event)
	{
		if (event.which !== 1)
			return;

		var self = this;
		document.activeElement.blur();
		event.preventDefault();
		self.runTimePickerTimer(function()
		{
			self.timePickerMinutesMinus();
		});
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
			$(_cp+"time-picker-minutes input", self.pickerNode)[0].select();
		}, 10);
	},

	onTimePickerMinutesBlur: function(event)
	{
		$(_cp+"time-picker-minutes input", this.pickerNode).val(hop.string.padLeft(this.date.getMinutes(), 2, "0"));
	},

	onTimePickerMinutesKeyup: function(event)
	{
		var self = this, $elem = $(_cp+"time-picker-minutes input", self.pickerNode),
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
		if (event.which !== 1)
			return;

		var self = this;
		document.activeElement.blur();
		event.preventDefault();
		self.runTimePickerTimer(function()
		{
			self.timePickerSecondsPlus();
		});
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
		$(_cp+"time-picker-seconds input", self.pickerNode).val(hop.string.padLeft(seconds, 2, "0"));
		self.dateChange();
		self.updateTimeHtml(false);
	},

	onTimePickerSecondsMinusMousedown: function(event)
	{
		if (event.which !== 1)
			return;

		var self = this;
		document.activeElement.blur();
		event.preventDefault();
		self.runTimePickerTimer(function()
		{
			self.timePickerSecondsMinus();
		});
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
			$(_cp+"time-picker-seconds input", self.pickerNode)[0].select();
		}, 10);
	},

	onTimePickerSecondsBlur: function(event)
	{
		$(_cp+"time-picker-seconds input", this.pickerNode).val(hop.string.padLeft(this.date.getSeconds(), 2, "0"));
	},

	onTimePickerSecondsKeyup: function(event)
	{
		var self = this, $elem = $(_cp+"time-picker-seconds input", self.pickerNode),
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
		var self = this, animation, type, params, animate = true, node = self.node;
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
			params = {};
			if (typeof animation === "string")
				type = animation;
			else
			{
				type = animation.type;
				if (animation.params)
					$.extend(true, params, animation.params);
			}
			if (hop.datepickerTitleAnimations[type])
			{
				$.extend(true, params, {
					id: animationId,
					datepicker: self,
					prevNode: prevTitleNode,
					nextNode: self.titleNode
				});
				self.titleAnimation = new hop.datepickerTitleAnimations[type](params);
				self.titleAnimation.start();
			}
		}
		if (!self.titleAnimation)
			$(prevTitleNode).remove();

		if (animate && self.pickerAnimations[animationId])
		{
			animation = self.pickerAnimations[animationId];
			params = {};
			if (typeof animation === "string")
				type = animation;
			else
			{
				type = animation.type;
				if (animation.params)
					$.extend(true, params, animation.params);
			}
			if (hop.datepickerPickerAnimations[type])
			{
				$.extend(true, params, {
					id: animationId,
					datepicker: self,
					prevNode: prevPickerNode,
					nextNode: self.pickerNode
				});
				self.pickerAnimation = new hop.datepickerPickerAnimations[type](params);
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

hop.datepickerAnimation = function(params)
{
	hop.configurable.apply(this, arguments);
};

hop.inherit(hop.datepickerAnimation, hop.configurable, {
	getDefaults: function()
	{
		return {
			id: null,
			datepicker: null,
			prevNode: null,
			nextNode: null
		};
	},
	
	start: function()
	{
	},

	finish: function()
	{
	}
});

if (!def(hop.datepickerTitleAnimations))
	hop.datepickerTitleAnimations = {};

if (!def(hop.datepickerPickerAnimations))
	hop.datepickerPickerAnimations = {};

if (!def(hop.datepickerAnimationPresets))
	hop.datepickerAnimationPresets = {};

hop.datepickerTitleAnimations.fade = function(params)
{
	hop.datepickerAnimation.apply(this, arguments);
};

hop.inherit(hop.datepickerTitleAnimations.fade, hop.datepickerAnimation, {
	getDefaults: function()
	{
		return $.extend(hop.datepickerAnimation.prototype.getDefaults.apply(this), {
			hideAnimation: false,
			showDuration: 200,
			hideDuration: 200,
			showEasing: "swing",
			hideEasing: "swing",
			interval: 5
		});
	},
	
	getVirtualParams: function()
	{
		return $.merge(hop.datepickerAnimation.prototype.getVirtualParams.apply(this), [
			"duration",
			"easing"
		]);
	},
	
	setDuration: function(duration)
	{
		this.showDuration = duration;
		this.hideDuration = duration;
	},
	
	setEasing: function(easing)
	{
		this.showEasing = easing;
		this.hideEasing = easing;
	},
	
	start: function()
	{
		this.realStart(this.datepicker.$title, "titleAnimation");
	},

	finish: function()
	{
		this.realFinish(this.datepicker.$title, "titleAnimation");
	},

	realStart: function($container, animationProperty)
	{
		var self = this, $prevNode = $(self.prevNode), $nextNode = $(self.nextNode),
			completeCount = 0, complete, intervalOrig = $.fx.interval,
			hideOptions = {}, showOptions = {};

		complete = function()
		{
			completeCount++;
			if (completeCount > 1)
			{
				$prevNode.remove();
				self.datepicker[animationProperty] = null;
				$nextNode.removeAttr("style");
				$container.removeAttr("style");
			}
		};

		hideOptions = {
			duration: self.hideDuration,
			easing: self.hideEasing,
			complete: complete
		};
		showOptions = {
			duration: self.showDuration,
			easing: self.showEasing,
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
		$.fx.interval = self.interval;
		if (self.hideAnimation)
			$prevNode.fadeOut(hideOptions);
		$nextNode.hide();
		$nextNode.fadeIn(showOptions);
		$.fx.interval = intervalOrig;
	},

	realFinish: function($container, animationProperty)
	{
		var self = this;
		$(self.prevNode).stop(true, true);
		$(self.nextNode).stop(true, true);
		$(self.prevNode).remove();
		$(self.nextNode).removeAttr("style");
		$container.removeAttr("style");
		self.datepicker[animationProperty] = null;
	}
});

hop.datepickerPickerAnimations.fade = function(params)
{
	hop.datepickerTitleAnimations.fade.apply(this, arguments);
};

hop.inherit(hop.datepickerPickerAnimations.fade, hop.datepickerTitleAnimations.fade, {
	start: function()
	{
		this.realStart(this.datepicker.$body, "pickerAnimation");
	},

	finish: function()
	{
		this.realFinish(this.datepicker.$body, "pickerAnimation");
	}
});

hop.datepickerAnimationPresets.fade = function(params)
{
	var animations = [
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
		result = {}, key,
		animationParams = (params && params.animationParams ? params.animationParams : {});
	for (key in animations)
	{
		result[animations[key]] = {
			type: "fade"
		};
		if (animationParams)
			result[animations[key]].params = animationParams;
	}
	return result;
};

})(window, document, jQuery, hopjs);