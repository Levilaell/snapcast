import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Radio, Zap, Sparkles, Share2, ArrowRight, Play, Check } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Radio className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">SnapCast</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
            <Link to="/dashboard">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Podcast Clipping
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Turn your podcast into viral social media content
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              SnapCast automatically finds the most engaging moments in your podcast and creates perfectly formatted clips for TikTok, Instagram, and YouTube Shorts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="glow-effect">
                  Start Creating <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                <Play className="mr-2 w-4 h-4" /> Watch Demo
              </Button>
            </div>
          </div>

          {/* Demo Visual */}
          <div className="mt-16 max-w-5xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-card to-muted/30">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Before</div>
                  <div className="bg-secondary rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded bg-primary/20" />
                      <div>
                        <div className="font-medium">Full Episode</div>
                        <div className="text-sm text-muted-foreground">45:23</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-8 bg-primary/10 rounded waveform-animation" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">After</div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((clip) => (
                      <Card key={clip} className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-primary flex items-center justify-center">
                            <Zap className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">Viral Clip {clip}</div>
                            <div className="text-xs text-muted-foreground">0:45 • Ready to share</div>
                          </div>
                          <Share2 className="w-4 h-4 text-primary" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to go viral</h2>
            <p className="text-xl text-muted-foreground">Powerful features that save hours of editing time</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Moment Detection</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your entire episode and identifies the most engaging, shareable moments automatically.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Radio className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto Captions</h3>
              <p className="text-muted-foreground">
                Beautiful, animated captions are added automatically with perfect timing and multiple style options.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Platform Export</h3>
              <p className="text-muted-foreground">
                Export in the perfect format for TikTok, Instagram Reels, YouTube Shorts, and more with one click.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground">Start free, upgrade as you grow</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="text-3xl font-bold mb-4">$0<span className="text-sm text-muted-foreground font-normal">/month</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">3 episodes per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">10 clips per episode</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">Basic caption styles</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">Get Started</Button>
            </Card>

            <Card className="p-6 border-primary shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-4">$29<span className="text-sm text-muted-foreground font-normal">/month</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">Unlimited episodes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">Unlimited clips</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">All caption styles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">Priority AI processing</span>
                </li>
              </ul>
              <Button className="w-full">Upgrade to Pro</Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">Team</h3>
              <div className="text-3xl font-bold mb-4">$79<span className="text-sm text-muted-foreground font-normal">/month</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">5 team members</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">Collaboration tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">Advanced analytics</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to create viral clips?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of podcasters who are growing their audience with SnapCast
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="glow-effect">
              Try SnapCast Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 SnapCast. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
