import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white font-bold text-sm">
                TF
              </div>
              <span className="font-heading font-semibold text-text-primary">
                TensorFlow Course
              </span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              A comprehensive, free course covering deep learning from
              fundamentals to production deployment. 10 modules, 80+ labs.
            </p>
          </div>

          {/* Course */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              Course
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/modules" className="text-sm text-text-muted hover:text-neon-cyan transition-colors">
                  All Modules
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-sm text-text-muted hover:text-neon-cyan transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/modules/01-intro-deep-learning" className="text-sm text-text-muted hover:text-neon-cyan transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="https://www.tensorflow.org/api_docs" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-neon-cyan transition-colors">
                  TensorFlow Docs
                </a>
              </li>
              <li>
                <a href="https://colab.research.google.com" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-neon-cyan transition-colors">
                  Google Colab
                </a>
              </li>
              <li>
                <a href="https://keras.io" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-neon-cyan transition-colors">
                  Keras Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              About
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="text-sm text-text-muted hover:text-neon-cyan transition-colors">
                  About the Course
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            Deep Learning with TensorFlow — 2025 Edition. Free and open educational resource.
          </p>
          <p className="text-xs text-text-muted">
            TensorFlow 2.x Compatible
          </p>
        </div>
      </div>
    </footer>
  );
}
