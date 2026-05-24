# RDF/OWL Ontology Visualization Web Application

A web-based interactive visualization tool for RDF and OWL ontologies, designed to help explore and understand knowledge graphs.

## Features

- **File Upload**: Upload RDF/OWL files in multiple formats (Turtle, RDF/XML, N-Triples, N3, JSON-LD)
- **Interactive Visualization**: Force-directed graph layout with zoom, pan, and node selection
- **Node Inspection**: Click on nodes to see detailed properties and connections
- **SPARQL Query Interface**: Execute SPARQL queries directly on loaded graphs
- **Fuseki Integration**: Connect to Apache Jena Fuseki SPARQL endpoints
- **Filtering & Search**: Filter nodes by type and search through the graph
- **Export Options**: Export visualization as PNG or graph data as JSON

## Installation

### Prerequisites
- Python 3.7+
- Flask
- RDFlib

### Setup
1. Clone or download this repository
2. Install required Python packages:
   ```bash
   pip install flask rdflib
   ```
   Or on Ubuntu/Debian:
   ```bash
   sudo apt install python3-flask python3-rdflib
   ```

3. Ensure you have write permissions for the `uploads` directory

## Usage

### Starting the Application
```bash
cd ontology_visualizer
python3 app.py
```

The application will start on `http://localhost:5000`

### Loading Ontologies
1. **Upload File**: Drag and drop or browse for RDF/OWL files
2. **Connect to Fuseki**: Enter a Fuseki endpoint URL (default: `http://localhost:3030/ds/sparql`)
3. **Supported Formats**: `.ttl`, `.rdf`, `.owl`, `.n3`, `.nt`, `.jsonld`, `.json`

### Using the Interface

#### Visualization Panel
- **Zoom**: Mouse wheel or pinch gesture
- **Pan**: Click and drag
- **Select Node**: Click on any node
- **Node Details**: View in the right sidebar
- **Reset View**: Click the sync button

#### Controls Panel
- **Physics**: Toggle force-directed simulation
- **Node Size**: Adjust node display size
- **Edge Width**: Adjust edge thickness
- **Layout**: Switch between hierarchical and force-directed layouts

#### Query Panel
- **SPARQL Editor**: Write and execute SPARQL queries
- **Query Types**: SELECT, CONSTRUCT, DESCRIBE, ASK
- **Results Display**: Table view for SELECT queries, graph update for CONSTRUCT

## API Endpoints

### `POST /api/upload`
Upload and parse RDF/OWL file
- **Parameters**: `file` (multipart/form-data)
- **Returns**: Graph data in vis.js format

### `POST /api/query`
Execute SPARQL query
- **Parameters**: `graph_id`, `query` (JSON)
- **Returns**: Query results

### `GET /api/graph/<graph_id>`
Get graph data
- **Returns**: Graph in vis.js format

### `POST /api/fuseki/connect`
Connect to Fuseki endpoint
- **Parameters**: `endpoint` (JSON)
- **Returns**: Connection status

### `GET /api/node/<graph_id>/<node_id>`
Get node details
- **Returns**: Node properties and connections

## Architecture

### Backend (Flask + RDFlib)
- **app.py**: Main Flask application
- **RDF Parsing**: Uses RDFlib for parsing and querying
- **Graph Conversion**: Converts RDF graphs to vis.js format
- **API Endpoints**: RESTful API for frontend communication

### Frontend (HTML/CSS/JavaScript)
- **vis.js**: Network visualization library
- **Bootstrap 5**: Responsive UI framework
- **Custom JavaScript**: Application logic and API integration

### Data Flow
1. User uploads RDF file or connects to endpoint
2. Backend parses RDF into graph structure
3. Graph converted to nodes/edges format
4. Frontend renders interactive visualization
5. User interactions trigger API calls
6. Results update visualization dynamically

## Integration with Apache Jena Fuseki

The application can connect to a running Fuseki instance:

1. Ensure Fuseki is running (default: `http://localhost:3030`)
2. Enter the endpoint URL in the "Connect to Fuseki" field
3. Use the SPARQL interface to query the remote dataset

## Example Queries

### Find All Classes
```sparql
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT ?class ?label ?comment
WHERE {
  ?class a owl:Class .
  OPTIONAL { ?class rdfs:label ?label }
  OPTIONAL { ?class rdfs:comment ?comment }
}
```

### Find Property Hierarchy
```sparql
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?property ?superproperty ?label
WHERE {
  ?property rdfs:subPropertyOf ?superproperty .
  OPTIONAL { ?property rdfs:label ?label }
}
```

### Find Individuals of a Class
```sparql
PREFIX ex: <http://example.org/ontology#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?individual ?type
WHERE {
  ?individual a ex:Person .
  ?individual rdf:type ?type
}
```

## Troubleshooting

### File Upload Issues
- Ensure file format is supported
- Check file size (max 16MB)
- Verify RDF syntax is valid

### Connection Issues
- Check if Fuseki is running: `curl http://localhost:3030`
- Verify endpoint URL format
- Check CORS settings if connecting to remote endpoint

### Visualization Performance
- For large graphs (>1000 nodes), use filtering
- Disable physics for better performance
- Use LIMIT in SPARQL queries

## License

This project is provided as-is for educational and research purposes.

## Acknowledgments

- [vis.js](https://visjs.org/) for network visualization
- [RDFlib](https://rdflib.readthedocs.io/) for RDF processing
- [Apache Jena](https://jena.apache.org/) for Fuseki SPARQL server
- [Flask](https://flask.palletsprojects.com/) for web framework