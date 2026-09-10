import {chromium} from 'playwright';import {readFile,writeFile} from 'node:fs/promises';import {LEAGUES} from './leagues.mjs';import {clean,parseStandingTexts,parseDateTime,vulnerability} from './core.mjs';
const BASE='https://www.flashscore.com/football';const output=new URL('../dist/data/matches.json',import.meta.url);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function textRows(page,selector){return page.locator(selector).allTextContents()}
async function standings(page,league){
  await page.goto(`${BASE}/${league.path}/standings/`,{waitUntil:'domcontentloaded',timeout:45000});await page.waitForTimeout(2500);
  const consent=page.getByRole('button',{name:/accept|agree|consent/i}).first();if(await consent.isVisible().catch(()=>false))await consent.click().catch(()=>{});
  const rows=await textRows(page,"[class*='ui-table__row'], [class*='tableCellParticipant']");const parsed=parseStandingTexts(rows);
  const unique=[];for(const x of parsed)if(!unique.some(y=>y.rank===x.rank||y.team===x.team))unique.push(x);return unique.sort((a,b)=>a.rank-b.rank);
}
async function fixtures(page,league){
  await page.goto(`${BASE}/${league.path}/fixtures/`,{waitUntil:'domcontentloaded',timeout:45000});await page.waitForTimeout(2500);
  return page.locator("[class*='event__match']").evaluateAll(nodes=>nodes.map(n=>({text:n.innerText,home:n.querySelector("[class*='event__homeParticipant']")?.textContent,away:n.querySelector("[class*='event__awayParticipant']")?.textContent,time:n.querySelector("[class*='event__time']")?.textContent})).slice(0,40));
}
async function recentForm(page,league,team){
  await page.goto(`${BASE}/${league.path}/results/`,{waitUntil:'domcontentloaded',timeout:45000});await page.waitForTimeout(1800);
  const games=await page.locator("[class*='event__match']").evaluateAll((nodes,team)=>nodes.map(n=>({home:n.querySelector("[class*='event__homeParticipant']")?.textContent?.trim(),away:n.querySelector("[class*='event__awayParticipant']")?.textContent?.trim(),hs:Number(n.querySelector("[class*='event__score--home']")?.textContent),as:Number(n.querySelector("[class*='event__score--away']")?.textContent)})).filter(g=>g.home===team||g.away===team).slice(0,5),team);
  return games.map(g=>g.hs===g.as?'D':((g.home===team&&g.hs>g.as)||(g.away===team&&g.as>g.hs))?'W':'L');
}
const browser=await chromium.launch({headless:true});const page=await browser.newPage({locale:'en-GB',timezoneId:'Europe/Paris'});const matches=[];const errors=[];
for(const league of LEAGUES){try{const table=await standings(page,league);if(table.length<10)throw new Error(`classement illisible (${table.length} lignes)`);await sleep(900);const games=await fixtures(page,league);const candidates=table.slice(-5);
  for(const game of games){const low=candidates.find(x=>x.team===clean(game.home)||x.team===clean(game.away));if(!low)continue;const date=parseDateTime(game.time);if(!date)continue;const days=(date-Date.now())/86400000;if(days<-.5||days>2)continue;const venue=low.team===clean(game.home)?'home':'away';const opponent=venue==='home'?clean(game.away):clean(game.home);const opp=table.find(x=>x.team===opponent);if(!opp)continue;await sleep(450);const form=await recentForm(page,league,low.team);while(form.length<5)form.push('D');matches.push({league:league.name,bottomTeam:low.team,bottomRank:low.rank,tableSize:table.length,opponent,opponentRank:opp.rank,kickoff:date.toISOString(),venue,form,vulnerability:vulnerability({rank:low.rank,tableSize:table.length,form,venue,opponentRank:opp.rank})});}
}catch(error){errors.push(`${league.name}: ${error.message}`)}await sleep(1200)}await browser.close();
if(!matches.length){const old=JSON.parse(await readFile(output,'utf8'));console.error('Aucun match collecté. Dernières données conservées.');console.error(errors.join('\n'));if(!old.matches?.length)process.exitCode=1;else process.exitCode=2;}else{await writeFile(output,JSON.stringify({generatedAt:new Date().toISOString(),source:'Flashscore — pages publiques',errors,matches:matches.sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff))},null,2)+'\n');console.log(`${matches.length} matchs enregistrés; ${errors.length} championnats en erreur.`)}
