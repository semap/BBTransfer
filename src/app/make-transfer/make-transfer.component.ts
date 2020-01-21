import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, Validators} from '@angular/forms';
import {BankAccount, Payee, Transaction, TransferRequest} from '../services/entities';
import {TransferService} from '../services/transfer.service';
import {Unsubscribable} from 'rxjs/src/internal/types';
import {ErrorStateMatcher, MatHorizontalStepper} from '@angular/material';
import {tap} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-make-transfer',
  templateUrl: './make-transfer.component.html',
  styleUrls: ['./make-transfer.component.scss']
})
export class MakeTransferComponent implements OnDestroy {
  title = 'Make a transfer';
  fromAccounts$ = this.transferService.fromAccounts$
    .pipe(tap( accs => this.setDefaultFromAccount(accs)));
  payees$ = this.transferService.payees$
    .pipe(tap( payees => this.setDefaultPayee(payees)));

  @ViewChild(MatHorizontalStepper, {static: true})
  stepper: MatHorizontalStepper;

  matcher = new AmountErrorMatcher();

  transferForm = new FormGroup({
    fromAccount: new FormControl(undefined, [Validators.required]),
    payee: new FormControl(undefined, [Validators.required]),
    amount: new FormControl(undefined, [Validators.required, Validators.min(0.01), Validators.pattern('^[-]?[0-9]+(.[0-9]{0,2})?$')]),
  }, {
    validators: form => this.validateBalance(form.get('fromAccount').value , form.get('amount').value)
  });

  private createTransferSubscription: Unsubscribable;

  constructor(private transferService: TransferService) { }

  get fromAccountControl() { return this.transferForm.controls.fromAccount; }
  get fromAccount(): BankAccount { return this.fromAccountControl.value; }

  get payeeControl() { return this.transferForm.controls.payee; }
  get payee(): Payee { return this.payeeControl.value; }

  get amountControl() { return this.transferForm.controls.amount; }
  get amount(): number { return this.amountControl.value; }

  submit(): void {
    if (this.createTransferSubscription) {
      this.createTransferSubscription.unsubscribe();
    }
    this.createTransferSubscription = this.createTransaction()
      .subscribe(
        __ => { this.stepper.next(); this.amountControl.reset(); },
        err => console.error(err.toString())  // TODO: render a proper error message to uses
      );
  }

  createTransaction(): Observable<Transaction> {
    if (!this.fromAccount || !this.payee) { return; }

    const transferRequest: TransferRequest = {
      fromAccountId: this.fromAccount.id,
      payeeId: this.payee.id,
      amount: this.amount
    };
    return this.transferService.createTransaction(transferRequest);
  }

  ngOnDestroy(): void {
    if (this.createTransferSubscription) {
      this.createTransferSubscription.unsubscribe();
    }
  }

  private setDefaultFromAccount(accounts: BankAccount[]): void {
    if (accounts && accounts.length > 1) {
      this.fromAccountControl.setValue(accounts[0]);
    }
  }

  private setDefaultPayee(payees: Payee[]): void {
    if (payees && payees.length > 1) {
      this.payeeControl.setValue(payees[0]);
    }
  }

  private validateBalance(fromAccount: BankAccount, withdrawAmount: number): ValidationErrors | null {
    return fromAccount && withdrawAmount && fromAccount.balance - withdrawAmount < -500 ?
      {insufficientFund: true} : null;
  }
}

class AmountErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return (control.dirty || control.touched) && !control.valid || (form.errors && form.errors.insufficientFund);
  }
}
