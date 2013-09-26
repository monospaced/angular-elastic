/*
 * angular-elastic v2.1.0
 * (c) 2013 Monospaced http://monospaced.com
 * License: MIT
 */

angular.module('monospaced.elastic', [])

  .constant('msdElasticConfig', {
    append: ''
  })

  .directive('msdElastic', ['$timeout', '$window', 'msdElasticConfig', function($timeout, $window, config) {
    'use strict';

    return {
      require: 'ngModel',
      restrict: 'A, C',
      link: function(scope, element, attrs, ngModel){

        // cache a reference to the DOM element
        var ta = element[0],
            $ta = element;

        // ensure the element is a textarea, and browser is capable
        if (ta.nodeName !== 'TEXTAREA' || !$window.getComputedStyle) {
          return;
        }

        // set these properties before measuring dimensions
        $ta.css({
          'overflow': 'hidden',
          'overflow-y': 'hidden',
          'word-wrap': 'break-word'
        });

        // force text reflow
        var text = ta.value;
        ta.value = '';
        ta.value = text;

        var appendText = attrs.msdElastic || config.append,
            append = appendText === '\\n' ? '\n' : appendText,
            $win = angular.element($window),
            $mirror = angular.element('<textarea tabindex="-1" style="position: absolute; ' +
                                      'top: -999px; right: auto; bottom: auto; left: 0 ;' +
                                      'overflow: hidden; -webkit-box-sizing: content-box; ' +
                                      '-moz-box-sizing: content-box; box-sizing: content-box; ' +
                                      'min-height: 0!important; height: 0!important; padding: 0;' +
                                      'word-wrap: break-word; border: 0;"/>').data('elastic', true),
            mirror = $mirror[0],
            taStyle = getComputedStyle(ta),
            resize = taStyle.getPropertyValue('resize'),
            borderBox = taStyle.getPropertyValue('box-sizing') === 'border-box' ||
                        taStyle.getPropertyValue('-moz-box-sizing') === 'border-box' ||
                        taStyle.getPropertyValue('-webkit-box-sizing') === 'border-box',
            boxOuter = !borderBox ? {width: 0, height: 0} : {
                          width: parseInt(taStyle.getPropertyValue('border-right-width'), 10) +
                                  parseInt(taStyle.getPropertyValue('padding-right'), 10) +
                                  parseInt(taStyle.getPropertyValue('padding-left'), 10) +
                                  parseInt(taStyle.getPropertyValue('border-left-width'), 10),
                          height: parseInt(taStyle.getPropertyValue('border-top-width'), 10) +
                                 parseInt(taStyle.getPropertyValue('padding-top'), 10) +
                                 parseInt(taStyle.getPropertyValue('padding-bottom'), 10) +
                                 parseInt(taStyle.getPropertyValue('border-bottom-width'), 10)
                        },
            minHeightValue = parseInt(taStyle.getPropertyValue('min-height'), 10),
            heightValue = parseInt(taStyle.getPropertyValue('height'), 10),
            minHeight = Math.max(minHeightValue, heightValue) - boxOuter.height,
            maxHeight = parseInt(taStyle.getPropertyValue('max-height'), 10),
            mirrored,
            active,
            copyStyle = ['font-family',
                         'font-size',
                         'font-weight',
                         'font-style',
                         'letter-spacing',
                         'line-height',
                         'text-transform',
                         'word-spacing',
                         'text-indent'];

        // exit if elastic already applied (or is the mirror element)
        if ($ta.data('elastic')) {
          return;
        }

        // Opera returns max-height of -1 if not set
        maxHeight = maxHeight && maxHeight > 0 ? maxHeight : 9e4;

        // append mirror to the DOM
        if (mirror.parentNode !== document.body) {
          angular.element(document.body).append(mirror);
        }

        // set resize and apply elastic
        $ta.css({
          'resize': (resize === 'none' || resize === 'vertical') ? 'none' : 'horizontal'
        }).data('elastic', true);

        /*
         * methods
         */

        function initMirror(){
          mirrored = ta;
          // copy the essential styles from the textarea to the mirror
          taStyle = getComputedStyle(ta);
          angular.forEach(copyStyle, function(val){
            mirror.style[val] = taStyle.getPropertyValue(val);
          });
        }

        function adjust() {
          var taHeight,
              mirrorHeight,
              width,
              overflow;

          if (mirrored !== ta) {
            initMirror();
          }

          // active flag prevents actions in function from calling adjust again
          if (!active) {
            active = true;

            mirror.value = ta.value + append; // optional whitespace to improve animation
            mirror.style.overflowY = ta.style.overflowY;

            taHeight = ta.style.height === '' ? 'auto' : parseInt(ta.style.height, 10);

            // update mirror width in case the textarea width has changed
            width = parseInt(borderBox ?
                             ta.offsetWidth :
                             getComputedStyle(ta).getPropertyValue('width'), 10) - boxOuter.width;
            mirror.style.width = width + 'px';

            mirrorHeight = mirror.scrollHeight;

            if (mirrorHeight > maxHeight) {
              mirrorHeight = maxHeight;
              overflow = 'scroll';
            } else if (mirrorHeight < minHeight) {
              mirrorHeight = minHeight;
            }
            mirrorHeight += boxOuter.height;

            ta.style.overflowY = overflow || 'hidden';

            if (taHeight !== mirrorHeight) {
              ta.style.height = mirrorHeight + 'px';
            }

            // small delay to prevent an infinite loop
            $timeout(function(){
              active = false;
            }, 1);

          }
        }

        function forceAdjust(){
          active = false;
          adjust();
        }

        /*
         * initialise
         */

        // listen
        if ('onpropertychange' in ta && 'oninput' in ta) {
          // IE9
          ta['oninput'] = ta.onkeyup = adjust;
        } else {
          ta['oninput'] = adjust;
        }

        $win.bind('resize', forceAdjust);

        scope.$watch(function(){
          return ngModel.$modelValue;
        }, function(newValue){
          forceAdjust();
        });

        /*
         * destroy
         */

        scope.$on('$destroy', function(){
          $mirror.remove();
          $win.unbind('resize', forceAdjust);
        });
      }
    };

  }]);
