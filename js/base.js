/*!
 * hopjs v@VERSION
 *
 * JavaScript UI library
 *
 * (c) @AUTHOR
 * Released under the MIT license
 *
 * Date: @DATE
 */

(function(window, document, $, undefined)
{

hopjs = {
	version: "@VERSION",

	def: function(value)
	{
		return (value !== undefined);
	},

	ifDef: function(value, alt)
	{
		if (!def(alt))
			alt = null;
		return (value !== undefined ? value : alt);
	},

	inherit: function(child, parent, proto)
	{
		var property, f;
		for (property in parent)
		{
			if (parent.hasOwnProperty(property))
				child[property] = parent[property];
		}
		if (Object.create)
			child.prototype = Object.create(parent.prototype);
		else
		{
			f = function(){};
			f.prototype = parent.prototype;
			child.prototype = new f();
		}
		child.prototype.constructor = child;
		child.parentClass = parent;
		if (proto)
		{
			for (property in proto)
			{
				if (proto.hasOwnProperty(property))
					child.prototype[property] = proto[property];
			}
		}
	},
	
	resolvePath: function(path)
	{
		var parts = path.split("."), i, parent = window;
		for (i in parts)
		{
			parent = parent[parts[i]];
			if (!hop.def(parent))
				return null;
		}
		return parent;
	}
};

var hop = hopjs, def = hop.def, ifDef = hop.ifDef;

hop.string = {
	padLeft: function(str, length, padStr)
	{
		str = String(str);
		var padLength = length-str.length;
		if (padLength < 1)
			return str;

		return ((hop.string.repeat(padStr, Math.ceil(padLength/padStr.length))).slice(0, padLength))+str;
	},

	padRight: function(str, length, padStr)
	{
		str = String(str);
		var padLength = length-str.length;
		if (padLength < 1)
			return str;

		return str+((hop.string.repeat(padStr, Math.ceil(padLength/padStr.length))).slice(0, padLength));
	},

	repeat: function(str, count)
	{
		var result = "", i;
		for (i = 0; i < count; i++)
			result += str;
		return result;
	},

	trim: function(str, chars)
	{
		if (def(chars))
			hop.string.regexQuote(chars);
		else
			chars = " \\s";
		var re = new RegExp("^["+chars+"]*(.*?)["+chars+"]*$"),
			matches = re.exec(str);
		return matches[1];
	},

	ltrim: function(str, chars)
	{
		if (def(chars))
			hop.string.regexQuote(chars);
		else
			chars = " \\s";
		var re = new RegExp("^["+chars+"]*(.*?)$"),
			matches = re.exec(str);
		return matches[1];
	},

	rtrim: function(str, chars)
	{
		if (def(chars))
			hop.string.regexQuote(chars);
		else
			chars = " \\s";
		var re = new RegExp("^(.*?)["+chars+"]*$"),
			matches = re.exec(str);
		return matches[1];
	},

	replace: function(from, to, str)
	{
		return str.replace(new RegExp(hop.string.regexQuote(from), "g"), to);
	},

	regexQuote: function(str)
	{
		return str.replace(new RegExp("[\\\\\.\\+\\-\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:]", "g"), "\\$&");
	},

	upperCaseFirstChar: function(str)
	{
		return str.substr(0, 1).toUpperCase()+str.substr(1);
	}
};

var monthNames = [
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
	monthNamesShort = [
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
	dayNames = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	],
	dayNamesShort = [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	],
	monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
	reMonthNames = monthNames.join("|"),
	reMonthNamesShort = monthNamesShort.join("|"),
	reDayNames = dayNames.join("|"),
	reDayNamesShort = monthNamesShort.join("|"),
	padLeft = hop.string.padLeft;

hop.time = {
	format: function(date, format)
	{
		var year = date.getFullYear(),
			month = date.getMonth(),
			weekNumber = hop.time.weekNumber(date),
			monthDate = date.getDate(),
			weekDay = date.getDay(),
			timezoneOffset = -date.getTimezoneOffset(),
			hours = date.getHours(),
			hours12 = hop.time.hours12(hours),
			result = "", i, chr, prevChr = null, a, b;
		for (i = 0; i < format.length; i++)
		{
			chr = format.charAt(i);
			if (prevChr === "\\")
			{
				result += chr;
				prevChr = null;
				continue;
			}
			else if (chr !== "\\")
			{
				switch (chr)
				{
					case "Y":
						result += year;
						break;
					case "y":
						result += year%100;
						break;
					case "o":
						result += weekNumber.year;
						break;
					case "L":
						result += (hop.time.yearIsLeap(year) ? "1" : "0");
						break;
					case "n":
						result += month+1;
						break;
					case "m":
						result += padLeft(month+1, 2, "0");
						break;
					case "F":
						result += monthNames[month];
						break;
					case "M":
						result += monthNamesShort[month];
						break;
					case "t":
						result += hop.time.yearMonthDays(year, month);
						break;
					case "W":
						result += weekNumber.week;
						break;
					case "j":
						result += monthDate;
						break;
					case "d":
						result += padLeft(monthDate, 2, "0");
						break;
					case "l":
						result += dayNames[weekDay];
						break;
					case "D":
						result += dayNamesShort[weekDay];
						break;
					case "N":
						result += (weekDay === 0 ? 7 : weekDay);
						break;
					case "S":
						result += hop.time.ordinalSuffix(monthDate);
						break;
					case "w":
						result += weekDay;
						break;
					case "z":
						result += hop.time.yearDay(date);
						break;
					case "g":
						result += hours12;
						break;
					case "G":
						result += hours;
						break;
					case "h":
						result += padLeft(hours12, 2, "0");
						break;
					case "H":
						result += padLeft(hours, 2, "0");
						break;
					case "i":
						result += padLeft(date.getMinutes(), 2, "0");
						break;
					case "s":
						result += padLeft(date.getSeconds(), 2, "0");
						break;
					case "a":
						result += (hop.time.am(hours) ? "am" : "pm");
						break;
					case "A":
						result += (hop.time.am(hours) ? "AM" : "PM");
						break;
					case "O":
					case "P":
						result += (timezoneOffset < 0 ? "-" : "+");
						a = Math.abs(timezoneOffset);
						b = Math.floor(a/60);
						result += padLeft(b, 2, "0");
						if (chr === "P")
							result += ":";
						result += padLeft(a-b*60, 2, "0");
						break;
					case "Z":
						if (timezoneOffset < 0)
							result += "-";
						result += Math.abs(timezoneOffset)*60;
						break;
					case "c":
						result += hop.time.format(date, "Y-m-d\TH:i:sP");
						break;
					case "r":
						result += hop.time.format(date, "D, d M Y H:i:s O");
						break;
					default:
						result += chr;
				}
			}
			prevChr = chr;
		}
		return result;
	},

	parse: function(date, format)
	{
		if (date === "")
			return false;

		var i, j, chr, prevChr, str, regexp, matches, tmp, result,
			pos = 0, year = null, month = null, day = null,
			hours = null, hours12 = null, minutes = 0, seconds = 0, pm = false;
		for (i = 0; i < format.length; i++)
		{
			chr = format.charAt(i);
			if (prevChr === "\\")
			{
				prevChr = null;
				pos++;
				continue;
			}
			else if (chr !== "\\")
			{
				str = date.substr(pos);
				switch (chr)
				{
					case "Y":
						matches = str.match(/^([0-9]+)(.*)$/);
						if (!matches)
							return false;

						year = matches[1];
						pos += matches[1].length;
						break;
					case "n":
					case "m":
						matches = str.match(/^([0-9]{1,2})(.*)$/);
						if (!matches || matches[1] < 1 || matches[1] > 12)
							return false;

						month = matches[1]-1;
						pos += matches[1].length;
						break;
					case "F":
					case "M":
						regexp = new RegExp("^("+(chr === "F" ? reMonthNames : reMonthNamesShort)+")(.*)$");
						matches = regexp.exec(str);
						if (!matches)
							return false;

						month = null;
						tmp = (chr === "F" ? monthNames : monthNamesShort);
						for (j in tmp)
						{
							if (tmp[j] === matches[1])
							{
								month = j;
								break;
							}
						}
						if (month === null)
							return false;

						pos += matches[1].length;
						break;
					case "j":
					case "d":
						matches = str.match(/^([0-9]{1,2})(.*)$/);
						if (!matches || matches[1] < 1 || matches[1] > 31)
							return false;

						day = matches[1];
						pos += matches[1].length;
						break;
					case "l":
					case "D":
						regexp = new RegExp("^("+(chr === "F" ? reDayNames : reDayNamesShort)+")(.*)$");
						matches = regexp.exec(str);
						if (!matches)
							return false;

						day = null;
						tmp = (chr === "F" ? dayNames : dayNamesShort);
						for (j in tmp)
						{
							if (tmp[j] === matches[1])
							{
								day = j;
								break;
							}
						}
						if (day === null)
							return false;

						pos += matches[1].length;
						break;

					case "G":
					case "H":
						matches = str.match(/^([0-9]{1,2})(.*)$/);
						if (!matches || matches[1] > 23)
							return false;

						hours = matches[1];
						pos += matches[1].length;
						break;
					case "g":
					case "h":
						matches = str.match(/^([0-9]{1,2})(.*)$/);
						if (!matches || matches[1] < 1 || matches[1] > 12)
							return false;

						hours12 = matches[1];
						pos += matches[1].length;
						break;
					case "i":
						matches = str.match(/^([0-9]{1,2})(.*)$/);
						if (!matches || matches[1] > 59)
							return false;

						minutes = matches[1];
						pos += matches[1].length;
						break;
					case "s":
						matches = str.match(/^([0-9]{1,2})(.*)$/);
						if (!matches || matches[1] > 59)
							return false;

						seconds = matches[1];
						pos += matches[1].length;
						break;
					case "a":
					case "A":
						matches = str.match(/^(am|pm)(.*)$/i);
						if (!matches)
							return false;

						pm = (matches[1].toLowerCase() === "pm");
						pos += matches[1].length;
						break;
					case " ":
					case "\t":
						matches = str.match(/^(\s+)(.*)$/i);
						if (!matches)
							return false;

						pos += matches[1].length;
						break;
					default:
						if (chr !== str.charAt(0))
							return false;

						pos++;
				}
			}
			prevChr = chr;
		}
		if (year === null || month === null || day === null)
			return false;

		if (hours === null && hours12 !== null)
			hours = hop.time.hours24(hours12, pm);
		result = new Date(year, month, day, hours === null ? 0 : hours, minutes, seconds);
		if (month !== result.getMonth())
			return false;

		return result;
	},

	formatIs12Hour: function(format)
	{
		var i, chr, prevChr = null;
		for (i = 0; i < format.length; i++)
		{
			chr = format.charAt(i);
			if (prevChr === "\\")
			{
				prevChr = null;
				continue;
			}
			else
			{
				if (chr === "G" || chr === "H")
					return false;

				if (chr === "g" || chr === "h")
					return true;
			}
			prevChr = chr;
		}
		return null;
	},

	yearIsLeap: function(year)
	{
		return (year%4 === 0 && year%100 !== 0 || year%400 === 0);
	},

	yearDay: function(date)
	{
		var month = date.getMonth(),
			monthDays = hop.time.monthDaysList(date.getFullYear(), month),
			result = date.getDate()-1, i;
		for (i = 0; i < month; i++)
			result += monthDays[i];
		return result;
	},

	weekNumber: function(date)
	{
		var d = new Date(date.getTime()), start;
		d.setHours(0, 0, 0);
		d.setDate(d.getDate()+4-(d.getDay() || 7));
		start = new Date(d.getFullYear(), 0, 1);
		return {
			week: Math.ceil(((d-start)/86400000+1)/7),
			year: d.getFullYear()
		};
	},

	monthDaysList: function(year)
	{
		var result = monthDays.slice();
		if (hop.time.yearIsLeap(year))
			result[1]++;
		return result;
	},

	yearMonthDays: function(year, month)
	{
		var result = monthDays[month];
		if (month === 1 && hop.time.yearIsLeap(year))
			result++;
		return result;
	},

	monthDays: function(year, month)
	{
		return hop.time.yearMonthDays(year, month);
	},

	hours12: function(hours24)
	{
		return (hours24%12 || 12);
	},

	hours24: function(hours12, pm)
	{
		return (pm ? 1 : 0)*12+hours12%12;
	},

	am: function(hours)
	{
		return (hours < 12);
	},

	pm: function(hours)
	{
		return (hours > 11);
	},

	ordinalSuffix: function(i)
	{
		var j = i%10, k = i%100;
		if (j === 1 && k !== 11)
			return "st";

		if (j === 2 && k !== 12)
			return "nd";

		if (j === 3 && k !== 13)
			return "rd";

		return "th";
	}
};

hop.html = {
	quoteValue: function(value)
	{
		return hop.string.replace('"', "&quot;", value);
	}
};

hop.css = {
	transitionEasings: {
		linear: "linear",
		swing: "cubic-bezier(0.02, 0.01, 0.47, 1)",
		easeInQuad: "cubic-bezier(0.55, 0.085, 0.68, 0.53)",
		easeOutQuad: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
		easeInOutQuad: "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
		easeInCubic: "cubic-bezier(0.550, 0.055, 0.675, 0.190)",
		easeOutCubic: "cubic-bezier(0.215, 0.61, 0.355, 1)",
		easeInOutCubic: "cubic-bezier(0.645, 0.045, 0.355, 1)",
		easeInQuart: "cubic-bezier(0.895, 0.03, 0.685, 0.22)",
		easeOutQuart: "cubic-bezier(0.165, 0.84, 0.44, 1)",
		easeInOutQuart: "cubic-bezier(0.77, 0, 0.175, 1)",
		easeInQuint: "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
		easeOutQuint: "cubic-bezier(0.23, 1, 0.32, 1)",
		easeInOutQuint: "cubic-bezier(0.86, 0, 0.07, 1)",
		easeInSine: "cubic-bezier(0.47, 0, 0.745, 0.715)",
		easeOutSine: "cubic-bezier(0.39, 0.575, 0.565, 1)",
		easeInOutSine: "cubic-bezier(0.445, 0.05, 0.55, 0.95)",
		easeInExpo: "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
		easeOutExpo: "cubic-bezier(0.19, 1, 0.22, 1)",
		easeInOutExpo: "cubic-bezier(1, 0, 0, 1)",
		easeInCirc: "cubic-bezier(0.6, 0.04, 0.98, 0.335)",
		easeOutCirc: "cubic-bezier(0.075, 0.82, 0.165, 1)",
		easeInOutCirc: "cubic-bezier(0.785, 0.135, 0.15, 0.86)",
		easeInBack: "cubic-bezier(0.6, -0.28, 0.735, 0.045)",
		easeOutBack: "cubic-bezier(0.175, .885, 0.32, 1.275)",
		easeInOutBack: "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
	},

	getTransitionEasing: function(id)
	{
		return ifDef(hop.css.transitionEasings[id]);
	}
};

hop.dom = {
	insertAfter: function(node, targetNode)
	{
		var parentNode = targetNode.parentNode,
			nextNode = targetNode.nextSibling;
		if (nextNode)
			return parentNode.insertBefore(node, nextNode);
		
		return parentNode.appendChild(node);
	},
	
	maxZIndex: function(childNode)
	{
		if (!def(childNode))
			childNode = document.body;
		var topNode, node, style;
		if (childNode === document.body)
			topNode = childNode;
		else
		{
			node = childNode.parentNode;
			while (node && node !== document.body)
			{
				style = (window.getComputedStyle ? window.getComputedStyle(node, null) : node.currentStyle);
				if (style.zIndex !== "auto" && (style.position === "relative" || style.position === "absolute" || style.position === "fixed"))
				{
					topNode = node;
					break;
				}
				node = node.parentNode;
			}
			if (!topNode)
				topNode = document.body;
		}
		return hop.dom.maxChildZIndex(topNode);
	},

	maxChildZIndex: function(node)
	{
		if (!def(node))
			node = document.body;
		var func, result = {
				zIndex: 0,
				node: null
			};
		func = function(node)
		{
			var key, child, zIndex, style;
			for (key in node.childNodes)
			{
				child = node.childNodes[key];
				if (child.nodeType !== 1)
					continue;
				style = (window.getComputedStyle ? window.getComputedStyle(child, null) : child.currentStyle);
				if (style.zIndex !== "auto" && style.zIndex !== "inherit" && style.position !== "static")
				{
					zIndex = parseInt(style.zIndex);
					if (!isNaN(zIndex) && zIndex >= result.zIndex)
					{
						result.zIndex = zIndex;
						result.node = child;
					}
				}
				else if (child.childNodes.length > 0)
					func(child);
			}
		};
		func(node);
		return result;
	}
};

hop.browser = {
	animationInfo: function()
	{
		if (!def(hop.browser.animationInfoCache))
		{
			var elem = document.createElement("div"), key,
				transitions = {
					transition: "transitionend",
					OTransition: "oTransitionEnd",
					MozTransition: "transitionend",
					WebkitTransition: "webkitTransitionEnd",
					msTransition: "MSTransitionEnd"
				},
				transforms = {
					transform: "transform",
					OTransform: "-o-transform",
					MozTransform: "-moz-transform",
					WebkitTransform: "-webkit-transform",
					msTransform: "-ms-transform"
				},
				result = {
					transitionProperty: null,
					transitionendEvent: null,
					transformProperty: null,
					transformCssProperty: null
				};
			for (key in transitions)
			{
				if (def(elem.style[key]))
				{
					result.transitionProperty = key;
					result.transitionendEvent = transitions[key];
					break;
				}
			}
			for (key in transforms)
			{
				if (def(elem.style[key]))
				{
					result.transformProperty = key;
					result.transformCssProperty = transforms[key];
					break;
				}
			}
			hop.browser.animationInfoCache = result;
		}
		return hop.browser.animationInfoCache;
	},

	isOldOpera: function()
	{
		if (!def(hop.browser.isOldOperaCache))
			hop.browser.isOldOperaCache = /^Opera\//.test(navigator.userAgent);
		return hop.browser.isOldOperaCache;
	}
};

hop.configurable = function(params)
{
	this.construct(params);
};

hop.configurable.prototype = {
	construct: function(params)
	{
		var self = this;
		if (!params)
			params = {};
		self.defaults = self.getDefaults();
		self.virtualParams = self.getVirtualParams();
		self.setDefaults();
		self.configure(params);
	},

	getDefaults: function()
	{
		return {};
	},

	getVirtualParams: function()
	{
		return [];
	},
	
	setDefaults: function()
	{
		$.extend(true, this, this.defaults);
	},

	configure: function(params)
	{
		if (!params)
			return;

		var param, suffix;
		for (param in params)
		{
			if (def(this.defaults[param]) || $.inArray(param, this.virtualParams) !== -1)
			{
				suffix = hop.string.upperCaseFirstChar(param);
				if (typeof this["configure"+suffix] === "function")
					this["configure"+suffix](params[param]);
				else if (typeof this["set"+suffix] === "function")
					this["set"+suffix](params[param]);
				else
					this[param] = params[param];
			}
		}
	}
};

hop.component = function(params)
{
	this.construct(params);
};

hop.inherit(hop.component, hop.configurable, {
	version: null,

	construct: function(params)
	{
		var self = this;
		if (!params)
			params = {};
		self.defaults = {};
		self.virtualParams = [];
		self.events = [];
		self.created = false;
		self.create(params);
		self.created = true;
		self.trigger("create");
		self.afterCreate(params);
	},

	create: function(params)
	{
		this.init(params);
	},

	init: function(params)
	{
		var self = this;
		self.defaults = self.getDefaults();
		self.virtualParams = self.getVirtualParams();
		self.events = self.getEvents();
		self.setDefaults();
		self.configure(params);
		self.initEventHandlers(params);
	},

	getEvents: function()
	{
		return [];
	},

	initEventHandlers: function(params)
	{
		var self = this, length = self.events, key, i, handler, suffix;
		self.eventHandlers = {
			create: []
		};
		for (key in self.events)
			self.eventHandlers[self.events[key]] = [];
		if (!params)
			return;

		for (key in self.eventHandlers)
		{
			suffix = hop.string.upperCaseFirstChar(key);
			if (params["on"+suffix])
				self.on(key, params["on"+suffix], ifDef(params["on"+suffix+"Data"]));
			if (params["once"+key])
				self.one(key, params["once"+suffix], ifDef(params["once"+suffix+"Data"]));
		}
		if (!params.eventHandlers)
			return;

		for (key in params.eventHandlers)
		{
			if (self.eventHandlers[key])
			{
				for (i in params.eventHandlers)
				{
					handler = params.eventHandlers[key][i];
					self.on(key, handler.handler, ifDef(handler.data), handler.once);
				}
			}
		}
	},

	afterCreate: function(params)
	{
	},

	on: function(event, handler, data, once)
	{
		if (!def(this.eventHandlers[event]))
			return;

		this.eventHandlers[event].push({
			handler: handler,
			data: data,
			once: !!once
		});
	},

	once: function(event, handler, data)
	{
		this.on(event, handler, data, true);
	},

	off: function(event, handler)
	{
		if (!def(this.eventHandlers[event]))
			return;

		var handlers = this.eventHandlers[event], i;
		for (i in handlers)
		{
			if (handlers[i].handler === handler)
				delete handlers[i];
		}
	},

	trigger: function(event, eventData)
	{
		if (!def(this.eventHandlers[event]))
			return;

		var handlers = this.eventHandlers[event], i, result;
		for (i in handlers)
		{
			result = handlers[i].handler(this, eventData, handlers[i].data);
			if (handlers[i].once)
				delete handlers[i];
			if (result === false)
				break;
		}
	}
});

})(window, document, jQuery);