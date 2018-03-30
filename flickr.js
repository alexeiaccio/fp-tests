/* requirejs.config({
  paths: {
    ramda: 'https://cdnjs.cloudflare.com/ajax/libs/ramda/0.13.0/ramda.min',
    jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min'
  }
});

require([
    'ramda',
    'jquery'
  ],
  function (_, $) {
    var trace = _.curry(function(tag, x) {
      console.log(tag, x);
      return x;
    });
    // код приложения
    var Impure = {
      getJSON: _.curry(function(callback, url) {
        $.getJSON(url, callback);
      }),
    
      setHtml: _.curry(function(sel, html) {
        $(sel).html(html);
      })
    };

    var url = function (term) {
      return 'https://api.flickr.com/services/feeds/photos_public.gne?tags=' +
        term + '&format=json&jsoncallback=?';
    };

    
    var img = function (url) {
      return $('<img />', { src: url });
    };
    
    var mediaUrl = _.compose(_.prop('m'), _.prop('media'));
    var srcs = _.compose(_.map(mediaUrl), _.prop('items'));
    var images = _.compose(_.map(img), srcs);
    var renderImages = _.compose(Impure.setHtml("body"), images);
    var app = _.compose(Impure.getJSON(renderImages), url);

    app("cats");
  }); */

const CDN = s => `https://cdnjs.cloudflare.com/ajax/libs/${s}`;
const ramda = CDN('ramda/0.21.0/ramda.min');
const jquery = CDN('jquery/3.0.0-rc1/jquery.min');

requirejs.config({ paths: { ramda, jquery } });
require(['jquery', 'ramda'], ($, { compose, curry, map, prop }) => {
  // -- Utils ----------------------------------------------------------
  const Impure = {
    trace: curry((tag, x) => { console.log(tag, x); return x; }), // eslint-disable-line no-console
    getJSON: curry((callback, url) => $.getJSON(url, callback)),
    setHtml: curry((sel, html) => $(sel).html(html)),
  };

  // -- Pure -----------------------------------------------------------
  const host = 'api.flickr.com';
  const path = '/services/feeds/photos_public.gne';
  const query = t => `?tags=${t}&format=json&jsoncallback=?`;
  const url = t => `https://${host}${path}${query(t)}`;

  const img = src => $('<img />', { src });
  const mediaUrl = compose(prop('m'), prop('media'));
  const mediaUrls = compose(map(mediaUrl), prop('items'));
  const images = compose(map(img), mediaUrls);

  // -- Impure ---------------------------------------------------------
  const render = compose(Impure.setHtml('#js-main'), images);
  const app = compose(Impure.getJSON(render), url);

  app('cats');
});