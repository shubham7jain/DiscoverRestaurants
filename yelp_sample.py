
# !/usr/bin/env python

"""
    Copyright (c) 2013, Los Alamos National Security, LLC
    All rights reserved.

    Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
    following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this list of conditions and the following
      disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
      following disclaimer in the documentation and/or other materials provided with the distribution.
    * Neither the name of Los Alamos National Security, LLC nor the names of its contributors may be used to endorse or
      promote products derived from this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
    INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
    SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
    WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
"""

"""
    Example call:
        ./examples.py "[API Key]"
"""
import csv
from yelpapi import YelpAPI
from pprint import pprint
import random
import pandas as pd

yelpAPIKey = 'BN8JZVUhnK-l5UAaCyr2XUGW-sqbIqtO8q-OTs8axYBoDs5YQFsP4BIZbnRuhz6yHnaOHACSZK52MxdNjmFKNgmJEs13FDBORJEDjBSkIypTut80bRLVUsYzmmUMXHYx'
yelp_api = YelpAPI(yelpAPIKey)

"""
    Example search by centroid and category.

    all Yelp categories: https://www.yelp.com/developers/documentation/v3/all_category_list
    centroid: https://www.flickr.com/places/info/2487956
"""

#-73.9862035,40.7497853

hotels = []
categories = ['restaurant', 'food', 'bar', 'dining', 'lunch', 'meal']
id_set = set([])

for i in range(len(categories)):
    response = yelp_api.search_query(term=categories[i], longitude=-73.935242, latitude=40.730610, limit=50)
    businesses = response['businesses']
    for bus in businesses:
        if bus['id'] not in id_set:
            id_set.add(bus['id'])
            hotels.append(bus)

outputs = []
# with open('sample_data.csv', 'w') as csv_file:
#     writer = csv.writer(csv_file)

for hotel in hotels:
    sp_tags = ''
    for cat in hotel['categories']:
        sp_tags += cat['alias']
        sp_tags += ' '

    output = dict()
    output['tags'] = sp_tags
    output['offers'] = random.choice([0, 1])
    output['res'] = output['offers']
    output['ratings'] = hotel['rating']
    output['reviews'] = hotel['review_count']
    outputs.append(output)

        # writer.writerow([hotel['name'], hotel['rating'], hotel['review_count'], sp_tags, random.choice([True, False])])

df = pd.DataFrame(outputs)
df.to_csv('sample_data.csv', encoding='utf-8', index=False)

pprint(hotels)
pprint('length: ' +  str(len(hotels)))
print('\n-------------------------------------------------------------------------\n')