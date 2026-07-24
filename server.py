import http.server
import socketserver
import os

PORT = 8080

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    # Change directory to frontend to serve files from there
    os.chdir('frontend')
    with socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
        print("Serving at port", PORT)
        httpd.serve_forever()
