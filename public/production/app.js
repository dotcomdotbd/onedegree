// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());


(function () {    

    var Skippr = (function () {

        function Skippr(element, options) {

            var _ = this,
                timer;
            
            _.settings = $.extend($.fn.skippr.defaults, options);
            _.$element = $(element);
            _.$parent = _.$element.parent();
            _.$photos = _.$element.children();
            _.count = _.$photos.length;
            _.countString = String(_.count);
            _.touchOnThis = false;
            _.previousTouchX = null;
            _.swipeDirection = null;
            _.init();
    
        }

        Skippr.prototype.init = function() {

            var _ = this;

            _.setup();
            _.navClick();
            _.arrowClick();
            _.resize();
            _.keyPress();

            if(_.settings.autoPlay == true) {
                _.autoPlay();
                _.autoPlayPause();
            }

            if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                _.touch();
            }


        }
        
        // Set event listeners for touch events.
        // 
        Skippr.prototype.touch = function() {

            var _ = this;

            _.$element.on('touchstart', function(ev) {

                var e = ev.originalEvent;
                var xcoord = e.pageX;

                // Record that this element is being touched.
                _.touchOnThis = true;
                // Record the current xcoord to be used as reference in
                // touchmove event listener.
                _.previousTouchX = xcoord;
            });

            _.$element.on('touchmove', function(ev) {

                var e = ev.originalEvent;
                var xcoord = e.pageX;

                if(_.touchOnThis) {
                    e.preventDefault();

                    if(_.previousTouchX < xcoord) {
                        // swiping right to go backwards
                        _.swipeDirection = "backwards";

                    } else if(_.previousTouchX > xcoord) {
                        //swiping left to go forwards
                        _.swipeDirection = "forwards";

                    }

                }

            });

            _.$element.on('touchend', function() {

                _.touchOnThis = false;

                // Trigger arrow event listeners depending
                // on swipe direction.
                if(_.swipeDirection == "backwards") {

                    _.$element.find(".skippr-previous").trigger('click');
    
                } else if(_.swipeDirection == "forwards") {

                    _.$element.find(".skippr-next").trigger('click');
            
                }

                // Reset in order to prevent event listeners
                // from responding to taps.
                _.swipeDirection = null;

            }); 

        }

        Skippr.prototype.setup = function() {

            var _ = this;
            
            // if img elements are being used,
            // create divs with background images to use
            // Skippr as normal.  
            if (_.settings.childrenElementType == 'img') {

                var makeDivs = [];

                for (i = 0; i < _.count; i++) {
                    var src = _.$photos.eq(i).attr('src'),
                        insert = '<div style="background-image: url(' + src + ')"></div>';

                    makeDivs.push(insert);
                }
                 makeDivs.join("");
                 _.$element.append(makeDivs);
                 _.$element.find('img').remove();
                 _.$photos = _.$element.children();

            }

            // if an array of image url's is being used
            // create divs with background images to use
            // Skippr as normal.
            if (_.settings.childrenElementType == 'array') {
                
                var imageArray = _.settings.imgArray;
                var makeDivs = [];

                for (i = 0; i < imageArray; i++) {
                    var src = imageArray[i];
                    var insert = '<div style="background-image: url(' + src + ')"></div>';

                    makeDivs.push(insert);
                }

                makeDivs.join("");
                _.$element.children().remove();
                _.$element.append(makeDivs);
                _.$photos = _.$element.children();

            }

            if (_.settings.transition == 'fade') {
                _.$photos.not(":first-child").hide();
            }

            if (_.settings.transition == 'slide') {
                _.setupSlider();

            }

            _.$photos.eq(0).addClass('visible');
            _.$element.addClass('skippr');

            _.navBuild();

            if(_.settings.arrows == true) {
                _.arrowBuild();
            }

        };

        Skippr.prototype.resize = function() {

            var _ = this;

            if( _.settings.transition == 'slide') {
                
                $(window).resize(function() {
        
                    var currentItem = _.$element.find(".skippr-nav-element-active").attr('data-slider');

                    _.setupSlider();

                    _.$photos.each(function() {
                        var amountLeft = parseFloat($(this).css('left')),
                            parentWidth = _.$parent.width(),
                            moveAmount;

                        if( currentItem > 1 ) {
                            moveAmount = amountLeft - (parentWidth * (currentItem - 1));
                        }
                        $(this).css('left', moveAmount + 'px');
                    });

                    // Corrects autoPlay timer
                    if(_.settings.autoPlay === true ) {
                        clearInterval(timer);
                        _.autoPlay();
                    }    

                });
            }
        };

        Skippr.prototype.arrowBuild = function() {

            var _ = this,
                previous,
                next,
                startingPrevious = _.count, // what will be the first previous slide?
                previousStyles = '';

            if ( _.settings.hidePrevious === true ) {
                previousStyles = 'style="display:none;"'; 
            }

            previous = '<nav class="skippr-nav-item skippr-arrow skippr-previous" data-slider="' + startingPrevious + '" ' + previousStyles + '></nav>';
            next = '<nav class="skippr-nav-item skippr-arrow skippr-next" data-slider="2"></nav>';

            _.$element.append(previous + next);

        };

        Skippr.prototype.navBuild = function() {

            var _ = this,
                container,
                navElements = [];

            if (_.settings.navType == "block") {
                var styleClass = "skippr-nav-element-block";
            } else if(_.settings.navType == "bubble") {
               var styleClass = "skippr-nav-element-bubble"; 
            }

            for (var i = 0; i < _.count; i++) { 
                //cycle through slideshow divs and display correct number of bubbles.
                var insert;

                if (i == 0) {
                    //check if first bubble, add respective active class.
                    insert = "<div class='skippr-nav-element skippr-nav-item " + styleClass + " skippr-nav-element-active' data-slider='" + (i + 1) + "'></div>";
                } else {
                    insert = "<div class='skippr-nav-element skippr-nav-item " + styleClass + "' data-slider='" + (i + 1) + "'></div>";
                }
                //insert bubbles into an array.
                navElements.push(insert); 
            };
            //join array elements into a single string.
            navElements = navElements.join(""); 
            // append html to bubbles container div.
            container = '<nav class="skippr-nav-container">' + navElements + '</nav>';

            _.$element.append(container);

        };

        Skippr.prototype.arrowClick = function() {
            
            var _ = this,
                $arrows = _.$element.find(".skippr-arrow");
            
            $arrows.click(function(){
               
                if ( !$(this).hasClass('disabled') ) {
                    _.change($(this));  
                }
                
            });

        };

        Skippr.prototype.navClick = function() {

            var _ = this,
                $navs = _.$element.find('.skippr-nav-element');

            $navs.click(function(){

                if ( !$(this).hasClass('disabled') ) {
                    _.change($(this));
                }
            });

        };

        Skippr.prototype.change = function(element) {

            var _ = this,
                item = element.attr('data-slider'),
                allNavItems = _.$element.find(".skippr-nav-item"),
                currentItem = _.$element.find(".skippr-nav-element-active").attr('data-slider'),
                nextData = _.$element.find(".skippr-next").attr('data-slider'),
                previousData = _.$element.find(".skippr-previous").attr('data-slider');

            if(item != currentItem) { //prevents animation for repeat click.

                if (_.settings.transition == 'fade') {

                    _.$photos.eq(item - 1).css('z-index', '10').siblings('div').css('z-index', '9');
                    
                    _.$photos.eq(item - 1).fadeIn(_.settings.speed, function() {
                        _.$element.find(".visible").fadeOut('fast',function(){
                            $(this).removeClass('visible');
                            _.$photos.eq(item - 1).addClass('visible');
                        });
                    }); 
                }

                if (_.settings.transition == 'slide') {
                  
                    _.$photos.each(function(){

                        var amountLeft = parseFloat($(this).css('left')),
                            parentWidth = _.$parent.width(),
                            moveAmount;

                        if (item > currentItem) {
                            moveAmount = amountLeft - (parentWidth * (item - currentItem)); 
                        }

                        if (item < currentItem) {
                            moveAmount = amountLeft + (parentWidth * (currentItem - item));                           
                        }

                        allNavItems.addClass('disabled');
                        
                        $(this).velocity({'left': moveAmount + 'px'}, _.settings.speed, _.settings.easing, function(){

                            allNavItems.removeClass('disabled');

                        });

                        _.logs("slides sliding");

                    });
                }


                _.$element.find(".skippr-nav-element")
                          .eq(item - 1)
                          .addClass('skippr-nav-element-active')
                          .siblings()
                          .removeClass('skippr-nav-element-active');
                
                var nextDataAddString = Number(item) + 1,
                    previousDataAddString = Number(item) - 1;

                if ( item == _.count ){ 
                    _.$element.find(".skippr-next").attr('data-slider', '1' );
                } else {
                     _.$element.find(".skippr-next").attr('data-slider', nextDataAddString );
                }
                
                if (item == 1) {
                     _.$element.find(".skippr-previous").attr('data-slider', _.countString );
                }  else {
                    _.$element.find(".skippr-previous").attr('data-slider', previousDataAddString ); 
                }

                if( _.settings.arrows && _.settings.hidePrevious ) {
                    _.hidePrevious();
                }    
            }

        };

        Skippr.prototype.autoPlay = function() {

            var _ = this;

            timer = setInterval(function(){
                var activeElement =  _.$element.find(".skippr-nav-element-active"),
                    activeSlide = activeElement.attr('data-slider');

                if( activeSlide == _.count ) {
                  var elementToInsert =  _.$element.find(".skippr-nav-element").eq(0); 
                } else {
                    var elementToInsert = activeElement.next();
                }

                _.change(elementToInsert);
                    
            },_.settings.autoPlayDuration);

        };

        Skippr.prototype.autoPlayPause = function() {

            var _ = this;

            // Set up a few listeners to clear and reset the autoPlay timer.

            _.$parent.hover(function(){
                clearInterval(timer);

                _.logs("clearing timer on hover");

            }, function() {
                _.autoPlay();

                _.logs("resetting timer on un-hover");

            });

            // Checks if this tab is not being viewed, and pauses autoPlay timer if not. 
            $(window).on("blur focus", function(e) {

                var prevType = $(this).data("prevType");

                if (prevType != e.type) {   //  reduce double fire issues
                    switch (e.type) {
                        case "blur":
                            clearInterval(timer);
                            _.logs('clearing timer on window blur'); 
                            break;
                        case "focus":
                            _.autoPlay();
                            _.logs('resetting timer on window focus');
                            break;
                    }
                }

                $(this).data("prevType", e.type);
            });

        };

        Skippr.prototype.setupSlider = function() {

            var _ = this,
                parentWidth = _.$parent.width(),
                amountLeft;

            _.$photos.css('position', 'absolute');

            for (i = 0; i < _.count; i++) {

                amountLeft = parentWidth * i;
                _.$photos.eq(i).css('left', amountLeft);
            }


        }

        Skippr.prototype.keyPress = function() {

            var _ = this;

            if(_.settings.keyboardOnAlways == true) {

                $(document).on('keydown', function(e) {
                    if(e.which == 39) {
                         _.$element.find(".skippr-next").trigger('click');
                    }
                    if(e.which == 37) {
                         _.$element.find(".skippr-previous").trigger('click');
                    }

                });
            }

            if (_.settings.keyboardOnAlways == false) {

                _.$parent.hover(function(){

                    $(document).on('keydown', function(e) {
                        if(e.which == 39) {
                             _.$element.find(".skippr-next").trigger('click');
                        }
                        if(e.which == 37) {
                             _.$element.find(".skippr-previous").trigger('click');
                        }

                    });
                    
                }, function(){
                    $(document).off('keydown');
                });
            }
            
        }

        Skippr.prototype.hidePrevious = function() {

            var _ = this;

            if ( _.$element.find(".skippr-nav-element").eq(0).hasClass('skippr-nav-element-active')) {
                 _.$element.find(".skippr-previous").fadeOut();
            } else {
                 _.$element.find(".skippr-previous").fadeIn();
            }
        }

        Skippr.prototype.logs = function(message) {

            var _ = this;

            _.settings.logs === true && console.log(message);

        }



        return Skippr;

    })();

    $.fn.skippr = function (options) {

        var instance;

        instance = this.data('skippr');
        if (!instance) {
            return this.each(function () {
                return $(this).data('skippr', new Skippr(this,options));
            });
        }
        if (options === true) return instance;
        if ($.type(options) === 'string') instance[options]();
        return this;
    };

    $.fn.skippr.defaults = {
        transition: 'slide',
        speed: 1000,
        easing: 'easeOutQuart',
        navType: 'block',
        childrenElementType : 'div',
        arrows: true,
        autoPlay: false,
        autoPlayDuration: 5000,
        keyboardOnAlways: true,
        hidePrevious: false,
        imgArray : null,
        logs: false
       
    };

}).call(this);

/*!
* Velocity.js: Accelerated JavaScript animation.
* @version 0.11.2
* @docs http://VelocityJS.org
* @license Copyright 2014 Julian Shapiro. MIT License: http://en.wikipedia.org/wiki/MIT_License
*/
!function(e){"function"==typeof define&&define.amd?window.Velocity?define(e):define(["jquery"],e):e("object"==typeof exports?window.Velocity?void 0:require("jquery"):window.jQuery)}(function(e){return function(t,r,a,o){function i(e){for(var t=-1,r=e?e.length:0,a=[];++t<r;){var o=e[t];o&&a.push(o)}return a}function n(e){var t=$.data(e,p);return null===t?o:t}function s(e){return function(t){return Math.round(t*e)*(1/e)}}function l(e,t){var r=e;return y.isString(e)?v.Easings[e]||(r=!1):r=y.isArray(e)&&1===e.length?s.apply(null,e):y.isArray(e)&&2===e.length?x.apply(null,e.concat([t])):y.isArray(e)&&4===e.length?S.apply(null,e):!1,r===!1&&(r=v.Easings[v.defaults.easing]?v.defaults.easing:f),r}function u(e){if(e)for(var t=(new Date).getTime(),r=0,a=v.State.calls.length;a>r;r++)if(v.State.calls[r]){var i=v.State.calls[r],s=i[0],l=i[2],p=i[3];p||(p=v.State.calls[r][3]=t-16);for(var d=Math.min((t-p)/l.duration,1),f=0,g=s.length;g>f;f++){var m=s[f],S=m.element;if(n(S)){var x=!1;l.display&&"none"!==l.display&&b.setPropertyValue(S,"display",l.display),l.visibility&&"hidden"!==l.visibility&&b.setPropertyValue(S,"visibility",l.visibility);for(var V in m)if("element"!==V){var P=m[V],w,C=y.isString(P.easing)?v.Easings[P.easing]:P.easing;if(w=1===d?P.endValue:P.startValue+(P.endValue-P.startValue)*C(d),P.currentValue=w,b.Hooks.registered[V]){var T=b.Hooks.getRoot(V),k=n(S).rootPropertyValueCache[T];k&&(P.rootPropertyValue=k)}var E=b.setPropertyValue(S,V,P.currentValue+(0===parseFloat(w)?"":P.unitType),P.rootPropertyValue,P.scrollData);b.Hooks.registered[V]&&(n(S).rootPropertyValueCache[T]=b.Normalizations.registered[T]?b.Normalizations.registered[T]("extract",null,E[1]):E[1]),"transform"===E[0]&&(x=!0)}l.mobileHA&&n(S).transformCache.translate3d===o&&(n(S).transformCache.translate3d="(0px, 0px, 0px)",x=!0),x&&b.flushTransformCache(S)}}l.display&&"none"!==l.display&&(v.State.calls[r][2].display=!1),l.visibility&&"hidden"!==l.visibility&&(v.State.calls[r][2].visibility=!1),l.progress&&l.progress.call(i[1],i[1],d,Math.max(0,p+l.duration-t),p),1===d&&c(r)}v.State.isTicking&&(v.mock?u(!0):h(u))}function c(e,t){if(!v.State.calls[e])return!1;for(var r=v.State.calls[e][0],a=v.State.calls[e][1],i=v.State.calls[e][2],s=v.State.calls[e][4],l=!1,u=0,c=r.length;c>u;u++){var p=r[u].element;if(t||i.loop||("none"===i.display&&b.setPropertyValue(p,"display",i.display),"hidden"===i.visibility&&b.setPropertyValue(p,"visibility",i.visibility)),($.queue(p)[1]===o||!/\.velocityQueueEntryFlag/i.test($.queue(p)[1]))&&n(p)){n(p).isAnimating=!1,n(p).rootPropertyValueCache={};var d=!1;$.each(n(p).transformCache,function(e,t){var r=/^scale/.test(e)?1:0;new RegExp("^\\("+r+"[^.]").test(t)&&(d=!0,delete n(p).transformCache[e])}),i.mobileHA&&(d=!0,delete n(p).transformCache.translate3d),d&&b.flushTransformCache(p),b.Values.removeClass(p,"velocity-animating")}if(!t&&i.complete&&!i.loop&&u===c-1)try{i.complete.call(a,a)}catch(f){setTimeout(function(){throw f},1)}s&&i.loop!==!0&&s(a),i.loop!==!0||t||v.animate(p,"reverse",{loop:!0,delay:i.delay}),i.queue!==!1&&$.dequeue(p,i.queue)}v.State.calls[e]=!1;for(var g=0,m=v.State.calls.length;m>g;g++)if(v.State.calls[g]!==!1){l=!0;break}l===!1&&(v.State.isTicking=!1,delete v.State.calls,v.State.calls=[])}var p="velocity",d=400,f="swing",g=function(){if(a.documentMode)return a.documentMode;for(var e=7;e>4;e--){var t=a.createElement("div");if(t.innerHTML="<!--[if IE "+e+"]><span></span><![endif]-->",t.getElementsByTagName("span").length)return t=null,e}return o}(),m=function(){var e=0;return r.webkitRequestAnimationFrame||r.mozRequestAnimationFrame||function(t){var r=(new Date).getTime(),a;return a=Math.max(0,16-(r-e)),e=r+a,setTimeout(function(){t(r+a)},a)}}(),h=r.requestAnimationFrame||m,y={isString:function(e){return"string"==typeof e},isArray:Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)},isFunction:function(e){return"[object Function]"===Object.prototype.toString.call(e)},isNode:function(e){return e&&e.nodeType},isNodeList:function(e){return"object"==typeof e&&/^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(e))&&e.length!==o&&(0===e.length||"object"==typeof e[0]&&e[0].nodeType>0)},isWrapped:function(e){return e&&(e.jquery||r.Zepto&&r.Zepto.zepto.isZ(e))},isSVG:function(e){return r.SVGElement&&e instanceof SVGElement},isEmptyObject:function(e){var t;for(t in e)return!1;return!0}},$;if(e&&e.fn!==o?$=e:r.Velocity&&r.Velocity.Utilities&&($=r.Velocity.Utilities),!$)throw new Error("Velocity: Either jQuery or Velocity's jQuery shim must first be loaded.");if(t.Velocity!==o&&t.Velocity.Utilities==o)throw new Error("Velocity: Namespace is occupied.");if(7>=g){if(e)return void(e.fn.velocity=e.fn.animate);throw new Error("Velocity: For IE<=7, Velocity falls back to jQuery, which must first be loaded.")}if(8===g&&!e)throw new Error("Velocity: For IE8, Velocity requires jQuery proper to be loaded; Velocity's jQuery shim does not work with IE8.");var v={State:{isMobile:/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),isAndroid:/Android/i.test(navigator.userAgent),isGingerbread:/Android 2\.3\.[3-7]/i.test(navigator.userAgent),isChrome:r.chrome,isFirefox:/Firefox/i.test(navigator.userAgent),prefixElement:a.createElement("div"),prefixMatches:{},scrollAnchor:null,scrollPropertyLeft:null,scrollPropertyTop:null,isTicking:!1,calls:[]},CSS:{},Utilities:$,Sequences:{},Easings:{},Promise:r.Promise,defaults:{queue:"",duration:d,easing:f,begin:null,complete:null,progress:null,display:null,loop:!1,delay:!1,mobileHA:!0,_cacheValues:!0},init:function(e){$.data(e,p,{isSVG:y.isSVG(e),isAnimating:!1,computedStyle:null,tweensContainer:null,rootPropertyValueCache:{},transformCache:{}})},animate:function(){},hook:function(e,t,r){var a=o;return y.isWrapped(e)&&(e=[].slice.call(e)),$.each(y.isNode(e)?[e]:e,function(e,i){if(n(i)===o&&v.init(i),r===o)a===o&&(a=v.CSS.getPropertyValue(i,t));else{var s=v.CSS.setPropertyValue(i,t,r);"transform"===s[0]&&v.CSS.flushTransformCache(i),a=s}}),a},mock:!1,version:{major:0,minor:11,patch:2},debug:!1};r.pageYOffset!==o?(v.State.scrollAnchor=r,v.State.scrollPropertyLeft="pageXOffset",v.State.scrollPropertyTop="pageYOffset"):(v.State.scrollAnchor=a.documentElement||a.body.parentNode||a.body,v.State.scrollPropertyLeft="scrollLeft",v.State.scrollPropertyTop="scrollTop");var S=function(){function e(e,t){return 1-3*t+3*e}function t(e,t){return 3*t-6*e}function r(e){return 3*e}function a(a,o,i){return((e(o,i)*a+t(o,i))*a+r(o))*a}function o(a,o,i){return 3*e(o,i)*a*a+2*t(o,i)*a+r(o)}return function(e,t,r,i){function n(t){for(var i=t,n=0;8>n;++n){var s=o(i,e,r);if(0===s)return i;var l=a(i,e,r)-t;i-=l/s}return i}if(4!==arguments.length)return!1;for(var s=0;4>s;++s)if("number"!=typeof arguments[s]||isNaN(arguments[s])||!isFinite(arguments[s]))return!1;return e=Math.min(e,1),r=Math.min(r,1),e=Math.max(e,0),r=Math.max(r,0),function(o){return e===t&&r===i?o:a(n(o),t,i)}}}(),x=function(){function e(e){return-e.tension*e.x-e.friction*e.v}function t(t,r,a){var o={x:t.x+a.dx*r,v:t.v+a.dv*r,tension:t.tension,friction:t.friction};return{dx:o.v,dv:e(o)}}function r(r,a){var o={dx:r.v,dv:e(r)},i=t(r,.5*a,o),n=t(r,.5*a,i),s=t(r,a,n),l=1/6*(o.dx+2*(i.dx+n.dx)+s.dx),u=1/6*(o.dv+2*(i.dv+n.dv)+s.dv);return r.x=r.x+l*a,r.v=r.v+u*a,r}return function a(e,t,o){var i={x:-1,v:0,tension:null,friction:null},n=[0],s=0,l=1e-4,u=.016,c,p,d;for(e=parseFloat(e)||500,t=parseFloat(t)||20,o=o||null,i.tension=e,i.friction=t,c=null!==o,c?(s=a(e,t),p=s/o*u):p=u;;)if(d=r(d||i,p),n.push(1+d.x),s+=16,!(Math.abs(d.x)>l&&Math.abs(d.v)>l))break;return c?function(e){return n[e*(n.length-1)|0]}:s}}();!function(){v.Easings.linear=function(e){return e},v.Easings.swing=function(e){return.5-Math.cos(e*Math.PI)/2},v.Easings.spring=function(e){return 1-Math.cos(4.5*e*Math.PI)*Math.exp(6*-e)},v.Easings.ease=S(.25,.1,.25,1),v.Easings["ease-in"]=S(.42,0,1,1),v.Easings["ease-out"]=S(0,0,.58,1),v.Easings["ease-in-out"]=S(.42,0,.58,1);var e={};$.each(["Quad","Cubic","Quart","Quint","Expo"],function(t,r){e[r]=function(e){return Math.pow(e,t+2)}}),$.extend(e,{Sine:function(e){return 1-Math.cos(e*Math.PI/2)},Circ:function(e){return 1-Math.sqrt(1-e*e)},Elastic:function(e){return 0===e||1===e?e:-Math.pow(2,8*(e-1))*Math.sin((80*(e-1)-7.5)*Math.PI/15)},Back:function(e){return e*e*(3*e-2)},Bounce:function(e){for(var t,r=4;e<((t=Math.pow(2,--r))-1)/11;);return 1/Math.pow(4,3-r)-7.5625*Math.pow((3*t-2)/22-e,2)}}),$.each(e,function(e,t){v.Easings["easeIn"+e]=t,v.Easings["easeOut"+e]=function(e){return 1-t(1-e)},v.Easings["easeInOut"+e]=function(e){return.5>e?t(2*e)/2:1-t(-2*e+2)/2}})}();var b=v.CSS={RegEx:{isHex:/^#([A-f\d]{3}){1,2}$/i,valueUnwrap:/^[A-z]+\((.*)\)$/i,wrappedValueAlreadyExtracted:/[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,valueSplit:/([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/gi},Lists:{colors:["fill","stroke","stopColor","color","backgroundColor","borderColor","borderTopColor","borderRightColor","borderBottomColor","borderLeftColor","outlineColor"],transformsBase:["translateX","translateY","scale","scaleX","scaleY","skewX","skewY","rotateZ"],transforms3D:["transformPerspective","translateZ","scaleZ","rotateX","rotateY"]},Hooks:{templates:{textShadow:["Color X Y Blur","black 0px 0px 0px"],boxShadow:["Color X Y Blur Spread","black 0px 0px 0px 0px"],clip:["Top Right Bottom Left","0px 0px 0px 0px"],backgroundPosition:["X Y","0% 0%"],transformOrigin:["X Y Z","50% 50% 0px"],perspectiveOrigin:["X Y","50% 50%"]},registered:{},register:function(){for(var e=0;e<b.Lists.colors.length;e++)b.Hooks.templates[b.Lists.colors[e]]=["Red Green Blue Alpha","255 255 255 1"];var t,r,a;if(g)for(t in b.Hooks.templates){r=b.Hooks.templates[t],a=r[0].split(" ");var o=r[1].match(b.RegEx.valueSplit);"Color"===a[0]&&(a.push(a.shift()),o.push(o.shift()),b.Hooks.templates[t]=[a.join(" "),o.join(" ")])}for(t in b.Hooks.templates){r=b.Hooks.templates[t],a=r[0].split(" ");for(var e in a){var i=t+a[e],n=e;b.Hooks.registered[i]=[t,n]}}},getRoot:function(e){var t=b.Hooks.registered[e];return t?t[0]:e},cleanRootPropertyValue:function(e,t){return b.RegEx.valueUnwrap.test(t)&&(t=t.match(b.Hooks.RegEx.valueUnwrap)[1]),b.Values.isCSSNullValue(t)&&(t=b.Hooks.templates[e][1]),t},extractValue:function(e,t){var r=b.Hooks.registered[e];if(r){var a=r[0],o=r[1];return t=b.Hooks.cleanRootPropertyValue(a,t),t.toString().match(b.RegEx.valueSplit)[o]}return t},injectValue:function(e,t,r){var a=b.Hooks.registered[e];if(a){var o=a[0],i=a[1],n,s;return r=b.Hooks.cleanRootPropertyValue(o,r),n=r.toString().match(b.RegEx.valueSplit),n[i]=t,s=n.join(" ")}return r}},Normalizations:{registered:{clip:function(e,t,r){switch(e){case"name":return"clip";case"extract":var a;return b.RegEx.wrappedValueAlreadyExtracted.test(r)?a=r:(a=r.toString().match(b.RegEx.valueUnwrap),a=a?a[1].replace(/,(\s+)?/g," "):r),a;case"inject":return"rect("+r+")"}},opacity:function(e,t,r){if(8>=g)switch(e){case"name":return"filter";case"extract":var a=r.toString().match(/alpha\(opacity=(.*)\)/i);return r=a?a[1]/100:1;case"inject":return t.style.zoom=1,parseFloat(r)>=1?"":"alpha(opacity="+parseInt(100*parseFloat(r),10)+")"}else switch(e){case"name":return"opacity";case"extract":return r;case"inject":return r}}},register:function(){9>=g||v.State.isGingerbread||(b.Lists.transformsBase=b.Lists.transformsBase.concat(b.Lists.transforms3D));for(var e=0;e<b.Lists.transformsBase.length;e++)!function(){var t=b.Lists.transformsBase[e];b.Normalizations.registered[t]=function(e,r,a){switch(e){case"name":return"transform";case"extract":return n(r)===o||n(r).transformCache[t]===o?/^scale/i.test(t)?1:0:n(r).transformCache[t].replace(/[()]/g,"");case"inject":var i=!1;switch(t.substr(0,t.length-1)){case"translate":i=!/(%|px|em|rem|vw|vh|\d)$/i.test(a);break;case"scal":case"scale":v.State.isAndroid&&n(r).transformCache[t]===o&&1>a&&(a=1),i=!/(\d)$/i.test(a);break;case"skew":i=!/(deg|\d)$/i.test(a);break;case"rotate":i=!/(deg|\d)$/i.test(a)}return i||(n(r).transformCache[t]="("+a+")"),n(r).transformCache[t]}}}();for(var e=0;e<b.Lists.colors.length;e++)!function(){var t=b.Lists.colors[e];b.Normalizations.registered[t]=function(e,r,a){switch(e){case"name":return t;case"extract":var i;if(b.RegEx.wrappedValueAlreadyExtracted.test(a))i=a;else{var n,s={black:"rgb(0, 0, 0)",blue:"rgb(0, 0, 255)",gray:"rgb(128, 128, 128)",green:"rgb(0, 128, 0)",red:"rgb(255, 0, 0)",white:"rgb(255, 255, 255)"};/^[A-z]+$/i.test(a)?n=s[a]!==o?s[a]:s.black:b.RegEx.isHex.test(a)?n="rgb("+b.Values.hexToRgb(a).join(" ")+")":/^rgba?\(/i.test(a)||(n=s.black),i=(n||a).toString().match(b.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g," ")}return 8>=g||3!==i.split(" ").length||(i+=" 1"),i;case"inject":return 8>=g?4===a.split(" ").length&&(a=a.split(/\s+/).slice(0,3).join(" ")):3===a.split(" ").length&&(a+=" 1"),(8>=g?"rgb":"rgba")+"("+a.replace(/\s+/g,",").replace(/\.(\d)+(?=,)/g,"")+")"}}}()}},Names:{camelCase:function(e){return e.replace(/-(\w)/g,function(e,t){return t.toUpperCase()})},SVGAttribute:function(e){var t="width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";return(g||v.State.isAndroid&&!v.State.isChrome)&&(t+="|transform"),new RegExp("^("+t+")$","i").test(e)},prefixCheck:function(e){if(v.State.prefixMatches[e])return[v.State.prefixMatches[e],!0];for(var t=["","Webkit","Moz","ms","O"],r=0,a=t.length;a>r;r++){var o;if(o=0===r?e:t[r]+e.replace(/^\w/,function(e){return e.toUpperCase()}),y.isString(v.State.prefixElement.style[o]))return v.State.prefixMatches[e]=o,[o,!0]}return[e,!1]}},Values:{hexToRgb:function(e){var t=/^#?([a-f\d])([a-f\d])([a-f\d])$/i,r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,a;return e=e.replace(t,function(e,t,r,a){return t+t+r+r+a+a}),a=r.exec(e),a?[parseInt(a[1],16),parseInt(a[2],16),parseInt(a[3],16)]:[0,0,0]},isCSSNullValue:function(e){return 0==e||/^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(e)},getUnitType:function(e){return/^(rotate|skew)/i.test(e)?"deg":/(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(e)?"":"px"},getDisplayType:function(e){var t=e.tagName.toString().toLowerCase();return/^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(t)?"inline":/^(li)$/i.test(t)?"list-item":/^(tr)$/i.test(t)?"table-row":"block"},addClass:function(e,t){e.classList?e.classList.add(t):e.className+=(e.className.length?" ":"")+t},removeClass:function(e,t){e.classList?e.classList.remove(t):e.className=e.className.toString().replace(new RegExp("(^|\\s)"+t.split(" ").join("|")+"(\\s|$)","gi")," ")}},getPropertyValue:function(e,t,a,i){function s(e,t){function a(){u&&b.setPropertyValue(e,"display","none")}var l=0;if(8>=g)l=$.css(e,t);else{var u=!1;if(/^(width|height)$/.test(t)&&0===b.getPropertyValue(e,"display")&&(u=!0,b.setPropertyValue(e,"display",b.Values.getDisplayType(e))),!i){if("height"===t&&"border-box"!==b.getPropertyValue(e,"boxSizing").toString().toLowerCase()){var c=e.offsetHeight-(parseFloat(b.getPropertyValue(e,"borderTopWidth"))||0)-(parseFloat(b.getPropertyValue(e,"borderBottomWidth"))||0)-(parseFloat(b.getPropertyValue(e,"paddingTop"))||0)-(parseFloat(b.getPropertyValue(e,"paddingBottom"))||0);return a(),c}if("width"===t&&"border-box"!==b.getPropertyValue(e,"boxSizing").toString().toLowerCase()){var p=e.offsetWidth-(parseFloat(b.getPropertyValue(e,"borderLeftWidth"))||0)-(parseFloat(b.getPropertyValue(e,"borderRightWidth"))||0)-(parseFloat(b.getPropertyValue(e,"paddingLeft"))||0)-(parseFloat(b.getPropertyValue(e,"paddingRight"))||0);return a(),p}}var d;d=n(e)===o?r.getComputedStyle(e,null):n(e).computedStyle?n(e).computedStyle:n(e).computedStyle=r.getComputedStyle(e,null),(g||v.State.isFirefox)&&"borderColor"===t&&(t="borderTopColor"),l=9===g&&"filter"===t?d.getPropertyValue(t):d[t],(""===l||null===l)&&(l=e.style[t]),a()}if("auto"===l&&/^(top|right|bottom|left)$/i.test(t)){var f=s(e,"position");("fixed"===f||"absolute"===f&&/top|left/i.test(t))&&(l=$(e).position()[t]+"px")}return l}var l;if(b.Hooks.registered[t]){var u=t,c=b.Hooks.getRoot(u);a===o&&(a=b.getPropertyValue(e,b.Names.prefixCheck(c)[0])),b.Normalizations.registered[c]&&(a=b.Normalizations.registered[c]("extract",e,a)),l=b.Hooks.extractValue(u,a)}else if(b.Normalizations.registered[t]){var p,d;p=b.Normalizations.registered[t]("name",e),"transform"!==p&&(d=s(e,b.Names.prefixCheck(p)[0]),b.Values.isCSSNullValue(d)&&b.Hooks.templates[t]&&(d=b.Hooks.templates[t][1])),l=b.Normalizations.registered[t]("extract",e,d)}return/^[\d-]/.test(l)||(l=n(e)&&n(e).isSVG&&b.Names.SVGAttribute(t)?/^(height|width)$/i.test(t)?e.getBBox()[t]:e.getAttribute(t):s(e,b.Names.prefixCheck(t)[0])),b.Values.isCSSNullValue(l)&&(l=0),v.debug>=2&&console.log("Get "+t+": "+l),l},setPropertyValue:function(e,t,a,o,i){var s=t;if("scroll"===t)i.container?i.container["scroll"+i.direction]=a:"Left"===i.direction?r.scrollTo(a,i.alternateValue):r.scrollTo(i.alternateValue,a);else if(b.Normalizations.registered[t]&&"transform"===b.Normalizations.registered[t]("name",e))b.Normalizations.registered[t]("inject",e,a),s="transform",a=n(e).transformCache[t];else{if(b.Hooks.registered[t]){var l=t,u=b.Hooks.getRoot(t);o=o||b.getPropertyValue(e,u),a=b.Hooks.injectValue(l,a,o),t=u}if(b.Normalizations.registered[t]&&(a=b.Normalizations.registered[t]("inject",e,a),t=b.Normalizations.registered[t]("name",e)),s=b.Names.prefixCheck(t)[0],8>=g)try{e.style[s]=a}catch(c){v.debug&&console.log("Browser does not support ["+a+"] for ["+s+"]")}else n(e)&&n(e).isSVG&&b.Names.SVGAttribute(t)?e.setAttribute(t,a):e.style[s]=a;v.debug>=2&&console.log("Set "+t+" ("+s+"): "+a)}return[s,a]},flushTransformCache:function(e){function t(t){return parseFloat(b.getPropertyValue(e,t))}var r="";if((g||v.State.isAndroid&&!v.State.isChrome)&&n(e).isSVG){var a={translate:[t("translateX"),t("translateY")],skewX:[t("skewX")],skewY:[t("skewY")],scale:1!==t("scale")?[t("scale"),t("scale")]:[t("scaleX"),t("scaleY")],rotate:[t("rotateZ"),0,0]};$.each(n(e).transformCache,function(e){/^translate/i.test(e)?e="translate":/^scale/i.test(e)?e="scale":/^rotate/i.test(e)&&(e="rotate"),a[e]&&(r+=e+"("+a[e].join(" ")+") ",delete a[e])})}else{var o,i;$.each(n(e).transformCache,function(t){return o=n(e).transformCache[t],"transformPerspective"===t?(i=o,!0):(9===g&&"rotateZ"===t&&(t="rotate"),void(r+=t+o+" "))}),i&&(r="perspective"+i+" "+r)}b.setPropertyValue(e,"transform",r)}};b.Hooks.register(),b.Normalizations.register(),v.animate=function(){function e(){return p?C.promise||null:f}function t(){function e(e){function d(e,r){var a=o,i=o,n=o;return y.isArray(e)?(a=e[0],!y.isArray(e[1])&&/^[\d-]/.test(e[1])||y.isFunction(e[1])||b.RegEx.isHex.test(e[1])?n=e[1]:(y.isString(e[1])&&!b.RegEx.isHex.test(e[1])||y.isArray(e[1]))&&(i=r?e[1]:l(e[1],s.duration),e[2]!==o&&(n=e[2]))):a=e,r||(i=i||s.easing),y.isFunction(a)&&(a=a.call(t,V,x)),y.isFunction(n)&&(n=n.call(t,V,x)),[a||0,i,n]}function f(e,t){var r,a;return a=(t||0).toString().toLowerCase().replace(/[%A-z]+$/,function(e){return r=e,""}),r||(r=b.Values.getUnitType(e)),[a,r]}function g(){var e={myParent:t.parentNode||a.body,position:b.getPropertyValue(t,"position"),fontSize:b.getPropertyValue(t,"fontSize")},o=e.position===N.lastPosition&&e.myParent===N.lastParent,i=e.fontSize===N.lastFontSize;N.lastParent=e.myParent,N.lastPosition=e.position,N.lastFontSize=e.fontSize;var s=100,l={};if(i&&o)l.emToPx=N.lastEmToPx,l.percentToPxWidth=N.lastPercentToPxWidth,l.percentToPxHeight=N.lastPercentToPxHeight;else{var u=n(t).isSVG?a.createElementNS("http://www.w3.org/2000/svg","rect"):a.createElement("div");v.init(u),e.myParent.appendChild(u),v.CSS.setPropertyValue(u,"position",e.position),v.CSS.setPropertyValue(u,"fontSize",e.fontSize),v.CSS.setPropertyValue(u,"overflow","hidden"),v.CSS.setPropertyValue(u,"overflowX","hidden"),v.CSS.setPropertyValue(u,"overflowY","hidden"),v.CSS.setPropertyValue(u,"boxSizing","content-box"),v.CSS.setPropertyValue(u,"paddingLeft",s+"em"),v.CSS.setPropertyValue(u,"minWidth",s+"%"),v.CSS.setPropertyValue(u,"maxWidth",s+"%"),v.CSS.setPropertyValue(u,"width",s+"%"),v.CSS.setPropertyValue(u,"minHeight",s+"%"),v.CSS.setPropertyValue(u,"maxHeight",s+"%"),v.CSS.setPropertyValue(u,"height",s+"%"),l.percentToPxWidth=N.lastPercentToPxWidth=(parseFloat(b.getPropertyValue(u,"width",null,!0))||1)/s,l.percentToPxHeight=N.lastPercentToPxHeight=(parseFloat(b.getPropertyValue(u,"height",null,!0))||1)/s,l.emToPx=N.lastEmToPx=(parseFloat(b.getPropertyValue(u,"paddingLeft"))||1)/s,e.myParent.removeChild(u)}return null===N.remToPx&&(N.remToPx=parseFloat(b.getPropertyValue(a.body,"fontSize"))||16),null===N.vwToPx&&(N.vwToPx=parseFloat(r.innerWidth)/100,N.vhToPx=parseFloat(r.innerHeight)/100),l.remToPx=N.remToPx,l.vwToPx=N.vwToPx,l.vhToPx=N.vhToPx,v.debug>=1&&console.log("Unit ratios: "+JSON.stringify(l),t),l}if(s.begin&&0===V)try{s.begin.call(m,m)}catch(P){setTimeout(function(){throw P},1)}if("scroll"===T){var w=/^x$/i.test(s.axis)?"Left":"Top",k=parseFloat(s.offset)||0,E,F,A;s.container?y.isWrapped(s.container)||y.isNode(s.container)?(s.container=s.container[0]||s.container,E=s.container["scroll"+w],A=E+$(t).position()[w.toLowerCase()]+k):s.container=null:(E=v.State.scrollAnchor[v.State["scrollProperty"+w]],F=v.State.scrollAnchor[v.State["scrollProperty"+("Left"===w?"Top":"Left")]],A=$(t).offset()[w.toLowerCase()]+k),c={scroll:{rootPropertyValue:!1,startValue:E,currentValue:E,endValue:A,unitType:"",easing:s.easing,scrollData:{container:s.container,direction:w,alternateValue:F}},element:t},v.debug&&console.log("tweensContainer (scroll): ",c.scroll,t)}else if("reverse"===T){if(!n(t).tweensContainer)return void $.dequeue(t,s.queue);"none"===n(t).opts.display&&(n(t).opts.display="block"),"hidden"===n(t).opts.visibility&&(n(t).opts.visibility="visible"),n(t).opts.loop=!1,n(t).opts.begin=null,n(t).opts.complete=null,S.easing||delete s.easing,S.duration||delete s.duration,s=$.extend({},n(t).opts,s);var j=$.extend(!0,{},n(t).tweensContainer);for(var L in j)if("element"!==L){var z=j[L].startValue;j[L].startValue=j[L].currentValue=j[L].endValue,j[L].endValue=z,y.isEmptyObject(S)||(j[L].easing=s.easing),v.debug&&console.log("reverse tweensContainer ("+L+"): "+JSON.stringify(j[L]),t)}c=j}else if("start"===T){var j;n(t).tweensContainer&&n(t).isAnimating===!0&&(j=n(t).tweensContainer),$.each(h,function(e,t){if(RegExp("^"+b.Lists.colors.join("$|^")+"$").test(e)){var r=d(t,!0),a=r[0],i=r[1],n=r[2];if(b.RegEx.isHex.test(a)){for(var s=["Red","Green","Blue"],l=b.Values.hexToRgb(a),u=n?b.Values.hexToRgb(n):o,c=0;c<s.length;c++)h[e+s[c]]=[l[c],i,u?u[c]:u];delete h[e]}}});for(var M in h){var R=d(h[M]),q=R[0],B=R[1],O=R[2];M=b.Names.camelCase(M);var W=b.Hooks.getRoot(M),X=!1;if(n(t).isSVG||b.Names.prefixCheck(W)[1]!==!1||b.Normalizations.registered[W]!==o){(s.display&&"none"!==s.display||s.visibility&&"hidden"!==s.visibility)&&/opacity|filter/.test(M)&&!O&&0!==q&&(O=0),s._cacheValues&&j&&j[M]?(O===o&&(O=j[M].endValue+j[M].unitType),X=n(t).rootPropertyValueCache[W]):b.Hooks.registered[M]?O===o?(X=b.getPropertyValue(t,W),O=b.getPropertyValue(t,M,X)):X=b.Hooks.templates[W][1]:O===o&&(O=b.getPropertyValue(t,M));var Y,G,I,U=!1;if(Y=f(M,O),O=Y[0],I=Y[1],Y=f(M,q),q=Y[0].replace(/^([+-\/*])=/,function(e,t){return U=t,""}),G=Y[1],O=parseFloat(O)||0,q=parseFloat(q)||0,"%"===G&&(/^(fontSize|lineHeight)$/.test(M)?(q/=100,G="em"):/^scale/.test(M)?(q/=100,G=""):/(Red|Green|Blue)$/i.test(M)&&(q=q/100*255,G="")),/[\/*]/.test(U))G=I;else if(I!==G&&0!==O)if(0===q)G=I;else{p=p||g();var D=/margin|padding|left|right|width|text|word|letter/i.test(M)||/X$/.test(M)?"x":"y";switch(I){case"%":O*="x"===D?p.percentToPxWidth:p.percentToPxHeight;break;case"px":break;default:O*=p[I+"ToPx"]}switch(G){case"%":O*=1/("x"===D?p.percentToPxWidth:p.percentToPxHeight);break;case"px":break;default:O*=1/p[G+"ToPx"]}}switch(U){case"+":q=O+q;break;case"-":q=O-q;break;case"*":q=O*q;break;case"/":q=O/q}c[M]={rootPropertyValue:X,startValue:O,currentValue:O,endValue:q,unitType:G,easing:B},v.debug&&console.log("tweensContainer ("+M+"): "+JSON.stringify(c[M]),t)}else v.debug&&console.log("Skipping ["+W+"] due to a lack of browser support.")}c.element=t}c.element&&(b.Values.addClass(t,"velocity-animating"),H.push(c),n(t).tweensContainer=c,n(t).opts=s,n(t).isAnimating=!0,V===x-1?(v.State.calls.length>1e4&&(v.State.calls=i(v.State.calls)),v.State.calls.push([H,m,s,null,C.resolver]),v.State.isTicking===!1&&(v.State.isTicking=!0,u())):V++)}var t=this,s=$.extend({},v.defaults,S),c={},p;if(n(t)===o&&v.init(t),parseFloat(s.delay)&&s.queue!==!1&&$.queue(t,s.queue,function(e){v.velocityQueueEntryFlag=!0,n(t).delayTimer={setTimeout:setTimeout(e,parseFloat(s.delay)),next:e}}),v.mock===!0)s.duration=1;else switch(s.duration.toString().toLowerCase()){case"fast":s.duration=200;break;case"normal":s.duration=d;break;case"slow":s.duration=600;break;default:s.duration=parseFloat(s.duration)||1}s.easing=l(s.easing,s.duration),s.begin&&!y.isFunction(s.begin)&&(s.begin=null),s.progress&&!y.isFunction(s.progress)&&(s.progress=null),s.complete&&!y.isFunction(s.complete)&&(s.complete=null),s.display&&(s.display=s.display.toString().toLowerCase(),"auto"===s.display&&(s.display=v.CSS.Values.getDisplayType(t))),s.visibility&&(s.visibility=s.visibility.toString().toLowerCase()),s.mobileHA=s.mobileHA&&v.State.isMobile&&!v.State.isGingerbread,s.queue===!1?s.delay?setTimeout(e,s.delay):e():$.queue(t,s.queue,function(t,r){return r===!0?(C.promise&&C.resolver(m),!0):(v.velocityQueueEntryFlag=!0,void e(t))}),""!==s.queue&&"fx"!==s.queue||"inprogress"===$.queue(t)[0]||$.dequeue(t)}var s=arguments[0]&&($.isPlainObject(arguments[0].properties)&&!arguments[0].properties.names||y.isString(arguments[0].properties)),p,f,g,m,h,S;if(y.isWrapped(this)?(p=!1,g=0,m=this,f=this):(p=!0,g=1,m=s?arguments[0].elements:arguments[0]),m=y.isWrapped(m)?[].slice.call(m):m){s?(h=arguments[0].properties,S=arguments[0].options):(h=arguments[g],S=arguments[g+1]);var x=y.isArray(m)||y.isNodeList(m)?m.length:1,V=0;if("stop"!==h&&!$.isPlainObject(S)){var P=g+1;S={};for(var w=P;w<arguments.length;w++)!y.isArray(arguments[w])&&/^\d/.test(arguments[w])?S.duration=parseFloat(arguments[w]):y.isString(arguments[w])||y.isArray(arguments[w])?S.easing=arguments[w]:y.isFunction(arguments[w])&&(S.complete=arguments[w])}var C={promise:null,resolver:null,rejecter:null};p&&v.Promise&&(C.promise=new v.Promise(function(e,t){C.resolver=e,C.rejecter=t}));var T;switch(h){case"scroll":T="scroll";break;case"reverse":T="reverse";break;case"stop":$.each(y.isNode(m)?[m]:m,function(e,t){n(t)&&n(t).delayTimer&&(clearTimeout(n(t).delayTimer.setTimeout),n(t).delayTimer.next&&n(t).delayTimer.next(),delete n(t).delayTimer)});var k=[];return $.each(v.State.calls,function(e,t){t&&$.each(y.isNode(t[1])?[t[1]]:t[1],function(t,r){$.each(y.isNode(m)?[m]:m,function(t,a){if(a===r){if(n(a)&&$.each(n(a).tweensContainer,function(e,t){t.endValue=t.currentValue}),S===!0||y.isString(S)){var o=y.isString(S)?S:"";$.each($.queue(a,o),function(e,t){y.isFunction(t)&&t(null,!0)}),$.queue(a,o,[])}k.push(e)}})})}),$.each(k,function(e,t){c(t,!0)}),C.promise&&C.resolver(m),e();default:if(!$.isPlainObject(h)||y.isEmptyObject(h)){if(y.isString(h)&&v.Sequences[h]){var E=S.duration,F=S.delay||0;return S.backwards===!0&&(m=(y.isWrapped(m)?[].slice.call(m):m).reverse()),$.each(m,function(e,t){parseFloat(S.stagger)?S.delay=F+parseFloat(S.stagger)*e:y.isFunction(S.stagger)&&(S.delay=F+S.stagger.call(t,e,x)),S.drag&&(S.duration=parseFloat(E)||(/^(callout|transition)/.test(h)?1e3:d),S.duration=Math.max(S.duration*(S.backwards?1-e/x:(e+1)/x),.75*S.duration,200)),v.Sequences[h].call(t,t,S||{},e,x,m,C.promise?C:o)}),e()}var A="Velocity: First argument ("+h+") was not a property map, a known action, or a registered sequence. Aborting.";return C.promise?C.rejecter(new Error(A)):console.log(A),e()}T="start"}var N={lastParent:null,lastPosition:null,lastFontSize:null,lastPercentToPxWidth:null,lastPercentToPxHeight:null,lastEmToPx:null,remToPx:null,vwToPx:null,vhToPx:null},H=[];$.each(y.isNode(m)?[m]:m,function(e,r){y.isNode(r)&&t.call(r)});var j=$.extend({},v.defaults,S),L;if(j.loop=parseInt(j.loop),L=2*j.loop-1,j.loop)for(var z=0;L>z;z++){var M={delay:j.delay};z===L-1&&(M.display=j.display,M.visibility=j.visibility,M.complete=j.complete),v.animate(m,"reverse",M)}return e()}},v.State.isMobile||a.hidden===o||a.addEventListener("visibilitychange",function(){a.hidden?(h=function(e){return setTimeout(function(){e(!0)},16)},u()):h=r.requestAnimationFrame||m});var V;return e&&e.fn?V=e:r.Zepto&&(V=r.Zepto),(V||r).Velocity=v,V&&(V.fn.velocity=v.animate,V.fn.velocity.defaults=v.defaults),$.each(["Down","Up"],function(e,t){v.Sequences["slide"+t]=function(e,r,a,o,i,n){var s=$.extend({},r),l={height:null,marginTop:null,marginBottom:null,paddingTop:null,paddingBottom:null,overflow:null,overflowX:null,overflowY:null},u=s.begin,c=s.complete,p=!1;null!==s.display&&(s.display="Down"===t?s.display||"auto":s.display||"none"),s.begin=function(){function r(){l.height=parseFloat(v.CSS.getPropertyValue(e,"height")),e.style.height="auto",parseFloat(v.CSS.getPropertyValue(e,"height"))===l.height&&(p=!0),v.CSS.setPropertyValue(e,"height",l.height+"px")}if("Down"===t){l.overflow=[v.CSS.getPropertyValue(e,"overflow"),0],l.overflowX=[v.CSS.getPropertyValue(e,"overflowX"),0],l.overflowY=[v.CSS.getPropertyValue(e,"overflowY"),0],e.style.overflow="hidden",e.style.overflowX="visible",e.style.overflowY="hidden",r();for(var a in l)if(!/^overflow/.test(a)){var o=v.CSS.getPropertyValue(e,a);"height"===a&&(o=parseFloat(o)),l[a]=[o,0]}}else{r();for(var a in l){var o=v.CSS.getPropertyValue(e,a);"height"===a&&(o=parseFloat(o)),l[a]=[0,o]}e.style.overflow="hidden",e.style.overflowX="visible",e.style.overflowY="hidden"}u&&u.call(e,e)},s.complete=function(e){var r="Down"===t?0:1;p===!0?l.height[r]="auto":l.height[r]+="px";for(var a in l)e.style[a]=l[a][r];c&&c.call(e,e),n&&n.resolver(i||e)},v.animate(e,l,s)}}),$.each(["In","Out"],function(e,t){v.Sequences["fade"+t]=function(e,r,a,o,i,n){var s=$.extend({},r),l={opacity:"In"===t?1:0};if(a!==o-1)s.complete=s.begin=null;else{var u=s.complete;s.complete=function(){u&&u.call(e,e),n&&n.resolver(i||e)}}null!==s.display&&(s.display=s.display||("In"===t?"auto":"none")),v.animate(this,l,s)}}),v}(e||window,window,document)});

var requestAnimationFrame = window.requestAnimationFrame || 
                            window.mozRequestAnimationFrame || 
                            window.webkitRequestAnimationFrame ||
                            window.msRequestAnimationFrame;


function mobile() {
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		return true;
	} else {
		return false;
	}
}


function squarify() {
	$('.square').each(function() {
		$(this).height($(this).width());
	});
}


var Mast = {

	init : function() {

		var _ = this;

		

		if (mobile()) {

			_.navButton.on('touchstart', function() {

				if (_.element.hasClass('opened')) {

					_.close();

				} else {

					_.open();

				}
			});
			
		} else {

			Mast.loop = requestAnimationFrame(Mast.sizing);

			_.navButton.click(function() {

				if (_.element.hasClass('opened')) {

					_.close();

				} else {

					_.open();

				}

			});
		}
	},

	element : $(".mast"),
	logo : $('.mast-logo'),
	navButton : $("#nav-button"),
	topContainer : $(".mast").children('.top-container'),
	bottomContainer : $(".mast").children('.bottom-container'),
	title : $('.title'),

	sizing : function() {

		var _ = this;
		var distance = $(window).scrollTop();
		var mastHeight = 160;
		var logoWidth = 130;


		if (distance > mastHeight) {

			Mast.getThinner(distance, mastHeight,logoWidth);
			Mast.title.css('font-size', '1.5rem');

		} else {

			Mast.getThicker();
			Mast.title.attr('style', '');

		}

		Mast.loop = requestAnimationFrame(Mast.sizing);

	},

	getThinner : function(distance, mastHeight, logoWidth) {

		Mast.element.height(mastHeight - ((distance - mastHeight) / 2));
		Mast.logo.width(logoWidth - ((distance - logoWidth) / 3));

	},

	getThicker : function() {

		Mast.element.attr('style', '');
		Mast.logo.attr('style', '');

	},

	open : function() {

		var _ = this;
		var containerOffset = 45.5;

		_.logo.attr('src', 'img/logo-white.svg');
		_.navButton.css('color', 'white').removeClass('fa-bars').addClass('fa-close');
		_.element.addClass('full-height opened green');
		_.title.hide();

		if (mobile()) {

			_.topContainer.css({ top : '12px', transform : 'translate(-50%, 0%)' });

		} else {

			cancelAnimationFrame(Mast.loop);
			_.topContainer.css({ top : containerOffset + 'px', transform : 'translate(-50%, 0%)' });
			
		}
		
		_.bottomContainer.fadeIn();
		_.getThicker();

	},

	close : function() {

		var _ = this;
		_.logo.attr('src', 'img/logo-green.svg');
		_.navButton.css('color', '#6bbb6f').removeClass('fa-close').addClass('fa-bars');
		_.element.removeClass('full-height opened green');
		_.topContainer.addClass('quick-transition');
		_.bottomContainer.fadeOut(100);
		_.title.fadeIn('fast');
		setTimeout(function(){_.topContainer.attr('style', '').removeClass('quick-transition')}, 100);

		if (!mobile()) {

			Mast.loop = requestAnimationFrame(Mast.sizing);

		}

		
	}

}


var SecondaryTeamMemberOverlay = {

	init : function() {
		_ = this;

		$('.secondary-team-member').hover(function() {

			_.slideIn($(this));

		}, function() {

			_.slideOut($(this));

		});

	},

	slideIn : function(element) {

		var overlay = element.find('.overlay');

		overlay.css({top : '0%', right : '0%'});

	},

	slideOut : function(element) {

		var overlay = element.find('.overlay');

		overlay.attr('style', '');

	}

}


var ProcessLine = {

	init : function() {

		var _ = this;

		_.setPathLength();
		_.draw();

	},

	element : document.querySelector('.process-line .animated-process-line'),

	colorTransitionPoints : [4777, 3242, 1715, 709, 163],

	colorTransitionElements : [
		{ icon : '#discover-icon', title : '#discover-title' },
		{ icon : '#analyze-icon', title : '#analyze-title' },
		{ icon : '#develop-icon', title : '#develop-title' },
		{ icon : '#implement-icon', title : '#implement-title' },
		{ icon : '#monitor-icon', title : '#monitor-title' }
	],

	setPathLength : function() {

		var path = ProcessLine.element;
		var length = path.getTotalLength();

		path.style.strokeDasharray = length + ' ' + length;
		path.style.strokeDashoffset = length;

	},

	draw : function() {

		var path = ProcessLine.element;
		var length = path.getTotalLength();
		var distance = $(window).scrollTop();

		for(i = 0; i < ProcessLine.colorTransitionPoints.length; i++) {

			if (parseInt(path.style.strokeDashoffset) < ProcessLine.colorTransitionPoints[i]) {

				$(ProcessLine.colorTransitionElements[i].icon).css({color: '#6bbb6f', fontSize : '7rem'});
				$(ProcessLine.colorTransitionElements[i].title).css('width','150px');

			} else {

				$(ProcessLine.colorTransitionElements[i].icon).attr('style', '');
				$(ProcessLine.colorTransitionElements[i].title).attr('style', '');

			}

		}

		path.style.strokeDashoffset = (length - (distance * 2.1));
		ProcessLine.loop = requestAnimationFrame(ProcessLine.draw)

	} 
}



var MediumPosts = {

	init : function() {

		this.setWidth();

	},

	initialElements : $(".m-story"),

	setWidth : function() {

		var loadedElements = $(".medium-container iframe");

		if ($(window).width() > 1000) {

			this.initialElements.each(function() {

				$(this).attr('data-width', "33%");

			})
			loadedElements.each(function() {

				$(this).attr('width', "33%");

			});

		} else {

			this.initialElements.each(function() {

				$(this).attr('data-width', "100%");

			});

			loadedElements.each(function() {

				$(this).attr('width', "100%");

			});
		}
	}
}

var HomeBanner = {

	init : function() {

		this.sizing();
		this.slideshow();

	},

	element : $(".home-banner"),

	sizing : function() {

		var windowHeight = $(window).height();
		var mastHeight = 160;
		var bannerHeight = windowHeight - mastHeight - ( mastHeight * 0.666);

		this.element.css('height', bannerHeight + 'px' );

	},

	slideshow : function() {

		$("#skippr-targer").skippr({

			transition : 'fade',
			arrows : false

		});

	}

}

$(document).ready(function() {

	Mast.init();
	squarify();

	if (thisPage === '/') {

		HomeBanner.init();

	}

	if (thisPage === '/' || thisPage === 'blog') {

		MediumPosts.init();

	}

	if (thisPage === 'team') {

		SecondaryTeamMemberOverlay.init();

	}

	if (thisPage === 'process' && $(window).width() > 1000) {

		ProcessLine.init();

	}

});

$(window).resize(function() {

	squarify();

	if (thisPage === '/') {

		HomeBanner.init();

	}

	if (thisPage === '/' || thisPage === 'blog') {

		MediumPosts.init();

	}

});







