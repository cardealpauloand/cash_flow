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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useApp();

  const handleNewTransaction = (transaction: TransactionFormSubmitPayload) => {
    console.log("Nova transação:", transaction);
    // Aqui você adicionaria a lógica para salvar a transação
    setIsModalOpen(false);
  };

  return (
    <nav className="border-b shadow-card backdrop-blur-sm navbar-bg">
    <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
                <div className="w-[148px] h-[54px] md:w-[188px] md:h-[62px] rounded-lg overflow-hidden -ml-10">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
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
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-gradient-income hover:scale-105 transition-all duration-200 shadow-card"
                >
                  <Plus size={16} className="mr-1" />
                  {t("newTransaction")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("newTransaction")}</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para criar uma nova transação.
                  </DialogDescription>
                </DialogHeader>
                <TransactionForm
                  onSubmit={handleNewTransaction}
                  onCancel={() => setIsModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};
