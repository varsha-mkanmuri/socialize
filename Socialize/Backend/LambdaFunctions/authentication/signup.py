import json
import boto3

def addToSQS(data):
    sqs = boto3.client('sqs')
    data = json.dumps(data)
    response = sqs.send_message(
        QueueUrl = 'emailVerification', 
        MessageBody = data)
    print(response)

def lambda_handler(event, context):
    uni = event['uni']
    email = event['email']
    password = event['password']
    
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('authentication')
    
    data = {
        'uni': uni,
        'emailID': email,
    }
    addToSQS(data)
    data['isVerified'] = False
    data['password'] = password
    
    try:
        table.put_item(Item=data)
        return {
                'statusCode': 200,
                'body': json.dumps('Successfully created the user with uni'+uni)
                }
    except Exception as e:
        return {
                'statusCode': 200,
                'body': json.dumps(f'User couldnt be created : {e}')
                }
    
   
