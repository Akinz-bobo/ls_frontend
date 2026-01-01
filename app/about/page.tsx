import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Mic, Music, Globe } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Cinema Book - Professional Audiobook Production Studio",
  description: "Learn about Cinema Book's mission to create exceptional audiobooks with professional narrators, original soundtracks, and HD sound effects. Discover our team and story.",
  keywords: "about cinema book, audiobook production team, professional narrators, audio production studio, digital storytelling",
  openGraph: {
    title: "About Cinema Book - Professional Audiobook Production Studio",
    description: "Learn about Cinema Book's mission to create exceptional audiobooks with professional narrators, original soundtracks, and HD sound effects.",
    type: "website",
  },
};

const features = [
  {
    icon: BookOpen,
    title: "Professional Audiobooks",
    description: "High-quality audiobook production with experienced narrators and crystal-clear audio."
  },
  {
    icon: Mic,
    title: "Expert Narration",
    description: "Professional voice actors and narrators bring stories to life with engaging performances."
  },
  {
    icon: Music,
    title: "Original Soundtracks",
    description: "Custom music and sound effects enhance the listening experience for every story."
  },
  {
    icon: Globe,
    title: "Multilanguage Support",
    description: "Audiobooks available in multiple languages to reach a global audience."
  }
];

const stats = [
  { value: "500+", label: "Audiobooks Produced" },
  { value: "50+", label: "Professional Narrators" },
  { value: "15+", label: "Languages Supported" },
  { value: "2018", label: "Founded" }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
            Cinema Book
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Professional audiobook production that brings stories to life
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full"></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Mission</h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            We transform written stories into immersive audio experiences through professional narration, 
            original soundtracks, and HD sound effects. Every audiobook we produce is crafted with 
            cinematic attention to detail.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Story */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Story</h2>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p>
                  Founded in 2018, Cinema Book began with a vision to elevate audiobook production 
                  to cinematic standards. We believe every story deserves to be told with the highest 
                  quality audio production.
                </p>
                <p>
                  Today, we work with authors, publishers, and content creators worldwide to produce 
                  audiobooks that captivate listeners through professional narration, immersive 
                  soundscapes, and multilanguage accessibility.
                </p>
                <p>
                  Our commitment to excellence has made us a trusted partner in the audiobook industry, 
                  helping bring hundreds of stories to life for audiences around the globe.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}