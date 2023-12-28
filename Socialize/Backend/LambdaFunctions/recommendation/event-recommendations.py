import json
import boto3
from boto3.dynamodb.conditions import Key

client = boto3.client('personalize-runtime')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('activity-details')

def lambda_handler(event, context):
    # TODO implement
    user_id = event['user_id']
    
    response = client.get_recommendations(
        campaignArn='arn:aws:personalize:us-east-1:252225289072:campaign/campaign-1',
        filterArn='arn:aws:personalize:us-east-1:252225289072:filter/filter-event',
        userId= user_id,
        numResults=10)
        
    itemList = response['itemList']
    reco_list = []
    
    for item in itemList:
        activity_id = item['itemId']
        QueryItem = table.query(
            KeyConditionExpression=Key('activity_id').eq(activity_id)
        )
        meetup = QueryItem['Items'][0]
        reco_list.append(meetup)
    
    return {
        'statusCode': 200,
        'body': reco_list
    }
