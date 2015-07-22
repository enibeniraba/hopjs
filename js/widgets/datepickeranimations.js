(function($, hop)
{

var def = hop.def;

hop.datepickerTitleAnimations.slide = {
	defaultParams: {
		hideAnimation: true,
		direction: 0,
		duration: 200,
		easing: "swing",
		interval: 5,
		transition: true,
		sync: true
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
		var self = this, params = self.params, defaultParams = self.defaultParams,
			$prevNode = $(self.data.prevNode),
			$nextNode = $(self.data.nextNode),
			height, width, hideProperties = {}, showProperties = {},
			hideAnimation = defaultParams.hideAnimation,
			direction = defaultParams.direction,
			duration = defaultParams.duration,
			easing = defaultParams.easing,
			interval = defaultParams.interval,
			transition = defaultParams.transition,
			sync = defaultParams.sync,
			completeCount = 0, complete, intervalOrig = $.fx.interval, horizontalOffset,
			hideOptions = {}, showOptions = {}, hideDuration, showDuration, hideEasing, showEasing,
			animationInfo;

		complete = function()
		{
			completeCount++;
			if (completeCount > (hideAnimation ? 1 : 0))
			{
				$prevNode.remove();
				self.datepicker[animationProperty] = null;
				$nextNode.removeAttr("style");
				$container.removeAttr("style");
			}
		};

		if (def(params.hideAnimation))
			hideAnimation = params.hideAnimation;

		if (def(params.direction))
			direction = params.direction;

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

		if (def(params.transition))
			transition = params.transition;

		if (hop.browser.isOldOpera())
			transition = false;

		if (transition)
		{
			animationInfo = hop.browser.animationInfo();
			if (!animationInfo.transitionProperty)
				transition = false;
		}

		if (transition)
		{
			if (hideAnimation)
				$prevNode.on(animationInfo.transitionendEvent, complete);
			$nextNode.on(animationInfo.transitionendEvent, complete);
		}
		else
		{
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
		}

		if (def(params.sync))
			sync = !!params.sync;

		$nextNode.hide();
		height = $container.height();
		width = $container.width();
		if (sync && $container[0] == self.datepicker.$title[0])
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
		if (direction == 0)
		{
			$nextNode.css({
				left: -horizontalOffset
			});
			if (transition)
			{
				$nextNode[0].offsetHeight;
				if (hideAnimation)
					$prevNode.css(self.transitionProperties(true, 0, horizontalOffset, hideDuration, hideEasing, animationInfo));
				$nextNode.css(self.transitionProperties(true, -horizontalOffset, horizontalOffset, showDuration, showEasing, animationInfo));
			}
			else
			{
				hideProperties.left = horizontalOffset;
				showProperties.left = 0;
			}
		}
		else if (direction == 1)
		{
			$nextNode.css({
				top: height
			});
			if (transition)
			{
				$nextNode[0].offsetHeight;
				if (hideAnimation)
					$prevNode.css(self.transitionProperties(false, 0, -height, hideDuration, hideEasing, animationInfo));
				$nextNode.css(self.transitionProperties(false, height, -height, showDuration, showEasing, animationInfo));
			}
			else
			{
				hideProperties.top = -height;
				showProperties.top = 0;
			}
		}
		else if (direction == 2)
		{
			$nextNode.css({
				left: horizontalOffset
			});
			if (transition)
			{
				$nextNode[0].offsetHeight;
				if (hideAnimation)
					$prevNode.css(self.transitionProperties(true, 0, -horizontalOffset, hideDuration, hideEasing, animationInfo));
				$nextNode.css(self.transitionProperties(true, horizontalOffset, -horizontalOffset, showDuration, showEasing, animationInfo));
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
				if (hideAnimation)
					$prevNode.css(self.transitionProperties(false, 0, height, hideDuration, hideEasing, animationInfo));
				$nextNode.css(self.transitionProperties(false, -height, height, showDuration, showEasing, animationInfo));
			}
			else
			{
				hideProperties.top = height;
				showProperties.top = 0;
			}
		}
		if (!transition)
		{
			$.fx.interval = interval;
			if (hideAnimation)
				$prevNode.animate(hideProperties, hideOptions);
			$nextNode.animate(showProperties, showOptions);
			$.fx.interval = intervalOrig;
		}
	},

	realFinish: function($container, animationProperty)
	{
		var data = this.data;
		$(data.prevNode).stop(true, true);
		$(data.nextNode).stop(true, true);
		$(data.prevNode).remove();
		$(data.prevNode).removeAttr("style");
		$(data.nextNode).removeAttr("style");
		$container.removeAttr("style");
		this.datepicker[animationProperty] = null;
	},

	transitionProperties: function(horizontal, position, offset, duration, easing, animationInfo)
	{
		var result = {},
			translateSuffix = (horizontal ? "X" : "Y"),
			property = (horizontal ? "left" : "top"),
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
};

hop.datepickerPickerAnimations.slide = $.extend(true, {}, hop.datepickerTitleAnimations.slide, {
	start: function()
	{
		this.realStart(this.datepicker.$body, "pickerAnimation");
	},

	finish: function()
	{
		this.realFinish(this.datepicker.$body, "pickerAnimation");
	}
});

hop.datepickerPickerAnimations.scale = {
	defaultParams: {
		hideAnimation: true,
		duration: 200,
		easing: "swing",
		interval: 5,
		transition: true
	},

	start: function()
	{
		var self = this, params = self.params, defaultParams = self.defaultParams,
			$body = self.datepicker.$body,
			$prevNode = $(self.data.prevNode),
			$nextNode = $(self.data.nextNode),
			height, width, hideProperties, showProperties,
			hideAnimation = defaultParams.hideAnimation,
			direction = defaultParams.direction,
			duration = defaultParams.duration,
			easing = defaultParams.easing,
			interval = defaultParams.interval,
			transition = defaultParams.transition,
			completeCount = 0, complete, intervalOrig = $.fx.interval, horizontalOffset,
			options = {}, hideOptions = {}, showOptions = {}, hideDuration, showDuration, hideEasing, showEasing,
			animationInfo = hop.browser.animationInfo(),
			transformProperty = animationInfo.transformProperty,
			$element, position, offset, elementOffset, t, l, h, w, i, year,
			hidePosition, showPosition, showScaleY, showScaleX, hideScaleY, hideScaleX, out = false;

		if ($.inArray(self.id, ["dayMonth", "monthDay", "monthYear", "yearMonth", "yearOut", "yearIn", "yearDay"]) == -1)
		{
			$prevNode.remove();
			self.datepicker.pickerAnimation = null;
			return;
		}

		complete = function()
		{
			completeCount++;
			if (completeCount > (hideAnimation ? 1 : 0))
			{
				$prevNode.remove();
				self.datepicker.pickerAnimation = null;
				$nextNode.removeAttr("style");
				$body.removeAttr("style");
			}
		};

		if (def(params.hideAnimation))
			hideAnimation = params.hideAnimation;

		if (def(params.direction))
			direction = params.direction;

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

		if (def(params.transition))
			transition = params.transition;

		if (hop.browser.isOldOpera() || !animationInfo.transitionProperty)
			transition = false;

		if (transition)
		{
			if (hideAnimation)
				$prevNode.on(animationInfo.transitionendEvent, complete);
			$nextNode.on(animationInfo.transitionendEvent, complete);
		}
		else
		{
			hideOptions = {
				duration: hideDuration,
				easing: hideEasing,
				complete: function()
				{
					$prevNode[0].style[transformProperty] = "scale(1, 1)";
					$prevNode[0].style[transformProperty] = null;
					complete();
				}
			};
			showOptions = {
				duration: showDuration,
				easing: showEasing,
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
			i = self.datepicker.dayPickerMonth;
			$element = $("."+self.datepicker.classPrefix+"datepicker-months-month-"+self.datepicker.dayPickerMonth, $nextNode);
			out = true;
		}
		else if (self.id === "monthYear")
		{
			i = self.datepicker.monthPickerYear-self.datepicker.calcFirstYear(0, self.datepicker.monthPickerYear)+1;
			$element = $("."+self.datepicker.classPrefix+"datepicker-years-year-"+self.datepicker.monthPickerYear, $nextNode);
			out = true;
		}
		else if (self.id === "yearOut")
		{
			i = (self.datepicker.calcFirstYear(self.datepicker.yearPickerScale-1, self.datepicker.yearPickerYearPrev)-self.datepicker.yearPickerYear)/Math.pow(10, self.datepicker.yearPickerScale)+1;
			$element = $("."+self.datepicker.classPrefix+"datepicker-years-year-"+self.datepicker.yearPickerYearPrev, $nextNode);
			out = true;
		}
		else if (self.id === "monthDay")
		{
			i = self.datepicker.dayPickerMonth;
			$element = $("."+self.datepicker.classPrefix+"datepicker-months-month-"+self.datepicker.dayPickerMonth, $prevNode);
		}
		else if (self.id === "yearMonth")
		{
			i = self.datepicker.monthPickerYear-self.datepicker.calcFirstYear(0, self.datepicker.monthPickerYear)+1;
			$element = $("."+self.datepicker.classPrefix+"datepicker-years-year-"+self.datepicker.monthPickerYear, $prevNode);
		}
		else if (self.id === "yearIn")
		{
			i = (self.datepicker.calcFirstYear(self.datepicker.yearPickerScale, self.datepicker.yearPickerYear)-self.datepicker.yearPickerYearPrev)/Math.pow(10, self.datepicker.yearPickerScale+1)+1;
			$element = $("."+self.datepicker.classPrefix+"datepicker-years-year-"+self.datepicker.yearPickerYear, $prevNode);
		}
		else if (self.id === "yearDay")
		{
			year = self.datepicker.calcFirstYear(self.datepicker.yearPickerScale-1, self.datepicker.dayPickerYear);
			i = (year-self.datepicker.yearPickerYear)/Math.pow(10, self.datepicker.yearPickerScale)+1;
			$element = $("."+self.datepicker.classPrefix+"datepicker-years-year-"+year, $prevNode);
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
			)
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
			)
			$nextNode.css(showPosition);
			showScaleY = $element.outerHeight()/$nextNode.outerHeight();
			showScaleX = $element.outerWidth()/$nextNode.outerWidth();
			$nextNode[0].style[transformProperty] = "scale("+showScaleX+", "+showScaleY+")";
			$nextNode.css({opacity: 0});
		}

		if (transition)
		{
			$nextNode[0].offsetHeight;
			if (hideAnimation)
				$prevNode.css(self.transitionProperties(hidePosition.top, hidePosition.left, hideScaleY, hideScaleX, out ? 0 : 1, hideDuration, hideEasing, animationInfo));
			$nextNode.css(self.transitionProperties(-showPosition.top, -showPosition.left, 1, 1, 1, showDuration, showEasing, animationInfo));
		}
		else
		{
			hideProperties = hidePosition;
			if (out)
				hideProperties.opacity = 0;
			hideOptions.progress = function(animation, progress, remaining)
			{
				var shift = $.easing[easing](progress, duration*progress, 0, 1, duration);
				$prevNode[0].style[transformProperty] = "scale("+(1-(1-hideScaleX)*shift)+", "+(1-(1-hideScaleY)*shift)+")";
			};
			showOptions.progress = function(animation, progress, remaining)
			{
				var shift = $.easing[easing](progress, duration*progress, 0, 1, duration);
				$nextNode[0].style[transformProperty] = "scale("+(showScaleX+(1-showScaleX)*shift)+", "+(showScaleY+(1-showScaleY)*shift)+")";
			};
			showProperties = {
				top: 0,
				left: 0
			};
			if (!out)
				showProperties.opacity = 1;
			$.fx.interval = interval;
			if (hideAnimation)
				$prevNode.animate(hideProperties, hideOptions);
			$nextNode.animate(showProperties, showOptions);
			$.fx.interval = intervalOrig;
		}
	},

	finish: function()
	{
		var data = this.data;
		$(data.prevNode).stop(true, true);
		$(data.nextNode).stop(true, true);
		$(data.prevNode).remove();
		$(data.prevNode).removeAttr("style");
		$(data.nextNode).removeAttr("style");
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
		var result = {},
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
};

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
		result = {}, animationParams, key, animation,
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
		result = {}, animationParams, key, animation,
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