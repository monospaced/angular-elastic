Angular Elastic
===============

Elastic (autosize) textareas for AngularJS, without jQuery dependency.

[See it in action](http://monospaced.github.io/angular-elastic).

Usage
-----

as attribute

    <textarea msd-elastic ng-model="foo">
      ...
    </textarea>

as class

    <textarea class="msd-elastic" ng-model="bar">
      ...
    </textarea>

optionally append whitespace to the end of the height calculation (an extra newline improves the apperance when animating)

    <textarea msd-elastic="\n" ng-model="foo">
      ...
    </textarea>

    <textarea class="msd-elastic: \n;" ng-model="bar">
      ...
    </textarea>

or configure whitespace globally

    app.config(['msdElasticConfig', function(config) {
      config.append = '\n\n';
    }])

Install
-------

    bower install angular-elastic

Include the `elastic.js` script provided by this component in your app, and add `monospaced.elastic` to your app’s dependencies.

Support
-------

__Modern browsers__ only—Internet Explorer 6, 7 & 8 retain their default textarea behaviour.

Demo
----------------

[monospaced.github.io/angular-elastic](http://monospaced.github.io/angular-elastic)

Inspiration
----------------

* [jQuery Autosize](http://www.jacklmoore.com/autosize/)

* [jQuery Elastic](http://unwrongest.com/projects/elastic/)

