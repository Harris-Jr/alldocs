import {
  Layers,
  Scissors,
  RotateCw,
  Stamp,
  Hash,
  Minimize2,
  Image as ImageIcon,
  FileImage,
  ShieldCheck,
  Lock,
  Zap,
  FileText,
  Check,
  ArrowRight,
  Upload,
  Download,
  X,
  GripVertical,
  type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  layers: Layers,
  scissors: Scissors,
  'rotate-cw': RotateCw,
  stamp: Stamp,
  hash: Hash,
  'minimize-2': Minimize2,
  image: ImageIcon,
  'file-image': FileImage,
  'shield-check': ShieldCheck,
  lock: Lock,
  zap: Zap,
  'file-text': FileText,
  check: Check,
  'arrow-right': ArrowRight,
  upload: Upload,
  download: Download,
  x: X,
  grip: GripVertical,
};

export function Icon({
  name,
  size = 20,
  className,
  'aria-hidden': ariaHidden = true,
}: {
  name: string;
  size?: number;
  className?: string;
  'aria-hidden'?: boolean;
}) {
  const Cmp = MAP[name] ?? FileText;
  return <Cmp size={size} className={className} aria-hidden={ariaHidden} />;
}
