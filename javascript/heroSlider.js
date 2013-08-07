;(function ($) {
    $.fn.heroSlider = function (userOptions) {
        return this.each(function () {
            var options = $.extend({
                slideContainer: '.hero-slide',      // The name of the slide class
                animationTime: 1000,                // The time it takes to complete the transition animation in milliseconds
                slideDelay: 3000,                   // The amount of time it will show each slide in milliseconds
                autoScroll: true,                   // If slides should automatically scroll by default
                loop: true,                         // If you should be able to go from last to first and vice versa
                allowEarlyClick: true,              // If you can change slides while animating.           
                alwaysShowNav: false                // If there is only one slide, hide the navigation controls
            }, userOptions);
            // User Configurable Options
            var $heroSlider = $(this),
                autoScroll = options.autoScroll,
                loop = options.loop,
                allowEarlyClick = options.allowEarlyClick,
                slides = $heroSlider.children(),
                slideWidth = $heroSlider.width(),
                slideHeight = $heroSlider.height(),
                slideWrapper,
                delayTimer,
                nextButton,
                previousButton,
                navigation,
                navButtons,
                slideCount = 0,
                currentSlide = 1,
                isFailure = 0,          // Is it MSIE?
                isAnimateFailure = 0;   // Is it MSIE 6!?

            // Methods
            // Protected Methods
            // Initialize
            $heroSlider.init = function () {
                // Check if we are dealing with a pathetic browser
                if ($.browser.msie) {
                    isFailure = 1;
                    if (parseFloat($.browser.version) < 7.0) {
                        isAnimateFailure = 1;
                    }
                }

                // Figure out how many slides we are using
                slideCount = ($heroSlider.find(options.slideContainer)).length;

                // Apply the slider css and wrap all the slides inside
                $heroSlider.css({
                    'overflow': 'hidden',
                    'position': 'relative'
                }).wrapInner('<div class="hs-slider-slide-wrapper" />');
                slideWrapper = $heroSlider.find('.hs-slider-slide-wrapper');

                // Apply some needed styles to the wrapper
                $heroSlider.setWrapperCSS();

                // Set the css for the slides
                $heroSlider.setSlideCSS();

                if (slideCount > 1 || options.alwaysShowNav) {
                    // Add the previous button
                    $heroSlider.append('<div class="hs-previous-button" />');
                    previousButton = $heroSlider.find('.hs-previous-button');
                    // Set the css for the previous button
                    $heroSlider.setPreviousButtonCSS();

                    // Add the next button
                    $heroSlider.append('<div class="hs-next-button" />');
                    nextButton = $heroSlider.find('.hs-next-button');
                    // Set the css for the next button
                    $heroSlider.setNextButtonCSS();
                    
                    // Add the navigation
                    $heroSlider.append('<div class="hs-navigation"><div class="hs-navigation-style"></div></div>');
                    navigation = $heroSlider.find('.hs-navigation');
                    // Create the navigation buttons
                    $heroSlider.createNavButtons();
                    // Set the css for the navigation bar
                    $heroSlider.setNavigationCSS();

                    // Bind the hover events for the carousel
                    $heroSlider.hover($heroSlider.showNav, $heroSlider.hideNav);

                    // Bind the click events for the buttons
                    nextButton.click(function () {
                        autoScroll = false;
                        $heroSlider.nextSlide();
                    });

                    previousButton.click(function () {
                        autoScroll = false;
                        $heroSlider.previousSlide();
                    });

                    navButtons.click(function () {
                        if (!slideWrapper.is(':animated') || allowEarlyClick) {
                            autoScroll = false;
                            clearInterval(delayTimer);
                            var lastElem = $(this).data('navbutton');
                            var newSlide = parseInt(lastElem) + 1;
                            if (newSlide != currentSlide) {
                                currentSlide = newSlide;
                                $heroSlider.changeSlide(slides.eq(lastElem));
                            }
                        }
                    });
                }


                // Initialize the timer
                $heroSlider.resetTimer();
            };

            // Timer Expiry
            $heroSlider.timerFinished = function () {
                $heroSlider.nextSlide();
            };

            // Reset Timer
            $heroSlider.resetTimer = function () {
                if (autoScroll) {
                    delayTimer = setInterval($heroSlider.timerFinished, options.slideDelay);
                }
            };

            // Show Navigation
            $heroSlider.showNav = function () {
                console.log('test');
                previousButton.stop(true, true).fadeIn('fast');
                nextButton.stop(true, true).fadeIn('fast');
                navigation.stop(true, true).fadeIn('fast');
            };

            // Hide Navigation
            $heroSlider.hideNav = function () {
                previousButton.stop(true, true).fadeOut('fast');
                nextButton.stop(true, true).fadeOut('fast');
                navigation.stop(true, true).fadeOut('fast');
            };

            // Next Slide
            $heroSlider.nextSlide = function () {
                if (!slideWrapper.is(':animated') || allowEarlyClick) {
                    currentSlide = currentSlide + 1;
                    if (currentSlide > slideCount) {
                        if (!loop) {
                            currentSlide = currentSlide - 1;
                        } else {
                            currentSlide = 1;
                        }
                    } 
                    $heroSlider.changeSlide(slides.eq(currentSlide - 1));
                    clearInterval(delayTimer);
                }
            };

            // Previous Slide
            $heroSlider.previousSlide = function () {
                if (!slideWrapper.is(':animated') || allowEarlyClick) {
                    currentSlide = currentSlide - 1;
                    if (currentSlide < 1) {
                        if (!loop) {
                            currentSlide = currentSlide + 1;
                        } else {
                            currentSlide = slideCount;
                        }
                    }
                    $heroSlider.changeSlide(slides.eq(currentSlide - 1));
                    clearInterval(delayTimer);
                }
            };

            // Change a slide
            $heroSlider.changeSlide = function (destinationSlide) {
                if (slideCount > 1 || options.alwaysShowNav) {
                    var pos = destinationSlide.position();
                    slideWrapper.stop().animate({left: -pos.left}, options.animationTime, 'swing', function () {
                        if (autoScroll) {
                            $heroSlider.resetTimer();
                        }
                    });
                    navButtons.removeClass('active');
                    navigation.find('.hs-nav-button[data-navbutton="' + (currentSlide - 1) + '"]').addClass('active');
                    $heroSlider.trigger('hs-slide-change', currentSlide);
                }
            };

            // Create the navigation buttons
            $heroSlider.createNavButtons = function () {
                for (var i = 0; i < slideCount; i++) {
                    navigation.find('.hs-navigation-style').append('<div class="hs-nav-button" data-navbutton="' + i + '"/>');
                };
                navButtons = navigation.find('.hs-nav-button');
                navButtons.first().addClass('active');
            };

            // Set the css for the slides themselves
            $heroSlider.setSlideCSS = function () {
                slideWidth = $heroSlider.width();
                slideHeight = $heroSlider.height();

                // Apply the slides CSS
                slides.css({
                    'height': slideHeight,
                    'width': slideWidth,
                    'position': 'relative',
                    'float': 'left'
                });

                slideWidth = $heroSlider.width();
                slideHeight = $heroSlider.height();
            };

            // Set the CSS for the Wrapper
            $heroSlider.setWrapperCSS = function () {
                slideWrapper.css({
                    'height': slideHeight,
                    'width': slideWidth * slideCount,
                    'position': 'relative',
                    'float': 'left',
                    'left': -((currentSlide - 1) * slideWidth)
                });
            };

            // Resets the slides to slide one, we don't want to do this every resize
            $heroSlider.resetWrapperPosition = function () {
                slideWrapper.css({'left': '0px'});
            };

            // Set the CSS for the next button
            $heroSlider.setNextButtonCSS = function () {
                nextButton.css({
                    'display': 'none',
                    'cursor': 'pointer',
                    'pointer-events':'all'
                });
            };

            // Set the CSS for the previous button
            $heroSlider.setPreviousButtonCSS = function () {
                previousButton.css({
                    'display': 'none',
                    'cursor': 'pointer',
                    'pointer-events': 'all'
                });
            };

            // Set the CSS for the navigation bar
            $heroSlider.setNavigationCSS = function () {
                navigation.css({
                    'display': 'none',
                    'pointer-events': 'all'
                });
            };

            // Resize the slides on window size changing
            $(window).resize(function () {
                $heroSlider.setSlideCSS();
                $heroSlider.setWrapperCSS();
                if (options.alwaysShow || slideCount > 1) {
                    $heroSlider.setPreviousButtonCSS();
                    $heroSlider.setNextButtonCSS();
                    $heroSlider.setNavigationCSS();
                }
            });

            // Public Methods
            // Change to next slide
            $.fn.heroSlider.nextSlide = function() {
                $heroSlider.nextSlide();   
            };

            // Change to previous slide
            $.fn.heroSlider.previousSlide = function() {
                $heroSlider.previousSlide();   
            };

            // Spin it up!
            return $heroSlider.init();
        });
    };
})(jQuery);
