export const DEFAULT_TEXTURES = {wall:'#6f7786',floor:'#343c49',ceiling:'#252b37'};
export function validateMap(map){
 const errors=[]; if(!Array.isArray(map.sectors)||!map.sectors.length)errors.push('Map needs at least one sector');
 for(const s of map.sectors||[]){if(!Array.isArray(s.points)||s.points.length<3)errors.push(`${s.id}: needs 3+ vertices`);if(s.ceiling<=s.floor)errors.push(`${s.id}: ceiling must exceed floor`);if(Math.abs(polygonArea(s.points||[]))<0.001)errors.push(`${s.id}: zero-area sector`)}
 return errors;
}
export function polygonArea(points){let sum=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];sum+=a.x*b.y-b.x*a.y;}return sum/2;}
export function pointInPolygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if(((a.y>y)!==(b.y>y))&&(x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x))inside=!inside;}return inside;}
export function distanceToSegment(x,y,a,b){const dx=b.x-a.x,dy=b.y-a.y;const t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a.x-t*dx,y-a.y-t*dy);}
export function canOccupy(map,x,y,radius=.22){return (map.sectors||[]).some(s=>pointInPolygon(x,y,s.points)&&s.points.every((p,i)=>distanceToSegment(x,y,p,s.points[(i+1)%s.points.length])>=radius));}
export function makeSector(points,id=`sector_${Date.now()}`){return {id,points,floor:0,ceiling:3.2,wallColor:DEFAULT_TEXTURES.wall,floorColor:DEFAULT_TEXTURES.floor,ceilingColor:DEFAULT_TEXTURES.ceiling};}