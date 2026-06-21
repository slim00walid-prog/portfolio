"use client";

import { useEffect, useRef, useState } from "react";
import { careerData } from "@/data/career";
import Link from "next/link";
import * as d3 from "d3";
import { BarChart3, ChevronLeft, Terminal } from "lucide-react";

interface Node {
  id: string;
  group: "project" | "skill" | "theme" | "evidence";
  label: string;
  val: number;
  color: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Edge {
  source: string;
  target: string;
}

const COLORS: Record<string, string> = {
  project: "#c8a96e",
  skill: "#00ffaa",
  theme: "#6b8cff",
  evidence: "#666",
};

export default function GraphPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 1000, h: 700 });
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string; sub: string } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        setDimensions({
          w: wrapperRef.current.clientWidth,
          h: Math.max(500, window.innerHeight - 200),
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.w < 100) return;

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeSet = new Set<string>();

    const addNode = (n: Node) => {
      if (!nodeSet.has(n.id)) {
        nodeSet.add(n.id);
        nodes.push(n);
      }
    };

    // Projects
    for (const p of careerData.projects) {
      addNode({ id: `proj-${p.id}`, group: "project", label: p.name, val: 20, color: COLORS.project });
      // Skill edges
      for (const [sname, skill] of Object.entries(careerData.skills)) {
        if (skill.projects.includes(p.id)) {
          addNode({ id: `skill-${sname}`, group: "skill", label: sname, val: 10, color: COLORS.skill });
          edges.push({ source: `proj-${p.id}`, target: `skill-${sname}` });
        }
      }
      // Evidence edges
      for (const ev of p.evidence.slice(0, 4)) {
        const theme = Object.entries(careerData.jiraThemes).find(([, t]) => t.keys.includes(ev));
        addNode({ id: `ev-${ev}`, group: "evidence", label: ev, val: 4, color: COLORS.evidence });
        edges.push({ source: `proj-${p.id}`, target: `ev-${ev}` });
        if (theme) {
          addNode({ id: `theme-${theme[0]}`, group: "theme", label: theme[0], val: 14, color: COLORS.theme });
          edges.push({ source: `ev-${ev}`, target: `theme-${theme[0]}` });
        }
      }
    }

    // Additional theme -> skill edges
    for (const [tname, theme] of Object.entries(careerData.jiraThemes)) {
      addNode({ id: `theme-${tname}`, group: "theme", label: tname, val: 14, color: COLORS.theme });
      for (const [sname, skill] of Object.entries(careerData.skills)) {
        if (tname.toLowerCase().includes(sname.split(" ")[0].toLowerCase()) || sname.toLowerCase().includes(tname.split("/")[0].toLowerCase())) {
          edges.push({ source: `theme-${tname}`, target: `skill-${sname}` });
        }
      }
    }

    // D3 force simulation
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.w;
    const height = dimensions.h;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Gradient defs
    const defs = svg.append("defs");
    const grad = defs.append("radialGradient").attr("id", "bg-grad");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "#1a1a1a");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#0a0a0a");
    svg.append("rect").attr("width", width).attr("height", height).attr("fill", "url(#bg-grad)");

    const simulation = d3
      .forceSimulation(nodes as unknown as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(edges)
          .id((d) => (d as unknown as Node).id)
          .distance(80)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    const link = svg
      .append("g")
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .attr("stroke-opacity", 0.6);

    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .call(d3.drag<any, Node>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    node
      .append("circle")
      .attr("r", (d) => d.val)
      .attr("fill", (d) => d.color)
      .attr("opacity", 0.8)
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-width", 1);

    node
      .append("text")
      .text((d) => d.label)
      .attr("x", 0)
      .attr("y", (d) => -d.val - 4)
      .attr("text-anchor", "middle")
      .attr("fill", "#999")
      .attr("font-size", (d) => (d.group === "evidence" ? "8" : "10"))
      .style("pointer-events", "none");

    node
      .on("mouseenter", (event, d) => {
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 40,
          text: d.label,
          sub: d.group.charAt(0).toUpperCase() + d.group.slice(1),
        });
        d3.select(event.currentTarget).select("circle").attr("opacity", 1).attr("stroke", "#fff").attr("stroke-width", 2);
      })
      .on("mouseleave", (event) => {
        setTooltip(null);
        d3.select(event.currentTarget).select("circle").attr("opacity", 0.8).attr("stroke", "rgba(255,255,255,0.1)").attr("stroke-width", 1);
      })
      .on("click", (_event, d) => {
        if (d.group === "project") {
          const el = document.querySelector(`[href="/#work"]`);
          if (el) (el as HTMLAnchorElement).click();
        }
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as unknown as Node).x!)
        .attr("y1", (d) => (d.source as unknown as Node).y!)
        .attr("x2", (d) => (d.target as unknown as Node).x!)
        .attr("y2", (d) => (d.target as unknown as Node).y!);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width - 160}, 20)`);
    const legendItems: { label: string; color: string }[] = [
      { label: "Projects", color: COLORS.project },
      { label: "Skills", color: COLORS.skill },
      { label: "Themes", color: COLORS.theme },
      { label: "Evidence", color: COLORS.evidence },
    ];
    legendItems.forEach((item, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 22})`);
      g.append("circle").attr("r", 5).attr("fill", item.color).attr("opacity", 0.8);
      g.append("text")
        .attr("x", 14)
        .attr("y", 4)
        .text(item.label)
        .attr("fill", "#999")
        .attr("font-size", "11");
    });

    return () => {
      simulation.stop();
    };
  }, [dimensions]);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Chrome bar */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-surface/50">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-muted hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <BarChart3 className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">Evidence Graph</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <Link href="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link>
          <Link href="/terminal" className="hover:text-accent transition-colors flex items-center gap-1">
            <Terminal className="w-3 h-3" /> Terminal
          </Link>
        </div>
      </div>

      {/* Graph */}
      <div ref={wrapperRef} className="flex-1 relative">
        <svg ref={svgRef} className="w-full h-full" />

        {tooltip && (
          <div
            className="absolute pointer-events-none bg-[#1a1a1a] border border-border rounded-lg px-3 py-2 text-xs shadow-xl z-10"
            style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
          >
            <div className="text-foreground font-medium">{tooltip.text}</div>
            <div className="text-text-muted mt-0.5">{tooltip.sub}</div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-text-muted py-3 border-t border-border">
        Drag nodes · Hover for details · Projects · Skills · Jira Themes · Evidence
      </div>
    </main>
  );
}
