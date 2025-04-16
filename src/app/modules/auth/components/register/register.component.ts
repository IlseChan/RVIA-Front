import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { termsAndConditions } from './termsandcond';
import { ValidationService } from '@modules/shared/services/validation.service';
import { AppOrg, Centro, Encargado, Position, PositionNames, PositionValues } from '@modules/auth/interfaces';

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
  appsOpc: AppOrg[] = [
    {
      "idu_aplicacion": 65,
      "nom_app": "Sistema Legado Tiendas Clientes Nuevos"
  },
  {
      "idu_aplicacion": 66,
      "nom_app": "Sistema Legado Tiendas Atención y Servicios"
  },
  ];
  centrosOpc: Centro[] = [
    {
      "num_centro": 232390,
      "nom_centro": "CLCN REMED DE VUL OMNIC Y SF"
    },
    {
        "num_centro": 232490,
        "nom_centro": "CLCN ANALISIS DE REQ AFORE"
    }
  ];
  encargados: Encargado[] =  [
    {
        "idu_encargado": 1,
        "num_empleado": 90000011,
        "nom_empleado": "Arturo Solis R"
    },
    {
        "idu_encargado": 2,
        "num_empleado": 90000031,
        "nom_empleado": "Luis del Rosario Bayliss"
    }
  ];
  isNotDivisional: boolean = false;
  txtPosition: string = '';

  private router = inject(Router);
  private authSrv = inject(AuthService);
  private vldtnSrv = inject(ValidationService);

  ngOnInit(): void {
    //TODO Traer las app para el select
    this.initFormUser();
    this.initFormOrg();
    this.authSrv.getPositions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        if(resp){
          this.positionsOpcs = [...resp];
  
          this.registerFormUser.get('idu_puesto')?.enable();
        }
      });
  }

  private initFormUser(): void {
    // this.registerFormUser = new FormGroup({
    //   num_empleado: new FormControl(null,[Validators.required,this.vldtnSrv.employeeNumber()]),
    //   nom_correo: new FormControl('',[Validators.required,this.vldtnSrv.emailCoppel()]),
    //   nom_usuario: new FormControl('',[Validators.required,this.vldtnSrv.noBlankValidation(),this.vldtnSrv.completeUserName()]),
    //   nom_contrasena: new FormControl('',[Validators.required,this.vldtnSrv.passwordValidation()]),
    //   confirmPassword: new FormControl('', Validators.required),
    //   idu_puesto: new FormControl({ value: null, disabled: true},[Validators.required,]),
    // },{
    //   validators: this.vldtnSrv.passwordMatch('nom_contrasena', 'confirmPassword')
    // });
    this.registerFormUser = new FormGroup({
      num_empleado: new FormControl(90000001,[Validators.required,this.vldtnSrv.employeeNumber()]),
      nom_correo: new FormControl('luis.bayliss@coppel.com',[Validators.required,this.vldtnSrv.emailCoppel()]),
      nom_usuario: new FormControl('Luis del Rosario Ayala',[Validators.required,this.vldtnSrv.noBlankValidation(),this.vldtnSrv.completeUserName()]),
      nom_contrasena: new FormControl('Carino@123456',[Validators.required,this.vldtnSrv.passwordValidation()]),
      confirmPassword: new FormControl('Carino@123456', Validators.required),
      idu_puesto: new FormControl({ value: null, disabled: true},[Validators.required,]),
    },{
      validators: this.vldtnSrv.passwordMatch('nom_contrasena', 'confirmPassword')
    });
  }

  private initFormOrg(): void {
    // TODO Revisar el disable mientras se carga la info
    this.registerFormOrg = new FormGroup({
      idu_aplicacion: new FormControl(null , [Validators.required]),
      num_centro: new FormControl(null , [Validators.required]),
      num_encargado: new FormControl(null),
      termAccepted: new FormControl(false, [Validators.requiredTrue])
    });
  }

  private getInfoOrg(){

    const { idu_puesto } = this.registerFormUser.value;
    if(!idu_puesto) {
      this.activeIndex = 0
      return;
    }
    console.log(idu_puesto);
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

    if(this.activeIndex === 1){
      this.initFormOrg();
      const { idu_puesto } = this.registerFormUser.value;
      if(idu_puesto !== PositionValues.DIVISIONAL){
        this.isNotDivisional = true;
        const position = this.positionsOpcs.find((pos) => pos.idu_puesto === idu_puesto - 1);
        this.txtPosition = position ? position.nom_puesto : 'ERRORR';  
      }
      this.updateGerenteValidator(idu_puesto);
      
      // TODO llamar a endpont
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

    console.log('¡VAMOS A REGISTRAR!');
    this.isRegister = true;
    
    const { confirmPassword, ...dataUser} = this.registerFormUser.value;
    const { termAccepted, ...dataOrg } = this.registerFormOrg.value;
    const dataRegister = { ...dataUser, ...dataOrg };
    console.log(dataRegister);

    this.authSrv.registerUser(dataRegister)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          console.log(resp);   
        },
        error: (err) => {
          console.log(err);
          // if (err.status === 0) {
          //   this.connectionErrorMessage = 'No se pudo conectar con el servidor.'; 
          // } else {
          //   this.errorMessage = err.message || 'No se pudo conectar con el servidor. Favor de verificar.'; 
          // }
          // this.isRegister = false;
      }})
  }



  // onRegister(): void {
  //   const trimmedUsername = this.username.trim();
  //   const trimmedPassword = this.password.trim();
  //   const trimmedConfirmPassword = this.confirmPassword.trim();



  //   this.isRegister = true;
  //   this.btnLabel = 'Registrando...';
  //   this.authService.registerUser(trimmedUsernumber, trimmedUsername, trimmedPassword, trimmedEmail)
  //     .pipe(
  //       finalize(() => this.btnLabel = 'Registrar')
  //     )
  //     .subscribe({
  //       next: () => {
  //         this.errorMessage = '';
  //         this.isReady = true;
  //       },
  //       error: (err) => {
  //         if (err.status === 0) {
  //           this.connectionErrorMessage = 'No se pudo conectar con el servidor.'; 
  //         } else {
  //           this.errorMessage = err.message || 'No se pudo conectar con el servidor. Favor de verificar.'; 
  //         }
  //         this.isRegister = false;
  //       }
  //     });
  // }

  showTerms(fromForm: boolean = false): void {
    const { termAccepted } =this.registerFormOrg.value;

    if((fromForm && termAccepted) || !fromForm) {
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