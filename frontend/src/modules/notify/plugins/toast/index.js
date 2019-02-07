// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var _ = require('underscore');
  var Handlebars = require('handlebars');
  var Origin = require('core/origin');
  // are overridden by any values passed to Snackbar
  var defaults = {
    type: 'info',
    icon: 'fa-info-circle',
    text: '',
    buttonText: 'Close',
    persist: true,
    animTime: 400,
    timeout: 3000,
    callback: null
  };

  var Toast = function(data) {
    if(typeof data === 'string') {
      data = { text: data };
    }
    process(_.extend({}, defaults, data));
  };

  function process(data) {
    var $el = $(Handlebars.templates.toast(data));
    // $el.one('click', function() { closeSnack($el, data); });
    $el.appendTo('.toastContainer').velocity('fadeIn', {
      duration: data.animTime,
      complete: function(elements) {
        console.log(data);
        if(!data.persist) data.timer = setTimeout(function() { closeSnack($el, data); }, data.timeout);
      }
    });

  };

  function closeSnack($el, data) {
    clearTimeout(data.timer);
    console.log('closeSnack', data);
    $el.velocity('fadeOut', {
      duration: data.animTime,
      complete: function() {
        $el.remove();
        if (data.callback) data.callback.apply();
      }
    });
  };

  var init = function() {
    Origin.Notify.register('toast', Toast);

    Origin.on('origin:dataReady', function() {
      $('.app-inner').append($('<div>', { class: 'toastContainer' }));
    });
  };

  return init;
});
