import json
import boto3
from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
from botocore.exceptions import ClientError
import datetime
from boto3.dynamodb.conditions import Key

REGION = 'us-east-1'
HOST = 'search-socialize-2fti2w65mbul2p7of77x4y7awm.us-east-1.es.amazonaws.com'
INDEX = 'socialize'

def lambda_handler(event, context):
    activity_id = event['activity_id']
    user_id = event['user_id']
    
    message, success, category, title = add_attendee_details(activity_id, user_id)
    
    if success == 0:
        
        return {
            'statusCode': 200,
            'body': json.dumps(message)
        }
        
    add_meetup_id_to_user(activity_id, user_id, category)
    add_message_sqs(title, category, user_id)
    return {
        'statusCode': 200,
        'body': json.dumps(message)
    }
   


def add_attendee_details(activity_id, user_id):
    
    try:
        db = boto3.resource('dynamodb')
        table = db.Table('activity-details')
        success = 1
        
        QueryItem = table.query(
            KeyConditionExpression=Key('activity_id').eq(activity_id)
        )
        
        attendees = QueryItem['Items'][0]['attendees']
        title = QueryItem['Items'][0]['title']
        timestamp = QueryItem['Items'][0]['timestamp']
        category = QueryItem['Items'][0]['category']
    
        if user_id in attendees:
            msg = "You are already registered for " + title
            success = 0
            return msg, success, category, title
        
        attendees.append(user_id)
    
        update_response = table.update_item(
            Key={
                'activity_id': activity_id,
                'timestamp': timestamp
            },
            UpdateExpression='set #attr_name = :attendees', 
            ExpressionAttributeNames={
                '#attr_name': 'attendees' 
            },
            ExpressionAttributeValues={
                ':attendees':   attendees },
            ReturnValues='UPDATED_NEW')
    
        
        success_msg = "You are successfully registered for " + title
        return success_msg, success, category, title
    
    except ClientError as e:
        return "Registration failed", 0, '', ''
    
def add_meetup_id_to_user(activity_id, user_id, category):

    client = OpenSearch(hosts=[{
            'host': HOST,
            'port': 443
        }],
            http_auth=get_awsauth(REGION, 'es'),
            use_ssl=True,
            verify_certs=True,
            connection_class=RequestsHttpConnection)
         
    field = ''   
    if category == 'Meetup':
        field = 'current_meetup_ids'
    elif category == 'Event':
        field = 'current_event_ids'
    elif category == "Study Group":
        field = 'current_study_groups'
            
    
    if client.exists(index=INDEX, id=user_id):
        update_request = {
            "script": {
                "source": f"ctx._source.{field}.add(params.value)",
                "lang": "painless",
                "params": {
                    "value": activity_id
                }
            }
        }
    
        response = client.update(
            index=INDEX,
            id=user_id,
            body=update_request
        )
    
        
    else:
        opensearch_record = {
                    "current_meetup_ids": [],
                    "current_event_ids": [],
                    "current_study_groups": [],
                    "current_poll_ids": [],
                    "created_activities": []
        }
        
        if category == 'Meetup':
            opensearch_record["current_meetup_ids"].append(activity_id)
        elif category == 'Event':
            opensearch_record["current_event_ids"].append(activity_id)
        elif category == "Study Group":
            opensearch_record["current_study_groups"].append(activity_id)

        response = client.index(
            id = user_id,
            index=INDEX,
            body=opensearch_record,
            refresh=True
        )

def get_awsauth(region, service):
    cred = boto3.Session().get_credentials()
    return AWS4Auth(cred.access_key,
                    cred.secret_key,
                    region,
                    service,
                    session_token=cred.token)
                    

def query(user_id):
    client = OpenSearch(hosts=[{
        'host': HOST,
        'port': 443
    }],
        http_auth=get_awsauth(REGION, 'es'),
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection)
    res = client.get(index=INDEX, id = user_id)
    
    return res['_source']


def add_message_sqs(title, category, user_id):
    sqs = boto3.client('sqs')
    sqs_res = sqs.get_queue_url(QueueName='activityRegistration')
    sqs_url = sqs_res['QueueUrl']
    sqs.send_message(
        QueueUrl=sqs_url,
        MessageAttributes={
            'title': {
                'DataType': 'String',
                'StringValue': str(title)
            },
            'category': {
                'DataType': 'String',
                'StringValue': str(category)
            },
            'user_id': {
                'DataType': 'String',
                'StringValue': str(user_id)
            }
        },
        MessageBody=(
            'Sending email details to SQS queue'
        )
    )
