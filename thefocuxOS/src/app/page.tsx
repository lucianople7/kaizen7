"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Terminal, GitBranch, Box, Search, BrainCircuit } from "lucide-react";

export default function FocuxOSPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [packet, setPacket] = useState<any>(null);
  const [error, setError] = useState("");

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setPacket(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPacket(data.packet);
      }
    } catch (err: any) {
      setError(err.message || "Failed to extract intelligence.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.5)]">
            <BrainCircuit className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter">thefocux<span className="font-light">OS</span></h1>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Dossiers</a>
          <a href="#" className="hover:text-foreground transition-colors text-foreground">Intelligence</a>
          <a href="#" className="hover:text-foreground transition-colors">Nodes</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full flex flex-col gap-12 mt-10">
        
        {/* Extraction Header */}
        <section className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Terminal className="mr-2 h-4 w-4" /> Kaizen Local Kernel Active
          </div>
          <h2 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">
            Intelligence Extraction
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            Input a GitHub repository or Hugging Face space URL to generate a local signal packet and evaluate adoption readiness.
          </p>

          <form onSubmit={handleExtract} className="flex w-full max-w-lg items-center space-x-2 mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="url" 
              placeholder="https://github.com/owner/repo" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10 h-12 bg-black/40 border-border/50 backdrop-blur-md focus-visible:ring-primary/50 text-base"
              disabled={loading}
            />
            <Button type="submit" disabled={loading} className="h-12 px-6 shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] transition-all">
              {loading ? "Extracting..." : "Scan"}
            </Button>
          </form>
          {error && <p className="text-destructive text-sm font-medium mt-2">{error}</p>}
        </section>

        {/* Results Area */}
        {packet && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out mt-8">
            <Card className="bg-card/30 backdrop-blur-xl border-border/50 overflow-hidden shadow-2xl">
              <CardHeader className="border-b border-border/20 bg-black/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {packet.source?.type === "github" ? <GitBranch className="h-6 w-6 text-primary" /> : <Box className="h-6 w-6 text-primary" />}
                    <CardTitle className="text-xl">
                      {packet.github?.fullName || "Intelligence Packet"}
                    </CardTitle>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${packet.github?.verdict === 'adopt_now' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                      packet.github?.verdict === 'adapt_pattern' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                      packet.github?.blocked ? 'bg-destructive/20 text-destructive border border-destructive/30' :
                      'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30'}`}>
                    {packet.github?.verdict || "Evaluated"}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Signal Summary</h3>
                  <div className="bg-black/40 rounded-lg p-4 font-mono text-sm text-neutral-300 leading-relaxed border border-border/30 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                    {packet.text.split("## README excerpt")[0]}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 rounded-md p-3 border border-border/20">
                        <div className="text-2xl font-bold text-foreground">{packet.github?.score ?? 0}</div>
                        <div className="text-xs text-muted-foreground">K7 Score</div>
                      </div>
                      <div className="bg-black/20 rounded-md p-3 border border-border/20">
                        <div className="text-2xl font-bold text-foreground">{packet.github?.stars ?? 0}</div>
                        <div className="text-xs text-muted-foreground">Stars</div>
                      </div>
                      <div className="bg-black/20 rounded-md p-3 border border-border/20 col-span-2">
                        <div className="text-sm font-medium text-foreground truncate">{packet.github?.license ?? "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">License</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">Reasons</h3>
                    <ul className="space-y-2">
                      {packet.github?.reasons?.map((r: string, i: number) => (
                        <li key={i} className="text-sm text-neutral-300 flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                          {r.replace(/_/g, " ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-black/30 border-t border-border/20 py-4 px-6 flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-mono">Next Action:</span>
                <span className="text-sm font-medium text-foreground">{packet.nextAction || "N/A"}</span>
              </CardFooter>
            </Card>
          </section>
        )}

      </main>
    </div>
  );
}
