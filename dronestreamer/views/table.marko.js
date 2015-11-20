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
      forEach = __helpers.f,
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
              "into": "title",
              "layout": __layoutHelper
            },
            function(out) {
              out.w('Table');
            });
          __tag(out,
            ___node_modules_marko_layout_put_tag_js,
            {
              "into": "body",
              "layout": __layoutHelper
            },
            function(out) {
              out.w('<div class="container"><h1 class="page-header">Raw Data</h1></div><div class="container">');
              __tag(out,
                ___node_modules_marko_async_async_fragment_tag_js,
                {
                  "dataProvider": data.strikes,
                  "clientReorder": true,
                  "_name": "data.strikes",
                  "placeholder": out.captureString(function() {
                      out.w('<div class="text-center"><img src="images/ripple.gif"><p class="lead">Loading...</p></div>');
                    })
                },
                function(out, strikes) {
                  out.w('<table class="table"><tr><th>Number</th><th>Country</th><th>Date</th><th>Narrative</th><th>Town</th><th>Deaths</th><th>Target</th><th>Lat</th><th>Long</th></tr>');

                  forEach(strikes, function(strike) {
                    out.w('<tr><td>' +
                      escapeXml(strike.number) +
                      '</td><td>' +
                      escapeXml(strike.country) +
                      '</td><td>' +
                      escapeXml(strike.date) +
                      '</td><td>' +
                      escapeXml(strike.narrative) +
                      '</td><td>' +
                      escapeXml(strike.town) +
                      '</td><td>' +
                      escapeXml(strike.deaths) +
                      '</td><td>' +
                      escapeXml(strike.target) +
                      '</td><td>' +
                      escapeXml(strike.lat) +
                      '</td><td>' +
                      escapeXml(strike.lon) +
                      '</td></tr>');
                  });

                  out.w(' </table>');
                });

              out.w('</div>');
              __tag(out,
                ___node_modules_marko_async_async_fragments_tag_js,
                {});
            });
        }
      });
  };
}
(module.exports = require("marko").c(__filename)).c(create);