import json
import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    
    try:
        sqs = boto3.client('sqs')
        sqs_res = sqs.get_queue_url(QueueName='activityRegistration')
        sqs_url = sqs_res['QueueUrl']
    
        received_message = sqs.receive_message(
            QueueUrl=sqs_url,
            MaxNumberOfMessages=1,
            MessageAttributeNames=['All']
        )
        
        print('received_message', received_message)
        
        if 'Messages' not in received_message:
            print("SQS queue has no messages currently.")
            return {
            'statusCode': 200,
            'body': json.dumps('Hello from Lambda!')
            }
            
        sqs_message = received_message['Messages'][0]
    
        print('Received message from sqs queue ', sqs_message)
        receipt_handle = sqs_message['ReceiptHandle']
    
        response = sqs.delete_message(
            QueueUrl= sqs_url,
            ReceiptHandle=receipt_handle
        )
        
        title = sqs_message['MessageAttributes']['title']['StringValue']
        category = sqs_message['MessageAttributes']['category']['StringValue']
        user_id = sqs_message['MessageAttributes']['user_id']['StringValue']
        
        sns_response_msg = "You have successfully registered for " + title + "! "
        sns_response_msg += "Hope you enjoy being part of this " + category+ "."
        
        email = fetch_user_email(user_id)
    
        send_ses(sns_response_msg, 'Congrats! Registration Successful!', email)
    
    except ClientError as e:
        print('Error', e.response['Error']['Message'])
        return
    
    
    
def send_ses(message, subject, email):
    try:
        #replace ToAddress in ses from sqs
        ses_client = boto3.client('ses', region_name='us-east-1')
        response = ses_client.send_email(
        Destination={
            'ToAddresses': [email]
        },
        Message={
            'Body': {
                'Text': {
                    'Charset': 'UTF-8',
                    'Data': message,
                }
            },
            'Subject': {
                'Charset': 'UTF-8',
                'Data': subject,
            },
        },
        Source='smrithip23@gmail.com'
        )
    
    except ClientError as e:
        print('Error', e.response['Error']['Message'])
        return
    
    print(response)

def fetch_user_email(user_id):
    
    dynamodb = boto3.resource('dynamodb')
    table_name = 'profile-details'
    table = dynamodb.Table(table_name)
    
    print("userid", user_id)

    try:
        response = table.get_item(
            Key={
                'uni': user_id
            }
        )

        print("dynamo db response", response)
       
        user_email = response['Item']['emailId']
        print("user_email", user_email)

            
        return user_email
    except ClientError as e:
        print('Error', e.response['Error']['Message'])
        return
