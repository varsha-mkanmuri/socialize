import json
import boto3

def lambda_handler(event, context):
    uni = event['uni']
    updated_data = {
        "location" : event['location'],
        "phoneno" : event['phoneno'],
        "interest": event['interest']
    }

    dynamodb = boto3.resource('dynamodb')

    table_name = 'profile-details'

    table = dynamodb.Table(table_name)

    try:
        response = table.update_item(
            Key={
                'uni': uni
            },
            UpdateExpression='SET #location = :location, #phoneno = :phoneno, #interest = :interest',
            ExpressionAttributeNames={
                '#location': 'location',
                '#phoneno': 'phoneno',
                '#interest': 'interest'
            },
            ExpressionAttributeValues={
                ':location': updated_data.get('location'),
                ':phoneno': updated_data.get('phoneno'),
                ':interest': updated_data.get('interest', [])
            },
            ReturnValues='UPDATED_NEW'
        )

        updated_user_item = response.get('Attributes', {})

        return {
            'statusCode': 200,
            'body': json.dumps(updated_user_item)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }