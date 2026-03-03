interface VantaEffect {
  destroy: () => void;
}

interface VantaDotsOptions {
  el: HTMLElement | null;
  backgroundColor?: number;
  color?: number;
  color2?: number;
  size?: number;
  spacing?: number;
  showLines?: boolean;
}

interface VantaStatic {
  DOTS: (options: VantaDotsOptions) => VantaEffect;
}

interface Window {
  VANTA: VantaStatic;
}