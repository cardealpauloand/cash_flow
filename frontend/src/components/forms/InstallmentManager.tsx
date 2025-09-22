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
