import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CreditCard, Wallet, PiggyBank, Smartphone, Edit, Trash2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import AccountForm from "@/components/forms/AccountForm";
import { useState } from "react";

interface Account {
  id: string;
  name: string;
  type: "corrente" | "poupanca" | "carteira" | "cartao";
  balance: number;
}

const accountIcons = {
  corrente: CreditCard,
  poupanca: PiggyBank,
  carteira: Wallet,
  cartao: Smartphone,
};

const accountColors = {
  corrente: "bg-gradient-to-r from-blue-500 to-blue-600",
  poupanca: "bg-gradient-to-r from-green-500 to-green-600",
  carteira: "bg-gradient-to-r from-yellow-500 to-yellow-600",
  cartao: "bg-gradient-to-r from-purple-500 to-purple-600",
};

const accountLabels = {
  corrente: "Conta Corrente",
  poupanca: "Poupança",
  carteira: "Carteira",
  cartao: "Cartão de Crédito",
};

// Mock data
const mockAccounts: Account[] = [
  { id: "1", name: "Nubank", type: "corrente", balance: 15420.50 },
  { id: "2", name: "Poupança CEF", type: "poupanca", balance: 5680.30 },
  { id: "3", name: "Dinheiro", type: "carteira", balance: 320.00 },
  { id: "4", name: "Cartão Itaú", type: "cartao", balance: -1250.80 },
];

const AccountsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const { formatCurrency, t } = useApp();

  const totalBalance = mockAccounts.reduce((total, account) => total + account.balance, 0);

  const handleNewAccount = (account: any) => {
    console.log('Nova conta:', account);
    // Aqui você adicionaria a lógica para salvar a conta
    setIsModalOpen(false);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsEditModalOpen(true);
  };

  const handleUpdateAccount = (updatedAccount: any) => {
    console.log('Conta atualizada:', updatedAccount);
    // Aqui você adicionaria a lógica para atualizar a conta
    setIsEditModalOpen(false);
    setEditingAccount(null);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{t('accounts')}</h1>
            <p className="text-muted-foreground text-lg">
              Gerencie suas contas e cartões
            </p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-income hover:scale-105 transition-all duration-200 shadow-card">
                <Plus size={16} className="mr-2" />
                {t('newAccount')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <AccountForm 
                onSubmit={handleNewAccount}
                onCancel={() => setIsModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Card */}
        <Card className="shadow-card bg-gradient-card hover:shadow-hover transition-all duration-300 animate-scale-in">
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground mb-3 text-lg font-medium">{t('totalBalance')}</p>
              <p className="text-5xl font-bold text-foreground mb-2">
                {formatCurrency(totalBalance)}
              </p>
              <p className="text-sm text-muted-foreground">
                {mockAccounts.length} contas ativas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockAccounts.map((account) => {
            const Icon = accountIcons[account.type];
            const isNegative = account.balance < 0;
            
            return (
              <Card key={account.id} className="shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-2 animate-fade-in group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-2xl ${accountColors[account.type]} shadow-card group-hover:shadow-hover transition-all duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="hover:bg-primary/10 transition-all duration-200"
                        onClick={() => handleEditAccount(account)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="hover:bg-destructive/10 transition-all duration-200">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-xl mb-2">{account.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {accountLabels[account.type]}
                    </p>
                    <p className={`text-3xl font-bold ${
                      isNegative ? "text-expense" : "text-foreground"
                    }`}>
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Edit Account Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            {editingAccount && (
              <AccountForm 
                onSubmit={handleUpdateAccount}
                onCancel={() => {
                  setIsEditModalOpen(false);
                  setEditingAccount(null);
                }}
                initialData={editingAccount}
                isEditing={true}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AccountsPage;