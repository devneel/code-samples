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
      ___node_modules_marko_async_async_fragment_tag_js = __renderer(require("marko-async/async-fragment-tag")),
      escapeXml = __helpers.x,
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
              out.w('<link href="css/c3.min.css" rel="stylesheet">');
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
              out.w('<div class="container"><h1 class="page-header">Deaths By Country</h1></div><div class="container">');
              __tag(out,
                ___node_modules_marko_async_async_fragment_tag_js,
                {
                  "dataProvider": data,
                  "clientReorder": true,
                  "_name": "data",
                  "placeholder": out.captureString(function() {
                      out.w('<div class="text-center"><img src="images/ripple.gif"><p class="lead">Loading...</p></div>');
                    })
                },
                function(out, d) {
                  out.w('<script>\n\t\t\t\t\tvar donutData = ' +
                    escapeXml(JSON.stringify(d.deathCountByCountry)) +
                    ';\n\t\t\t\t\tvar stackedBarData = ' +
                    escapeXml(JSON.stringify(d.countryDeathsBreakdown)) +
                    ';\n\t\t\t\t\tconsole.log(\'stackedBarData is\');\n\t\t\t\t\tconsole.log(stackedBarData.countriesForAxisLabels);\n\t\t\t\t</script><div id="deaths_by_country_donut" class="c3 chart"></div><div class="gap">&nbsp;</div><div><h2>Deaths Breakdown By Country</h2><div id="deaths_breakdown_by_country_stacked_bar" class="c3 chart"></div></div>');
                });

              out.w('</div>');
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
              out.w('<script src="js/d3.min.js"></script><script src="js/c3.min.js"></script><script src="js/vis/donut.js"></script><script src="js/vis/stacked_bar.js"></script>');
            });
        }
      });
  };
}
(module.exports = require("marko").c(__filename)).c(create);