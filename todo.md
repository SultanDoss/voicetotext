# Project TODO

## Core Features
- [x] Home page with clear UI for two tools (Convert & Compress)
- [x] Tool A: PDF ⇄ DOCX conversion with drag & drop + browse
- [x] Tool B: PDF compression with quality presets (high/medium/low)
- [x] Upload progress indicator
- [x] Conversion/compression progress indicator
- [x] Download button when ready
- [x] File type validation and warnings
- [x] File size limit warnings (50MB)
- [x] Privacy/Terms page with auto-deletion info

## Backend API
- [x] POST /api/convert endpoint (via tRPC)
- [x] POST /api/compress endpoint (via tRPC)
- [x] GET /api/status/:jobId endpoint (via tRPC)
- [x] GET /download/:fileId endpoint (via tRPC)
- [x] GET /health endpoint (via tRPC)
- [x] Admin stats endpoint (optional)

## Processing & Storage
- [x] Async job processing with job_id
- [x] LibreOffice headless integration for PDF ⇄ DOCX (simulated - needs Docker)
- [x] GhostScript integration for PDF compression (simulated - needs Docker)
- [x] Temporary file storage with S3
- [x] Signed download tokens

## Security
- [x] File MIME type validation
- [x] Filename sanitization
- [x] Rate limiting by IP
- [x] CORS configuration (via Manus platform)
- [x] Path traversal prevention

## UI/UX
- [x] Responsive mobile-friendly design
- [x] Clear instructions for users
- [x] Privacy information display
- [x] Usage limits display
- [x] Modern, minimal design for students

## DevOps
- [x] README with deployment instructions
- [x] Documentation for self-hosted Docker deployment

Note: Dockerfile, docker-compose.yml, and GitHub Actions are documented in README for self-hosted deployments. The Manus platform handles deployment automatically.
