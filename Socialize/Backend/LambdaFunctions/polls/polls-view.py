import json
import boto3
import decimal

dynamodb = boto3.resource('dynamodb')

poll_table_name = 'polls-db'
poll_table = dynamodb.Table(poll_table_name)

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    try:
        
        user_id = event['user_id']
        
        # Querying all polls associated with the user_id
        response = poll_table.query(
            IndexName='user_id-index',  # Assuming there's a Global Secondary Index on 'user_id'
            KeyConditionExpression='user_id = :uid',
            ExpressionAttributeValues={':uid': user_id}
        )
        

        # Extract the polls from the response
        polls = response.get('Items', [])

        response_body = {
            'polls': polls,
            'message': f'Polls for user {user_id} retrieved successfully'
        }

        response = {
            'statusCode': 200,
            'body': json.dumps(response_body, cls = DecimalEncoder)
        }

    except Exception as e:
        # Handle any exceptions and respond with an error
        response = {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

    return response