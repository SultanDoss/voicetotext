# Free File Converter

A free, anonymous web application for file conversion and PDF compression. Built for students and office workers who need quick, reliable document processing without registration.

## Features

### PDF ⇄ DOCX Conversion
- Convert PDF files to editable Word documents (DOCX)
- Convert Word documents to PDF format
- Drag & drop or browse to upload files
- Real-time progress tracking

### PDF Compression
- Reduce PDF file size with three quality presets:
  - **High Quality**: ~20% reduction, best for printing
  - **Balanced**: ~50% reduction, good for sharing
  - **Maximum Compression**: ~70% reduction, best for web

### Privacy & Security
- **No registration required** - completely anonymous
- **Auto-delete** - all files removed after 60 minutes
- **Secure processing** - HTTPS encryption
- **No data collection** - we don't read your files

## Tech Stack

### Frontend
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- Framer Motion for animations
- shadcn/ui component library
- Wouter for routing

### Backend
- Node.js with Express
- tRPC for type-safe API
- Drizzle ORM with MySQL/TiDB
- S3-compatible storage for files

### Processing (Docker Deployment)
- LibreOffice headless for PDF ⇄ DOCX conversion
- GhostScript for PDF compression

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd file-converter

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

See `.env.example` for all available configuration options:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL/TiDB connection string | Required |
| `MAX_FILE_SIZE` | Maximum upload size in bytes | 52428800 (50MB) |
| `FILE_TTL_MINUTES` | File retention time | 60 |
| `RATE_LIMIT_PER_MINUTE` | Max requests per IP per minute | 10 |
| `ADMIN_SECRET_TOKEN` | Token for admin stats endpoint | Optional |

## API Endpoints

All endpoints are available via tRPC at `/api/trpc`:

### File Operations
- `files.convert` - Convert PDF ⇄ DOCX
- `files.compress` - Compress PDF
- `files.status` - Get job status
- `files.download` - Get download URL
- `files.health` - Health check

### Authentication (Optional)
- `auth.me` - Get current user
- `auth.logout` - Logout

## Docker Deployment (Self-Hosted)

For self-hosted deployment with actual file conversion (LibreOffice/GhostScript), you'll need to create Docker configuration:

### Dockerfile Example

```dockerfile
FROM node:22-slim

# Install LibreOffice and GhostScript
RUN apt-get update && apt-get install -y \
    libreoffice \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### docker-compose.yml Example

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - MAX_FILE_SIZE=52428800
      - FILE_TTL_MINUTES=60
    restart: unless-stopped
```

## Usage Limits

- Maximum file size: 50 MB
- File retention: 60 minutes
- Rate limit: 10 requests per minute per IP
- Supported formats: PDF, DOCX

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please read CONTRIBUTING.md for guidelines.
