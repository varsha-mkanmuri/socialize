import json
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')

poll_table_name = 'polls-db'
poll_table = dynamodb.Table(poll_table_name)

profile_table_name = 'profile-details'
profile_table = dynamodb.Table(profile_table_name)

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
        # Extract poll_id and user_id from the event
        poll_id = event['poll_id']
        user_id = event['user_id']
       
        profile_response = profile_table.get_item(
            Key={'uni': user_id},
            ProjectionExpression='poll_ids'
        )
        
        user_polls = profile_response.get('Item', {}).get('poll_ids', [])

        if poll_id in user_polls:
            # User has already participated, return a response
            response_body = {
                'already_registered': True
            }
            response = {
                'statusCode': 200,
                'body': response_body
            }
        else:
            # Update the participation count for the specified poll ID
            response = poll_table.update_item(
                Key={'poll_id': poll_id},
                UpdateExpression='SET participants_count = participants_count + :incr',
                ExpressionAttributeValues={':incr': 1},
                ReturnValues='ALL_NEW'  # Return the updated item
            )
            # Get the updated poll details
            updated_poll = response.get('Attributes', {})
            # print(updated_poll)
    
            # Add the poll_id to the 'polls_id' column in the 'profile-details' table
            profile_table.update_item(
                Key={'uni': user_id},
                UpdateExpression='SET poll_ids = list_append(if_not_exists(poll_ids, :empty_list), :poll_id)',
                ExpressionAttributeValues={':poll_id': [poll_id], ':empty_list': []}
            )
    
            response_body = {
                'updated_poll': updated_poll,
                'message': f'Participation in poll {poll_id} recorded successfully for user {user_id}',
                'already_registered': False
            }
    
            response = {
                'statusCode': 200,
                'body': response_body
            }

    except Exception as e:
        # Handle any exceptions and respond with an error
        response = {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

    return response