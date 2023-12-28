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
        # Assuming the user_id is provided in the event
        user_id = event['user_id']

        # Scan all polls from the 'poll-db' table
        response = poll_table.scan()

        # Filter out polls associated with the specified user
        polls = [poll for poll in response.get('Items', []) if poll.get('user_id') != user_id]

        # Respond with the list of polls
        response_body = {
            'polls': polls,
            'message': f'Polls excluding user {user_id} retrieved successfully'
        }

        response = {
            'statusCode': 200,
            'body': json.dumps(response_body, cls=DecimalEncoder)
        }

    except Exception as e:
        # Handle any exceptions and respond with an error
        response = {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

    return response