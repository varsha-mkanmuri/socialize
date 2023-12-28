import json
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')

poll_table_name = 'polls-db'
poll_table = dynamodb.Table(poll_table_name)

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    try:
        # Extract poll_id from the path parameters
        poll_id = event['poll_id']

        # Retrieve specific details for the given poll ID
        response = poll_table.get_item(
            Key={'poll_id': poll_id}
        )

        # Check if the poll exists
        if 'Item' not in response:
            response = {
                'statusCode': 404,
                'body': json.dumps({'error': 'Poll not found'})
            }
        else:
            poll_details = response['Item']

            response = {
                'statusCode': 200,
                'body': poll_details
            }

    except Exception as e:
        # Handle any exceptions and respond with an error
        response = {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

    return response