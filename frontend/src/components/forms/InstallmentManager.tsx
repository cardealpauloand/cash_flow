import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Installment {
  id: string;
  amount: number;
  dueDate: Date;
  description: string;
  status: 'pending' | 'paid';
}

interface InstallmentManagerProps {
  installments: Installment[];
  onInstallmentsChange: (installments: Installment[]) => void;
  totalAmount: number;
}

const InstallmentManager = ({ installments, onInstallmentsChange, totalAmount }: InstallmentManagerProps) => {
  const [numberOfInstallments, setNumberOfInstallments] = useState<number>(1);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [installmentType, setInstallmentType] = useState<'equal' | 'custom'>('equal');

  // Gerar parcelas automaticamente
  const generateInstallments = () => {
    if (numberOfInstallments <= 0 || totalAmount <= 0) return;

    const newInstallments: Installment[] = [];
    const amountPerInstallment = totalAmount / numberOfInstallments;

    for (let i = 0; i < numberOfInstallments; i++) {
      newInstallments.push({
        id: `installment-${i + 1}`,
        amount: Math.round(amountPerInstallment * 100) / 100,
        dueDate: addMonths(startDate, i),
        description: `Parcela ${i + 1}/${numberOfInstallments}`,
        status: 'pending'
      });
    }

    // Ajustar a última parcela para compensar arredondamentos
    if (newInstallments.length > 0) {
      const totalCalculated = newInstallments.reduce((sum, inst) => sum + inst.amount, 0);
      const difference = totalAmount - totalCalculated;
      newInstallments[newInstallments.length - 1].amount += difference;
      newInstallments[newInstallments.length - 1].amount = Math.round(newInstallments[newInstallments.length - 1].amount * 100) / 100;
    }

    onInstallmentsChange(newInstallments);
  };

  const updateInstallment = (id: string, field: keyof Installment, value: any) => {
    const updated = installments.map(installment =>
      installment.id === id ? { ...installment, [field]: value } : installment
    );
    onInstallmentsChange(updated);
  };

  const removeInstallment = (id: string) => {
    const filtered = installments.filter(installment => installment.id !== id);
    onInstallmentsChange(filtered);
  };

  const addCustomInstallment = () => {
    const newInstallment: Installment = {
      id: `custom-${Date.now()}`,
      amount: 0,
      dueDate: new Date(),
      description: `Parcela ${installments.length + 1}`,
      status: 'pending'
    };
    onInstallmentsChange([...installments, newInstallment]);
  };

  const clearInstallments = () => {
    onInstallmentsChange([]);
  };

  const totalInstallmentsAmount = installments.reduce((sum, installment) => sum + installment.amount, 0);
  const difference = totalAmount - totalInstallmentsAmount;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">Parcelamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo de Parcelamento</Label>
            <Select value={installmentType} onValueChange={(value: 'equal' | 'custom') => setInstallmentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">Parcelas Iguais</SelectItem>
                <SelectItem value="custom">Parcelas Personalizadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {installmentType === 'equal' && (
            <div className="space-y-2">
              <Label>Número de Parcelas</Label>
              <Input
                type="number"
                min="1"
                max="24"
                value={numberOfInstallments}
                onChange={(e) => setNumberOfInstallments(parseInt(e.target.value) || 1)}
              />
            </div>
          )}
        </div>

        {installmentType === 'equal' && (
          <div className="space-y-2">
            <Label>Data da Primeira Parcela</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          {installmentType === 'equal' ? (
            <Button type="button" onClick={generateInstallments} className="flex-1">
              Gerar Parcelas
            </Button>
          ) : (
            <Button type="button" onClick={addCustomInstallment} className="flex-1">
              Adicionar Parcela
            </Button>
          )}
          {installments.length > 0 && (
            <Button type="button" variant="outline" onClick={clearInstallments} className="sm:w-auto">
              Limpar
            </Button>
          )}
        </div>

        {installments.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span>Total das Parcelas: R$ {totalInstallmentsAmount.toFixed(2)}</span>
              {difference !== 0 && (
                <span className={difference > 0 ? "text-destructive" : "text-green-600"}>
                  Diferença: R$ {difference.toFixed(2)}
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-60 sm:max-h-80 overflow-y-auto">
              {installments.map((installment, index) => (
                <Card key={installment.id} className="p-3">
                  <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-4 sm:gap-3 sm:items-end">
                    <div className="space-y-1 sm:col-span-2 md:col-span-1">
                      <Label className="text-xs">Descrição</Label>
                      <Input
                        value={installment.description}
                        onChange={(e) => updateInstallment(installment.id, 'description', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 sm:contents">
                      <div className="space-y-1">
                        <Label className="text-xs">Valor</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={installment.amount}
                          onChange={(e) => updateInstallment(installment.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Vencimento</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-left font-normal text-xs px-2"
                            >
                              <CalendarIcon className="mr-1 h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {format(installment.dueDate, "dd/MM/yy", { locale: ptBR })}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={installment.dueDate}
                              onSelect={(date) => date && updateInstallment(installment.id, 'dueDate', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <div className="flex justify-center sm:justify-start">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeInstallment(installment.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InstallmentManager;