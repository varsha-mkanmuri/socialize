import json
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

def lambda_handler(event, context):
    activity_id = event["activity_id"]
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('activity-details')
    
    QueryItem = table.query(
        KeyConditionExpression=Key('activity_id').eq(activity_id)
    )
    
    response = {
        'statusCode': 200,
        'body': QueryItem["Items"][0]}
    
    return response

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError("Object of type {} is not JSON serializable".format(type(obj)))

