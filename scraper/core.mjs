export const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
export function vulnerability({rank,tableSize,form,venue,opponentRank}){
  const rankPressure=(rank-1)/Math.max(1,tableSize-1)*45;
  const formScore=form.reduce((n,r)=>n+(r==='L'?8:r==='D'?4:0),0);
  const venueScore=venue==='away'?8:2;
  const opponentScore=Math.max(0,(tableSize-opponentRank)/Math.max(1,tableSize-1)*7);
  return Math.max(0,Math.min(100,Math.round(rankPressure+formScore+venueScore+opponentScore)));
}
export function parseStandingTexts(rows){
  return rows.map(text=>{const line=clean(text);const m=line.match(/^(\d+)[\s.]*(.+?)(?:\s+\d+){5,}/);return m?{rank:Number(m[1]),team:clean(m[2])}:null}).filter(Boolean);
}
export function parseDateTime(raw,now=new Date()){
  const m=clean(raw).match(/(?:(\d{1,2})[./](\d{1,2})[./]?\s*)?(\d{1,2}):(\d{2})/);if(!m)return null;
  const d=new Date(now);d.setSeconds(0,0);if(m[1])d.setMonth(Number(m[2])-1,Number(m[1]));d.setHours(Number(m[3]),Number(m[4]));
  if(!m[1]&&d<now)d.setDate(d.getDate()+1);return d;
}
