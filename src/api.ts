import {createClient} from '@supabase/supabase-js';
export const configured=Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
export const supabase=configured?createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_ANON_KEY):null;
const base=(import.meta.env.VITE_API_URL||'/api/v1').replace(/\/$/,'');
export async function api(path:string,method='GET',body?:unknown){
 const token=(await supabase?.auth.getSession())?.data.session?.access_token;
 const r=await fetch(base+path,{method,headers:{Authorization:`Bearer ${token||''}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.message||e.error?.message|| (typeof e.error==='string'?e.error:null)||`Error ${r.status}`)}
 if(r.status===204)return null;return r.json();
}
export async function exportEvents(parcelId:string,organizationId:string){const token=(await supabase?.auth.getSession())?.data.session?.access_token;const r=await fetch(base+`/events/export.csv?parcel_id=${encodeURIComponent(parcelId)}&organization_id=${encodeURIComponent(organizationId)}`,{headers:{Authorization:`Bearer ${token}`}});if(!r.ok)throw new Error('No se pudo exportar');const u=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=u;a.download='labores.csv';a.click();URL.revokeObjectURL(u)}
export function list(value:any):any[]{return Array.isArray(value)?value:value?.data||[]}
export function polygon(points:number[][]){if(points.length<3)throw new Error('Dibuja al menos tres puntos');return {type:'Polygon',coordinates:[[...points,[...points[0]]]]}}
