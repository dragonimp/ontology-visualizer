#!/usr/bin/env python3
"""
RDF/OWL Ontology Visualization Web Application
Provides a web interface for visualizing RDF/OWL ontologies and knowledge graphs.
"""

import os
import tempfile
import json
from flask import Flask, render_template, request, jsonify, send_from_directory
import rdflib
from rdflib import Graph, URIRef, Literal, BNode
from rdflib.namespace import RDF, RDFS, OWL, XSD

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# In-memory graph store (for demo purposes)
graphs = {}

def graph_to_vis(graph_id, graph):
    """Convert RDF graph to vis.js network format"""
    nodes = {}
    edges = []
    
    # First pass: collect all subjects and objects as nodes
    for s, p, o in graph:
        # Handle subject
        if isinstance(s, URIRef):
            node_id = str(s)
            label = node_id.split('/')[-1].split('#')[-1]
            nodes[node_id] = {
                'id': node_id,
                'label': label,
                'title': node_id,
                'group': 'resource',
                'shape': 'ellipse'
            }
        elif isinstance(s, BNode):
            node_id = str(s)
            nodes[node_id] = {
                'id': node_id,
                'label': 'Blank Node',
                'title': 'Blank Node',
                'group': 'blank',
                'shape': 'circle'
            }
        
        # Handle object if it's a resource
        if isinstance(o, URIRef):
            node_id = str(o)
            label = node_id.split('/')[-1].split('#')[-1]
            nodes[node_id] = {
                'id': node_id,
                'label': label,
                'title': node_id,
                'group': 'resource',
                'shape': 'ellipse'
            }
        elif isinstance(o, BNode):
            node_id = str(o)
            nodes[node_id] = {
                'id': node_id,
                'label': 'Blank Node',
                'title': 'Blank Node',
                'group': 'blank',
                'shape': 'circle'
            }
        elif isinstance(o, Literal):
            # Create a node for literals
            node_id = f"literal_{hash(str(o))}"
            label = str(o)[:50] + ('...' if len(str(o)) > 50 else '')
            nodes[node_id] = {
                'id': node_id,
                'label': label,
                'title': str(o),
                'group': 'literal',
                'shape': 'box',
                'color': {'background': '#e1f5fe'}
            }
            # Edge from subject to literal
            if isinstance(s, URIRef) or isinstance(s, BNode):
                edges.append({
                    'from': str(s),
                    'to': node_id,
                    'label': str(p).split('/')[-1].split('#')[-1],
                    'title': str(p),
                    'arrows': 'to'
                })
            continue
        
        # Create edge between resources
        if (isinstance(s, URIRef) or isinstance(s, BNode)) and (isinstance(o, URIRef) or isinstance(o, BNode)):
            edges.append({
                'from': str(s),
                'to': str(o),
                'label': str(p).split('/')[-1].split('#')[-1],
                'title': str(p),
                'arrows': 'to'
            })
    
    # Convert nodes dict to list
    nodes_list = list(nodes.values())
    
    return {
        'nodes': nodes_list,
        'edges': edges,
        'graph_id': graph_id,
        'stats': {
            'nodes': len(nodes_list),
            'edges': len(edges),
            'triples': len(graph)
        }
    }

@app.route('/')
def index():
    """Render main visualization page"""
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle RDF/OWL file upload"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        # Save uploaded file
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)
        
        # Parse RDF file
        graph = Graph()
        try:
            # Try to guess format from extension
            file_ext = file.filename.lower().split('.')[-1]
            format_map = {
                'ttl': 'turtle',
                'n3': 'n3',
                'nt': 'ntriples',
                'rdf': 'xml',
                'owl': 'xml',
                'json': 'json-ld',
                'jsonld': 'json-ld'
            }
            format = format_map.get(file_ext, 'xml')
            
            graph.parse(filename, format=format)
            graph_id = f"graph_{len(graphs)}"
            graphs[graph_id] = graph
            
            # Convert to vis.js format
            vis_data = graph_to_vis(graph_id, graph)
            
            return jsonify({
                'success': True,
                'graph_id': graph_id,
                'data': vis_data,
                'message': f'Successfully loaded {len(graph)} triples'
            })
        except Exception as e:
            return jsonify({'error': f'Failed to parse RDF file: {str(e)}'}), 400

@app.route('/api/query', methods=['POST'])
def query_graph():
    """Execute SPARQL query on a graph"""
    data = request.json
    graph_id = data.get('graph_id')
    query = data.get('query')
    
    if not graph_id or not query:
        return jsonify({'error': 'Missing graph_id or query'}), 400
    
    if graph_id not in graphs:
        return jsonify({'error': 'Graph not found'}), 404
    
    try:
        graph = graphs[graph_id]
        results = graph.query(query)
        
        # Convert results to JSON
        if results.type == 'SELECT':
            bindings = []
            for row in results:
                row_dict = {}
                for var in results.vars:
                    value = row[var]
                    if value:
                        row_dict[str(var)] = {
                            'value': str(value),
                            'type': type(value).__name__
                        }
                bindings.append(row_dict)
            
            return jsonify({
                'success': True,
                'results': bindings,
                'vars': [str(var) for var in results.vars]
            })
        elif results.type == 'CONSTRUCT':
            # Return the constructed graph
            constructed_graph = results.graph
            vis_data = graph_to_vis(f"constructed_{graph_id}", constructed_graph)
            return jsonify({
                'success': True,
                'data': vis_data
            })
        else:
            return jsonify({
                'success': True,
                'results': str(results)
            })
    except Exception as e:
        return jsonify({'error': f'SPARQL query error: {str(e)}'}), 400

@app.route('/api/graph/<graph_id>', methods=['GET'])
def get_graph(graph_id):
    """Get graph data in vis.js format"""
    if graph_id not in graphs:
        return jsonify({'error': 'Graph not found'}), 404
    
    graph = graphs[graph_id]
    vis_data = graph_to_vis(graph_id, graph)
    return jsonify(vis_data)

@app.route('/api/fuseki/connect', methods=['POST'])
def connect_fuseki():
    """Connect to external Fuseki SPARQL endpoint"""
    data = request.json
    endpoint = data.get('endpoint', 'http://localhost:3030/ds/sparql')
    
    try:
        # Test connection with a simple query
        test_query = "SELECT * WHERE { ?s ?p ?o } LIMIT 1"
        # This would require SPARQLWrapper or similar library
        # For now, just return success
        return jsonify({
            'success': True,
            'endpoint': endpoint,
            'message': 'Connection successful (demo mode)'
        })
    except Exception as e:
        return jsonify({'error': f'Failed to connect to Fuseki: {str(e)}'}), 400

@app.route('/api/node/<graph_id>/<node_id>', methods=['GET'])
def get_node_details(graph_id, node_id):
    """Get detailed information about a node"""
    if graph_id not in graphs:
        return jsonify({'error': 'Graph not found'}), 404
    
    graph = graphs[graph_id]
    
    # Find all triples where node is subject or object
    node_uri = URIRef(node_id) if node_id.startswith('http') else None
    if not node_uri:
        # Try to find the node by label
        for s, p, o in graph:
            if str(s) == node_id:
                node_uri = s
                break
            if str(o) == node_id:
                node_uri = o
                break
    
    if not node_uri:
        return jsonify({'error': 'Node not found'}), 404
    
    # Get incoming and outgoing edges
    outgoing = []
    incoming = []
    
    for s, p, o in graph:
        if s == node_uri:
            outgoing.append({
                'predicate': str(p),
                'object': str(o),
                'object_type': type(o).__name__
            })
        if o == node_uri:
            incoming.append({
                'subject': str(s),
                'predicate': str(p),
                'subject_type': type(s).__name__
            })
    
    return jsonify({
        'node_id': str(node_uri),
        'outgoing': outgoing,
        'incoming': incoming,
        'total_connections': len(outgoing) + len(incoming)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)