#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Testing Mentore Backend API...${NC}"
echo ""

BASE_URL="http://localhost:3001"

echo -e "${YELLOW}📋 Test 1: Health Check${NC}"
health_response=$(curl -s "$BASE_URL/health")
if [[ $health_response == *"success":true* ]]; then
    echo -e "✅ Health check: ${GREEN}PASSED${NC}"
else
    echo -e "❌ Health check: ${RED}FAILED${NC}"
    echo "Response: $health_response"
    exit 1
fi
echo ""

echo -e "${YELLOW}📋 Test 2: API Documentation${NC}"
doc_response=$(curl -s "$BASE_URL/")
if [[ $doc_response == *"Welcome to Mentore Backend API"* ]]; then
    echo -e "✅ API Documentation: ${GREEN}PASSED${NC}"
else
    echo -e "❌ API Documentation: ${RED}FAILED${NC}"
    echo "Response: $doc_response"
    exit 1
fi
echo ""

echo -e "${YELLOW}📋 Test 3: Create Mentor${NC}"
mentor_response=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Alice Mentor",
        "email": "alice@example.com",
        "password": "Password123",
        "role": "mentor",
        "expertise": ["JavaScript", "React", "Node.js"],
        "bio": "Experienced full-stack developer"
    }')

if [[ $mentor_response == *"success":true* ]] && [[ $mentor_response == *"token"* ]]; then
    echo -e "✅ Create Mentor: ${GREEN}PASSED${NC}"
    # Extract token for future requests
    mentor_token=$(echo "$mentor_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "Mentor token extracted: ${mentor_token:0:20}..."
else
    echo -e "❌ Create Mentor: ${RED}FAILED${NC}"
    echo "Response: $mentor_response"
fi
echo ""

echo -e "${YELLOW}📋 Test 4: Create Mentee${NC}"
mentee_response=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Bob Student",
        "email": "bob@example.com",
        "password": "Password123",
        "role": "mentee",
        "bio": "Aspiring web developer"
    }')

if [[ $mentee_response == *"success":true* ]] && [[ $mentee_response == *"token"* ]]; then
    echo -e "✅ Create Mentee: ${GREEN}PASSED${NC}"
    mentee_token=$(echo "$mentee_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "Mentee token extracted: ${mentee_token:0:20}..."
else
    echo -e "❌ Create Mentee: ${RED}FAILED${NC}"
    echo "Response: $mentee_response"
fi
echo ""

echo -e "${YELLOW}📋 Test 5: Mentor Login${NC}"
login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "alice@example.com",
        "password": "Password123"
    }')

if [[ $login_response == *"success":true* ]] && [[ $login_response == *"token"* ]]; then
    echo -e "✅ Mentor Login: ${GREEN}PASSED${NC}"
    # Update token from login
    mentor_token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    echo -e "❌ Mentor Login: ${RED}FAILED${NC}"
    echo "Response: $login_response"
fi
echo ""

if [ -n "$mentor_token" ]; then
    echo -e "${YELLOW}📋 Test 6: Get Mentor Profile${NC}"
    profile_response=$(curl -s -X GET "$BASE_URL/api/auth/me" \
        -H "Authorization: Bearer $mentor_token")

    if [[ $profile_response == *"success":true* ]] && [[ $profile_response == *"Alice Mentor"* ]]; then
        echo -e "✅ Get Mentor Profile: ${GREEN}PASSED${NC}"
    else
        echo -e "❌ Get Mentor Profile: ${RED}FAILED${NC}"
        echo "Response: $profile_response"
    fi
    echo ""

    echo -e "${YELLOW}📋 Test 7: Assign Mentee${NC}"
    assign_response=$(curl -s -X POST "$BASE_URL/api/auth/assign-mentee" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $mentor_token" \
        -d '{
            "menteeEmail": "bob@example.com"
        }')

    if [[ $assign_response == *"success":true* ]] && [[ $assign_response == *"Mentee assigned successfully"* ]]; then
        echo -e "✅ Assign Mentee: ${GREEN}PASSED${NC}"
    else
        echo -e "❌ Assign Mentee: ${RED}FAILED${NC}"
        echo "Response: $assign_response"
    fi
    echo ""
fi

echo -e "${YELLOW}📋 Test 8: Invalid Login${NC}"
invalid_login=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "invalid@example.com",
        "password": "wrongpassword"
    }')

if [[ $invalid_login == *"success":false* ]] && [[ $invalid_login == *"Invalid credentials"* ]]; then
    echo -e "✅ Invalid Login Rejection: ${GREEN}PASSED${NC}"
else
    echo -e "❌ Invalid Login Rejection: ${RED}FAILED${NC}"
    echo "Response: $invalid_login"
fi
echo ""

echo -e "${YELLOW}📋 Test 9: Unauthorized Access${NC}"
unauth_response=$(curl -s -X GET "$BASE_URL/api/auth/me")

if [[ $unauth_response == *"success":false* ]] && [[ $unauth_response == *"Not authorized"* ]]; then
    echo -e "✅ Unauthorized Access Rejection: ${GREEN}PASSED${NC}"
else
    echo -e "❌ Unauthorized Access Rejection: ${RED}FAILED${NC}"
    echo "Response: $unauth_response"
fi
echo ""

echo -e "${GREEN}🎉 All tests completed!${NC}"
echo -e "${YELLOW}Server is running successfully on http://localhost:3001${NC}"