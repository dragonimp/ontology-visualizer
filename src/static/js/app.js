/**
 * RDF/OWL Ontology Visualization - Main Application Script
 */

// Global variables
let network = null;
let graphData = {
    nodes: new vis.DataSet([]),
    edges: new vis.DataSet([])
};
let currentGraphId = null;
let allNodes = [];
let allEdges = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNetwork();
    setupEventListeners();
    checkFusekiConnection();
});

// Initialize vis.js network
function initializeNetwork() {
    const container = document.getElementById('network');
    
    const options = {
        nodes: {
            shape: 'ellipse',
            size: 25,
            font: {
                size: 14,
                face: 'Tahoma'
            },
            borderWidth: 2,
            shadow: true
        },
        edges: {
            width: 2,
            color: { color: '#848484' },
            smooth: {
                type: 'continuous',
                roundness: 0.5
            },
            arrows: {
                to: { enabled: true, scaleFactor: 0.8 }
            },
            font: {
                size: 12,
                align: 'top'
            },
            selectionWidth: 5
        },
        physics: {
            enabled: true,
            solver: 'forceAtlas2Based',
            forceAtlas2Based: {
                gravitationalConstant: -50,
                centralGravity: 0.01,
                springLength: 200,
                springConstant: 0.08,
                damping: 0.4,
                avoidOverlap: 1
            },
            stabilization: {
                enabled: true,
                iterations: 1000,
                updateInterval: 100
            }
        },
        interaction: {
            navigationButtons: true,
            keyboard: true,
            hover: true,
            selectable: true,
            selectConnectedEdges: true,
            tooltipDelay: 200,
            hideEdgesOnDrag: false,
            hideNodesOnDrag: false
        },
        layout: {
            improvedLayout: true
        },
        groups: {
            resource: {
                color: { background: '#97C2FC', border: '#2B7CE9' },
                font: { color: '#000000' }
            },
            blank: {
                color: { background: '#FFFF88', border: '#FFA500' },
                font: { color: '#000000' },
                shape: 'circle'
            },
            literal: {
                color: { background: '#e1f5fe', border: '#03A9F4' },
                font: { color: '#000000' },
                shape: 'box'
            },
            class: {
                color: { background: '#FB7E81', border: '#FF0000' },
                font: { color: '#FFFFFF' },
                shape: 'box'
            },
            property: {
                color: { background: '#7BE141', border: '#4CAF50' },
                font: { color: '#000000' },
                shape: 'diamond'
            }
        }
    };
    
    // Create network
    network = new vis.Network(container, graphData, options);
    
    // Network events
    network.on('click', function(params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            showNodeDetails(nodeId);
            highlightConnectedNodes(nodeId);
        } else {
            clearNodeDetails();
            clearHighlights();
        }
    });
    
    network.on('doubleClick', function(params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            focusOnNode(nodeId);
        }
    });
    
    network.on('stabilizationIterationsDone', function() {
        network.fit();
    });
}

// Setup event listeners
function setupEventListeners() {
    // File upload
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.backgroundColor = '#e3f2fd';
        uploadArea.style.borderColor = '#2980b9';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.backgroundColor = '#f8fafc';
        uploadArea.style.borderColor = '#3498db';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.backgroundColor = '#f8fafc';
        uploadArea.style.borderColor = '#3498db';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    });
    
    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchNode();
        }
    });
    
    // SPARQL query on Ctrl+Enter
    document.getElementById('sparqlQuery').addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            executeSparql();
        }
    });
}

// Handle file selection
function handleFileSelect(event) {
    const files = event.target.files;
    handleFiles(files);
}

// Handle files (upload and process)
function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    showLoading('Uploading and parsing RDF file...');
    
    fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        
        if (data.error) {
            showError(data.error);
            return;
        }
        
        // Successfully loaded graph
        currentGraphId = data.graph_id;
        document.getElementById('current-graph').textContent = file.name;
        
        // Update graph visualization
        updateGraphVisualization(data.data);
        
        // Update statistics
        updateStatistics(data.data.stats);
        
        // Add to recent files
        addToRecentFiles(file.name, data.graph_id);
        
        showSuccess(`Successfully loaded ${data.data.stats.triples} triples`);
    })
    .catch(error => {
        hideLoading();
        showError('Failed to upload file: ' + error.message);
    });
}

// Update graph visualization with new data
function updateGraphVisualization(data) {
    allNodes = data.nodes;
    allEdges = data.edges;
    
    graphData.nodes.clear();
    graphData.edges.clear();
    
    graphData.nodes.add(data.nodes);
    graphData.edges.add(data.edges);
    
    // Fit to screen after a short delay
    setTimeout(() => network.fit(), 500);
}

// Update statistics display
function updateStatistics(stats) {
    document.getElementById('stat-nodes').textContent = stats.nodes;
    document.getElementById('stat-edges').textContent = stats.edges;
    document.getElementById('stat-triples').textContent = stats.triples;
}

// Show node details
function showNodeDetails(nodeId) {
    if (!currentGraphId) return;
    
    fetch(`/api/node/${currentGraphId}/${encodeURIComponent(nodeId)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('nodeDetails').innerHTML = 
                    `<p class="text-danger">Error: ${data.error}</p>`;
                return;
            }
            
            let html = `
                <h6>${data.node_id.split('/').pop().split('#').pop()}</h6>
                <p class="small text-muted">${data.node_id}</p>
                <hr>
                <p><strong>Total Connections:</strong> ${data.total_connections}</p>
            `;
            
            if (data.outgoing.length > 0) {
                html += `<h6>Outgoing Edges:</h6><ul class="list-unstyled small">`;
                data.outgoing.forEach(edge => {
                    html += `<li>
                        <strong>${edge.predicate.split('/').pop().split('#').pop()}</strong> → 
                        ${edge.object_type === 'Literal' ? `"${edge.object}"` : edge.object.split('/').pop().split('#').pop()}
                    </li>`;
                });
                html += `</ul>`;
            }
            
            if (data.incoming.length > 0) {
                html += `<h6>Incoming Edges:</h6><ul class="list-unstyled small">`;
                data.incoming.forEach(edge => {
                    html += `<li>
                        ${edge.subject.split('/').pop().split('#').pop()} → 
                        <strong>${edge.predicate.split('/').pop().split('#').pop()}</strong>
                    </li>`;
                });
                html += `</ul>`;
            }
            
            document.getElementById('nodeDetails').innerHTML = html;
        })
        .catch(error => {
            document.getElementById('nodeDetails').innerHTML = 
                `<p class="text-danger">Error loading node details: ${error.message}</p>`;
        });
}

// Clear node details
function clearNodeDetails() {
    document.getElementById('nodeDetails').innerHTML = 
        `<p class="text-muted">Click on a node to see details</p>`;
}

// Highlight connected nodes
function highlightConnectedNodes(nodeId) {
    if (!document.getElementById('highlightConnections').checked) return;
    
    // Find connected edges
    const connectedEdgeIds = [];
    const connectedNodeIds = new Set([nodeId]);
    
    graphData.edges.forEach(edge => {
        if (edge.from === nodeId || edge.to === nodeId) {
            connectedEdgeIds.push(edge.id);
            connectedNodeIds.add(edge.from);
            connectedNodeIds.add(edge.to);
        }
    });
    
    // Highlight connected nodes and edges
    const updateNodes = [];
    const updateEdges = [];
    
    graphData.nodes.forEach(node => {
        if (connectedNodeIds.has(node.id)) {
            updateNodes.push({
                id: node.id,
                color: {
                    background: node.id === nodeId ? '#FF6B6B' : '#4ECDC4',
                    border: node.id === nodeId ? '#FF0000' : '#1A535C'
                },
                font: { color: '#FFFFFF' }
            });
        } else {
            updateNodes.push({
                id: node.id,
                color: {
                    background: node.color ? node.color.background : getDefaultColor(node.group),
                    border: node.color ? node.color.border : getDefaultBorderColor(node.group)
                },
                font: { color: node.font ? node.font.color : '#000000' }
            });
        }
    });
    
    graphData.edges.forEach(edge => {
        if (connectedEdgeIds.includes(edge.id)) {
            updateEdges.push({
                id: edge.id,
                color: { color: '#FF6B6B', highlight: '#FF0000' },
                width: 4
            });
        } else {
            updateEdges.push({
                id: edge.id,
                color: { color: '#848484', highlight: '#848484' },
                width: 2
            });
        }
    });
    
    graphData.nodes.update(updateNodes);
    graphData.edges.update(updateEdges);
}

// Clear highlights
function clearHighlights() {
    const updateNodes = [];
    const updateEdges = [];
    
    graphData.nodes.forEach(node => {
        updateNodes.push({
            id: node.id,
            color: {
                background: getDefaultColor(node.group),
                border: getDefaultBorderColor(node.group)
            },
            font: { color: node.group === 'class' ? '#FFFFFF' : '#000000' }
        });
    });
    
    graphData.edges.forEach(edge => {
        updateEdges.push({
            id: edge.id,
            color: { color: '#848484', highlight: '#848484' },
            width: 2
        });
    });
    
    graphData.nodes.update(updateNodes);
    graphData.edges.update(updateEdges);
}

// Get default color for node group
function getDefaultColor(group) {
    const colors = {
        'resource': '#97C2FC',
        'blank': '#FFFF88',
        'literal': '#e1f5fe',
        'class': '#FB7E81',
        'property': '#7BE141'
    };
    return colors[group] || '#97C2FC';
}

// Get default border color for node group
function getDefaultBorderColor(group) {
    const colors = {
        'resource': '#2B7CE9',
        'blank': '#FFA500',
        'literal': '#03A9F4',
        'class': '#FF0000',
        'property': '#4CAF50'
    };
    return colors[group] || '#2B7CE9';
}

// Focus on a specific node
function focusOnNode(nodeId) {
    network.focus(nodeId, {
        scale: 1.5,
        animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
        }
    });
}

// Search for a node
function searchNode() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!query) return;
    
    // Find nodes matching the query
    const matchingNodes = [];
    graphData.nodes.forEach(node => {
        if (node.label.toLowerCase().includes(query) || 
            node.title.toLowerCase().includes(query)) {
            matchingNodes.push(node.id);
        }
    });
    
    if (matchingNodes.length > 0) {
        // Select and focus on first matching node
        network.selectNodes([matchingNodes[0]]);
        focusOnNode(matchingNodes[0]);
        showNodeDetails(matchingNodes[0]);
        
        if (matchingNodes.length > 1) {
            showInfo(`Found ${matchingNodes.length} matching nodes`);
        }
    } else {
        showWarning('No nodes found matching your search');
    }
}

// Filter nodes by type
function filterByType() {
    const filterType = document.getElementById('filterType').value;
    
    if (filterType === 'all') {
        // Show all nodes
        graphData.nodes.forEach(node => {
            graphData.nodes.update({
                id: node.id,
                hidden: false
            });
        });
    } else {
        // Filter by type
        graphData.nodes.forEach(node => {
            graphData.nodes.update({
                id: node.id,
                hidden: node.group !== filterType
            });
        });
    }
    
    // Hide edges connected to hidden nodes
    graphData.edges.forEach(edge => {
        const fromNode = graphData.nodes.get(edge.from);
        const toNode = graphData.nodes.get(edge.to);
        
        if (fromNode && toNode && (!fromNode.hidden && !toNode.hidden)) {
            graphData.edges.update({
                id: edge.id,
                hidden: false
            });
        } else {
            graphData.edges.update({
                id: edge.id,
                hidden: true
            });
        }
    });
}

// Toggle physics simulation
function togglePhysics(enabled) {
    network.setOptions({
        physics: { enabled: enabled }
    });
}

// Update node size
function updateNodeSize(size) {
    graphData.nodes.forEach(node => {
        graphData.nodes.update({
            id: node.id,
            size: parseInt(size)
        });
    });
}

// Update edge width
function updateEdgeWidth(width) {
    graphData.edges.forEach(edge => {
        graphData.edges.update({
            id: edge.id,
            width: parseInt(width)
        });
    });
}

// Change layout algorithm
function changeLayout(layoutType) {
    const options = {
        hierarchical: {
            enabled: true,
            direction: 'UD',
            sortMethod: 'directed'
        },
        force: {
            enabled: true,
            solver: 'forceAtlas2Based'
        },
        grid: {
            enabled: true,
            solver: 'grid'
        }
    };
    
    network.setOptions({
        layout: options[layoutType] || options.force
    });
    
    if (layoutType === 'hierarchical') {
        network.setOptions({ physics: false });
    } else {
        network.setOptions({ physics: true });
    }
}

// Toggle highlight connections
function toggleHighlight(enabled) {
    if (!enabled) {
        clearHighlights();
    }
}

// Execute SPARQL query
function executeSparql() {
    if (!currentGraphId) {
        showError('Please load a graph first');
        return;
    }
    
    const query = document.getElementById('sparqlQuery').value;
    const queryType = document.getElementById('queryType').value;
    
    showLoading('Executing SPARQL query...');
    
    fetch('/api/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            graph_id: currentGraphId,
            query: query
        })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        
        if (data.error) {
            showError('SPARQL Error: ' + data.error);
            return;
        }
        
        if (queryType === 'CONSTRUCT' && data.data) {
            // Update visualization with constructed graph
            updateGraphVisualization(data.data);
            updateStatistics(data.data.stats);
            showSuccess('Constructed graph visualized');
        } else if (data.results) {
            // Display SELECT results in table
            displayQueryResults(data);
        } else {
            // Display other result types
            document.getElementById('queryResults').innerHTML = `
                <div class="alert alert-info">
                    <pre class="mb-0">${JSON.stringify(data, null, 2)}</pre>
                </div>
            `;
        }
    })
    .catch(error => {
        hideLoading();
        showError('Failed to execute query: ' + error.message);
    });
}

// Display SPARQL query results
function displayQueryResults(data) {
    let html = `
        <div class="table-responsive">
            <table class="table table-sm table-striped">
                <thead>
                    <tr>
    `;
    
    // Add headers
    data.vars.forEach(variable => {
        html += `<th>${variable}</th>`;
    });
    
    html += `</tr></thead><tbody>`;
    
    // Add rows
    data.results.forEach(row => {
        html += `<tr>`;
        data.vars.forEach(variable => {
            const cell = row[variable];
            if (cell) {
                html += `<td>${cell.value}</td>`;
            } else {
                html += `<td class="text-muted">-</td>`;
            }
        });
        html += `</tr>`;
    });
    
    html += `</tbody></table></div>`;
    html += `<p class="small text-muted">${data.results.length} results</p>`;
    
    document.getElementById('queryResults').innerHTML = html;
}

// Load example SPARQL query
function loadExampleQuery() {
    const examples = [
        `# Find all classes
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT ?class ?label ?comment
WHERE {
  ?class a owl:Class .
  OPTIONAL { ?class rdfs:label ?label }
  OPTIONAL { ?class rdfs:comment ?comment }
}
ORDER BY ?class`,

        `# Find all properties and their domains/ranges
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT ?property ?label ?domain ?range
WHERE {
  ?property a rdf:Property .
  OPTIONAL { ?property rdfs:label ?label }
  OPTIONAL { ?property rdfs:domain ?domain }
  OPTIONAL { ?property rdfs:range ?range }
}
ORDER BY ?property`,

        `# Find subclass hierarchy
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT ?superclass ?class ?label
WHERE {
  ?class rdfs:subClassOf ?superclass .
  OPTIONAL { ?class rdfs:label ?label }
  FILTER (!isBlank(?superclass))
}
ORDER BY ?superclass ?class`
    ];
    
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    document.getElementById('sparqlQuery').value = randomExample;
}

// Connect to Fuseki endpoint
function connectFuseki() {
    const endpoint = document.getElementById('fusekiEndpoint').value;
    
    if (!endpoint) {
        showError('Please enter a Fuseki endpoint URL');
        return;
    }
    
    showLoading('Connecting to Fuseki endpoint...');
    
    fetch('/api/fuseki/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint: endpoint })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        
        if (data.error) {
            showError(data.error);
            return;
        }
        
        showSuccess(data.message);
        document.getElementById('current-graph').textContent = `Fuseki: ${endpoint}`;
        
        // For demo purposes, load a sample query
        document.getElementById('sparqlQuery').value = 
            `SELECT * WHERE { ?s ?p ?o } LIMIT 100`;
    })
    .catch(error => {
        hideLoading();
        showError('Failed to connect: ' + error.message);
    });
}

// Check if Fuseki is available
function checkFusekiConnection() {
    fetch('http://localhost:3030/', { mode: 'no-cors' })
        .then(() => {
            // Fuseki is reachable
            console.log('Fuseki is available at localhost:3030');
        })
        .catch(() => {
            // Fuseki not available
            console.log('Fuseki not available');
        });
}

// Add file to recent files list
function addToRecentFiles(filename, graphId) {
    const recentFilesDiv = document.getElementById('recentFiles');
    
    // Create new entry
    const entry = document.createElement('div');
    entry.className = 'mb-2';
    entry.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span class="small">${filename}</span>
            <button class="btn btn-sm btn-outline-primary" onclick="loadRecentGraph('${graphId}')">
                <i class="fas fa-redo"></i>
            </button>
        </div>
    `;
    
    // Add to top of list
    if (recentFilesDiv.firstChild && recentFilesDiv.firstChild.className === 'mb-2') {
        recentFilesDiv.insertBefore(entry, recentFilesDiv.firstChild);
    } else {
        recentFilesDiv.prepend(entry);
    }
    
    // Limit to 5 recent files
    const entries = recentFilesDiv.getElementsByClassName('mb-2');
    if (entries.length > 5) {
        entries[entries.length - 1].remove();
    }
}

// Load recent graph
function loadRecentGraph(graphId) {
    showLoading('Loading graph...');
    
    fetch(`/api/graph/${graphId}`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            
            if (data.error) {
                showError(data.error);
                return;
            }
            
            currentGraphId = graphId;
            document.getElementById('current-graph').textContent = `Graph: ${graphId}`;
            
            updateGraphVisualization(data);
            updateStatistics(data.stats);
            
            showSuccess(`Loaded graph with ${data.stats.triples} triples`);
        })
        .catch(error => {
            hideLoading();
            showError('Failed to load graph: ' + error.message);
        });
}

// Clear current graph
function clearGraph() {
    if (!confirm('Are you sure you want to clear the current graph?')) return;
    
    graphData.nodes.clear();
    graphData.edges.clear();
    currentGraphId = null;
    allNodes = [];
    allEdges = [];
    
    document.getElementById('current-graph').textContent = 'No graph loaded';
    updateStatistics({ nodes: 0, edges: 0, triples: 0 });
    clearNodeDetails();
    
    showInfo('Graph cleared');
}

// Reset view
function resetView() {
    network.fit();
    network.stabilize();
}

// Export as PNG
function exportPNG() {
    const container = document.getElementById('network');
    network.fit();
    
    // Create a temporary canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to network size
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    
    // Draw network (simplified - vis.js has better export methods)
    // This is a basic implementation
    const dataURL = network.getBase64Image('png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'ontology-visualization.png';
    link.href = dataURL;
    link.click();
}

// Export as JSON
function exportJSON() {
    const data = {
        nodes: allNodes,
        edges: allEdges,
        timestamp: new Date().toISOString()
    };
    
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = 'ontology-data.json';
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
}

// UI Helper functions
function showLoading(message) {
    // Simple loading indicator
    document.body.style.cursor = 'wait';
    if (message) {
        console.log('Loading:', message);
    }
}

function hideLoading() {
    document.body.style.cursor = 'default';
}

function showSuccess(message) {
    alertify.success(message);
}

function showError(message) {
    alertify.error(message);
}

function showWarning(message) {
    alertify.warning(message);
}

function showInfo(message) {
    alertify.message(message);
}

// Initialize alertify if available
if (typeof alertify !== 'undefined') {
    alertify.set('notifier','position', 'top-right');
}

// Simple alertify polyfill if not available
if (typeof alertify === 'undefined') {
    window.alertify = {
        success: function(msg) { console.log('Success:', msg); alert(msg); },
        error: function(msg) { console.error('Error:', msg); alert('Error: ' + msg); },
        warning: function(msg) { console.warn('Warning:', msg); alert('Warning: ' + msg); },
        message: function(msg) { console.log('Info:', msg); },
        set: function() {}
    };
}