curl -X POST http://localhost:5000/customer/login -H "Content-Type: application/json" -c cookie.txt -d '{"username":"user1","password":"password123"}'
{"message":"User successfully logged in","accessToken":"<JWT_TOKEN>"}
