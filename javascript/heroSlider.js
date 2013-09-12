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
                alwaysShowNav: false,               // If there is only one slide, hide the navigation controls
                effect: 'Slide'                     // The effect you would like to use, one of 'Slide', 'Fade'
            }, userOptions);
            var $heroSlider = $(this),
                autoScroll = options.autoScroll,
                loop = options.loop,
                allowEarlyClick = options.allowEarlyClick,
                slides = $heroSlider.children(),
                slideWidth = $heroSlider.width(),
                slideHeight = $heroSlider.height(),
                slideId = 'hs-slide-',
                slideWrapper,
                delayTimer,
                nextButton,
                previousButton,
                navigation,
                navButtons,
                slideCount = 0,
                currentSlide = 1,
                isFailure = 0,          // Is it MSIE?
                isAnimateFailure = 0,   // Is it MSIE 6!?
                animating = false;   

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

                // Set up our effect functions
                // This definitely needs to be done in smarter way
                switch (options.effect) {
                    case 'Slide':
                        $heroSlider.setSliderCSS = $heroSlider.setSliderCSSSlide;
                        $heroSlider.changeSlide = $heroSlider.changeSlideSlide;
                        $heroSlider.setWrapperCSS = $heroSlider.setWrapperCSSSlide;
                        $heroSlider.setSlideCSS = $heroSlider.setSlideCSSSlide;
                    break;
                    case 'Fade':
                        $heroSlider.setSliderCSS = $heroSlider.setSliderCSSFade;
                        $heroSlider.changeSlide = $heroSlider.changeSlideFade;
                        $heroSlider.setWrapperCSS = $heroSlider.setWrapperCSSFade;
                        $heroSlider.setSlideCSS = $heroSlider.setSlideCSSFade;
                    break;
                }

                // Figure out how many slides we are using
                slideCount = ($heroSlider.find(options.slideContainer)).length;

                // Set the css for the slider itself
                $heroSlider.setSliderCSS();
                
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
                        if (!animating || allowEarlyClick) {
                            autoScroll = false;
                            clearInterval(delayTimer);
                            var lastElem = $(this).data('navbutton');
                            var newSlide = parseInt(lastElem) + 1;
                            if (newSlide != currentSlide) {
                                visibleSlide = currentSlide;
                                currentSlide = newSlide;
                                $heroSlider.changeSlide(currentSlide, visibleSlide);
                            }
                        }
                    });
                }

                // Assign IDs for DOM reference
                $heroSlider.setSlideIds();

                // Initialize the timer
                $heroSlider.resetTimer();
            };

            // Next Slide
            $heroSlider.nextSlide = function () {
                if (!animating || allowEarlyClick) {
                    visibleSlide = currentSlide;
                    currentSlide = currentSlide + 1;
                    if (currentSlide > slideCount) {
                        if (!loop) {
                            currentSlide = currentSlide - 1;
                        } else {
                            currentSlide = 1;
                        }
                    } 
                    $heroSlider.changeSlide(currentSlide, visibleSlide);
                    clearInterval(delayTimer);
                }
            };

            // Previous Slide
            $heroSlider.previousSlide = function () {
                if (!animating || allowEarlyClick) {
                    visibleSlide = currentSlide;
                    currentSlide = currentSlide - 1;
                    if (currentSlide < 1) {
                        if (!loop) {
                            currentSlide = currentSlide + 1;
                        } else {
                            currentSlide = slideCount;
                        }
                    }
                    $heroSlider.changeSlide(currentSlide, visibleSlide);
                    clearInterval(delayTimer);
                }
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

            // Create the navigation buttons
            $heroSlider.createNavButtons = function () {
                for (var i = 0; i < slideCount; i++) {
                    navigation.find('.hs-navigation-style').append('<div class="hs-nav-button" data-navbutton="' + i + '"/>');
                };
                navButtons = navigation.find('.hs-nav-button');
                navButtons.first().addClass('active');
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

            // Set the ids of our slides
            $heroSlider.setSlideIds = function () {
                // Initialize the backgrounds
                $.each(slides, function(index, slide) {
                    $(slide).attr('id', slideId + (index + 1));
                });
            }

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

            // Effect Methods
            // Slider Effect
            // Apply the slider css and wrap all the slides inside
            $heroSlider.setSliderCSSSlide = function () {
                $heroSlider.css({
                    'overflow': 'hidden',
                    'position': 'relative'
                }).wrapInner('<div class="hs-slider-slide-wrapper" />');
                slideWrapper = $heroSlider.find('.hs-slider-slide-wrapper');

                // Apply some needed styles to the wrapper
                $heroSlider.setWrapperCSSSlide();
            }

            // Change a slide
            $heroSlider.changeSlideSlide = function (destinationSlide, visibleSlide) {
                if (slideCount > 1 || options.alwaysShowNav) {
                    destinationSlide = $('#' + slideId + destinationSlide);
                    var pos = destinationSlide.position();
                    animating = true;
                    slideWrapper.stop().animate({left: -pos.left}, options.animationTime, 'swing', function () {
                        if (autoScroll) {
                            $heroSlider.resetTimer();
                        }
                        animating = false;
                    });
                    navButtons.removeClass('active');
                    navigation.find('.hs-nav-button[data-navbutton="' + (currentSlide - 1) + '"]').addClass('active');
                    $heroSlider.trigger('hs-slide-change', currentSlide);
                }
            };

            // Set the css for the slides themselves
            $heroSlider.setSlideCSSSlide = function () {
                slideWidth = $heroSlider.width();
                slideHeight = $heroSlider.height();

                // Apply the slides CSS
                slides.css({
                    'height': slideHeight,
                    'width': slideWidth,
                    'position': 'relative',
                    'float': 'left'
                });
            };

            // Set the CSS for the Wrapper
            $heroSlider.setWrapperCSSSlide = function () {
                slideWrapper.css({
                    'height': slideHeight,
                    'width': slideWidth * slideCount,
                    'position': 'relative',
                    'float': 'left',
                    'left': -((currentSlide - 1) * slideWidth)
                });
            };

            // Fade Effect
            // Apply the slider css and wrap all the slides inside
            $heroSlider.setSliderCSSFade = function () {
                $heroSlider.css({
                    'overflow': 'hidden',
                    'position': 'relative'
                }).wrapInner('<div class="hs-slider-slide-wrapper" />');
                slideWrapper = $heroSlider.find('.hs-slider-slide-wrapper');
                
                // Apply some needed styles to the wrapper
                $heroSlider.setWrapperCSSFade();
            }

            // Change a slide
            $heroSlider.changeSlideFade = function (destinationSlide, visibleSlide) {
                if (slideCount > 1 || options.alwaysShowNav) {
                    animating = true;
                    destinationSlideObject = $('#' + slideId + destinationSlide);
                    visibleSlideObject = $('#' + slideId + visibleSlide);
                    slideWrapper.prepend(destinationSlideObject);
                    visibleSlideObject.stop().fadeTo(options.animationTime, 0, 'swing', function () {
                        if (autoScroll) {
                            $heroSlider.resetTimer();
                        }
                        animating = false;
                    });
                    destinationSlideObject.stop().fadeTo(1, 1);
                    navButtons.removeClass('active');
                    navigation.find('.hs-nav-button[data-navbutton="' + (currentSlide - 1) + '"]').addClass('active');
                    $heroSlider.trigger('hs-slide-change', currentSlide);
                }
            };

            // Set the css for the slides themselves
            $heroSlider.setSlideCSSFade = function () {
                slideWidth = $heroSlider.width();
                slideHeight = $heroSlider.height();

                // Apply the slides CSS
                slides.css({
                    'width': '100%',
                    'height': '400px',
                    'position': 'absolute',
                    'top': '0px'
                });

                slides.hide();
                slides.first().show();
            };

            // Set the CSS for the Wrapper
            $heroSlider.setWrapperCSSFade = function () {
                slideWrapper.css({
                    'height': slideHeight,
                    'width': slideWidth,
                    'position': 'relative'
                });
            };

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
