window.hopjs = {
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
		if (Object.create)
			child.prototype = Object.create(parent.prototype);
		else
		{
			var f = function(){};
			f.prototype = parent.prototype;
			child.prototype = new f();
		}
		child.prototype.constructor = child;
		child.parentClass = parent;
		if (proto)
			$.extend(true, child.prototype, proto);
	}
};

var hop = window.hopjs, def = hop.def, ifDef = hop.ifDef;