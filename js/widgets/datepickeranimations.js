(function($, hop)
{

var def = hop.def;

if (!def(hop.datepickerTitleAnimations))
	hop.datepickerTitleAnimations = {};

if (!def(hop.datepickerPickerAnimations))
	hop.datepickerPickerAnimations = {};

if (!def(hop.datepickerAnimationPresets))
	hop.datepickerAnimationPresets = {};

hop.datepickerTitleAnimations.slide = function(params)
{
	hop.datepickerAnimation.apply(this, arguments);
};

hop.inherit(hop.datepickerTitleAnimations.slide, hop.datepickerAnimation, {
	getDefaults: function()
	{
		return $.extend(hop.datepickerAnimation.prototype.getDefaults.apply(this), {
			hideAnimation: true,
			direction: 0,
			showDuration: 200,
			hideDuration: 200,
			showEasing: "swing",
			hideEasing: "swing",
			interval: 5,
			transition: true,
			sync: true
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
		var self = this,
			$prevNode = $(self.prevNode),
			$nextNode = $(self.nextNode),
			height, width, hideProperties = {}, showProperties = {},
			transition = self.transition,
			completeCount = 0, complete, intervalOrig = $.fx.interval, horizontalOffset,
			hideOptions = {}, showOptions = {},
			animationInfo;
		
		if (hop.browser.isOldOpera())
			transition = false;

		complete = function()
		{
			completeCount++;
			if (completeCount > (self.hideAnimation ? 1 : 0))
			{
				$prevNode.remove();
				self.datepicker[animationProperty] = null;
				$nextNode.removeAttr("style");
				$container.removeAttr("style");
			}
		};

		if (transition)
		{
			animationInfo = hop.browser.animationInfo();
			if (!animationInfo.transitionProperty)
				transition = false;
		}

		if (transition)
		{
			if (self.hideAnimation)
				$prevNode.on(animationInfo.transitionendEvent, complete);
			$nextNode.on(animationInfo.transitionendEvent, complete);
		}
		else
		{
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
		}

		$nextNode.hide();
		height = $container.height();
		width = $container.width();
		if (self.sync && $container[0] === self.datepicker.$title[0])
			horizontalOffset = self.datepicker.$body.width();
		else
			horizontalOffset = width;
		$container.css({
			height: height,
			width: width
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
		if (self.direction === 0)
		{
			$nextNode.css({
				left: -horizontalOffset
			});
			if (transition)
			{
				$nextNode[0].offsetHeight;
				if (self.hideAnimation)
					$prevNode.css(self.transitionProperties(true, 0, horizontalOffset, self.hideDuration, self.hideEasing, animationInfo));
				$nextNode.css(self.transitionProperties(true, -horizontalOffset, horizontalOffset, self.showDuration, self.showEasing, animationInfo));
			}
			else
			{
				hideProperties.left = horizontalOffset;
				showProperties.left = 0;
			}
		}
		else if (self.direction === 1)
		{
			$nextNode.css({
				top: height
			});
			if (transition)
			{
				$nextNode[0].offsetHeight;
				if (self.hideAnimation)
					$prevNode.css(self.transitionProperties(false, 0, -height, self.hideDuration, self.hideEasing, animationInfo));
				$nextNode.css(self.transitionProperties(false, height, -height, self.showDuration, self.showEasing, animationInfo));
			}
			else
			{
				hideProperties.top = -height;
				showProperties.top = 0;
			}
		}
		else if (self.direction === 2)
		{
			$nextNode.css({
				left: horizontalOffset
			});
			if (transition)
			{
				$nextNode[0].offsetHeight;
				if (self.hideAnimation)
					$prevNode.css(self.transitionProperties(true, 0, -horizontalOffset, self.hideDuration, self.hideEasing, animationInfo));
				$nextNode.css(self.transitionProperties(true, horizontalOffset, -horizontalOffset, self.showDuration, self.showEasing, animationInfo));
			}
			else
			{
				hideProperties.left = -horizontalOffset;
				showProperties.left = 0;
			}
		}
		else
		{
			$nextNode.css({
				top: -height
			});
			if (transition)
			{
				$nextNode[0].offsetHeight;
				if (self.hideAnimation)
					$prevNode.css(self.transitionProperties(false, 0, height, self.hideDuration, self.hideEasing, animationInfo));
				$nextNode.css(self.transitionProperties(false, -height, height, self.showDuration, self.showEasing, animationInfo));
			}
			else
			{
				hideProperties.top = height;
				showProperties.top = 0;
			}
		}
		if (!transition)
		{
			$.fx.interval = self.interval;
			if (self.hideAnimation)
				$prevNode.animate(hideProperties, hideOptions);
			$nextNode.animate(showProperties, showOptions);
			$.fx.interval = intervalOrig;
		}
	},

	realFinish: function($container, animationProperty)
	{
		$(this.prevNode).stop(true, true);
		$(this.nextNode).stop(true, true);
		$(this.prevNode).remove();
		$(this.prevNode).removeAttr("style");
		$(this.nextNode).removeAttr("style");
		$container.removeAttr("style");
		this.datepicker[animationProperty] = null;
	},

	transitionProperties: function(horizontal, position, offset, duration, easing, animationInfo)
	{
		var result = {},
			translateSuffix = (horizontal ? "X" : "Y"),
			property = (horizontal ? "left" : "top");
		easing = hop.css.getTransitionEasing(easing);
		if (easing !== null)
			easing = " "+easing;
		if (animationInfo.transformProperty)
		{
			result.transform = "translate"+translateSuffix+"("+offset+"px)";
			result.transition = animationInfo.transformProperty+" "+duration+"ms"+easing;
		}
		else
		{
			result[property] = (position+offset)+"px";
			result.transition = property+" "+duration+"ms"+easing;
		}
		return result;
	}
});

hop.datepickerPickerAnimations.slide = function(params)
{
	hop.datepickerTitleAnimations.slide.apply(this, arguments);
};

hop.inherit(hop.datepickerPickerAnimations.slide, hop.datepickerTitleAnimations.slide, {
	start: function()
	{
		this.realStart(this.datepicker.$body, "pickerAnimation");
	},

	finish: function()
	{
		this.realFinish(this.datepicker.$body, "pickerAnimation");
	}
});

hop.datepickerPickerAnimations.scale = function(params)
{
	hop.datepickerAnimation.apply(this, arguments);
};

hop.inherit(hop.datepickerPickerAnimations.scale, hop.datepickerAnimation, {
	getDefaults: function()
	{
		return $.extend(hop.datepickerAnimation.prototype.getDefaults.apply(this), {
			hideAnimation: true,
			showDuration: 200,
			hideDuration: 200,
			showEasing: "swing",
			hideEasing: "swing",
			interval: 5,
			transition: true
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
		var self = this, datepicker = self.datepicker,
			dotClassPrefix = "."+datepicker.classPrefix+"datepicker-",
			$body = datepicker.$body,
			$prevNode = $(self.prevNode),
			$nextNode = $(self.nextNode),
			height, width, hideProperties, showProperties,
			transition = self.transition,
			completeCount = 0, complete, intervalOrig = $.fx.interval,
			hideOptions = {}, showOptions = {},
			animationInfo = hop.browser.animationInfo(),
			transformProperty = animationInfo.transformProperty,
			i, $element, t, l, h, w, position, offset, elementOffset,
			hidePosition, showPosition, showScaleY, showScaleX, hideScaleY, hideScaleX, out = false;

		if ($.inArray(self.id, ["dayMonth", "monthDay", "monthYear", "yearMonth", "yearOut", "yearIn", "yearDay"]) === -1)
		{
			$prevNode.remove();
			datepicker.pickerAnimation = null;
			return;
		}
		
		if (hop.browser.isOldOpera() || !animationInfo.transitionProperty)
			transition = false;

		complete = function()
		{
			completeCount++;
			if (completeCount > (self.hideAnimation ? 1 : 0))
			{
				$prevNode.remove();
				datepicker.pickerAnimation = null;
				$nextNode.removeAttr("style");
				$body.removeAttr("style");
			}
		};

		if (transition)
		{
			if (self.hideAnimation)
				$prevNode.on(animationInfo.transitionendEvent, complete);
			$nextNode.on(animationInfo.transitionendEvent, complete);
		}
		else
		{
			hideOptions = {
				duration: self.hideDuration,
				easing: self.hideEasing,
				complete: function()
				{
					$prevNode[0].style[transformProperty] = "scale(1, 1)";
					$prevNode[0].style[transformProperty] = null;
					complete();
				}
			};
			showOptions = {
				duration: self.showDuration,
				easing: self.showEasing,
				complete: function()
				{
					$nextNode[0].style[transformProperty] = "scale(1, 1)";
					$nextNode[0].style[transformProperty] = null;
					complete();
				}
			};
		}

		height = $body.height();
		width = $body.width();
		$body.css({
			height: height,
			width: width
		});
		$prevNode.css({
			height: $prevNode.height(),
			width: $prevNode.width(),
			position: "absolute",
			top: 0,
			left: 0
		});
		$nextNode.css({
			height: $nextNode.height(),
			width: $nextNode.width(),
			position: "absolute",
			top: 0,
			left: 0
		});

		if (self.id === "dayMonth")
		{
			i = datepicker.dayPickerMonth;
			$element = $(dotClassPrefix+"months-month-"+i, $nextNode);
			out = true;
		}
		else if (self.id === "monthYear")
		{
			i = datepicker.monthPickerYear-datepicker.calcFirstYear(0, datepicker.monthPickerYear)+1;
			$element = $(dotClassPrefix+"years-year-count-"+i, $nextNode);
			out = true;
		}
		else if (self.id === "yearOut")
		{
			i = (datepicker.calcFirstYear(datepicker.yearPickerScale-1, datepicker.yearPickerYearPrev)-datepicker.yearPickerYear)/Math.pow(10, datepicker.yearPickerScale)+1;
			$element = $(dotClassPrefix+"years-year-count-"+i, $nextNode);
			out = true;
		}
		else if (self.id === "monthDay")
		{
			i = datepicker.dayPickerMonth;
			$element = $(dotClassPrefix+"months-month-"+datepicker.dayPickerMonth, $prevNode);
		}
		else if (self.id === "yearMonth")
		{
			i = datepicker.monthPickerYear-datepicker.calcFirstYear(0, datepicker.monthPickerYear)+1;
			$element = $(dotClassPrefix+"years-year-count-"+i, $prevNode);
		}
		else if (self.id === "yearIn")
		{
			i = (datepicker.calcFirstYear(datepicker.yearPickerScale, datepicker.yearPickerYear)-datepicker.yearPickerYearPrev)/Math.pow(10, datepicker.yearPickerScale+1)+1;
			$element = $(dotClassPrefix+"years-year-count-"+i, $prevNode);
		}
		else if (self.id === "yearDay")
		{
			i = (datepicker.calcFirstYear(datepicker.yearPickerScale-1, datepicker.dayPickerYear)-datepicker.yearPickerYear)/Math.pow(10, datepicker.yearPickerScale)+1;
			if (i < 0)
				i = 0;
			else if (i > 11)
				i = 11;
			$element = $(dotClassPrefix+"years-year-count-"+i, $prevNode);
		}
		t = -(Math.floor(i/4)*height);
		l = -(Math.round(i%4)*width);
		h = 3*height;
		w = 4*width;

		$prevNode.css({"z-index": out ? 1 : 0});
		$nextNode.css({"z-index": out ? 0 : 1});

		if (out)
		{
			position = $prevNode.position();
			offset = $prevNode.offset();
			elementOffset = $element.offset();
			hidePosition = self.calcPosition(
				$prevNode,
				position.top-offset.top+elementOffset.top,
				position.left-offset.left+elementOffset.left,
				$element.outerHeight(),
				$element.outerWidth()
			);
			hideScaleY = $element.outerHeight()/$prevNode.outerHeight();
			hideScaleX = $element.outerWidth()/$prevNode.outerWidth();

			showPosition = self.calcPosition($nextNode, t, l, h, w);;
			$nextNode.css(showPosition);
			showScaleY = 3;
			showScaleX = 4;
			$nextNode[0].style[transformProperty] = "scale("+showScaleX+", "+showScaleY+")";
		}
		else
		{
			hidePosition = self.calcPosition($prevNode, t, l, h, w);
			hideScaleY = 3;
			hideScaleX = 4;

			position = $nextNode.position();
			offset = $nextNode.offset();
			elementOffset = $element.offset();
			showPosition = self.calcPosition(
				$nextNode,
				position.top-offset.top+elementOffset.top,
				position.left-offset.left+elementOffset.left,
				$element.outerHeight(),
				$element.outerWidth()
			);
			$nextNode.css(showPosition);
			showScaleY = $element.outerHeight()/$nextNode.outerHeight();
			showScaleX = $element.outerWidth()/$nextNode.outerWidth();
			$nextNode[0].style[transformProperty] = "scale("+showScaleX+", "+showScaleY+")";
			$nextNode.css({opacity: 0});
		}

		if (transition)
		{
			$nextNode[0].offsetHeight;
			if (self.hideAnimation)
				$prevNode.css(self.transitionProperties(hidePosition.top, hidePosition.left, hideScaleY, hideScaleX, out ? 0 : 1, self.hideDuration, self.hideEasing, animationInfo));
			$nextNode.css(self.transitionProperties(-showPosition.top, -showPosition.left, 1, 1, 1, self.showDuration, self.showEasing, animationInfo));
		}
		else
		{
			hideProperties = hidePosition;
			if (out)
				hideProperties.opacity = 0;
			hideOptions.progress = function(animation, progress, remaining)
			{
				var shift = $.easing[self.easing](progress, self.hideDuration*progress, 0, 1, self.hideDuration);
				$prevNode[0].style[transformProperty] = "scale("+(1-(1-hideScaleX)*shift)+", "+(1-(1-hideScaleY)*shift)+")";
			};
			showOptions.progress = function(animation, progress, remaining)
			{
				var shift = $.easing[easing](progress, self.showDuration*progress, 0, 1, self.showDuration);
				$nextNode[0].style[transformProperty] = "scale("+(showScaleX+(1-showScaleX)*shift)+", "+(showScaleY+(1-showScaleY)*shift)+")";
			};
			showProperties = {
				top: 0,
				left: 0
			};
			if (!out)
				showProperties.opacity = 1;
			$.fx.interval = self.interval;
			if (self.hideAnimation)
				$prevNode.animate(hideProperties, hideOptions);
			$nextNode.animate(showProperties, showOptions);
			$.fx.interval = intervalOrig;
		}
	},

	finish: function()
	{
		$(this.prevNode).stop(true, true);
		$(this.nextNode).stop(true, true);
		$(this.prevNode).remove();
		$(this.prevNode).removeAttr("style");
		$(this.nextNode).removeAttr("style");
		this.datepicker.$body.removeAttr("style");
		this.datepicker.pickerAnimation = null;
	},

	calcPosition: function($node, top, left, height, width)
	{
		return {
			top: top+(height-$node.outerHeight())/2,
			left: left+(width-$node.outerWidth())/2
		};
	},

	transitionProperties: function(offsetY, offsetX, scaleY, scaleX, opacity, duration, easing, animationInfo)
	{
		var result = {};
		easing = hop.css.getTransitionEasing(easing);
		if (easing !== null)
			easing = " "+easing;
		result = {
			opacity: opacity,
			transform: "translate("+offsetX+"px, "+offsetY+"px) scale("+scaleX+", "+scaleY+")",
			transition: animationInfo.transformProperty+" "+duration+"ms"+easing+", opacity "+duration+"ms"+easing
		};
		return result;
	}
});

hop.datepickerAnimationPresets.slide = function(params)
{
	var directions = {
			dayPrev: 0,
			dayNext: 2,
			dayMonth: 3,
			monthDay: 1,
			monthPrev: 0,
			monthNext: 2,
			monthYear: 3,
			yearMonth: 1,
			yearPrev: 0,
			yearNext: 2,
			yearOut: 3,
			yearIn: 1,
			yearDay: 1,
			timeShow: 1,
			timeHide: 3
		},
		key, result = {},
		animationParams = (params && params.animationParams ? params.animationParams : {});
	for (key in directions)
	{
		result[key] = {
			type: "slide",
			params: {
				direction: directions[key]
			}
		};
		if (animationParams)
			$.extend(true, result[key].params, animationParams);
	}
	return result;
};

hop.datepickerAnimationPresets.slideFade = function(params)
{
	var directions = {
			dayPrev: 0,
			dayNext: 2,
			monthPrev: 0,
			monthNext: 2,
			yearPrev: 0,
			yearNext: 2
		},
		fadeAnimations = [
			"dayMonth",
			"monthDay",
			"monthYear",
			"yearMonth",
			"yearOut",
			"yearIn",
			"yearDay",
			"timeShow",
			"timeHide"
		],
		result = {}, key,
		animationParams = (params && params.animationParams ? params.animationParams : {});
	for (key in directions)
	{
		result[key] = {
			type: "slide",
			params: {
				direction: directions[key]
			}
		};
		if (animationParams)
			$.extend(true, result[key].params, animationParams);
	}
	for (key in fadeAnimations)
	{
		result[fadeAnimations[key]] = {
			type: "fade"
		};
		if (animationParams)
			result[fadeAnimations[key]].params = animationParams;
	}
	return result;
};

hop.datepickerAnimationPresets.slideScale = function(params)
{
	var directions = {
			dayPrev: 0,
			dayNext: 2,
			monthPrev: 0,
			monthNext: 2,
			yearPrev: 0,
			yearNext: 2,
			timeShow: 1,
			timeHide: 3
		},
		scaleAnimations = [
			"dayMonth",
			"monthDay",
			"monthYear",
			"yearMonth",
			"yearOut",
			"yearIn",
			"yearDay"
		],
		result = {}, key,
		animationParams = (params && params.animationParams ? params.animationParams : {});
	for (key in directions)
	{
		result[key] = {
			type: "slide",
			params: {
				direction: directions[key]
			}
		};
		if (animationParams)
			$.extend(true, result[key].params, animationParams);
	}
	for (key in scaleAnimations)
	{
		result[scaleAnimations[key]] = {
			type: "scale"
		};
		if (animationParams)
			result[scaleAnimations[key]].params = animationParams;
	}
	return result;
};

})(jQuery, hopjs);