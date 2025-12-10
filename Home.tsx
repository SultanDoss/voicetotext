import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  FileType2,
  FileArchive,
  ArrowRight,
  Shield,
  Clock,
  Zap,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <FileType2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">FileConverter</span>
            </div>
            <Link href="/privacy">
              <Button variant="ghost" size="sm">
                Privacy
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

        <div className="container relative z-10 pt-20 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Free File Conversion
              <span className="block text-primary">Made Simple</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
              Convert PDFs to Word documents and compress PDFs instantly. No
              registration required. Your files are automatically deleted after
              60 minutes.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-600" />
                <span>No signup needed</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Auto-delete in 60 min</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Secure & private</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Choose Your Tool
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select the conversion or compression tool you need. Fast,
              reliable, and completely free.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Convert Tool Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link href="/convert">
                <div className="group bg-card rounded-2xl p-8 border shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer h-full">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <FileType2 className="w-7 h-7 text-primary" />
                  </div>

                  <h3 className="text-xl font-semibold mb-3">Convert File</h3>
                  <p className="text-muted-foreground mb-6">
                    Convert between PDF and Word documents. Upload your file and
                    get the converted version in seconds.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">
                      PDF → DOCX
                    </span>
                    <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">
                      DOCX → PDF
                    </span>
                  </div>

                  <div className="flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                    Start Converting
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Compress Tool Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/compress">
                <div className="group bg-card rounded-2xl p-8 border shadow-sm hover:shadow-lg transition-all duration-300 hover:border-orange-500/50 cursor-pointer h-full">
                  <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors">
                    <FileArchive className="w-7 h-7 text-orange-600" />
                  </div>

                  <h3 className="text-xl font-semibold mb-3">Compress PDF</h3>
                  <p className="text-muted-foreground mb-6">
                    Reduce PDF file size without losing quality. Choose from
                    multiple compression levels.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                      High Quality
                    </span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                      Balanced
                    </span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                      Maximum
                    </span>
                  </div>

                  <div className="flex items-center text-orange-600 font-medium group-hover:gap-3 gap-2 transition-all">
                    Start Compressing
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Why Choose Us?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built for students and professionals who need quick, reliable file
              conversions.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Convert files in seconds with our optimized processing",
                color: "text-yellow-600",
                bg: "bg-yellow-100",
              },
              {
                icon: Lock,
                title: "No Registration",
                description: "Use immediately without creating an account",
                color: "text-green-600",
                bg: "bg-green-100",
              },
              {
                icon: Clock,
                title: "Auto Cleanup",
                description: "Files deleted automatically after 60 minutes",
                color: "text-blue-600",
                bg: "bg-blue-100",
              },
              {
                icon: Shield,
                title: "100% Free",
                description: "No hidden fees, no premium tiers, just free",
                color: "text-purple-600",
                bg: "bg-purple-100",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mx-auto mb-4`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Usage Limits Section */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-semibold mb-4">Usage Information</h3>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Max file size: 50 MB
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Files auto-delete: 60 minutes
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Supported: PDF, DOCX
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <FileType2 className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">
                Free File Converter
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy & Terms
              </Link>
              <span>Made for students & professionals</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
