import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { termsAndConditions } from './termsandcond';
import { ValidationService } from '@modules/shared/services/validation.service';
import { AppOrg, Centro, Encargado, Position, PositionValues } from '@modules/auth/interfaces';

@Component({
  selector: 'rvia-register',
  standalone: true,
  imports: [ReactiveFormsModule, PrimeNGModule, NgFor, NgIf, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isRegister: boolean = false;
  registerFormUser!: FormGroup;
  registerFormOrg!: FormGroup;

  termAccepted: boolean = false;
  isShowTerms: boolean = false;
  termsAndConditions = termsAndConditions;

  readonly headers = [
    { label: 'Usuario'},
    { label: 'Organización'},
  ];
  activeIndex: number = 0;
  positionsOpcs: Position[] = [];
  appsOpc: AppOrg[] = [];
  centrosOpc: Centro[] = [];
  encargados: Encargado[] =  [];

  isNotDivisional: boolean = false;
  txtPosition: string = '';

  private router = inject(Router);
  private authSrv = inject(AuthService);
  private vldtnSrv = inject(ValidationService);

  ngOnInit(): void {
    this.initFormUser();
    this.initFormOrg();
    this.authSrv.getPositions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        if(resp){
          this.positionsOpcs = [...resp];
        }
      });
  }

  private initFormUser(): void {
    this.registerFormUser = new FormGroup({
      num_empleado: new FormControl(null,[Validators.required,this.vldtnSrv.employeeNumber()]),
      nom_correo: new FormControl('',[Validators.required,this.vldtnSrv.emailCoppel()]),
      nom_usuario: new FormControl('',[Validators.required,this.vldtnSrv.noBlankValidation(),this.vldtnSrv.completeUserName()]),
      nom_contrasena: new FormControl('',[Validators.required,this.vldtnSrv.passwordValidation()]),
      confirmPassword: new FormControl('', Validators.required),
      num_puesto: new FormControl(null,[Validators.required,]),
    },{
      validators: this.vldtnSrv.passwordMatch('nom_contrasena', 'confirmPassword')
    });
  }

  private initFormOrg(): void {
    this.registerFormOrg = new FormGroup({
      idu_aplicacion: new FormControl(null, [Validators.required]),
      num_centro: new FormControl(null, [Validators.required,]),
      num_encargado: new FormControl(null),
      termAccepted: new FormControl(false, [Validators.requiredTrue])
    });
  }

  private getInfoOrg(){

    const { num_puesto } = this.registerFormUser.value;
    if(!num_puesto) {
      this.activeIndex = 0
      return;
    }

    this.authSrv.getInfoOrg(num_puesto)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        if(resp){
          this.appsOpc = [...resp.aplicaciones];
          this.centrosOpc = [...resp.centros];
          this.encargados = [...resp.superiores]; 
        }
      });

  }

  private isValidFieldBase(form: FormGroup, field: string): boolean {
    const control = form.controls[field];
    return !!(
      control?.enabled &&
      control?.invalid &&
      control?.touched &&
      control?.dirty
    );
  }
  
  isValidField(field: string): boolean {
    return this.isValidFieldBase(this.registerFormUser, field);
  }
  
  isValidFieldOrg(field: string): boolean {
    return this.isValidFieldBase(this.registerFormOrg, field);
  }

  changeStep(value: number): void {

    this.activeIndex += value;
    this.isNotDivisional = false;

    if(this.activeIndex === 1){
      this.initFormOrg();
      const { num_puesto } = this.registerFormUser.value;
      if(num_puesto !== PositionValues.DIVISIONAL){
        this.isNotDivisional = true;
        const position = this.positionsOpcs.find((pos) => pos.idu_puesto === num_puesto - 1);
        this.txtPosition = position ? position.nom_puesto : 'ERRORR';  
      }

      this.updateGerenteValidator(num_puesto);      
      this.getInfoOrg();
    }
  }

  checkDisabled(): boolean {
    if(this.activeIndex === 0){
      return this.registerFormUser.invalid 
    }

    if(this.activeIndex === 1){
      return this.registerFormOrg.invalid 
    }

    return true;
  }

  updateGerenteValidator(positionValue: number): void {
    const control = this.registerFormOrg.get('num_encargado');
    if (!control) return;
  
    if (positionValue !== PositionValues.DIVISIONAL) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
    }
  
    control.updateValueAndValidity();
  }

  onRegister(): void {
    if(this.registerFormUser.invalid || this.registerFormOrg.invalid){
      return;
    }

    this.isRegister = true;
    
    const { confirmPassword, ...dataUser} = this.registerFormUser.value;
    let { termAccepted, ...dataOrg } = this.registerFormOrg.value;
    
    if(dataUser.num_puesto === PositionValues.DIVISIONAL){
      const { num_encargado, ...rest } = dataOrg;
      dataOrg = {... rest}
    }
    
    const dataRegister = { ...dataUser, ...dataOrg };
    this.authSrv.registerUser(dataRegister)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
        },
        error: () => {
          this.isRegister = false;
      }})
  }

  showTerms(fromForm: boolean = false): void {
    const { termAccepted } = this.registerFormOrg.value;
    if((fromForm && !this.isShowTerms && !termAccepted) || !fromForm) {
      this.isShowTerms = !this.isShowTerms
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void{
    this.destroy$.next();
    this.destroy$.complete();
  }
}