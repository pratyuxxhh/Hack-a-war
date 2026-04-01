import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';

const ArchitectureDiagram = ({ diagram }) => {
  const containerRef = useRef(null);
  const renderRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [renderError, setRenderError] = useState('');

  const mermaidSource = useMemo(() => {
    if (typeof diagram === 'string') return diagram;
    if (diagram && typeof diagram.mermaid === 'string') return diagram.mermaid;
    return '';
  }, [diagram]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'dark',
      flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!renderRef.current) return;
      if (!mermaidSource.trim()) {
        renderRef.current.innerHTML = '';
        return;
      }

      try {
        setRenderError('');
        const id = `arch-diagram-${Date.now()}`;
        const { svg } = await mermaid.render(id, mermaidSource);
        renderRef.current.innerHTML = svg;
      } catch {
        setRenderError('Unable to render diagram from response.');
        renderRef.current.innerHTML = '';
      }
    };

    renderDiagram();
  }, [mermaidSource]);

  const handleZoomIn = () => setScale((z) => Math.min(z + 0.15, 3));
  const handleZoomOut = () => setScale((z) => Math.max(z - 0.15, 0.4));
  const handleReset = () => { setScale(1); setPan({ x: 0, y: 0 }); };
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
    setScale((z) => Math.max(0.4, Math.min(3, z + delta)));
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
          {Math.round(scale * 100)}%
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
        {!mermaidSource.trim() && (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
            Diagram is unavailable for this response.
          </div>
        )}
        {renderError && (
          <div className="h-full flex items-center justify-center text-amber-400 text-sm px-4 text-center">
            {renderError}
          </div>
        )}
        {mermaidSource.trim() && !renderError && (
          <div
            ref={renderRef}
            className="w-full h-full p-4 overflow-visible"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          />
        )}
      </div>

      {/* Zoom hint */}
      <p className="text-zinc-600 text-xs mt-2 text-center">
        Scroll to zoom • Drag to pan • Full Mermaid from API output
      </p>
    </div>
  );
};

export default ArchitectureDiagram;
