import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, 
  Layers, 
  TrendingUp, 
  CreditCard, 
  HelpCircle,
  Search,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { soundFx, triggerHaptic } from '../utils/notificationHelpers';
import { MaintenanceAlert, NavTab } from '../types';

interface BottomNavBarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  alerts?: MaintenanceAlert[];
  onOpenAlerts?: () => void;
  onOpenSearch?: () => void;
}

interface NavItemDef {
  id: NavTab;
  shortLabel: string;
  fullLabel: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  shortcut: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
}) => {
  const { themeConfig } = useTheme();
  const dockRef = useRef<HTMLDivElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);

  const navItems: NavItemDef[] = useMemo(() => [
    {
      id: 'telemetry',
      shortLabel: 'Health',
      fullLabel: 'Live Health',
      subtitle: 'Real-time 10Hz Vibration & Heat',
      icon: Activity,
      badge: 'Live',
      shortcut: '1',
    },
    {
      id: 'fleet',
      shortLabel: 'Machines',
      fullLabel: 'All Machines',
      subtitle: 'Factory Machinery Inventory',
      icon: Layers,
      shortcut: '2',
    },
    {
      id: 'roi',
      shortLabel: 'Savings',
      fullLabel: 'Money Saved',
      subtitle: 'Plant Downtime & ₹ Calculations',
      icon: TrendingUp,
      shortcut: '3',
    },
    {
      id: 'subscription',
      shortLabel: 'Pricing',
      fullLabel: 'Pricing (₹)',
      subtitle: 'Tier Features & Sensor Hardware',
      icon: CreditCard,
      shortcut: '4',
    },
    {
      id: 'help',
      shortLabel: 'Warranty',
      fullLabel: 'Warranty & Help',
      subtitle: 'Free Replacement & AI Engineer',
      icon: HelpCircle,
      shortcut: '5',
    },
  ], []);

  // UI state for hover index & tooltips
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipItem, setTooltipItem] = useState<{ label: string; shortcut?: string; x: number } | null>(null);
  
  // Spring Physics Simulation Refs (Zero-Re-Render 120 FPS Performance)
  const targetTiltRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentTiltRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  
  const targetGlareRef = useRef<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const currentGlareRef = useRef<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Position of sliding active capsule
  const [activeCapsuleStyle, setActiveCapsuleStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // Calculate sliding active indicator bounds
  const updateCapsulePosition = useCallback(() => {
    if (!itemsContainerRef.current) return;
    const activeBtn = itemsContainerRef.current.querySelector<HTMLElement>(`[data-nav-id="${activeTab}"]`);
    if (activeBtn) {
      const containerRect = itemsContainerRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setActiveCapsuleStyle({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
        opacity: 1,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    updateCapsulePosition();
    const handleResize = () => requestAnimationFrame(updateCapsulePosition);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCapsulePosition]);

  // High-performance 2nd-order Damped Harmonic Oscillator (Apple Spring Physics)
  const startSpringLoop = useCallback(() => {
    if (animFrameRef.current !== null) return;
    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05); // clamp delta time for stability
      lastTimeRef.current = now;

      const target = targetTiltRef.current;
      const current = currentTiltRef.current;
      const vel = velocityRef.current;

      // Spring constants: stiffness = 160, damping = 16 (Apple fluid glass feel)
      const k = 160;
      const d = 16;

      const ax = (target.x - current.x) * k - vel.vx * d;
      const ay = (target.y - current.y) * k - vel.vy * d;

      vel.vx += ax * dt;
      vel.vy += ay * dt;

      current.x += vel.vx * dt;
      current.y += vel.vy * dt;

      // Smooth Glare Interpolation
      const gTarget = targetGlareRef.current;
      const gCurrent = currentGlareRef.current;
      gCurrent.x += (gTarget.x - gCurrent.x) * 0.22;
      gCurrent.y += (gTarget.y - gCurrent.y) * 0.22;
      gCurrent.opacity += (gTarget.opacity - gCurrent.opacity) * 0.2;

      // Direct GPU Property Injection (Bypasses React Re-renders!)
      if (dockRef.current) {
        const style = dockRef.current.style;
        style.setProperty('--tilt-x', `${current.x.toFixed(2)}deg`);
        style.setProperty('--tilt-y', `${current.y.toFixed(2)}deg`);
        style.setProperty('--glare-x', `${gCurrent.x.toFixed(1)}%`);
        style.setProperty('--glare-y', `${gCurrent.y.toFixed(1)}%`);
        style.setProperty('--glare-opacity', `${gCurrent.opacity.toFixed(2)}`);
        style.setProperty('--edge-glint-x', `${(current.y * 2.8).toFixed(1)}px`);
        style.setProperty('--glow-x', `${(current.y * 1.4).toFixed(1)}px`);
        style.setProperty('--glow-y', `${(-current.x * 1.4).toFixed(1)}px`);
      }

      // Settle and stop loop when motionless & target is 0
      const isResting = 
        Math.abs(current.x - target.x) < 0.02 &&
        Math.abs(current.y - target.y) < 0.02 &&
        Math.abs(vel.vx) < 0.05 &&
        Math.abs(vel.vy) < 0.05 &&
        Math.abs(gCurrent.opacity - gTarget.opacity) < 0.01;

      if (isResting && target.x === 0 && target.y === 0 && gTarget.opacity === 0) {
        current.x = 0;
        current.y = 0;
        vel.vx = 0;
        vel.vy = 0;
        gCurrent.opacity = 0;
        if (dockRef.current) {
          const style = dockRef.current.style;
          style.setProperty('--tilt-x', '0deg');
          style.setProperty('--tilt-y', '0deg');
          style.setProperty('--glare-opacity', '0');
        }
        animFrameRef.current = null;
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  // Handle Desktop Mouse Parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1; // -1 to 1
    const normY = (y / rect.height) * 2 - 1; // -1 to 1

    targetTiltRef.current = {
      x: -normY * 6.5,
      y: normX * 8.5,
    };

    targetGlareRef.current = {
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.85,
    };

    startSpringLoop();
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    startSpringLoop();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHoveredIdx(null);
    setTooltipItem(null);
    targetTiltRef.current = { x: 0, y: 0 };
    targetGlareRef.current = { x: 50, y: 50, opacity: 0 };
    startSpringLoop();
  };

  // Handle Mobile Touch Parallax & Scrubbing
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dockRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = dockRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const normX = Math.max(-1, Math.min(1, (x / rect.width) * 2 - 1));
    const normY = Math.max(-1, Math.min(1, (y / rect.height) * 2 - 1));

    targetTiltRef.current = {
      x: -normY * 5.2,
      y: normX * 7.2,
    };

    targetGlareRef.current = {
      x: Math.max(0, Math.min(100, (x / rect.width) * 100)),
      y: Math.max(0, Math.min(100, (y / rect.height) * 100)),
      opacity: 0.85,
    };

    if (itemsContainerRef.current) {
      const containerRect = itemsContainerRef.current.getBoundingClientRect();
      const relX = touch.clientX - containerRect.left;
      const tabWidth = containerRect.width / navItems.length;
      const currentIdx = Math.max(0, Math.min(navItems.length - 1, Math.floor(relX / tabWidth)));
      if (currentIdx !== hoveredIdx) {
        setHoveredIdx(currentIdx);
        triggerHaptic(10);
      }
    }

    startSpringLoop();
  };

  const handleTouchEnd = () => {
    if (hoveredIdx !== null && navItems[hoveredIdx]) {
      handleTabClick(navItems[hoveredIdx].id);
    }
    setIsHovered(false);
    setHoveredIdx(null);
    targetTiltRef.current = { x: 0, y: 0 };
    targetGlareRef.current = { x: 50, y: 50, opacity: 0 };
    startSpringLoop();
  };

  // Scroll-driven Parallax: Buoyant floating tilt as user scrolls the page
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollTimeout: number | null = null;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Dynamic tilt based on scroll velocity (±3°)
      const scrollTilt = Math.max(-3.2, Math.min(3.2, deltaY * 0.12));
      
      if (!isHovered) {
        targetTiltRef.current.x = scrollTilt;
        startSpringLoop();

        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = window.setTimeout(() => {
          targetTiltRef.current.x = 0;
          startSpringLoop();
        }, 120);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [isHovered, startSpringLoop]);

  // Gyroscope / Device Orientation Parallax on Mobile devices
  useEffect(() => {
    let hasGyro = false;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      hasGyro = true;
      const clampedGamma = Math.max(-25, Math.min(25, e.gamma));
      const clampedBeta = Math.max(15, Math.min(65, e.beta)) - 40;

      targetTiltRef.current = {
        x: -(clampedBeta / 25) * 4,
        y: (clampedGamma / 25) * 6,
      };

      targetGlareRef.current = {
        x: 50 + (clampedGamma / 25) * 35,
        y: 50 + (clampedBeta / 25) * 35,
        opacity: 0.45,
      };

      startSpringLoop();
    };

    if (window.DeviceOrientationEvent && typeof window.addEventListener === 'function') {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }

    return () => {
      if (hasGyro) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [startSpringLoop]);

  const handleTabClick = (tabId: NavTab) => {
    soundFx.playTabClick();
    triggerHaptic(12);
    setActiveTab(tabId);
  };

  // Magnification proximity calculation
  const getItemTransform = (idx: number) => {
    if (hoveredIdx === null) {
      return {
        scale: 1,
        translateY: 0,
      };
    }

    const distance = Math.abs(idx - hoveredIdx);
    let scale = 1;
    let translateY = 0;

    if (distance === 0) {
      scale = 1.12;
      translateY = -5;
    } else if (distance === 1) {
      scale = 1.05;
      translateY = -2;
    } else if (distance === 2) {
      scale = 1.01;
      translateY = -0.5;
    }

    return {
      scale,
      translateY,
    };
  };

  return (
    <div 
      className="fixed bottom-0 inset-x-0 z-40 pointer-events-none pb-safe transition-all select-none"
      aria-label="Apple Parallax Navigation Dock"
    >
      <div 
        className="max-w-4xl mx-auto px-1.5 sm:px-4 sm:pb-3 pointer-events-auto"
        style={{ perspective: 900 }}
      >
        {/* Apple Style Parallax Tooltip Floating Above Hovered Item (Desktop) */}
        {tooltipItem && isHovered && (
          <div 
            className="hidden lg:flex absolute -top-11 z-50 pointer-events-none transition-all duration-150 ease-out"
            style={{ 
              left: tooltipItem.x, 
              transform: 'translateX(-50%) translateZ(40px) translateY(calc(var(--tilt-x, 0deg) * 0.5))',
            }}
          >
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-1.5 ring-1 ring-black/10">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>{tooltipItem.label}</span>
              {tooltipItem.shortcut && (
                <kbd className="ml-1 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white/20 rounded-md text-slate-200">
                  {tooltipItem.shortcut}
                </kbd>
              )}
            </div>
          </div>
        )}

        {/* 3D Tilting Apple Glass Dock Chassis (GPU Hardware Composited) */}
        <div
          ref={dockRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={(e) => {
            setIsHovered(true);
            handleTouchMove(e);
          }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: 'rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateZ(0)',
            transformStyle: 'preserve-3d',
            transition: isHovered ? 'box-shadow 0.2s ease' : 'box-shadow 0.35s ease',
            touchAction: 'none',
            willChange: 'transform',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
          className="relative group rounded-3xl sm:rounded-[32px] p-1.5 sm:p-2.5 transition-all"
        >
          {/* Layer 0: Ambient Theme Reflection Glow under the Dock */}
          <div 
            className="absolute inset-0 rounded-3xl sm:rounded-[32px] opacity-40 blur-xl pointer-events-none transition-opacity duration-300"
            style={{
              background: 'radial-gradient(ellipse at var(--glare-x, 50%) 100%, var(--theme-accent, #0284c7) 0%, transparent 70%)',
              transform: 'translate3d(var(--glow-x, 0px), var(--glow-y, 0px), -15px)',
            }}
          />

          {/* Layer 1: Frosted Apple Glass Base Chassis with Specular Bevels */}
          <nav 
            className="relative bg-white/90 sm:bg-white/80 backdrop-blur-3xl border border-white/90 rounded-[24px] sm:rounded-[28px] p-1 sm:p-1.5 flex items-center justify-between gap-1 overflow-hidden ring-1 ring-slate-900/5"
            style={{
              boxShadow: `
                0 20px 45px -12px rgba(15, 23, 42, 0.22),
                0 2px 8px 0 rgba(0, 0, 0, 0.04),
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.95),
                inset 0 -1px 2px 0 rgba(0, 0, 0, 0.05)
              `,
            }}
          >
            {/* Dynamic Apple Specular Glare Hotspot */}
            <div 
              className="absolute inset-0 pointer-events-none transition-opacity duration-200 rounded-[24px] sm:rounded-[28px]"
              style={{
                opacity: 'var(--glare-opacity, 0)',
                background: 'radial-gradient(circle 130px at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.2) 40%, transparent 80%)',
                mixBlendMode: 'overlay',
              }}
            />

            {/* Subtle Metallic Prismatic Rainbow Edge Glint */}
            <div 
              className="absolute inset-x-0 top-0 h-[1.5px] pointer-events-none opacity-80"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 15%, rgba(56,189,248,0.5) 45%, rgba(244,114,182,0.4) 55%, rgba(255,255,255,0.8) 75%, transparent 100%)',
                transform: 'translateX(var(--edge-glint-x, 0px))',
              }}
            />

            {/* Navigation Tabs Container with Sliding Active Segmented Pill */}
            <div 
              ref={itemsContainerRef}
              className="relative flex-1 grid grid-cols-5 sm:flex sm:items-center sm:justify-around gap-0.5 sm:gap-1.5"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Layer 2: Apple Fluid Sliding Active Pill Capsule */}
              {activeCapsuleStyle.opacity > 0 && (
                <div 
                  className="absolute top-1 bottom-1 rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none block"
                  style={{
                    left: `${activeCapsuleStyle.left}px`,
                    width: `${activeCapsuleStyle.width}px`,
                    transform: 'translateZ(10px)',
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.85) 100%)',
                    boxShadow: `
                      0 4px 16px -2px rgba(2, 132, 199, 0.25),
                      0 1px 3px 0 rgba(0, 0, 0, 0.08),
                      inset 0 1px 1px 0 rgba(255, 255, 255, 1),
                      inset 0 -1px 1px 0 rgba(2, 132, 199, 0.15)
                    `,
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                  }}
                />
              )}

              {/* Layer 3: Elevating Parallax Navigation Tab Buttons */}
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const transform = getItemTransform(idx);

                return (
                  <button
                    key={item.id}
                    data-nav-id={item.id}
                    onClick={() => handleTabClick(item.id)}
                    onMouseEnter={(e) => {
                      setHoveredIdx(idx);
                      const rect = e.currentTarget.getBoundingClientRect();
                      const dockRect = dockRef.current?.getBoundingClientRect();
                      if (dockRect) {
                        setTooltipItem({
                          label: item.fullLabel,
                          shortcut: item.shortcut,
                          x: rect.left - dockRect.left + rect.width / 2,
                        });
                      }
                    }}
                    className={`relative flex flex-col sm:flex-row items-center justify-center min-h-[50px] sm:min-h-[46px] py-1 px-0.5 sm:px-4 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 touch-manipulation group z-10 ${
                      isActive
                        ? `${themeConfig.textClass} font-bold`
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    style={{
                      transform: `translateZ(${isActive ? 24 : 16}px) translate3d(calc(var(--tilt-y, 0deg) * -0.4), calc(var(--tilt-x, 0deg) * 0.4 + ${transform.translateY}px), 0) scale(${transform.scale})`,
                      transformStyle: 'preserve-3d',
                      transition: isHovered 
                        ? 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.15s ease' 
                        : 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.2s ease',
                    }}
                    title={`${item.fullLabel} (${item.subtitle})`}
                  >
                    {/* Parallax Elevated Icon & Badge */}
                    <div 
                      className="relative flex items-center justify-center"
                      style={{ 
                        transform: `translateZ(${isActive ? 30 : 20}px) translate3d(calc(var(--tilt-y, 0deg) * -0.2), calc(var(--tilt-x, 0deg) * 0.2), 0)`,
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <Icon 
                        className={`w-4.5 h-4.5 sm:w-4 sm:h-4 transition-all duration-200 ${
                          isActive 
                            ? `${themeConfig.textClass} drop-shadow-[0_2px_8px_rgba(2,132,199,0.35)] scale-110 sm:scale-105` 
                            : 'text-slate-500 group-hover:text-slate-800 group-hover:scale-110'
                        }`} 
                      />

                      {/* Parallax Floating "Live" Badge */}
                      {item.badge && (
                        <span 
                          className="absolute -top-1 -right-1 sm:hidden w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-white shadow-xs"
                          style={{ transform: 'translateZ(35px)' }}
                        />
                      )}
                    </div>
                    
                    {/* Responsive Label with Depth */}
                    <span 
                      className="text-[10px] sm:text-xs mt-0.5 sm:mt-0 sm:ml-2 tracking-tight font-semibold truncate text-center leading-none"
                      style={{ transform: `translateZ(${isActive ? 26 : 18}px)` }}
                    >
                      <span className="sm:hidden">{item.shortLabel}</span>
                      <span className="hidden sm:inline">{item.fullLabel}</span>
                    </span>

                    {/* Desktop Pill Badge */}
                    {item.badge && (
                      <span 
                        className="hidden sm:inline-flex ml-1.5 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase tracking-wider shadow-2xs border border-emerald-200/80"
                        style={{ transform: 'translateZ(28px)' }}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Desktop Keyboard Shortcut Cue */}
                    <span 
                      className="hidden lg:inline-flex ml-1 text-[9px] font-mono font-bold text-slate-400 group-hover:text-slate-600 opacity-60"
                      style={{ transform: 'translateZ(20px)' }}
                    >
                      {item.shortcut}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Desktop Utilities: Search with Apple Parallax Depth */}
            {onOpenSearch && (
              <div 
                className="hidden md:flex items-center pl-2 ml-1 border-l border-slate-200/80"
                style={{ 
                  transform: 'translateZ(18px) translate3d(calc(var(--tilt-y, 0deg) * -0.3), calc(var(--tilt-x, 0deg) * 0.3), 0)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <button
                  onClick={() => {
                    soundFx.playTabClick();
                    onOpenSearch();
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const dockRect = dockRef.current?.getBoundingClientRect();
                    if (dockRect) {
                      setTooltipItem({
                        label: 'Search Machines & Telemetry',
                        shortcut: '⌘K',
                        x: rect.left - dockRect.left + rect.width / 2,
                      });
                    }
                  }}
                  className="p-2 sm:px-3 sm:py-2 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 group"
                  title="Quick Search Machines (Cmd+K)"
                  style={{ transform: 'translateZ(22px)' }}
                >
                  <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  <span className="hidden lg:inline text-xs">Search</span>
                  <kbd className="hidden lg:inline px-1 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">⌘K</kbd>
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};
