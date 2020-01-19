import { Component, OnInit } from '@angular/core';
import {TransferService} from '../services/transfer.service';
import {FormControl} from '@angular/forms';
import {combineLatest, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {Transaction} from '../services/entities';

@Component({
  selector: 'app-recent-transactions',
  templateUrl: './recent-transactions.component.html',
  styleUrls: ['./recent-transactions.component.scss']
})
export class RecentTransactionsComponent implements OnInit {
  searchText: FormControl = new FormControl('');

  readonly transactions$ = combineLatest(
      this.transferService.transactions$,
      this.searchText.valueChanges.pipe(startWith('')))
    .pipe(
      map(([transactions, text]) => this.filterTransactions(transactions, text))
    );

  constructor(private transferService: TransferService) {}

  ngOnInit() {
  }
  //
  private filterTransactions(transactions: Transaction[], text: string): Transaction[] {
    if (!text) { return transactions; }

    const regex = new RegExp(`${text}`, 'i');
    return transactions.filter(
      transaction => regex.test(transaction.merchant) || regex.test(transaction.transactionType)
    );
  }
}
