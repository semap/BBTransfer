export interface TransactionsData {
  data: Transaction[];
}

export interface Transaction {
  amount: number;
  categoryCode: string;
  merchant: string;
  merchantLogo: string;
  transactionDate: number;
  transactionType: string;
}

export interface BankAccountsData {
  data: BankAccount[];
}

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
}

export interface PayeesData {
  data: Payee[];
}

export interface Payee {
  id: string;
  categoryCode: string;
  merchant: string;
  merchantLogo: string;
}

export interface TransferRequest {
  fromAccountId: string;
  payeeId: string;
  amount: number;
}
