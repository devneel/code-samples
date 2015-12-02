function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      __loadTemplate = __helpers.l,
      __defaults_default_marko = __loadTemplate(require.resolve("./defaults/default.marko"), require),
      __renderer = __helpers.r,
      ___node_modules_marko_layout_use_tag_js = __renderer(require("marko-layout/use-tag")),
      __tag = __helpers.t,
      ___node_modules_marko_layout_put_tag_js = __renderer(require("marko-layout/put-tag"));

  return function render(data, out) {
    __tag(out,
      ___node_modules_marko_layout_use_tag_js,
      {
        "template": __defaults_default_marko,
        "getContent": function(__layoutHelper) {
          __tag(out,
            ___node_modules_marko_layout_put_tag_js,
            {
              "into": "title",
              "layout": __layoutHelper
            },
            function(out) {
              out.w('Dronestreamer');
            });
          __tag(out,
            ___node_modules_marko_layout_put_tag_js,
            {
              "into": "body",
              "layout": __layoutHelper
            },
            function(out) {
              out.w('<div class="container"><h1>Dronestreamer</h1><p class="lead">Data visualizations of drone devastation</p><ul><li><p class="lead">2 visualizations of <a href="/deaths-by-country">deaths by country</a></p></li><li><p class="lead">See <a href="/table">table of raw data</a></p></li></ul><p>Data provided by <a href="http://dronestre.am">dronestre.am</a> | Full source on <a href="http://github.com/devneel/dronestreamer">github</a></p></div>');
            });
        },
        "*": {
          "showHeader": true
        }
      });
  };
}
(module.exports = require("marko").c(__filename)).c(create);