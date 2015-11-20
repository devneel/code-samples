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
              out.w('First');
            });
          __tag(out,
            ___node_modules_marko_layout_put_tag_js,
            {
              "into": "body",
              "layout": __layoutHelper
            },
            function(out) {
              out.w('<div class="container"><h1>Where do you go? My Lovely.</h1></div>');
            });
        },
        "*": {
          "showHeader": true
        }
      });
  };
}
(module.exports = require("marko").c(__filename)).c(create);