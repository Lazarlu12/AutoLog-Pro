import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "@/types/domain";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

interface Breadcrumb {
  label: string;
  href: string;
}

interface ActionButton {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "ghost";
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  action?: ActionButton;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function PageHeader({ title, description, breadcrumbs, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div className="space-y-1">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              </span>
            ))}
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{title}</span>
          </nav>
        )}

        <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Action button */}
      {action && (
        <div className="shrink-0">
          {action.href ? (
            <Button
              asChild
              variant={action.variant ?? "default"}
              size="sm"
              className={
                action.variant === "default" || !action.variant
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : undefined
              }
            >
              <Link href={action.href}>
                {action.icon && <action.icon className="w-3.5 h-3.5 mr-1.5" />}
                {action.label}
              </Link>
            </Button>
          ) : (
            <Button
              variant={action.variant ?? "default"}
              size="sm"
              onClick={action.onClick}
              className={
                action.variant === "default" || !action.variant
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : undefined
              }
            >
              {action.icon && <action.icon className="w-3.5 h-3.5 mr-1.5" />}
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}