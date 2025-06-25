import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { History } from "lucide-react";

interface LedgerEntry {
  date: string;
  openingBalance: number;
  deposit: number;
  withdrawal: number;
  interest: number;
  endingBalance: number;
}

interface LedgerTableProps {
  ledgerData: LedgerEntry[];
}

const formatCurrency = (amount: number) => {
  if (typeof amount !== 'number') return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  // Assuming the date is in a format JS can parse. Add more robust parsing if needed.
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getTransactionType = (entry: LedgerEntry): React.ReactNode => {
    const interest = Number(entry.interest) || 0;
    const withdrawal = Number(entry.withdrawal) || 0;
    const deposit = Number(entry.deposit) || 0;

    if (deposit > 0) {
        return <span className="font-semibold text-green-600">Investment</span>;
    }
    if (interest > 0 && withdrawal === 0) {
        return <span className="font-semibold text-blue-600">Interest Accrued</span>;
    }
    if (withdrawal > 0) {
        if (Math.abs(interest - withdrawal) < 0.01) { // Floating point comparison
            return <span className="font-semibold text-gray-700">Payment (Interest)</span>;
        }
        return <span className="font-semibold text-orange-600">Payment (Principal)</span>;
    }
    return <span className="text-gray-500">Calculation</span>;
};

const LedgerTable = ({ ledgerData }: LedgerTableProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
            <History className="h-5 w-5 mr-2 text-indigo-600" />
            <CardTitle>Financial Ledger</CardTitle>
        </div>
        <CardDescription>A detailed record of all transactions and calculations.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Transaction Type</TableHead>
              <TableHead className="text-right">Deposit</TableHead>
              <TableHead className="text-right">Withdrawal</TableHead>
              <TableHead className="text-right">Interest</TableHead>
              <TableHead className="text-right">Ending Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgerData && ledgerData.length > 0 ? (
              ledgerData.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{formatDate(entry.date)}</TableCell>
                  <TableCell>{getTransactionType(entry)}</TableCell>
                  <TableCell className="text-right text-green-600">{entry.deposit > 0 ? formatCurrency(entry.deposit) : '-'}</TableCell>
                  <TableCell className="text-right text-orange-600">{entry.withdrawal > 0 ? formatCurrency(entry.withdrawal) : '-'}</TableCell>
                  <TableCell className="text-right text-blue-600">{entry.interest > 0 ? formatCurrency(entry.interest) : '-'}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(entry.endingBalance)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                  No ledger data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LedgerTable; 