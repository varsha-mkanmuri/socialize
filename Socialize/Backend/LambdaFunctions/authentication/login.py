import json
import boto3

def get_profile_details(uni):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('profile-details')
    res = table.get_item(Key={ 'uni': uni })
    return res['Item']
    
def lambda_handler(event, context):
    
    uni = event['uni']
    password = event['password']
    
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('authentication')
    authentication = {'present' : False, 'err' : None}
    try:
        res = table.get_item(Key={ 'uni': uni })
        print(res)
        if 'Item' in res:
            user = res['Item']
            if user['password'] == password:
                if user['isVerified']: 
                    authentication['present'] = True
                    authentication['user'] = get_profile_details(uni)
                else:
                    authentication['err'] = 'Please verify your email'
                    
            else:
                authentication['err'] = "Password Incorrect"

        else:
            authentication['err'] = "Uni not found, please register"
        
        print(authentication)
        return {
                'statusCode': 200,
                'body': authentication,
                'headers' : {
                    'Access-Control-Allow-Origin' : '*'
                    }
                }
    except Exception as e:
        print("Error : ", e)
        return {
                'statusCode': 200,
                'body': json.dumps(authentication)
                }
    
   
