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
			options = {}, hideOptions = {}, showOptions = {}, hideDuration, showDuration, hideEasing, showEasing,
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
			hideAnimation = !!params.hideAnimation;

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
					$prevNode.css(self.getTransitionCss(true, 0, horizontalOffset, hideDuration, hideEasing, animationInfo));
				$nextNode.css(self.getTransitionCss(true, -horizontalOffset, horizontalOffset, showDuration, showEasing, animationInfo));
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
					$prevNode.css(self.getTransitionCss(false, 0, -height, hideDuration, hideEasing, animationInfo));
				$nextNode.css(self.getTransitionCss(false, height, -height, showDuration, showEasing, animationInfo));
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
					$prevNode.css(self.getTransitionCss(true, 0, -horizontalOffset, hideDuration, hideEasing, animationInfo));
				$nextNode.css(self.getTransitionCss(true, horizontalOffset, -horizontalOffset, showDuration, showEasing, animationInfo));
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
					$prevNode.css(self.getTransitionCss(false, 0, height, hideDuration, hideEasing, animationInfo));
				$nextNode.css(self.getTransitionCss(false, -height, height, showDuration, showEasing, animationInfo));
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
		var self = this, data = self.data;
		$(data.prevNode).stop(true, true);
		$(data.nextNode).stop(true, true);
		$(data.prevNode).remove();
		$(data.prevNode).removeAttr("style");
		$(data.nextNode).removeAttr("style");
		$container.removeAttr("style");
		self.datepicker[animationProperty] = null;
	},

	getTransitionCss: function(horizontal, position, offset, duration, easing, animationInfo)
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

hop.datepickerAnimationPresets.slide = function(params)
{
	var result = {
			dayPrev: {
				params: {
					direction: 0
				}
			},
			dayNext: {
				params: {
					direction: 2
				}
			},
			dayMonth: {
				params: {
					direction: 3
				}
			},
			monthDay: {
				params: {
					direction: 1
				}
			},
			monthPrev: {
				params: {
					direction: 0
				}
			},
			monthNext: {
				params: {
					direction: 2
				}
			},
			monthYear: {
				params: {
					direction: 3
				}
			},
			yearMonth: {
				params: {
					direction: 1
				}
			},
			yearPrev: {
				params: {
					direction: 0
				}
			},
			yearNext: {
				params: {
					direction: 2
				}
			},
			yearOut: {
				params: {
					direction: 3
				}
			},
			yearIn: {
				params: {
					direction: 1
				}
			},
			yearDay: {
				params: {
					direction: 1
				}
			},
			timeShow: {
				params: {
					direction: 1
				}
			},
			timeHide: {
				params: {
					direction: 3
				}
			}
		},
		animationParams, key, animation;
	if (!params)
		params = {};
	if (params.animationParams)
		animationParams = params.animationParams;
	for (key in result)
	{
		result[key].type = "slide";
		if (animationParams)
			$.extend(result[key].params, animationParams);
	}
	return result;
};

hop.datepickerAnimationPresets.slideFade = function(params)
{
	var result = {
			dayPrev: {
				params: {
					direction: 0
				}
			},
			dayNext: {
				params: {
					direction: 2
				}
			},
			monthPrev: {
				params: {
					direction: 0
				}
			},
			monthNext: {
				params: {
					direction: 2
				}
			},
			yearPrev: {
				params: {
					direction: 0
				}
			},
			yearNext: {
				params: {
					direction: 2
				}
			}
		},
		fadeTypes = [
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
		animationParams, key, animation;
	if (!params)
		params = {};
	if (params.animationParams)
		animationParams = params.animationParams;
	for (key in result)
	{
		result[key].type = "slide";
		if (animationParams)
			$.extend(result[key].params, animationParams);
	}
	for (key in fadeTypes)
	{
		animation = {
			type: "fade"
		};
		if (animationParams)
			animation.params = animationParams;
		result[fadeTypes[key]] = animation;
	}
	return result;
};

})(jQuery, hopjs);