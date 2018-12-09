import csv
import boto3
import json
import urllib
import base64
import requests
import json
from yelpapi import YelpAPI
from model import Model

print('Loading function')
dynamo = boto3.client('dynamodb')


def respond(err, res=None):
    print err
    print 'Shubham'
    print res
    return {
        'statusCode': '400' if err else '200',
        'body': 'Server error' if err else json.dumps(res),
        'headers': {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin" : "*"
        },
    }


def lambda_handler(event, context):
    '''Demonstrates a simple HTTP endpoint using API Gateway. You have full
    access to the request and response payload, including headers and
    status code.

    To scan a DynamoDB table, make a GET request with the TableName as a
    query string parameter. To put, update, or delete an item, make a POST,
    PUT, or DELETE request respectively, passing in the payload to the
    DynamoDB API as a JSON body.
    '''
    print("Received event: " + json.dumps(event, indent=2))

    client_key = 'l7xxe8d5547bafd14cb686d18771bb63c8ba'
    client_secret = '3c404cbdea734e9a97913ced8c3197d4'

    header = base64.b64encode(client_key + ':' + client_secret)

    city_name = event['multiValueQueryStringParameters']['city'][0]
    url = 'https://apis.discover.com/auth/oauth/v2/token';

    response = requests.post(url,
                             headers={
                                 "Authorization": "Basic %s" % header,
                                 "Content-Type": "application/x-www-form-urlencoded"},
                             data={
                                 'grant_type': "client_credentials",
                                 'scope': "CITYGUIDES DCIOFFERS DCIOFFERS_POST DCILOUNGES DCILOUNGES_POST DCILOUNGES_PROVIDER_LG DCILOUNGES_PROVIDER_DCIPL DCI_ATM DCI_CURRENCYCONVERSION DCI_CUSTOMERSERVICE DCI_TIP"
                             });

    access_token = json.loads(response.content)['access_token'];

    ### Calling the merchants api with the city name
    url = 'https://api.discover.com/cityguides/v2/merchants'
    queryParams = '?' + urllib.urlencode({urllib.quote_plus('card_network'): 'DCI', urllib.quote_plus('merchant_city'): city_name, urllib.quote_plus('merchant_category'): 'restaurants',
                                   urllib.quote_plus('has_privileges'): 'false', urllib.quote_plus('sortby'): 'name',
                                   urllib.quote_plus('sortdir'): 'asc'})
    headers = {'Accept': 'application/json', 'x-dfs-api-plan': 'CITYGUIDES_SANDBOX',
               'Authorization': 'Bearer ' + str(access_token)}
    response_body = requests.get(url + queryParams, headers=headers)
    merchant_data = json.loads(response_body.content)

    ### Calling the offers api with the city name
    url = 'https://api.discover.com/dci-offers/v2/offers/1'
    headers = {'Accept': 'application/json', 'x-dfs-api-plan': 'DCIOFFERS_SANDBOX',
               'Authorization': 'Bearer ' + str(access_token)}
    response_body = requests.get(url, headers=headers)

    dataArray = merchant_data["result"]
    print len(dataArray)
    #if len(dataArray) > 5:
    #    dataArray = dataArray[:5]
    #print data
    final_response_array = []
    count = 1
    for merchant_data in dataArray:
        print("Discover")
        print merchant_data
        #merchant_data = json.loads(merchant_data)
        restaurant_name = merchant_data['name']
        restaurant_lat = merchant_data['point'][1]
        restaurant_long = merchant_data['point'][0]
        restaurant_city = merchant_data['city']
        yelp_api = YelpAPI(
        'u-ZYmzBtbRVZZl8hp0SVOvb6huwm2p_eUAQuMRShwGm-9ekUqtCcSk8DtsJXjorPPOcg12tl4qwVR71W9hggXRspcvr0uEAtjVkYnR1FOxLpgVsv6-Hs5HSSgVQMXHYx')
        
        print('navneet')
        #  New York
        response = yelp_api.search_query(term=restaurant_name, location=restaurant_city, longitude=restaurant_long,
                                     latitude=restaurant_lat, limit=1)
        if 'businesses' not in response:
            continue
        if len(response['businesses']) <= 0:
            continue
        response = response['businesses'][0]
        final_response = dict()
        if 'name' not in response:
            print restaurant_name, response
            continue
        print("Yelp")
        print(response)
        final_response['name'] = response['name']
        final_response['ratings'] = response['rating']
        final_response['review_count'] = response['review_count']
        final_response['is_closed'] = response['is_closed']
        ## code added
        if len(merchant_data['privileges_url']) >= 1:
            final_response['is_privilege'] = '1'
        else:
            final_response['is_privilege'] = '0'
            
        sp_tags = ''
        for cat in response['categories']:
           sp_tags += cat['alias']
           sp_tags += ' '
           
        final_response['categories'] = sp_tags
            
        ###
        print(final_response)
        print("bhavikxxx")
        final_response_array.append(final_response)
        count += 1
        if count > 25:
            break
    print final_response_array

    ###
    testData = []
    testData.append("offers, ratings, reviews, tags")
    for data in final_response_array:
        testData.append(str(data['is_privilege']) + "," + str(data['ratings']) + "," + str(data['review_count']) + "," + data['categories'])
    
    print('Shubham');
    with open('/tmp/testData.csv', 'w') as writeFile:
        writer = csv.writer(writeFile, escapechar=' ', quoting=csv.QUOTE_NONE)
        for data in testData:
            writer.writerow([data])
        
    writeFile.close()
    
    result = Model()
    print(result)
    print(final_response_array)
    sorted_array = [x for _,x in sorted(zip(result,final_response_array), reverse=True)]
    print(sorted_array)

    return respond(None, {"result": sorted_array})



