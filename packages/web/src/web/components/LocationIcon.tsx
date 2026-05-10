import {
  Home,
  Trees,
  Car,
  Grid3x3,
  Waves,
  Fence,
  Flame,
  Lightbulb,
  Circle,
  AlignVerticalJustifyCenter,
  Navigation,
  Square,
  ChevronDown,
  Minus,
  Scan,
  type LucideProps,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Home,
  Trees,
  Car,
  Grid3x3,
  Waves,
  Fence,
  Flame,
  Lightbulb,
  Circle,
  AlignVerticalJustifyCenter,
  Navigation,
  Square,
  ChevronDown,
  Minus,
  Scan,
};

interface Props extends LucideProps {
  name: string;
}

export function LocationIcon({ name, ...props }: Props) {
  const Icon = iconMap[name] ?? Lightbulb;
  return <Icon {...props} />;
}
