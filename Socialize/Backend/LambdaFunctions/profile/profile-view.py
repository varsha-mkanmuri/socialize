import json
import boto3

def lambda_handler(event, context):
    print(event['uni'])
    uni = event['uni']
    dynamodb = boto3.resource('dynamodb')

    table_name = 'profile-details'

    table = dynamodb.Table(table_name)

    try:
        response = table.get_item(
            Key={
                'uni': uni
            }
        )

        if 'Item' in response:
            user_item = response['Item']
            return {
                'statusCode': 200,
                'body': user_item, 
                'headers' : {
                    'Access-Control-Allow-Origin' : '*'
                }
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps('User not found')
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }