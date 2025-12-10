import { ArrowLeft, Shield, Clock, Lock, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Privacy & Terms</h1>
                <p className="text-sm text-muted-foreground">
                  How we handle your files
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Your Privacy Matters</h1>
            <p className="text-lg text-muted-foreground">
              We take your privacy seriously. Here&apos;s how we handle your
              files and data.
            </p>
          </div>

          {/* Key Points */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card rounded-2xl p-6 border">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Account Required</h3>
              <p className="text-muted-foreground">
                Use our service completely anonymously. We don&apos;t require
                registration, email, or any personal information.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 border">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                60-Minute Auto-Delete
              </h3>
              <p className="text-muted-foreground">
                All uploaded and converted files are automatically deleted from
                our servers after 60 minutes. No exceptions.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 border">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Processing</h3>
              <p className="text-muted-foreground">
                Files are processed in isolated environments. We use secure
                connections (HTTPS) for all transfers.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 border">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Data Collection</h3>
              <p className="text-muted-foreground">
                We don&apos;t analyze, read, or store the content of your files.
                Your documents remain private.
              </p>
            </div>
          </div>

          {/* Detailed Terms */}
          <div className="bg-card rounded-2xl p-8 border mb-8">
            <h2 className="text-xl font-semibold mb-6">Terms of Service</h2>

            <div className="space-y-6 text-muted-foreground">
              <section>
                <h3 className="font-medium text-foreground mb-2">
                  1. Service Description
                </h3>
                <p>
                  Free File Converter provides free online file conversion and
                  compression services. We support PDF to DOCX conversion, DOCX
                  to PDF conversion, and PDF compression.
                </p>
              </section>

              <section>
                <h3 className="font-medium text-foreground mb-2">
                  2. File Handling
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Files are temporarily stored for processing purposes only
                  </li>
                  <li>
                    All files are automatically deleted after 60 minutes
                  </li>
                  <li>
                    We do not access, read, or analyze the content of your files
                  </li>
                  <li>
                    Download links expire after 60 minutes
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-medium text-foreground mb-2">
                  3. Usage Limits
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Maximum file size: 50 MB per file</li>
                  <li>Rate limiting applies to prevent abuse</li>
                  <li>
                    Service is provided &quot;as is&quot; without guarantees
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-medium text-foreground mb-2">
                  4. Acceptable Use
                </h3>
                <p>
                  You agree not to use this service for any illegal purposes or
                  to process files that violate copyright or other laws. We
                  reserve the right to block access for abuse.
                </p>
              </section>

              <section>
                <h3 className="font-medium text-foreground mb-2">
                  5. Privacy
                </h3>
                <p>
                  We collect minimal data necessary for service operation. This
                  includes temporary storage of files and basic usage metrics.
                  We do not sell or share any data with third parties.
                </p>
              </section>

              <section>
                <h3 className="font-medium text-foreground mb-2">
                  6. Disclaimer
                </h3>
                <p>
                  This service is provided free of charge. We make no warranties
                  about the accuracy of conversions or availability of the
                  service. Use at your own risk.
                </p>
              </section>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center text-muted-foreground">
            <p>
              Questions about our privacy practices? This is a free tool for
              students and professionals. We&apos;re committed to keeping it
              simple and private.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
