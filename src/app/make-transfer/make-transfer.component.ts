import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Transaction, TransferRequest} from '../services/entities';
import {TransferService} from '../services/transfer.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-make-transfer',
  templateUrl: './make-transfer.component.html',
  styleUrls: ['./make-transfer.component.scss']
})
export class MakeTransferComponent implements OnInit {
  title = 'Make a transfer';
  transferForm = new FormGroup({
    fromAccount: new FormControl('48b7b61e-3df1-44c6-b81e-87caf0986c6a'),
    payee: new FormControl('2c7e18c6-781a-4ef8-832d-18c530f9a55f'),
    amount: new FormControl(0),
  });

  constructor(private transferService: TransferService) { }

  get fromAccounts$() {
    return this.transferService.fromAccounts$;
  }

  get payees$() {
    return this.transferService.payees$;
  }

  ngOnInit() {
  }

  onSubmit() {
    const transferRequest: TransferRequest = {
      fromAccountId: this.transferForm.get('fromAccount').value,
      payeeId: this.transferForm.get('payee').value,
      amount: this.transferForm.get('amount').value
    };
    const sub = this.transferService.createTransaction(transferRequest)
      .subscribe( transaction => transaction);
  }
}
