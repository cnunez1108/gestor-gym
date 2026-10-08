'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
type Row = {id:number;name:string;identification?:string;phone?:string;email?:string;role?:string;active?:number};
export default function Records({kind}:{kind:'users'|'members'}) {
  const [rows,setRows]=useState<Row[]>([]), [edit,setEdit]=useState<number>(), [message,setMessage]=useState(''), [busy,setBusy]=useState(false);
  const empty={name:'',email:'',password:'',role:'receptionist',active:true,identification:'',phone:''};
  const [form,setForm]=useState(empty);
  const refresh=()=>api<Row[]>(kind).then(setRows);
  useEffect(()=>{api<Row[]>(kind).then(setRows).catch(e=>setMessage(e.message));},[kind]);
  async function submit(event:FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { await api(edit?`${kind}/${edit}`:kind,edit?'PATCH':'POST',form); await refresh(); setForm(empty);setEdit(undefined);setMessage('Registro guardado.'); }
    catch(e){setMessage((e as Error).message);} finally{setBusy(false);}
  }
  function select(row:Row){setEdit(row.id);setForm({...empty,...row,active:!!row.active});}
  return <div className="membership-container"><h1>{kind==='users'?'Usuarios':'Miembros'}</h1>
    <div className="membership-card"><h2>{edit?'Editar registro':'Nuevo registro'}</h2>
      <form onSubmit={submit}><div className="membership-form-grid">
        <div className="form-group"><label htmlFor="name">Nombre</label><input id="name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
        {kind==='members'?<>
          <div className="form-group"><label htmlFor="identification">Identificación</label><input id="identification" required value={form.identification} onChange={e=>setForm({...form,identification:e.target.value})}/></div>
          <div className="form-group"><label htmlFor="phone">Teléfono</label><input id="phone" required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
        </>:<>
          <div className="form-group"><label htmlFor="email">Correo</label><input id="email" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div className="form-group"><label htmlFor="password">Contraseña {edit?'(vacía para conservar)':''}</label><input id="password" type="password" minLength={8} required={!edit} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
          <div className="form-group"><label htmlFor="role">Rol</label><select id="role" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="admin">Administrador</option><option value="receptionist">Recepcionista</option></select></div>
          {edit !== undefined && <label><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Usuario activo</label>}
        </>}
      </div><p role="status">{message}</p><button className="membership-button" disabled={busy}>Guardar</button>
      {edit&&<button type="button" onClick={()=>{setEdit(undefined);setForm(empty);}}>Cancelar edición</button>}</form>
    </div>
    <div className="membership-card membership-table-wrapper"><table className="membership-table"><thead><tr><th>Nombre</th><th>{kind==='members'?'Identificación':'Correo'}</th><th>{kind==='members'?'Teléfono':'Rol / estado'}</th><th>Acciones</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{row.name}</td><td>{row.identification||row.email}</td><td>{row.phone||`${row.role==='admin'?'Administrador':'Recepcionista'} / ${row.active?'Activo':'Inactivo'}`}</td><td><button onClick={()=>select(row)}>Editar</button>{kind==='users'&&!!row.active&&<button onClick={async()=>{try{await api(`users/${row.id}`,'PATCH',{...row,active:false});await refresh();}catch(e){setMessage((e as Error).message);}}}>Desactivar</button>}</td></tr>)}</tbody></table></div>
  </div>;
}
