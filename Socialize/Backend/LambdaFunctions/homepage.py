import json
import boto3
from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
from botocore.exceptions import ClientError
import datetime
from boto3.dynamodb.conditions import Key, Attr
from decimal import Decimal
from datetime import datetime

REGION = 'us-east-1'
HOST = 'search-socialize-2fti2w65mbul2p7of77x4y7awm.us-east-1.es.amazonaws.com'
INDEX = 'socialize'

def get_awsauth(region, service):
    cred = boto3.Session().get_credentials()
    return AWS4Auth(cred.access_key,
                    cred.secret_key,
                    region,
                    service,
                    session_token=cred.token)
                    

def get_activities(user_id):
    INDEX = 'socialize-tags'
    q = {'size': 5, 'query': {'multi_match': {'query': user_id, 'fields':['creator_id']}}}
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
        
        for hit in hits:
            results.append(hit['_source'])
            
    except ClientError as e:
        print('Error', e.response['Error']['Message'])
    return results

def get_poll_ids(uni):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('profile-details')
    
    response = table.get_item(
        Key={
            'uni': uni
        }
    )
    
    if 'Item' in response:
        user_item = response['Item']
        return list(set(user_item['poll_ids']))
    else:
        return []

def get_polls(uni):
    ids = get_poll_ids(uni)
    if len(ids) > 0:
        dynamodb = boto3.resource('dynamodb')
        batch_keys = {
            'polls-db' : {
                'Keys' : [{'poll_id':i} for i in ids]
            }
        }
        response = dynamodb.batch_get_item(RequestItems = batch_keys)
    
        if 'polls-db' in response['Responses']:
            res = response['Responses']['polls-db']
            return res
    
    return []
    
    

def lambda_handler(event, context):
    user_id = event["user_id"]
    result = query(user_id)

    t = []
    if result : 
        current_meetup_ids = result['current_meetup_ids']
        current_event_ids = result['current_event_ids']
        current_study_groups = result['current_study_groups']

        activity_ids = []
        activity_ids.extend(current_meetup_ids)
        activity_ids.extend(current_event_ids)
        activity_ids.extend(current_study_groups)
        user_activity_details = fetch_activity_details(activity_ids)
        for _ in user_activity_details: t = t + _

    result_return = {
        'upcoming' : t, 
        'activities_created' : get_activities(user_id),
        'polls': get_polls(user_id)
    }
        
    return {
        'statusCode': 200,
        'body': result_return
    }

def query(user_id):
    client = OpenSearch(hosts=[{
        'host': HOST,
        'port': 443
    }],
        http_auth=get_awsauth(REGION, 'es'),
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection)
        
    if client.exists(index=INDEX, id=user_id):
        res = client.get(index=INDEX, id = user_id)
        return res['_source']
    else:
        return []

    
def get_awsauth(region, service):
    cred = boto3.Session().get_credentials()
    return AWS4Auth(cred.access_key,
                    cred.secret_key,
                    region,
                    service,
                    session_token=cred.token)

def insert(record, user_id):
    try:
        client = OpenSearch(hosts=[{
            'host': HOST,
            'port': 443
        }],
            http_auth=get_awsauth(REGION, 'es'),
            use_ssl=True,
            verify_certs=True,
            connection_class=RequestsHttpConnection)

        response = client.index(
            id = user_id,
            index=INDEX,
            body=record,
            refresh=True
        )

    except ClientError as e:
        print('Error', e.response['Error']['Message'])
        
        
def fetch_activity_details(activity_ids):
    db = boto3.resource('dynamodb')
    table = db.Table('activity-details')
   
    try:
        activity_details = []
       
        current_datetime = datetime.now()
        current_timestamp = Decimal(current_datetime.timestamp())

        for id in activity_ids:
            # print("id", id)
            
            item = table.query(
                KeyConditionExpression=Key('activity_id').eq(id) & Key('timestamp').gt(current_timestamp)
            )
            
            #add a check to only include events which are in the future
            if item['Items']:
                activity_details.append(item['Items'])

        
        return activity_details
    
    except ClientError as e:
        return None, None
 
    
def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError("Object of type {} is not JSON serializable".format(type(obj)))
    
  

