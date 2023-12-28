import json 
import boto3
from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key, Attr
from datetime import datetime
from decimal import Decimal

REGION = 'us-east-1'
HOST = 'search-socialize-2fti2w65mbul2p7of77x4y7awm.us-east-1.es.amazonaws.com'
INDEX = 'search-activities'

def lambda_handler(event,context): 
    print(event)
    
    search_query = event["search_query"]
    category = event["category"]
    search_keys = search_query.split()
    activity_ids = query(search_keys, category)
    
    results = fetch_activity_details(activity_ids)

    response = {
        'statusCode': 200,
        'results': results
    }
    return response
    

def get_awsauth(region, service):
    cred = boto3.Session().get_credentials()
    return AWS4Auth(cred.access_key,
                    cred.secret_key,
                    region,
                    service,
                    session_token=cred.token)

def query(keywords, category):
    
    should_condition = [{'multi_match': {'query': keyword, 'fields' : ['title', 'description', 'location'], 'type': 'best_fields', 'fuzziness': 'AUTO'}} for keyword in keywords]
    must_condition = [{'multi_match': {'query': category, 'fields' : ['category']}}]

    q = {
        'size': 10,
        'query': {
            'bool': {
                'should': should_condition,
                'must': must_condition,
                'minimum_should_match': 1
            }
        }
    }
    
    client = OpenSearch(hosts=[{
        'host': HOST,
        'port': 443
    }],
        http_auth=get_awsauth(REGION, 'es'),
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection)
    res = client.search(index=INDEX, body=q)
    hits = res['hits']['hits']
    results = []

    search_results = []

    for hit in hits:
        activity_id = hit['_id']
        search_results.append(activity_id)

    return search_results
    
    
def fetch_activity_details(activity_ids):
    db = boto3.resource('dynamodb')
    table = db.Table('activity-details')
   
    try:
        activity_details = []
       
        current_datetime = datetime.now()
        current_timestamp = Decimal(current_datetime.timestamp())

        for id in activity_ids:
            
            item = table.query(
                KeyConditionExpression=Key('activity_id').eq(id) & Key('timestamp').gt(current_timestamp)
            )
            
            #add a check to only include events which are in the future
            if item['Items']:
                activity_details.append(item['Items'][0])

        return activity_details
    
    except ClientError as e:
        return None, None
    
def query_all():
    q = {'size': 10, 'query': {'match_all': {}}}
    print("query formed", q)
    client = OpenSearch(hosts=[{
        'host': HOST,
        'port': 443
    }],
        http_auth=get_awsauth(REGION, 'es'),
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection)
    res = client.search(index=INDEX, body=q)
    hits = res['hits']['hits']