hop.dom = {
	maxZIndex: function(childNode)
	{
		if (!def(childNode))
			childNode = document.body;
		var topNode, node;
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