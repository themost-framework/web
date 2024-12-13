// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
(function(window) {

    var $ = window.jQuery;

    $.fn.outerHTML = $.fn.outer = function () {
        return $(this).clone().wrap('<div></div>').parent().html();
    };

    $.extend($.expr[':'],{
        required: function(a) {
            return $(a).attr('required') === 'required';
        }
    });
})(window);