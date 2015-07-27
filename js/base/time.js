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
						result += (hop.time.am(hours) ? 'am' : 'pm');
						break;
					case "A":
						result += (hop.time.am(hours) ? 'AM' : 'PM');
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

		var i, j, chr, prevChr, str, regexp, matches, result,
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
							if (tmp[j] == matches[1])
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
							if (tmp[j] == matches[1])
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

						pm = (matches[1].toLowerCase() == "pm");
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
		if (month != result.getMonth())
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
		result = monthDays.slice();
		if (hop.time.yearIsLeap(year))
			result[1]++;
		return result;
	},

	yearMonthDays: function(year, month)
	{
		result = monthDays[month];
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
		if (j == 1 && k != 11)
			return "st";

		if (j == 2 && k != 12)
			return "nd";

		if (j == 3 && k != 13)
			return "rd";

		return "th";
	}
};