import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, lstatSync } from 'fs';

/**
 * Dev-Scripts Static File Server
 * 
 * Serves static files from dev-scripts directory ONLY in development mode.
 * In production, this API route returns 404 for security.
 * 
 * @route GET /api/dev-scripts/[...path]
 */
export async function GET(request, { params }) {
  // SECURITY: Block access in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { 
        error: 'Dev-scripts are not available in production',
        message: 'This development tool is disabled in production environments for security reasons.'
      }, 
      { status: 404 }
    );
  }

  try {
    const { path } = await params;
    let filePath;

    // Handle root access (no path or empty path)
    if (!path || path.length === 0 || (path.length === 1 && path[0] === '')) {
      filePath = join(process.cwd(), 'dev-scripts', 'index.html');
    } else {
      // Join path segments safely
      filePath = join(process.cwd(), 'dev-scripts', ...path);
      
      // Handle directory requests - look for index.html
      if (existsSync(filePath) && lstatSync(filePath).isDirectory()) {
        filePath = join(filePath, 'index.html');
      }
    }

    // Security check: Ensure we're still within dev-scripts directory
    const devScriptsDir = join(process.cwd(), 'dev-scripts');
    if (!filePath.startsWith(devScriptsDir)) {
      return NextResponse.json(
        { error: 'Access denied: Path traversal not allowed' }, 
        { status: 403 }
      );
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { 
          error: 'File not found',
          path: filePath.replace(process.cwd(), ''),
          available: 'Try /dev-scripts/ for the main dashboard'
        }, 
        { status: 404 }
      );
    }

    // Read file
    const fileContent = await readFile(filePath);
    
    // Determine content type
    const contentType = getContentType(filePath);
    
    // Log access in development
    console.log(`[DEV-SCRIPTS] Serving: ${filePath.replace(process.cwd(), '')}`);
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Dev-Scripts': 'development-only',
      },
    });

  } catch (error) {
    console.error('[DEV-SCRIPTS] Error serving file:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to serve dev-scripts file'
      }, 
      { status: 500 }
    );
  }
}

/**
 * Determine content type based on file extension
 */
function getContentType(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase();
  
  const contentTypes = {
    'html': 'text/html; charset=utf-8',
    'css': 'text/css; charset=utf-8',
    'js': 'application/javascript; charset=utf-8',
    'json': 'application/json; charset=utf-8',
    'svg': 'image/svg+xml',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'ico': 'image/x-icon',
    'txt': 'text/plain; charset=utf-8',
    'md': 'text/markdown; charset=utf-8',
  };

  return contentTypes[ext] || 'application/octet-stream';
}

// Block all other HTTP methods
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}