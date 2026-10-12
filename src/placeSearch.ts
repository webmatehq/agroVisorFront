export type PlaceResult = {id:string;name:string;description:string;latitude:number;longitude:number;zoom:number};
export function coordinateResult(input:string):PlaceResult|null {
 const match=input.trim().replaceAll('−','-').match(/^([+-]?\d+(?:\.\d+)?)\s*[,;]\s*([+-]?\d+(?:\.\d+)?)$/);
 if(!match)return null;
 const latitude=Number(match[1]),longitude=Number(match[2]);
 if(latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)throw new Error('La latitud debe estar entre −90 y 90, y la longitud entre −180 y 180.');
 return {id:'coordinates',name:'Coordenadas',description:`${latitude}, ${longitude}`,latitude,longitude,zoom:17};
}
export async function searchPlaces(input:string,signal:AbortSignal):Promise<PlaceResult[]> {
 const coordinates=coordinateResult(input);if(coordinates)return [coordinates];
 const name=input.trim();if(name.length<3)throw new Error('Escribe al menos tres letras o introduce latitud, longitud.');
 const url=new URL('https://geocoding-api.open-meteo.com/v1/search');
 url.search=new URLSearchParams({name,count:'7',language:'es',format:'json',countryCode:'EC'}).toString();
 const response=await fetch(url,{signal});if(!response.ok)throw new Error('No se pudo consultar el buscador. Inténtalo de nuevo.');
 const data=await response.json();if(data.error)throw new Error('No se pudo consultar el buscador.');
 return (data.results||[]).filter((p:any)=>Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)).map((p:any)=>({id:String(p.id),name:String(p.name),description:[p.admin2,p.admin1,p.country].filter(Boolean).join(', '),latitude:p.latitude,longitude:p.longitude,zoom:14}));
}
