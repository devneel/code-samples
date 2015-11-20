function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      __loadTemplate = __helpers.l,
      __defaults_default_marko = __loadTemplate(require.resolve("./defaults/default.marko"), require),
      __renderer = __helpers.r,
      ___node_modules_marko_layout_use_tag_js = __renderer(require("marko-layout/use-tag")),
      __tag = __helpers.t,
      ___node_modules_marko_layout_put_tag_js = __renderer(require("marko-layout/put-tag")),
      ___node_modules_marko_async_async_fragments_tag_js = __renderer(require("marko-async/async-fragments-tag"));

  return function render(data, out) {
    __tag(out,
      ___node_modules_marko_layout_use_tag_js,
      {
        "template": __defaults_default_marko,
        "getContent": function(__layoutHelper) {
          __tag(out,
            ___node_modules_marko_layout_put_tag_js,
            {
              "into": "head",
              "layout": __layoutHelper
            },
            function(out) {
              out.w('<link href="css/nv.d3.min.css" rel="stylesheet">');
            });
          __tag(out,
            ___node_modules_marko_layout_put_tag_js,
            {
              "into": "title",
              "layout": __layoutHelper
            },
            function(out) {
              out.w('Deaths By Country');
            });
          __tag(out,
            ___node_modules_marko_layout_put_tag_js,
            {
              "into": "body",
              "layout": __layoutHelper
            },
            function(out) {
              out.w('<div class="container"><h1 class="page-header">Deaths By Country</h1></div><div class="container"><div id="chart2" class="col-md-8 col-md-offset-2"><svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid"></svg></div></div>');
              __tag(out,
                ___node_modules_marko_async_async_fragments_tag_js,
                {});
            });
          __tag(out,
            ___node_modules_marko_layout_put_tag_js,
            {
              "into": "js",
              "layout": __layoutHelper
            },
            function(out) {
              out.w('<script src="js/d3.min.js"></script><script src="js/nv.d3.min.js"></script><script src="js/vis/donut.js"></script>');
            });
        }
      });
  };
}
(module.exports = require("marko").c(__filename)).c(create);