from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from .models import CustomUser, Content
from django.core.exceptions import ValidationError
from pymongo import MongoClient
from django.conf import settings
import re
from bson import ObjectId
from datetime import datetime

client = MongoClient(settings.MONGODB_URI)  # MongoDB connection
db = client[settings.MONGODB_DATABASE]
users_collection = db['users']
contents_collection = db['contents']

def validate_password(password):
    if len(password) < 8:
        raise ValidationError('Password must be at least 8 characters long')
    if not re.search(r'[A-Z]', password):
        raise ValidationError('Password must contain at least one uppercase letter')
    if not re.search(r'[a-z]', password):
        raise ValidationError('Password must contain at least one lowercase letter')
    if not re.search(r'[0-9]', password):
        raise ValidationError('Password must contain at least one number')

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        data = request.data
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        user_type = data.get('user_type', 'user')
        if not all([email, username, password]):  # basic_validation
            return Response({
                'error': 'Please provide all required fields: email, username, password'
            }, status=status.HTTP_400_BAD_REQUEST)
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'  # email_format
        if not re.match(email_pattern, email):
            return Response({
                'error': 'Invalid email format'
            }, status=status.HTTP_400_BAD_REQUEST)
        if len(username) < 3:  # username_validation
            return Response({
                'error': 'Username must be at least 3 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            return Response({
                'error': 'Username can only contain letters, numbers, and underscores'
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(password)
        except ValidationError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

        if users_collection.find_one({"$or": [  # checking users
            {"username": username},
            {"email": email}
        ]}):
            return Response({
                'error': 'User with this username or email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)

        # mongo_db structure
        mongo_user = {
            "username": username,
            "email": email,
            "user_type": user_type,
            "is_verified": True,
        }
        result = users_collection.insert_one(mongo_user)
        user = CustomUser.objects.create_user(  # Create Django user
            username=username,
            email=email,
            password=password,
            user_type=user_type,
            is_verified=True,
            mongodb_id=str(result.inserted_id)
        )
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': 'User created successfully',
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'user': {
                'id': str(result.inserted_id),
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type
            }
        }, status=status.HTTP_201_CREATED)
    except ValidationError as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    try:
        data = request.data
        login_identifier = data.get('login')
        password = data.get('password')
        user_type = data.get('user_type', 'user')
        if not all([login_identifier, password]):
            return Response({
                'error': 'Please provide both login identifier and password'
            }, status=status.HTTP_400_BAD_REQUEST)
        query = {"user_type": user_type}  # find user in mongo_db
        if '@' in login_identifier:
            query["email"] = login_identifier
        else:
            query["username"] = login_identifier

        mongo_user = users_collection.find_one(query)
        if not mongo_user:
            return Response({
                'error': 'No user found with provided credentials'
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            user = CustomUser.objects.get(username=mongo_user['username'])  # authentication
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'User authentication failed'
            }, status=status.HTTP_401_UNAUTHORIZED)
        authenticated_user = authenticate(username=user.username, password=password)
        if not authenticated_user:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(authenticated_user)
        return Response({
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'user': {
                'id': str(mongo_user['_id']),
                'username': authenticated_user.username,
                'email': authenticated_user.email,
                'user_type': authenticated_user.user_type
            }
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_content(request):
    try:
        data = request.data
        heading = data.get('heading')
        description = data.get('description')
        price = data.get('price')

        if not heading or not description:
            return Response({
                'error': 'Please provide both heading and description'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            content_data = {
                'heading': heading,
                'description': description,
                'price': price,
                'host_id': str(request.user.id),
                'host_name': request.user.username,
                'uploaded_at': datetime.now().isoformat()
            }
            
            result = contents_collection.insert_one(content_data)  # Insert into MongoDB
            content = Content.objects.create(  # Create Django model instance
                heading=heading,
                description=description,
                price=price,
                host=request.user,
                mongodb_id=str(result.inserted_id)
            )
            return Response({
                'success': 'Content uploaded successfully',
                'content': {
                    'id': str(result.inserted_id),
                    'heading': heading,
                    'description': description,
                    'price': price,
                    'host_name': request.user.username,
                    'uploaded_at': content_data['uploaded_at']
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            if 'result' in locals():
                contents_collection.delete_one({'_id': result.inserted_id})
            raise e

    except Exception as e:
        print(f"Error in upload_content: {str(e)}")
        return Response({
            'error': f'Error uploading content: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_host_contents(request, host_id):
    try:
        contents = list(contents_collection.find({'host_id': host_id}))
        for content in contents:
            content['_id'] = str(content['_id'])
        
        return Response({
            'contents': contents
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_contents(request):
    try:
        contents = list(contents_collection.find())
        for content in contents:
            content['_id'] = str(content['_id'])
        return Response({
            'contents': contents
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)