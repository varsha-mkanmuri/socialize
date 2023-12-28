import json
import uuid
import boto3

dynamodb = boto3.resource('dynamodb')
poll_table_name = 'polls-db'
poll_table = dynamodb.Table(poll_table_name)

def add_data_to_profile(uni, poll_id):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('profile-details')
    response = table.get_item( Key={'uni': uni })
    item = response['Item']
    item['poll_ids'].append(poll_id)
    res = table.put_item(Item = item)
    print(res)
    return

def lambda_handler(event, context):
    try:
        # Assuming the request body contains the title and description of the poll
        title = event['title']
        description = event['description']
        user_id = event['user_id']
        category = event['category']
        tags = event['tags']

        # Generate a unique poll ID using UUID
        poll_id = str(uuid.uuid4())

        # Save the poll details to DynamoDB
        poll_table.put_item(
            Item={
                'poll_id': poll_id,
                'title': title,
                'description': description,
                'participants_count': 0,
                'tags' : tags,
                'category' : category,
                'user_id': user_id  # Store only the user ID of the creator
            }
        )
        add_data_to_profile(user_id, poll_id)
        response_body = {
            'poll_id': poll_id,
            'message': 'Poll created successfully'
        }

        response = {
            'statusCode': 200,
            'body': json.dumps(response_body)
        }

    except Exception as e:
        # Handle any exceptions and respond with an error
        response = {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

    return response