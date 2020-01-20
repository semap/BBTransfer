import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BankAccount, Payee, TransferRequest} from '../services/entities';
import {TransferService} from '../services/transfer.service';
import {Unsubscribable} from 'rxjs/src/internal/types';
import {MatHorizontalStepper, MatStepper} from '@angular/material';
import {flatMap, map, switchMap, tap} from 'rxjs/operators';
import {Observable, combineLatest} from 'rxjs';

@Component({
  selector: 'app-make-transfer',
  templateUrl: './make-transfer.component.html',
  styleUrls: ['./make-transfer.component.scss']
})
export class MakeTransferComponent implements OnDestroy {
  title = 'Make a transfer';
  transferForm = new FormGroup({
    fromAccount: new FormControl(),
    payee: new FormControl(),
    amount: new FormControl(),
  });

  fromAccounts$ = this.transferService.fromAccounts$
    .pipe(tap( accs => this.setDefaultFromAccount(accs)));
  payees$ = this.transferService.payees$
    .pipe(tap( payees => this.setDefaultPayee(payees)));

  @ViewChild(MatHorizontalStepper, {static: false})
  stepper: MatHorizontalStepper;

  private createTransferSubscription: Unsubscribable;

  constructor(private transferService: TransferService) { }

  get fromAccount(): BankAccount {
    return this.transferForm.get('fromAccount').value;
  }

  get payee(): Payee {
    return this.transferForm.get('payee').value;
  }

  get amount(): number {
    return this.transferForm.get('amount').value;
  }

  submit(): void {
    if (!this.fromAccount || !this.payee) { return; }

    const transferRequest: TransferRequest = {
      fromAccountId: this.fromAccount.id,
      payeeId: this.payee.id,
      amount: this.transferForm.get('amount').value
    };
    if (this.createTransferSubscription) {
      this.createTransferSubscription.unsubscribe();
    }
    this.createTransferSubscription = this.transferService.createTransaction(transferRequest)
      .subscribe(
        __ => this.stepper.next(),
        err => console.error(err.toString())
      );
  }

  ngOnDestroy(): void {
    if (this.createTransferSubscription) {
      this.createTransferSubscription.unsubscribe();
    }
  }

  private setDefaultFromAccount(accounts: BankAccount[]): void {
    if (accounts && accounts.length > 1) {
      this.transferForm.get('fromAccount').setValue(accounts[0]);
    }
  }

  private setDefaultPayee(payees: Payee[]): void {
    if (payees && payees.length > 1) {
      this.transferForm.get('payee').setValue(payees[0]);
    }
  }
}
