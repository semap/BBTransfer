import { Component, OnInit } from '@angular/core';
import {TransferService} from '../services/transfer.service';

@Component({
  selector: 'app-recent-transactions',
  templateUrl: './recent-transactions.component.html',
  styleUrls: ['./recent-transactions.component.scss']
})
export class RecentTransactionsComponent implements OnInit {

  constructor(private transferService: TransferService) { }

  get transactions$() {
    return this.transferService.transactions$;
  }
  ngOnInit() {
  }
}
