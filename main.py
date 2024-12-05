from fastapi import FastAPI
from fastapi.params import Body
from pydantic import BaseModel, ValidationError
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
from schema import *
from functions import *
from datetime import datetime
import google.generativeai as genai
from pydantic import BaseModel

app = FastAPI()
genai.configure(api_key="AIzaSyCimAqa7BwLamEjdVYVLQCQHKJZRoM9p0Y")
model = genai.GenerativeModel("gemini-1.5-flash")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5501","https://fin-ai-hackathon.vercel.app/" , "*"],  # Allow all origins (use specific domains in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post('/auth')
async def postAuth(info : loginInfo):

    flag = await authentication(info.username , info.password)
    if (flag):
        return {"result" : "true"}
    return {"result" : "false"}

    
@app.post('/register')  #TO add to database
async def uploadUser(info : loginInfo):
    
    flag = await register(info.username , info.password)
    
    if (flag):
        return {"result" : "true"}
    
    return {"result" : "false"}


@app.post('/chkUser') # to check if the user already exists
async def userExists(info : loginInfo):
    flag = await checkUser(info.username , info.password)
    
    if (flag):
        return {"result" : "true"}
    
    return {"result" : "false"}

@app.post('/expenses/add')
async def add_expense(expense: dict):
    try:
        required_fields = ['username', 'amount', 'description', 'date']
        if not all(field in expense for field in required_fields):
            return {"result": "false", "error": "Missing required fields"}
            
        success = await insert_expense(expense)  # Call refactored function
        return {"result": str(success).lower()}
    except Exception as e:
        print(f"Error adding expense: {e}")
        return {"result": "false", "error": "Internal server error"}

# Ensure any success or error messages related to amounts use ₹ instead of $

@app.get('/expenses/{username}')
async def get_expenses(username: str):
    try:
        expenses = await get_user_expenses(username)
        return {"expenses": expenses}
    except Exception as e:
        print(f"Error getting expenses: {e}")
        return {"expenses": [], "error": "Internal server error"}
class UserMessage(BaseModel):
    message: str
    username: str

@app.post('/chat')
async def chat_with_gemini(user_message: UserMessage):
    # Replace with your Gemini chatbot API interaction
    # For example, you may need to make an API call here to the Gemini model
    value = await get_user_expenses(user_message.username)
    result = str(value)
    response = model.generate_content(user_message.message+ ""+"Analyze the dataset of item names, costs, and purchase dates to identify where the most money is being spent and Ensure that: 1. you keep it consise probably under 8 lines but not less than 5 lines, the values are in INR.use markdown format to make it look structred with bullet points here: " + result)
    
    return {"response": response.text}

@app.delete('/expenses/delete/{expense_id}')
async def delete_expense_endpoint(expense_id: int):
    success = await delete_expense(expense_id)
    if success:
        return {"success": True}
    else:
        return {"success": False, "error": "Failed to delete expense."}
