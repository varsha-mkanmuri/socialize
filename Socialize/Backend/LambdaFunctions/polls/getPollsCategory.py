import boto3
import json
from boto3.dynamodb.conditions import Key, Attr

def get_polls(category):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('polls-db')
    response = table.scan(FilterExpression=Attr('category').eq(category))
    if 'Items' in response.keys():
        return response['Items']
    return []

def lambda_handler(event, context):
    # TODO implement
    category = event['category']
    polls = get_polls(category)
    print(polls)
    return {
        'statusCode': 200,
        'body': polls
    }
