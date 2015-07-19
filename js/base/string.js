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