#!/bin/bash

echo "🔍 Finding your local IP address..."
echo ""

# For Mac/Linux
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "📱 Your local IP addresses:"
    ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print "   " $2}'
    echo ""
    echo "💡 Use one of these IPs in src/config/api.js"
    echo ""
    echo "Example:"
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
    echo "   const API_BASE_URL = 'http://$IP:5002/api';"
fi

# For Windows (Git Bash)
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    echo "📱 Your local IP addresses:"
    ipconfig | grep "IPv4" | awk '{print "   " $NF}'
    echo ""
    echo "💡 Use one of these IPs in src/config/api.js"
fi

echo ""
echo "📝 Edit: src/config/api.js"
echo "   Update line 11 with your IP address"
echo ""
