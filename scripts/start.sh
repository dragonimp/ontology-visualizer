#!/bin/bash

# Start RDF/OWL Ontology Visualization Web Application

echo "Starting RDF/OWL Ontology Visualizer..."
echo ""

# Check if Flask and RDFlib are available
python3 -c "import flask, rdflib" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Warning: Flask or RDFlib not found. Attempting to install..."
    apt update && apt install -y python3-flask python3-rdflib 2>/dev/null || {
        echo "Failed to install dependencies. Please install manually:"
        echo "  pip install flask rdflib"
        echo "  or"
        echo "  apt install python3-flask python3-rdflib"
        exit 1
    }
fi

# Create necessary directories
mkdir -p uploads static/css static/js templates

# Check if app.py exists
if [ ! -f "app.py" ]; then
    echo "Error: app.py not found!"
    exit 1
fi

# Get local IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')
if [ -z "$IP_ADDRESS" ]; then
    IP_ADDRESS="localhost"
fi

echo "================================================"
echo "Application starting..."
echo "Local: http://localhost:5000"
echo "Network: http://$IP_ADDRESS:5000"
echo "================================================"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the Flask application
python3 app.py