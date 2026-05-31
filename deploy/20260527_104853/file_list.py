import os, json
from http.server import HTTPServer, BaseHTTPRequestHandler

TTL_DIR = '/var/www/html/ontology3d'

class H(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ('/file_list', '/file_list/', '/file_list.json'):
            ttl_files = []
            for f in os.listdir(TTL_DIR):
                if f.endswith(('.ttl','.rdf','.nt','.n3')):
                    fp = os.path.join(TTL_DIR, f)
                    if os.path.isfile(fp):
                        ttl_files.append({'name': f, 'size': os.path.getsize(fp), 'url': './' + f})
            ttl_files.sort(key=lambda x: x['size'], reverse=True)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'files': ttl_files, 'count': len(ttl_files)}).encode())
    def log_message(self, *a): pass

HTTPServer(('127.0.0.1', 8765), H).serve_forever()
