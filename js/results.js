(() => {
  const byId = id => document.getElementById(id);
  const panel=byId('result-leaderboard'), rank=byId('result-rank'), list=byId('result-ranking-list'), show=byId('show-result-leaderboard');
  let result=null;
  window.spellstormClearResult = () => { result=null; panel.hidden=true; show.hidden=true; byId('guest-progress').hidden=true; rank.textContent=''; list.replaceChildren(); };
  window.spellstormShowResult = (won,score,circle,best) => {
    window.spellstormClearResult();
    const duration=window.spellstormRunDuration?.() ?? 0;
    const current={won,score,save:window.spellstormResultSave?.()}; result=current;
    byId('again').textContent=won?'Play again':'Retry';
    show.hidden=!won; show.disabled=false;
    byId('final-score').textContent=score.toLocaleString();
    byId('run-details').textContent=`${won?'Circle 50 completed':`Highest circle: ${circle}`} · ${Math.floor(duration/60)}m ${duration%60}s`;
    byId('best-over').textContent=`Local best: ${best.toLocaleString()}`;
    Promise.resolve(current.save).then(saved => {
      if(result!==current) return;
      if(saved?.guest) byId('guest-progress').hidden=false;
      else if(saved?.saved) byId('best-over').textContent=`Personal best: ${Number(saved.best).toLocaleString()}${saved.newBest?' · New record!':''}`;
    });
  };
  show.addEventListener('click', async () => {
    if(!result?.won) return;
    const current=result; panel.hidden=false; show.disabled=true; rank.textContent='Loading leaderboard...'; list.replaceChildren();
    try {
      const saved=await current.save;
      if(result!==current || panel.hidden) return;
      if(!saved || saved.error) throw Error('Run unavailable');
      const response=await fetch(`rank-preview.php?mode=${saved.guest?'guest':'member'}&score=${encodeURIComponent(current.score)}`,{credentials:'same-origin',cache:'no-store'});
      if(!response.ok) throw Error('Leaderboard unavailable');
      const data=await response.json();
      if(result!==current || panel.hidden) return;
      rank.textContent=`${data.guest?'Guest — Unranked':data.name} · ${data.guest?'Temporary position':'Your current rank'} #${data.rank} · ${Number(data.score).toLocaleString()}${data.guest?' · Not saved':''}`;
      for(const row of data.rows){ const item=document.createElement('li'); const img=document.createElement('img'); img.src=`avatar.php?id=${encodeURIComponent(row.user_id)}`; img.alt=''; img.width=24; img.height=24; img.className='rounded-circle object-fit-cover me-2'; item.append(img,document.createTextNode(`#${row.rank}  ${row.username} · ${Number(row.score).toLocaleString()}`)); list.appendChild(item); }
      if(!data.rows.length){const item=document.createElement('li');item.textContent='No registered scores yet.';list.appendChild(item);}
    } catch (_) { if(result===current && !panel.hidden) rank.textContent='Leaderboard unavailable. Please try again.'; }
    finally { if(result===current) show.disabled=false; }
  });
  byId('close-result-leaderboard').addEventListener('click',()=>{panel.hidden=true;show.disabled=false;show.focus();});
})();
