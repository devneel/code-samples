function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      __renderer = __helpers.r,
      ______node_modules_marko_layout_placeholder_tag_js = __renderer(require("marko-layout/placeholder-tag")),
      __tag = __helpers.t;

  return function render(data, out) {
    out.w('<!doctype html> <html lang="en"><head>');
    __tag(out,
      ______node_modules_marko_layout_placeholder_tag_js,
      {
        "name": "head",
        "content": data.layoutContent
      });

    out.w('<meta charset="UTF-8"><meta http-equiv="content-type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta itemprop="description" name="Description" content="Dronestre.am Data Visualizations"><link href="css/default.css" rel="stylesheet"><title>');
    __tag(out,
      ______node_modules_marko_layout_placeholder_tag_js,
      {
        "name": "title",
        "content": data.layoutContent
      });

    out.w(' - Dronestreamer</title></head><body><div id="body"><div class="navbar navbar-default navbar-fixed-top"><div class="container"><div class="navbar-header"><a href="../" class="navbar-brand">Dronestreamer</a><button class="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar-main"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button></div><div class="navbar-collapse collapse" id="navbar-main"><ul class="nav navbar-nav navbar-right"><li><a href="/deaths-by-country">Deaths By Country</a></li><li><a href="/table">Table</a></li></ul></div></div></div>');
    __tag(out,
      ______node_modules_marko_layout_placeholder_tag_js,
      {
        "name": "body",
        "content": data.layoutContent
      });

    out.w('</div>');
    __tag(out,
      ______node_modules_marko_layout_placeholder_tag_js,
      {
        "name": "footer",
        "content": data.layoutContent
      },
      function(out) {
        out.w('<footer><small>Devneel Vaidya 2015</small></footer>');
      });
    __tag(out,
      ______node_modules_marko_layout_placeholder_tag_js,
      {
        "name": "js",
        "content": data.layoutContent
      });

    out.w('</body></html>');
  };
}
(module.exports = require("marko").c(__filename)).c(create);