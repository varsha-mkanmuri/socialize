import boto3
import json

def receive_message():
    sqs = boto3.client('sqs')
    response = sqs.receive_message(QueueUrl = 'emailVerification')
    data = None
    if 'Messages' in response.keys():
        message = response['Messages']
        if len(message) > 0: 
            receipt_handle = message[0]['ReceiptHandle']
            message = message[0]['Body']
            data = json.loads(message)
            dlt_response = sqs.delete_message(QueueUrl='emailVerification', ReceiptHandle=receipt_handle)
    return data
    
def send_email(uni, email):
    from_email = 'smrithi.prakash23@gmail.com'
    to_email = email
    
    link = f'main.d3ux64n7l5a7it.amplifyapp.com/createProfile?uni={uni}&email={email}'
    
    message = {
        'Subject' : {
            'Data' : 'Verify Email for Socialize'
        },
        'Body': {
            'Text' : { 'Data':f"""
            Thank you for registering at Socialize. Hope you are able to meet like minded people, \
            attend new event and study well using the study group.
            You can complete your verification using this link : {link}
            """}
        }
    }
    ses = boto3.client('ses')
    response = ses.send_email(
        Source = from_email, 
        Destination = {'ToAddresses':[to_email]},
        Message = message)
    return response

def lambda_handler(event, context):
    data = receive_message()
    if data is not None : send_email(data['uni'], data['emailID'])
    
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
