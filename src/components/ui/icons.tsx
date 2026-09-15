"use client";

import { SVGProps } from "react";
import {
  Compass,
  Navigation,
  Ship,
  BarChart3,
  LogOut,
  Anchor,
  Bell,
  Search,
} from "lucide-react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function IconCompass({ className, width = 18, height = 18, ...props }: IconProps) {
  return <Compass className={className} width={width} height={height} {...props} />;
}

export function IconRoute({ className, width = 18, height = 18, ...props }: IconProps) {
  return <Navigation className={className} width={width} height={height} {...props} />;
}

export function IconShip({ className, width = 18, height = 18, ...props }: IconProps) {
  return <Ship className={className} width={width} height={height} {...props} />;
}

export function IconChart({ className, width = 18, height = 18, ...props }: IconProps) {
  return <BarChart3 className={className} width={width} height={height} {...props} />;
}

export function IconLogout({ className, width = 18, height = 18, ...props }: IconProps) {
  return <LogOut className={className} width={width} height={height} {...props} />;
}

export function IconAnchor({ className, width = 18, height = 18, ...props }: IconProps) {
  return <Anchor className={className} width={width} height={height} {...props} />;
}

export function IconBell({ className, width = 18, height = 18, ...props }: IconProps) {
  return <Bell className={className} width={width} height={height} {...props} />;
}

export function IconSearch({ className, width = 18, height = 18, ...props }: IconProps) {
  return <Search className={className} width={width} height={height} {...props} />;
}
