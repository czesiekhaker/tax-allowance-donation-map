#! /usr/bin/env python3
# -*- coding: utf-8 -*-
# vim:fenc=utf-8
#
# Copyright © 2016 Michał 'czesiek' Czyżewski <me@czesiek.net>
#
# Distributed under terms of the MIT license.

"""
Combine locations with donation values for cities.
"""

import simplekml
import json

with open('cities_locations.json') as locations_file:
    locations = json.load(locations_file)

with open('donations_by_city.json') as donations_file:
    donations = json.load(donations_file)

kml = simplekml.Kml()
kml.document.name = "Donations to Panoptykon Foundation in 2016 by city"

for city, donation in donations.items():
    lat = locations[city][0]
    lon = locations[city][1]
    point = kml.newpoint(name=city, coords=[(lon, lat)], description=str(donation))

kml.save("donations_by_city.kml")
