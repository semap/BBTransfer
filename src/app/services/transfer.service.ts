import { Injectable } from '@angular/core';
import {BehaviorSubject, combineLatest, EMPTY, merge, Observable, of, ReplaySubject, Subject} from 'rxjs';
import {map, shareReplay, skip, tap} from 'rxjs/operators';
import {BankAccount, BankAccountsData, Payee, PayeesData, Transaction, TransactionsData, TransferRequest} from './entities';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TransferService {

  readonly TRANSACTIONS_URL = '/assets/mock-transactions.json';
  readonly FROM_ACCOUNTS_URL = '/assets/mock-from-accounts.json';
  readonly PAYEES_URL = '/assets/mock-payees.json';

  private transactions = new BehaviorSubject<Transaction[]>([]);
  readonly transactions$: Observable<Transaction[]>;

  private fromAccounts = new BehaviorSubject<BankAccount[]>([]);
  readonly fromAccounts$: Observable<BankAccount[]>;

  private payees = new BehaviorSubject<Payee[]>([]);
  readonly payees$: Observable<Payee[]>;

  constructor(private http: HttpClient) {
    this.transactions$ = this.mergeAndReplay(this.transactions, this.fetchTransactions());
    this.fromAccounts$ = this.mergeAndReplay(this.fromAccounts, this.fetchFromAccounts());
    this.payees$ = this.mergeAndReplay(this.payees, this.fetchPayees());
  }

  /**
   * Given a TransferRequest, create a transaction.
   * @param transferRequest   The transfer request.
   */
  createTransaction(transferRequest: TransferRequest): Observable<Transaction> {
    return of(transferRequest)
      .pipe(
        map(req => this.toTransaction(req)),
        tap(transaction => this.updateAccountsAndTransactions(transaction, transferRequest.fromAccountId))
      );
  }

  findPayee(id: string): Payee {
    return this.payees.value.find(payee => payee.id === id);
  }

  private fetchTransactions(): Observable<Transaction[]> {
    return this.http.get<TransactionsData>(this.TRANSACTIONS_URL)
      .pipe(
        map(transactionData => transactionData.data),
        map( transactions => transactions.map(tx => ({...tx, amount: parseFloat(String(tx.amount)) * -1})))
      );
  }

  private fetchFromAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccountsData>(this.FROM_ACCOUNTS_URL)
      .pipe(
        map(bankAccountsData => bankAccountsData.data)
      );
  }

  private fetchPayees(): Observable<Payee[]> {
    return this.http.get<PayeesData>(this.PAYEES_URL)
      .pipe(
        map(payeesData => payeesData.data)
      );
  }

  /****** private functions **********/

  private mergeAndReplay<T>(subject: BehaviorSubject<T>, observable: Observable<T>): Observable<T> {
    return merge(
        subject.pipe(skip(2)),   // skip the init value and the one from "ele => subject.next(ele)"
        observable.pipe(tap(ele => subject.next(ele))))
      .pipe(shareReplay(1));
  }

  private toTransaction(transferRequest: TransferRequest): Transaction {
    const payee: Payee = this.findPayee(transferRequest.payeeId);
    return {
      amount: transferRequest.amount * -1,
      categoryCode: payee.categoryCode,
      merchant: payee.merchant,
      merchantLogo: payee.merchantLogo,
      transactionDate: new Date().getTime(),
      transactionType: 'Online Transfer'
    };
  }

  private updateAccountsAndTransactions(transaction: Transaction, accountId: string) {
    // update account balance
    const newAccounts = this.fromAccounts.value
      .map(acc => acc.id === accountId ? {...acc, balance: acc.balance + +transaction.amount} : acc);
    this.fromAccounts.next(newAccounts);

    const newTransactions = [transaction].concat(this.transactions.value);
    this.transactions.next(newTransactions);
  }
}
