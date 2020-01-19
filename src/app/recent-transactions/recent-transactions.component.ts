import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {TransferService} from '../services/transfer.service';
import {FormControl} from '@angular/forms';
import {combineLatest, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {Transaction} from '../services/entities';
import {MatSort, Sort} from '@angular/material';

@Component({
  selector: 'app-recent-transactions',
  templateUrl: './recent-transactions.component.html',
  styleUrls: ['./recent-transactions.component.scss']
})
export class RecentTransactionsComponent implements AfterViewInit {
  searchText: FormControl = new FormControl('');

  @ViewChild(MatSort, {static: false})
  sort: MatSort;

  transactions$: Observable<Transaction[]>;

  constructor(private transferService: TransferService) {}

  ngAfterViewInit(): void {
    this.transactions$ = combineLatest(
      this.transferService.transactions$,
      this.searchText.valueChanges.pipe(startWith('')),
      this.sort.sortChange.asObservable().pipe(startWith(null)))
    .pipe(
      map(([transactions, text, sort]) =>
        [...this.filterTransactions(transactions, text)].sort(this.createComparator(sort))
      ),
    );
  }

  private filterTransactions(transactions: Transaction[], text: string): Transaction[] {
    if (!text) { return transactions; }
    text = text.toLowerCase();
    return transactions.filter( // TODO: use RegExp
      transaction => transaction.merchant.toLowerCase().includes(text)
    );
  }

  private createComparator(sort: Sort): (a: Transaction, b: Transaction) => number {
    if (!sort) { return (a, b) => 0; }
    const direction = (sort.direction === `asc` ? 1 : (sort.direction === 'desc') ? -1 : 0);
    return (transaction1, transaction2) => {
      return (transaction1[sort.active] < transaction2[sort.active] ? -1 : 1) * direction;
    };
  }
}
