import json
import boto3

def update_authentication(uni):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('authentication')
    res = table.get_item(Key={ 'uni': uni })
    if len(res) > 0:
        data = res['Item']
        data['isVerified'] = True
        table.put_item(Item=data)
    return
    

def lambda_handler(event, context):
    user_name = event['name']
    user_uni = event['uni']
    user_emailId = event['emailId']
    user_loc = event['location']
    user_phno = event['phoneno']
    user_int = event['interest']
    
    update_authentication(user_uni)

    dynamodb = boto3.resource('dynamodb')

    table_name = 'profile-details'

    table = dynamodb.Table(table_name)

    user_item = {
        'name': user_name,
        'uni': user_uni,
        'emailId': user_emailId,
        'location': user_loc,
        'phoneno': user_phno,
        'interest': user_int,
        'poll_ids' : []
    }

    table.put_item(Item=user_item)

    response = {
        'statusCode': 200,
        'body': json.dumps('User created successfully!')
    }

    return response