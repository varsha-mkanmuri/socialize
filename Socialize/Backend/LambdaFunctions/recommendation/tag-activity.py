import json
import boto3
from datetime import datetime
from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
from botocore.exceptions import ClientError

REGION = 'us-east-1'
HOST = 'search-socialize-2fti2w65mbul2p7of77x4y7awm.us-east-1.es.amazonaws.com'

def get_awsauth(region, service):
    cred = boto3.Session().get_credentials()
    return AWS4Auth(cred.access_key,
                    cred.secret_key,
                    region,
                    service,
                    session_token=cred.token)
                    

def query_opensearch(tag, category=None):
    INDEX = 'socialize-tags'
    if category is not None:
        q = {"size":10,
             "query": {
                    "bool": {
                      "must": 
                        [{
                          "multi_match": {
                              'query' : tag, 
                              'fields' : ['tags']
                          }
                        },
                        {
                          "multi_match": {
                              'query' : category, 
                              'fields' : ['category']
                          }
                        }]
                    }
                  }
                }
    else:
        q = {'size': 10, 'query': {'multi_match': {'query': tag, 'fields':['tags']}}}
    results = []
    try:
        client = OpenSearch(hosts=[{
            'host': HOST,
            'port': 443
        }],
            http_auth=get_awsauth(REGION, 'es'),
            use_ssl=True,
            verify_certs=True,
            connection_class=RequestsHttpConnection)

        response = client.search(index=INDEX, body=q)
        hits = response['hits']['hits']
        if len(hits) > 0:
            for hit in hits:
                results.append([hit['_source']['activity_id'],hit['_source']['timestamp']])
            
    except ClientError as e:
        print('Error', e.response['Error']['Message'])
    print(results)
    if len(results) > 0:
        dynamodb = boto3.resource('dynamodb')
        batch_keys = {
            'activity-details' : {
                'Keys' : [{'activity_id':i[0], 'timestamp':i[1]} for i in results]
            }
        }
        response = dynamodb.batch_get_item(RequestItems = batch_keys)
        print(response)
        if 'activity-details' in response['Responses']:
            res = response['Responses']['activity-details']
            return res
    
    return []

def filter_dates(items):
    final = []
    for item in items:
        given_date = datetime.strptime(item['datetime'], "%Y-%m-%d %H:%M:%S")
        current_date = datetime.now()
        if given_date > current_date:
            final.append(item)
    return final

def delete_records():
    INDEX = 'socialize-tags'
    client = OpenSearch(hosts=[{
            'host': HOST,
            'port': 443
        }],
            http_auth=get_awsauth(REGION, 'es'),
            use_ssl=True,
            verify_certs=True,
            connection_class=RequestsHttpConnection)

    response = client.delete_by_query(index=INDEX, body={"query": {"match_all": {}}})
    print(response)

def lambda_handler(event, context):    
    tag = event['tag']
    category = event['category']
    
    items = query_opensearch(tag, category)
    return {
        'statusCode': 200,
        'body': items
    }
