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
  transferForm = new FormGroup({
    fromAccount: new FormControl('48b7b61e-3df1-44c6-b81e-87caf0986c6a'),
    payeeAccount: new FormControl('2c7e18c6-781a-4ef8-832d-18c530f9a55f')
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
    console.warn('KKKKKKKKKKKKKK');
    const transferRequest: TransferRequest = {
      payeeId: '2c7e18c6-781a-4ef8-832d-18c530f9a55f',
      fromAccountId: '48b7b61e-3df1-44c6-b81e-87caf0986c6a',
      amount: 39.03
    };
    const sub = this.transferService.createTransaction(transferRequest)
      .subscribe( transaction => transaction);
  }
}
