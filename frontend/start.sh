#!/bin/bash
# FairLens AI — Start Frontend
echo "🎨 Starting FairLens AI Frontend (Static Fallback)..."
echo "==================================="

# Use python 3.14 to serve the static index.html
echo "Serving frontend on http://localhost:5173"
echo "Note: This is a standalone build using CDN assets."

python3.14 -m http.server 5173
