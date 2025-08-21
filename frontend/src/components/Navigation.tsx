import {
  Home,
  CreditCard,
  ArrowUpDown,
  PieChart,
  Settings,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { UserMenu } from "@/components/auth/UserMenu";
import TransactionForm, {
  TransactionFormSubmitPayload,
} from "@/components/forms/TransactionForm";
import { useState } from "react";

const navItems = [
  { icon: Home, label: "dashboard", href: "/" },
  { icon: CreditCard, label: "accounts", href: "/accounts" },
  { icon: ArrowUpDown, label: "transactions", href: "/transactions" },
  { icon: PieChart, label: "reports", href: "/reports" },
];

export const Navigation = () => {
  const location = useLocation();
  const { t } = useApp();

  return (
    <nav className="border-b bg-card shadow-card backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow animate-glow-pulse">
                <span className="text-primary-foreground font-bold text-lg">
                  CF
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Cash Flow</h1>
                <p className="text-xs text-muted-foreground">
                  Controle Financeiro
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Link key={item.href} to={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "flex items-center space-x-2 transition-all duration-200",
                        isActive &&
                          "bg-primary text-primary-foreground shadow-glow animate-scale-in"
                      )}
                    >
                      <Icon size={16} />
                      <span className="capitalize">{t(item.label)}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />

            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};
