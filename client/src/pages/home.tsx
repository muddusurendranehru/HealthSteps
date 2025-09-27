import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white border-b border-border shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <i className="fas fa-walking text-xl"></i>
              </div>
              <span className="text-xl font-semibold text-foreground">HealthStep</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors">
                Home
              </Link>
              <Link href="/auth" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors">
                Sign In
              </Link>
              <Link href="/dashboard" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Hero Section */}
        <section className="gradient-bg text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Track Your Health,<br/>
                <span className="text-secondary">Step by Step</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
                Monitor your daily activity, set goals, and build healthier habits with our simple yet powerful step tracking platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth" className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg" data-testid="button-get-started">
                  Get Started Free
                </Link>
                <Link href="/dashboard" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary transition-colors" data-testid="button-view-demo">
                  View Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything You Need to Stay Active
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Simple tools to help you monitor, understand, and improve your daily activity levels.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-card p-8 rounded-lg card-shadow transition-all duration-300">
                <div className="bg-primary/10 text-primary p-3 rounded-lg w-fit mb-6">
                  <i className="fas fa-chart-line text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Daily Tracking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Log your steps easily and watch your progress unfold with intuitive daily tracking tools.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-card p-8 rounded-lg card-shadow transition-all duration-300">
                <div className="bg-secondary/10 text-secondary p-3 rounded-lg w-fit mb-6">
                  <i className="fas fa-target text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Goal Setting</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Set personalized step goals and track your achievements to stay motivated every day.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-card p-8 rounded-lg card-shadow transition-all duration-300">
                <div className="bg-accent/10 text-accent p-3 rounded-lg w-fit mb-6">
                  <i className="fas fa-mobile-alt text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Mobile Ready</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access your health data anywhere with our fully responsive, mobile-optimized design.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-muted-foreground">Daily Steps Tracked</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-secondary mb-2">500+</div>
                <div className="text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">98%</div>
                <div className="text-muted-foreground">Goal Achievement</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Health Monitoring</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
