hop.widget = function(params)
{
	this.construct(params);
};

hop.widget.prototype = {
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

	getDefaults: function()
	{
		return {};
	},

	getVirtualParams: function()
	{
		return [];
	},

	getEvents: function()
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
};