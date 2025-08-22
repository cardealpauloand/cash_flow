// filepath: /src/components/forms/InstallmentManager.tsx
// Componente deprecated: parcelamento agora é feito no backend via campo installments_count.
// Mantido stub vazio para evitar import breaks caso algo ainda referencie.
import React from "react";

export interface Installment {
  id: string;
  amount: number;
  dueDate: Date;
  description: string;
  status: "pending" | "paid";
}

const InstallmentManager: React.FC<{
  installments: Installment[];
  onInstallmentsChange: (i: Installment[]) => void;
  totalAmount: number;
}> = () => null;
export default InstallmentManager;
