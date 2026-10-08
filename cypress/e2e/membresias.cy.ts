const businessToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/La_Paz',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const admin={email:'admin@test.local',password:'AdminTest123!'};
const receptionist={email:'recepcion@stronghub.com',password:'ReceptionTest123!'};
function login(reception=false){cy.request('POST','/api/auth/login',reception?receptionist:admin);}
const unique=()=>`CY-${Date.now()}-${Math.random().toString(16).slice(2)}`;
describe('StrongHub · aceptación integrada',()=>{
  it('CP-001: login incorrecto y correcto; cookie HttpOnly',()=>{
    cy.request({method:'POST',url:'/api/auth/login',body:{...admin,password:'Incorrecta!'},failOnStatusCode:false}).its('status').should('eq',401);
    cy.visit('/login');cy.get('input[type=email]').type(admin.email);cy.get('input[type=password]').type(admin.password);cy.contains('Iniciar sesión').click();cy.url().should('include','/dashboard');cy.getCookie('stronghub_session').its('httpOnly').should('eq',true);
  });
  it('CP-002: logout revoca sesión y bloquea acceso',()=>{
    login();cy.getCookie('stronghub_session').then(cookie=>{
      const stale=cookie!.value;cy.visit('/dashboard');cy.contains('Salir').click();cy.url().should('include','/login');
      cy.request({url:'/api/members',failOnStatusCode:false}).its('status').should('eq',401);
      cy.setCookie('stronghub_session',stale);cy.request({url:'/api/members',failOnStatusCode:false}).its('status').should('eq',401);
    });cy.visit('/membresias');cy.url().should('include','/login');
  });
  it('CP-003: recepción no administra usuarios por página ni API',()=>{
    login(true);cy.visit('/usuarios');cy.url().should('include','/dashboard');
    for(const method of ['GET','POST','PATCH'])cy.request({method,url:method==='PATCH'?'/api/users/1':'/api/users',body:method==='GET'?undefined:{},failOnStatusCode:false}).its('status').should('eq',403);
  });
  it('CP-004: correo e identificación duplicados y edición',()=>{
    login();const value=unique();
    const user={name:'Usuario Cypress',email:`${value}@test.local`,password:'TestClave123!',role:'receptionist'};
    cy.request('POST','/api/users',user).then(response=>{cy.request('PATCH',`/api/users/${response.body.id}`,{...user,name:'Editado',active:true});});
    cy.request({method:'POST',url:'/api/users',body:user,failOnStatusCode:false}).its('status').should('eq',409);
    const member={name:'Miembro Cypress',identification:value,phone:'70000002'};
    cy.request('POST','/api/members',member).then(response=>cy.request('PATCH',`/api/members/${response.body.id}`,{...member,name:'Miembro editado'}));
    cy.request({method:'POST',url:'/api/members',body:member,failOnStatusCode:false}).its('status').should('eq',409);
  });
  it('CP-005: registrar membresía con pago, comprobar vigencia y persistencia',()=>{
    login(true);const value=unique();cy.visit('/membresias');
    cy.get('#memberName').type('Juan Pérez');cy.get('#identification').type(value);cy.get('#phone').type('70000003');cy.get('#plan').select('Mensual');cy.get('#startDate').type(businessToday());cy.get('#payment').type('30');cy.get('[data-cy=register-membership]').click();
    cy.contains('La membresía fue registrada correctamente.').should('be.visible');cy.get('[data-cy=memberships-table]').contains('tr',value).should('contain','Activa');
    cy.reload();cy.get('[data-cy=memberships-table]').contains('tr',value).should('contain','Activa');cy.visit('/pagos');cy.contains('Juan Pérez').should('be.visible');
  });
  it('CP-006: fecha pasada en formulario y servidor',()=>{
    login();const past=new Date(`${businessToday()}T00:00:00Z`);past.setUTCDate(past.getUTCDate()-1);const date=past.toISOString().slice(0,10);
    cy.visit('/membresias');cy.get('#memberName').type('Fecha inválida');cy.get('#identification').type(unique());cy.get('#phone').type('70000004');cy.get('#startDate').type(date);cy.get('#payment').type('30');cy.get('[data-cy=register-membership]').click();cy.contains('La fecha de inicio no puede ser anterior a la fecha actual.').should('be.visible');
    cy.request({method:'POST',url:'/api/memberships',body:{planId:1,startDate:date,requestKey:unique(),member:{name:'Fecha',identification:unique(),phone:'1'}},failOnStatusCode:false}).its('status').should('eq',400);
  });
  it('CP-007: pago separado, monto incorrecto y duplicados',()=>{
    login();const value=unique();
    cy.request('POST','/api/members',{name:'Pago Cypress',identification:value,phone:'70000005'}).then(member=>{
      const input={memberId:member.body.id,planId:1,startDate:businessToday(),requestKey:value};
      cy.request('POST','/api/memberships',input).then(membership=>{
        const body={membershipId:membership.body.id,amountCents:3000};
        cy.request({method:'POST',url:'/api/payments',body:{...body,amountCents:2999},failOnStatusCode:false}).its('status').should('eq',400);
        cy.request('GET','/api/memberships').then(response=>expect(response.body.find((m:{id:number})=>m.id===body.membershipId).status).to.eq('Pendiente'));
        cy.request('POST','/api/payments',body).its('status').should('eq',201);
        cy.request({method:'POST',url:'/api/payments',body,failOnStatusCode:false}).its('status').should('eq',409);
        cy.request({method:'POST',url:'/api/memberships',body:input,failOnStatusCode:false}).its('status').should('eq',409);
        cy.request('GET','/api/memberships').then(response=>expect(response.body.find((m:{id:number})=>m.id===body.membershipId).status).to.eq('Activa'));
      });
    });
  });
  it('CP-008: usuario desactivado pierde autorización',()=>{
    login();const value=unique(),user={name:'Desactivar',email:`${value}@test.local`,password:'TestClave123!',role:'receptionist'};
    cy.request('POST','/api/users',user).then(response=>{
      const userId=response.body.id;
      cy.request('POST','/api/auth/login',user);cy.getCookie('stronghub_session').then(cookie=>{
        const token=cookie!.value;login();cy.request('PATCH',`/api/users/${userId}`,{...user,active:false});
        cy.setCookie('stronghub_session',token);cy.request({url:'/api/members',failOnStatusCode:false}).its('status').should('eq',401);
        cy.request({method:'POST',url:'/api/auth/login',body:user,failOnStatusCode:false}).its('status').should('eq',401);
      });
    });
  });
});
