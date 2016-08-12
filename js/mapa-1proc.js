/*
 * mapa-1proc.js
 * Copyright (C) 2016 Michał 'czesiek' Czyżewski <me@czesiek.net>
 *
 * Distributed under terms of the MIT license.
 */
(function(){
  'use strict';
  
  var blur = document.getElementById('blur');
  var radius = document.getElementById('radius');

  var heatmap = new ol.layer.Heatmap({
    source: new ol.source.Vector({
      url: 'donations_by_city.kml',
      format: new ol.format.KML({
        extractStyles: false
      })
    }),
    blur: 40,
    radius: 20
  });

  var markers = new ol.layer.Vector({
    source: new ol.source.Vector({
      url: 'donations_by_city.kml',
      format: new ol.format.KML({
        extractStyles: false
      })
    }),
    renderOrder: null,
    style: styleFunction  /* XXX: not required after all */
  });

  heatmap.getSource().on('addfeature', function(event) {
    var name = event.feature.get('name');
    var donationValue = event.feature.get('description');
    //console.log(name + ' :: ' + donationValue);
    event.feature.set('weight', donationValue);
  });

  var tiles = new ol.layer.Tile({
    source: new ol.source.OSM()
  });

  var map = new ol.Map({
    layers: [tiles, heatmap, markers],
    target: 'map',
    view: new ol.View({
      center: ol.proj.transform([19.480556, 52.069167], 'EPSG:4326', 'EPSG:3857'),  /* Piątek */
      zoom: 6
    })
  });

  var styleCache = {};
  var styleFunction = function(feature, resolution) {
    // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
    // standards-violating <magnitude> tag in each Placemark.  We extract it from
    // the Placemark's name instead.
    var name = feature.get('name');
    var magnitude = parseFloat(name.substr(2));
    var radius = 5 + 20 * (magnitude - 5);
    var style = styleCache[radius];

    if (!style) {
      style = [new ol.style.Style({
        image: new ol.style.Circle({
          radius: radius,
          fill: new ol.style.Fill({
            color: 'rgba(255, 153, 0, 0.4)'
          }),
          stroke: new ol.style.Stroke({
            color: 'rgba(255, 204, 0, 0.2)',
            width: 1
          })
        })
      })];
      styleCache[radius] = style;
    }
    return style;
  };

  var info = $('#info');
  info.tooltip({
    animation: false,
    trigger: 'manual'
  });

  var displayFeatureInfo = function(pixel) {
    info.css({
      left: pixel[0] + 'px',
      top: (pixel[1] - 15) + 'px'
    });
    var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
      return feature;
    });
    if (feature) {
      info.tooltip('hide')
        .attr('data-original-title', feature.get('name'))
        .tooltip('fixTitle')
        .tooltip('show');
    } else {
      info.tooltip('hide');
    }
  };

  map.on('pointermove', function(evt) {
    if (evt.dragging) {
      info.tooltip('hide');
      return;
    }
    displayFeatureInfo(map.getEventPixel(evt.originalEvent));
  });

  map.on('click', function(evt) {
    displayFeatureInfo(evt.pixel);
  });
})();
