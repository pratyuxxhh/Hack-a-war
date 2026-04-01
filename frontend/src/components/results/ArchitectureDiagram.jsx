import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';

const nodeColors = {
  ingestion: { fill: '#3B82F6', glow: 'rgba(59, 130, 246, 0.3)' },
  streaming: { fill: '#F97316', glow: 'rgba(249, 115, 22, 0.3)' },
  compute: { fill: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.3)' },
  storage: { fill: '#10B981', glow: 'rgba(16, 185, 129, 0.3)' },
  analytics: { fill: '#F59E0B', glow: 'rgba(245, 158, 11, 0.3)' },
  visualization: { fill: '#EC4899', glow: 'rgba(236, 72, 153, 0.3)' },
  monitoring: { fill: '#06B6D4', glow: 'rgba(6, 182, 212, 0.3)' },
  events: { fill: '#EAB308', glow: 'rgba(234, 179, 8, 0.3)' },
  notifications: { fill: '#F43F5E', glow: 'rgba(244, 63, 94, 0.3)' },
  orchestration: { fill: '#A855F7', glow: 'rgba(168, 85, 247, 0.3)' },
  caching: { fill: '#0EA5E9', glow: 'rgba(14, 165, 233, 0.3)' },
  security: { fill: '#EF4444', glow: 'rgba(239, 68, 68, 0.3)' },
  networking: { fill: '#64748B', glow: 'rgba(100, 116, 139, 0.3)' },
};

const ArchitectureDiagram = ({ diagram }) => {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nodes = Array.isArray(diagram?.nodes) ? diagram.nodes : [];
  const edges = Array.isArray(diagram?.edges) ? diagram.edges : [];
  const hasNodes = nodes.length > 0;

  // Calculate SVG viewBox based on nodes
  const padding = 60;
  const minX = hasNodes ? Math.min(...nodes.map((n) => n.x)) - padding : 0;
  const minY = hasNodes ? Math.min(...nodes.map((n) => n.y)) - padding : 0;
  const maxX = hasNodes ? Math.max(...nodes.map((n) => n.x)) + padding + 100 : 800;
  const maxY = hasNodes ? Math.max(...nodes.map((n) => n.y)) + padding + 40 : 420;
  const svgWidth = maxX - minX;
  const svgHeight = maxY - minY;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container || !document?.fullscreenEnabled) return;
    if (!document.fullscreenElement) {
      await container.requestFullscreen();
      return;
    }
    await document.exitFullscreen();
  };

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.max(0.3, Math.min(3, z + delta)));
  }, []);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const getNodeById = (id) => nodes.find((n) => n.id === id);

  return (
    <div className="relative">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-zinc-900/90 backdrop-blur-sm rounded-lg border border-zinc-700/50 p-1">
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-xs text-zinc-500 font-mono px-1 min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-zinc-700" />
        <button
          onClick={handleReset}
          className="p-1.5 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-zinc-700" />
        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Diagram container */}
      <div
        ref={containerRef}
        className="w-full bg-zinc-950/50 rounded-xl border border-zinc-800/50 overflow-hidden"
        style={{ height: isFullscreen ? '100vh' : '360px', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {!hasNodes && (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
            Diagram is unavailable for this response.
          </div>
        )}
        {hasNodes && (
        <svg
          width="100%"
          height="100%"
          viewBox={`${minX} ${minY} ${svgWidth} ${svgHeight}`}
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {/* Defs for arrow markers and glows */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="rgba(139, 92, 246, 0.5)" />
            </marker>
            {Object.entries(nodeColors).map(([type, colors]) => (
              <filter key={type} id={`glow-${type}`}>
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
            {/* Grid pattern */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(139, 92, 246, 0.04)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Background grid */}
          <rect x={minX} y={minY} width={svgWidth} height={svgHeight} fill="url(#grid)" />

          {/* Edges (animated) */}
          {edges.map((edge, i) => {
            const from = getNodeById(edge.from);
            const to = getNodeById(edge.to);
            if (!from || !to) return null;

            const fromX = from.x + 50;
            const fromY = from.y + 16;
            const toX = to.x;
            const toY = to.y + 16;

            // Curved path
            const midX = (fromX + toX) / 2;
            const path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
            
            const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to;

            return (
              <g key={`${edge.from}-${edge.to}`}>
                <path
                  d={path}
                  fill="none"
                  stroke={isHighlighted ? 'rgba(139, 92, 246, 0.7)' : 'rgba(139, 92, 246, 0.2)'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  markerEnd="url(#arrowhead)"
                  style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
                />
                {/* Animated dot along path */}
                <circle r="2.5" fill="#8B5CF6" opacity="0.8">
                  <animateMotion
                    dur={`${2 + i * 0.3}s`}
                    repeatCount="indefinite"
                    path={path}
                  />
                </circle>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node, index) => {
            const colors = nodeColors[node.type] || nodeColors.compute;
            const isHovered = hoveredNode === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow background */}
                {isHovered && (
                  <rect
                    x="-6"
                    y="-6"
                    width="112"
                    height="44"
                    rx="14"
                    fill={colors.glow}
                    opacity="0.4"
                  />
                )}

                {/* Node background */}
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="32"
                  rx="8"
                  fill={isHovered ? 'rgba(39, 39, 42, 0.95)' : 'rgba(24, 24, 27, 0.9)'}
                  stroke={isHovered ? colors.fill : 'rgba(63, 63, 70, 0.5)'}
                  strokeWidth={isHovered ? 2 : 1}
                  style={{ transition: 'all 0.2s' }}
                />

                {/* Color accent bar */}
                <rect
                  x="0"
                  y="0"
                  width="4"
                  height="32"
                  rx="2"
                  fill={colors.fill}
                  opacity={isHovered ? 1 : 0.7}
                />

                {/* Label */}
                <text
                  x="50"
                  y="20"
                  textAnchor="middle"
                  fill={isHovered ? '#FAFAFA' : '#A1A1AA'}
                  fontSize="11"
                  fontFamily="Inter, sans-serif"
                  fontWeight="500"
                  style={{ transition: 'fill 0.2s' }}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
        )}
      </div>

      {/* Zoom hint */}
      <p className="text-zinc-600 text-xs mt-2 text-center">
        Scroll to zoom • Drag to pan • Hover nodes for details
      </p>
    </div>
  );
};

export default ArchitectureDiagram;
