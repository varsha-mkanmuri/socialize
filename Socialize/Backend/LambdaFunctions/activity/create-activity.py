import json 
import boto3
import time
from decimal import Decimal
from datetime import datetime
from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
from botocore.exceptions import ClientError
import uuid

REGION = 'us-east-1'
HOST = 'search-socialize-2fti2w65mbul2p7of77x4y7awm.us-east-1.es.amazonaws.com'

def get_awsauth(region, service):
    cred = boto3.Session().get_credentials()
    return AWS4Auth(cred.access_key,
                    cred.secret_key,
                    region,
                    service,
                    session_token=cred.token)

def insert(record, activity_id):
    INDEX = 'socialize-tags'
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
            id = activity_id,
            index=INDEX,
            body=record,
            refresh=True
        )

    except ClientError as e:
        print('Error', e.response['Error']['Message'])

def query_opensearch(tag):
    INDEX = 'socialize-tags'
    q = {'size': 5, 'query': {'multi_match': {'query': tag, 'fields':['tags']}}}
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
        print(hits)
        
        for hit in hits:
            results.append(hit['_source'])
            
    except ClientError as e:
        print('Error', e.response['Error']['Message'])
    return results
    

def lambda_handler(event,context): 
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('activity-details')
    
    l = ['title', 'description', 'date', 'time', 'location','category']
    for _ in l : 
        if not event[_] :
            return {'statusCode': 400,
                    'body': {"message": f"{_} missing"}
                    } 
        
    activity_id=str(uuid.uuid4())
    creator_id = event["creator_id"]
    title = event["title"]
    description = event["description"]
    date = event["date"]
    time = event["time"]
    location = event["location"]
    category = event["category"]
    category_tag = event['category_tag']
    
    if category != "Meetup" and category != "Event" and category != "Study Group":
        return {
        'statusCode': 400,
        'body': {"message": "Invalid category"}
        }
    
    # example date string '09/19/22 13:55:26'
    date_str = str(date) + " " + str(time)
    datetime_object = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
    datetime_str = str(datetime_object)
    timestamp = int(datetime.timestamp(datetime_object))
    attendees = []
    
    curr_timestamp = datetime.now().timestamp()
    if timestamp <= curr_timestamp:
        return {
            'statusCode': 400,
            'body': {"message": "Date and time must be in the future"}
        }
    
    # inserting values into table
    item = {
        'creator_id': creator_id,
        'activity_id': activity_id,
        'title': title,
        'description': description,
        'datetime': datetime_str,
        'timestamp': timestamp,
        'location': location,
        'attendees': attendees,
        'category': category, 
        'tags' : category_tag,
    }
    
    table.put_item(
      Item=item
    )
    insert(item, activity_id)
    
    index_activity_opensearch(activity_id, title, description, category, timestamp, location)
    #index_activity_opensearch('msddsnywnbjb', 'Regular Morning Walk and Talk', 'Morning Walk and Talk', 'Meetup', 1735088400, 'Queens, New York')

    response = {
        'statusCode': 200,
        'body': {"message": category + " successfully created"}
    }
    return response
    
    

def index_activity_opensearch(activity_id, title, description, category, timestamp, location):
    
    ACTIVITY_INDEX = 'search-activities'
    
    client = OpenSearch(hosts=[{
            'host': HOST,
            'port': 443
        }],
            http_auth=get_awsauth(REGION, 'es'),
            use_ssl=True,
            verify_certs=True,
            connection_class=RequestsHttpConnection)
            
    opensearch_record = {
        "title": title,
        "description": description,
        "category": category,
        "timestamp": timestamp,
        "location": location
    }
            
    response = client.index(
            id = activity_id,
            index=ACTIVITY_INDEX,
            body=opensearch_record,
            refresh=True
        )
    
    
    
    