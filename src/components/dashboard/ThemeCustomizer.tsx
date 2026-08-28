import { useState } from "react";
import { Palette, ChevronDown, ChevronUp, Sparkles, Gauge, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";

interface ThemeCustomizerProps {
  themeName: string;
  themeGradient: string;
  customBgColor: string | null;
  customAccentColor: string | null;
  gradientDirection: string;
  animationType: string | null;
  animationSpeed?: number;
  animationIntensity?: number;
  onUpdate: (updates: {
    theme_name?: string;
    theme_gradient?: string;
    custom_bg_color?: string | null;
    custom_accent_color?: string | null;
    gradient_direction?: string;
    animation_type?: string | null;
    animation_speed?: number;
    animation_intensity?: number;
  }) => void;
}

const presetThemes = [
  { name: "Midnight", gradient: "from-indigo-900 via-purple-900 to-pink-900", colors: ["#312e81", "#581c87", "#831843"] },
  { name: "Sunset", gradient: "from-orange-500 via-pink-500 to-purple-600", colors: ["#f97316", "#ec4899", "#9333ea"] },
  { name: "Ocean", gradient: "from-cyan-500 via-blue-500 to-indigo-600", colors: ["#06b6d4", "#3b82f6", "#4f46e5"] },
  { name: "Forest", gradient: "from-green-600 via-emerald-500 to-teal-500", colors: ["#16a34a", "#10b981", "#14b8a6"] },
  { name: "Minimal", gradient: "from-gray-100 via-gray-200 to-gray-300", colors: ["#f3f4f6", "#e5e7eb", "#d1d5db"] },
  { name: "Rose Gold", gradient: "from-rose-400 via-pink-300 to-amber-200", colors: ["#fb7185", "#f9a8d4", "#fde68a"] },
  { name: "Northern Lights", gradient: "from-green-400 via-cyan-500 to-purple-600", colors: ["#4ade80", "#06b6d4", "#9333ea"] },
  { name: "Coral Reef", gradient: "from-red-400 via-orange-300 to-yellow-200", colors: ["#f87171", "#fdba74", "#fef08a"] },
  { name: "Lavender Dream", gradient: "from-purple-300 via-pink-200 to-indigo-300", colors: ["#c4b5fd", "#fbcfe8", "#a5b4fc"] },
  { name: "Deep Space", gradient: "from-slate-900 via-purple-900 to-slate-900", colors: ["#0f172a", "#581c87", "#0f172a"] },
  { name: "Autumn", gradient: "from-amber-600 via-orange-500 to-red-600", colors: ["#d97706", "#f97316", "#dc2626"] },
  { name: "Ice", gradient: "from-blue-100 via-cyan-100 to-teal-100", colors: ["#dbeafe", "#cffafe", "#ccfbf1"] },
];

const gradientDirections = [
  { value: "to-b", label: "↓ Top to Bottom" },
  { value: "to-t", label: "↑ Bottom to Top" },
  { value: "to-r", label: "→ Left to Right" },
  { value: "to-l", label: "← Right to Left" },
  { value: "to-br", label: "↘ Diagonal" },
  { value: "to-tl", label: "↖ Diagonal Up" },
];

const animationTypes = [
  { value: null, label: "None", icon: "✕", category: "basic" },
  { value: "pulse", label: "Pulse", icon: "✨", category: "basic" },
  { value: "particles", label: "Particles", icon: "⭐", category: "basic" },
  { value: "wave", label: "Wave", icon: "🌊", category: "basic" },
  { value: "gradient-shift", label: "Shift", icon: "🌈", category: "basic" },
  { value: "glow", label: "Glow", icon: "💫", category: "basic" },
  { value: "orbs", label: "Orbs", icon: "🔮", category: "basic" },
  { value: "shimmer", label: "Shimmer", icon: "✦", category: "basic" },
  { value: "neon", label: "Neon", icon: "💡", category: "basic" },
  { value: "rain", label: "Rain", icon: "🌧️", category: "weather" },
  { value: "snow", label: "Snow", icon: "❄️", category: "weather" },
  { value: "lightning", label: "Lightning", icon: "⚡", category: "weather" },
  { value: "aurora", label: "Aurora", icon: "🌌", category: "weather" },
  { value: "leaves", label: "Leaves", icon: "🍂", category: "seasonal" },
  { value: "confetti", label: "Confetti", icon: "🎉", category: "fun" },
  { value: "bokeh", label: "Bokeh", icon: "🔵", category: "blur" },
  { value: "fireflies", label: "Fireflies", icon: "🌟", category: "nature" },
  { value: "bubbles", label: "Bubbles", icon: "🫧", category: "fun" },
  { value: "sparkle", label: "Sparkle", icon: "💎", category: "fun" },
  { value: "matrix", label: "Matrix", icon: "💻", category: "tech" },
];

// Animation presets for quick selection
const animationPresets = [
  { name: "Subtle", speed: 0.5, intensity: 0.5, description: "Gentle, understated" },
  { name: "Moderate", speed: 1, intensity: 1, description: "Balanced default" },
  { name: "Dramatic", speed: 1.5, intensity: 1.8, description: "Bold, eye-catching" },
];

export function ThemeCustomizer({
  themeName,
  themeGradient,
  customBgColor,
  customAccentColor,
  gradientDirection,
  animationType,
  animationSpeed = 1,
  animationIntensity = 1,
  onUpdate,
}: ThemeCustomizerProps) {
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [isCustom, setIsCustom] = useState(themeName === "Custom");

  const handlePresetSelect = (theme: typeof presetThemes[0]) => {
    setIsCustom(false);
    onUpdate({
      theme_name: theme.name,
      theme_gradient: theme.gradient,
      custom_bg_color: null,
      custom_accent_color: null,
      animation_type: null,
    });
  };

  const handleAnimationChange = (type: string | null) => {
    onUpdate({ animation_type: type });
  };

  const handleSpeedChange = (value: number[]) => {
    onUpdate({ animation_speed: value[0] });
  };

  const handleIntensityChange = (value: number[]) => {
    onUpdate({ animation_intensity: value[0] });
  };

  const handleCustomColorChange = (type: "bg" | "accent", color: string) => {
    setIsCustom(true);
    if (type === "bg") {
      onUpdate({
        theme_name: "Custom",
        custom_bg_color: color,
      });
    } else {
      onUpdate({
        theme_name: "Custom",
        custom_accent_color: color,
      });
    }
  };

  const handleDirectionChange = (direction: string) => {
    // Update gradient direction
    const currentGradient = themeGradient;
    const gradientWithoutDirection = currentGradient.replace(/to-[a-z]+/, "");
    const newGradient = `${gradientWithoutDirection.replace("from-", `${direction} from-`)}`.replace(/\s+/g, " ").trim();
    
    onUpdate({
      gradient_direction: direction,
      theme_gradient: themeGradient.includes("to-") 
        ? themeGradient.replace(/to-[a-z]+/, direction)
        : `${direction} ${themeGradient}`,
    });
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">Theme</label>
      
      {/* Preset Themes Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {presetThemes.map(theme => (
          <button
            key={theme.name}
            onClick={() => handlePresetSelect(theme)}
            className={`aspect-square rounded-xl bg-gradient-to-b ${theme.gradient} transition-all relative group ${
              themeName === theme.name && !isCustom
                ? "ring-2 ring-primary ring-offset-2"
                : "hover:scale-105"
            }`}
            title={theme.name}
          >
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-xl transition-opacity text-white text-xs font-medium">
              {theme.name}
            </span>
          </button>
        ))}
      </div>

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Palette className="w-4 h-4" />
        <span>Custom Colors</span>
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showAdvanced && (
        <div className="space-y-4 p-4 bg-secondary/50 rounded-xl">
          {/* Custom Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-2">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customBgColor || "#1e1b4b"}
                  onChange={(e) => handleCustomColorChange("bg", e.target.value)}
                  className="w-10 h-10 rounded-lg border border-input cursor-pointer"
                />
                <input
                  type="text"
                  value={customBgColor || ""}
                  onChange={(e) => handleCustomColorChange("bg", e.target.value)}
                  placeholder="#1e1b4b"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-2">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customAccentColor || "#8b5cf6"}
                  onChange={(e) => handleCustomColorChange("accent", e.target.value)}
                  className="w-10 h-10 rounded-lg border border-input cursor-pointer"
                />
                <input
                  type="text"
                  value={customAccentColor || ""}
                  onChange={(e) => handleCustomColorChange("accent", e.target.value)}
                  placeholder="#8b5cf6"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background"
                />
              </div>
            </div>
          </div>

          {/* Gradient Direction */}
          <div>
            <label className="block text-xs text-muted-foreground mb-2">Gradient Direction</label>
            <div className="grid grid-cols-3 gap-2">
              {gradientDirections.map(dir => (
                <button
                  key={dir.value}
                  onClick={() => handleDirectionChange(dir.value)}
                  className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                    gradientDirection === dir.value || themeGradient.includes(dir.value)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  {dir.label}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Type */}
          <div>
            <label className="block text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Animation Effect
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {animationTypes.map((anim) => (
                <button
                  key={anim.value || "none"}
                  onClick={() => handleAnimationChange(anim.value)}
                  className={`px-3 py-2 text-xs rounded-lg border transition-all flex items-center justify-center gap-1 ${
                    animationType === anim.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  <span>{anim.icon}</span>
                  <span>{anim.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Animation Controls - Only show when animation is selected */}
          {animationType && (
            <div className="space-y-4 p-3 bg-background/50 rounded-lg border border-input">
              {/* Presets */}
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Quick Presets</label>
                <div className="grid grid-cols-3 gap-2">
                  {animationPresets.map((preset) => {
                    const isActive = 
                      Math.abs(animationSpeed - preset.speed) < 0.1 && 
                      Math.abs(animationIntensity - preset.intensity) < 0.1;
                    return (
                      <button
                        key={preset.name}
                        onClick={() => onUpdate({ 
                          animation_speed: preset.speed, 
                          animation_intensity: preset.intensity 
                        })}
                        className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                          isActive
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input hover:border-primary/50"
                        }`}
                        title={preset.description}
                      >
                        {preset.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-3 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Speed: {animationSpeed.toFixed(1)}x
                </label>
                <Slider
                  value={[animationSpeed]}
                  onValueChange={handleSpeedChange}
                  min={0.3}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-3 flex items-center gap-1">
                  <Gauge className="w-3 h-3" />
                  Intensity: {animationIntensity.toFixed(1)}x
                </label>
                <Slider
                  value={[animationIntensity]}
                  onValueChange={handleIntensityChange}
                  min={0.3}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Subtle</span>
                  <span>Intense</span>
                </div>
              </div>
            </div>
          )}

          {/* Animation Preview */}
          {animationType && (
            <div>
              <label className="block text-xs text-muted-foreground mb-2">Animation Preview</label>
              <div 
                className={`h-24 rounded-xl relative overflow-hidden bg-gradient-to-b ${themeGradient || 'from-indigo-900 via-purple-900 to-pink-900'}`}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2 / animationSpeed, repeat: Infinity, repeatDelay: 0.5 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    className="rounded-full bg-white/20 backdrop-blur"
                    style={{ width: 32 * animationIntensity, height: 32 * animationIntensity }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2 / animationSpeed, repeat: Infinity }}
                  />
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-center">
                  <span className="text-[10px] text-white/60 bg-black/30 px-2 py-1 rounded">
                    Speed: {animationSpeed.toFixed(1)}x | Intensity: {animationIntensity.toFixed(1)}x
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {isCustom && customBgColor && (
            <div>
              <label className="block text-xs text-muted-foreground mb-2">Color Preview</label>
              <div
                className="h-16 rounded-xl"
                style={{
                  background: customAccentColor
                    ? `linear-gradient(to bottom, ${customBgColor}, ${customAccentColor})`
                    : customBgColor,
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
