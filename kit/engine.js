/* محرك رحلات الإنتاج الكتابي — رحلة ونس */
(function(){
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const $=s=>document.querySelector(s);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function norm(s){return String(s||'').replace(/[ً-ْٰـ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[^ء-ي0-9٠-٩\s]/g,' ').replace(/\s+/g,' ').trim()}
const wc=s=>{const t=norm(s);return t?t.split(' ').length:0};
/* finds which items of list appear as word-starts (with و/ف/ب/ل/ك prefixes allowed) */
function found(s,list){const n=' '+norm(s)+' ';return [...new Set(list.filter(w=>{const k=norm(w);return [' ',' و',' ف',' ب',' ل',' ك',' وب',' ول',' فل',' ال',' وال',' فال',' بال',' لل',' كال',' وبال',' ولل'].some(p=>n.includes(p+k))}))]}
function foundWord(s,list){const ws=norm(s).split(' ').map(w=>w.replace(/^[وف]/,''));return [...new Set(list.filter(w=>ws.includes(norm(w))))]}
const P=(emo,bg,cap)=>`<div class="panel bg${bg||0}">${emo}${cap?`<span class="cap">${cap}</span>`:''}</div>`;
function simile(s){const n=' '+norm(s)+' ';return /كأن/.test(s||'')||/\s[وف]?كان(ه|ها|هما|هم)\s/.test(n)||/\s[وف]?كال\S{2,}/.test(n)||/\s[وف]?(مثل|يشبه|تشبه)\s/.test(n)}
const T={AR,esc,norm,wc,found,foundWord,P,shuffle,simile};
window.Kit=T;

window.Journey=function(J){
  document.documentElement.lang='ar';document.documentElement.dir='rtl';
  let store={stars:{},drafts:{}};
  try{const s=JSON.parse(localStorage.getItem(J.key));if(s)store=Object.assign(store,s)}catch(e){}
  const save=()=>{try{localStorage.setItem(J.key,JSON.stringify(store))}catch(e){}};
  const setStars=(id,n)=>{if((store.stars[id]||0)<n){store.stars[id]=n;save()}};
  const starStr=n=>'<span class="stars">'+[1,2,3].map(i=>i<=n?'★':'<span class="off">★</span>').join('')+'</span>';
  const ST=J.stations;
  const go=id=>{location.hash=id?'#'+id:'#home'};
  const head=id=>{const s=ST.find(x=>x.id===id),n=ST.indexOf(s);return `<div class="stack" style="gap:6px;margin-bottom:18px"><div class="eyebrow">المحطة ${AR(n)}</div><h2>${s.t}</h2><p class="muted">${s.d}</p></div>`};
  const nextId=id=>{const i=ST.findIndex(s=>s.id===id);return ST[i+1]?ST[i+1].id:null};
  const prog=(n,i)=>`<div class="progress">${Array.from({length:n},(_,j)=>`<span class="${j<i?'on':j===i?'now':''}"></span>`).join('')}</div>`;
  function result(el,id,score,total){
    const pct=total?score/total:1, stars=pct>=.9?3:pct>=.6?2:1; setStars(id,stars); const nx=nextId(id);
    el.innerHTML=head(id)+`<div class="card result"><div class="big">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
     <h3>أنهيت المحطة: ${AR(score)} من ${AR(total)}</h3><p class="muted">${stars===3?'أداء ممتاز! أنت جاهز للمحطة التالية.':stars===2?'جيد جدًا. راجع الأخطاء ثم جرّب مرة أخرى لتحصل على ثلاث نجوم.':'لا بأس، المهارة تُبنى بالتكرار. أعد المحطة واقرأ تفسير كل إجابة.'}</p>
     <div class="row" style="justify-content:center"><button class="btn ghost" id="again">أعد المحطة</button><button class="btn" id="nx">${nx?'المحطة التالية ←':'خريطة الرحلة'}</button></div></div>`;
    $('#again').onclick=route;$('#nx').onclick=()=>go(nx||'home');
  }

  function home(el){
    el.innerHTML=`<section class="hero"><div class="stack" style="gap:6px"><div class="eyebrow">${J.eyebrow}</div><h1>${J.title}</h1><p class="lead">${J.lead}</p></div><div>${J.hero||''}</div></section>
     <nav class="map">${ST.map((s,i)=>`<button class="station ${store.stars[s.id]?'done':''}" data-id="${s.id}"><span class="st-num">${AR(i)}</span><span><div class="st-title">${s.t}</div><div class="st-desc">${s.d}</div></span>${starStr(store.stars[s.id]||0)}</button>`).join('')}</nav>`;
    el.querySelectorAll('.station').forEach(b=>b.onclick=()=>go(b.dataset.id));
  }

  /* guide: S.top (html shown above), S.html (text with .k[data-k]), S.steps [{tag,txt,show:[]}] , S.after */
  function guide(el,S){
    let k=-1;
    const draw=()=>{const st=S.steps[k];
      el.innerHTML=head(S.id)+`<div class="card stack">
       <div class="steps"><button class="${k<0?'on':''}" data-i="-1">${S.first||'النص كاملًا'}</button>${S.steps.map((x,i)=>`<button class="${i===k?'on':''}" data-i="${i}">${AR(i+1)} ${x.tag}</button>`).join('')}</div>
       <div class="rule"><span class="tag">${st?st.tag:'اقرأ'}</span><p>${st?st.txt:S.intro}</p></div>
       ${S.top||''}<div class="passage gx">${S.html}</div>
       <div class="row" style="justify-content:space-between"><button class="btn ghost" id="pv" ${k<0?'disabled':''}>→ السابق</button>
       ${k<S.steps.length-1?'<button class="btn" id="nx">التالي ←</button>':`<button class="btn alt" id="done">${S.doneLabel||'فهمت ←'}</button>`}</div></div>${S.after||''}`;
      if(st)el.querySelectorAll('.gx .k').forEach(x=>{if(st.show.includes(x.dataset.k))x.classList.add('lit')});
      el.querySelectorAll('.steps button').forEach(b=>b.onclick=()=>{k=+b.dataset.i;draw()});
      $('#pv').onclick=()=>{if(k>-1){k--;draw()}};
      if($('#nx'))$('#nx').onclick=()=>{k++;draw()};
      if($('#done'))$('#done').onclick=()=>{setStars(S.id,3);go(nextId(S.id)||'home')};
    };draw();
  }

  /* quiz: S.items [{passage,prompt,options[{t,ok,why}],tip}] */
  function quiz(el,S){
    const order=S.keepFirst?[S.items[0]].concat(shuffle(S.items.slice(1))):shuffle(S.items); let i=0,score=0;
    const draw=()=>{const it=order[i];let tried=false,done=false;const opts=shuffle(it.options);
      el.innerHTML=head(S.id)+`<div class="card stack">${prog(order.length,i)}
       ${it.passage?`<div class="passage">${it.passage.replace('____','<span class="blank" id="blank">؟</span>')}</div>`:''}<h3>${it.prompt}</h3>
       <div class="opts">${opts.map((o,j)=>`<button class="opt" data-j="${j}">${o.t}</button>`).join('')}</div>
       <div id="fb" class="stack" style="gap:10px"></div>
       <div class="row" style="justify-content:flex-end"><button class="btn" id="nx" hidden>${i<order.length-1?'التالي ←':'النتيجة ←'}</button></div></div>`;
      el.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(done)return;const o=opts[+b.dataset.j];
        if(o.ok){done=true;if(!tried)score++;b.classList.add('right');el.querySelectorAll('.opt').forEach(x=>x.disabled=true);
          const bl=$('#blank');if(bl){bl.textContent=o.t;bl.classList.add('filled')}
          $('#fb').innerHTML=`<div class="fb good"><b>${tried?'صحيح الآن.':'إجابة صحيحة!'}</b> ${o.why}</div>`+(it.tip?`<div class="fb tip"><b>قاعدة:</b> ${it.tip}</div>`:'');$('#nx').hidden=false;$('#nx').focus()}
        else{tried=true;b.classList.add('wrong');b.disabled=true;$('#fb').innerHTML=`<div class="fb bad"><b>ليست هذه.</b> ${o.why} جرّب مرة أخرى.</div>`}});
      $('#nx').onclick=()=>{i++;i<order.length?draw():result(el,S.id,score,order.length)};
    };draw();
  }

  /* order: S.tasks [{title,prompt,items[html],why}], S.big for picture cards */
  function order(el,S){
    let p=0,score=0;
    const draw=()=>{const Tk=S.tasks[p];let pool=shuffle(Tk.items.map((_,i)=>i));while(pool.every((v,i)=>v===i))pool=shuffle(pool);let ans=[],first=true,locked=0;
      const paint=state=>{
        el.innerHTML=head(S.id)+`<div class="card stack ${S.big?'order-big':''}">${prog(S.tasks.length,p)}
         <h3>${Tk.title}</h3><p class="muted small">${Tk.prompt||'اضغط على الجزء لتضعه في المكان التالي، واضغط على جزء موضوع لتعيده.'}</p>
         <div class="slots">${Tk.items.map((_,i)=>{const v=ans[i];const cls=v===undefined?'':'filled'+(state&&state[i]!==undefined?(state[i]?' right':' wrong'):'');
           return `<button class="slot ${cls}" data-i="${i}" ${v===undefined||i<locked?'disabled':''}><span class="no">${AR(i+1)}</span><span>${v===undefined?'<span class="muted small">…</span>':Tk.items[v]}</span></button>`}).join('')}</div>
         ${pool.length?`<div class="eyebrow">اختر من هنا</div><div class="pool">${pool.map(v=>`<button class="card-pick" data-v="${v}">${Tk.items[v]}</button>`).join('')}</div>`:''}
         <div id="fb"></div>
         <div class="row" style="justify-content:flex-end"><button class="btn" id="ck" ${pool.length?'hidden':''}>تحقّق</button><button class="btn ghost" id="rt" hidden>أعد المحاولة</button><button class="btn" id="nx" hidden>${p<S.tasks.length-1?'التالي ←':'النتيجة ←'}</button></div></div>`;
        el.querySelectorAll('.card-pick').forEach(b=>b.onclick=()=>{const v=+b.dataset.v;pool=pool.filter(x=>x!==v);ans.push(v);paint()});
        el.querySelectorAll('.slot.filled').forEach(b=>b.onclick=()=>{if(state)return;const i=+b.dataset.i;if(i<locked)return;pool=pool.concat(ans.splice(i));paint()});
        $('#ck').onclick=()=>{const st=ans.map((v,i)=>v===i);
          if(st.every(Boolean)){if(first)score++;paint(st);$('#ck').hidden=true;$('#fb').innerHTML=`<div class="fb good"><b>ترتيب صحيح!</b> ${Tk.why}</div>`;$('#nx').hidden=false;$('#nx').onclick=()=>{p++;p<S.tasks.length?draw():result(el,S.id,score,S.tasks.length)}}
          else{first=false;paint(st);$('#ck').hidden=true;let pre=0;while(st[pre])pre++;
            $('#fb').innerHTML=`<div class="fb bad"><b>${AR(st.filter(Boolean).length)} من ${AR(st.length)} في مكانها الصحيح.</b> ${S.hint||''}</div>`;
            $('#rt').hidden=false;$('#rt').onclick=()=>{locked=pre;pool=shuffle(ans.splice(pre));paint()}}};
      };paint();
    };draw();
  }

  /* sort: S.cats [{k,label}], S.items [{t,a,why,pic}] */
  function sort(el,S){
    const order=shuffle(S.items);let i=0,score=0;
    const draw=()=>{const it=order[i];let done=false,tried=false;
      el.innerHTML=head(S.id)+`<div class="card stack">${prog(order.length,i)}
       ${it.pic||''}<div class="passage" style="text-align:center">${it.t}</div><h3 style="text-align:center">${S.ask||'إلى أي مجموعة ينتمي؟'}</h3>
       <div class="sorter n${S.cats.length}">${S.cats.map((c,j)=>`<button class="c${j}" data-a="${c.k}">${c.label}</button>`).join('')}</div>
       <div id="fb"></div><div class="row" style="justify-content:flex-end"><button class="btn" id="nx" hidden>${i<order.length-1?'التالي ←':'النتيجة ←'}</button></div></div>`;
      el.querySelectorAll('.sorter button').forEach(b=>b.onclick=()=>{if(done)return;
        if(b.dataset.a===it.a){done=true;if(!tried)score++;b.classList.add('right');el.querySelectorAll('.sorter button').forEach(x=>x.disabled=true);$('#fb').innerHTML=`<div class="fb good"><b>${tried?'صحيح الآن.':'صحيح!'}</b> ${it.why}</div>`;$('#nx').hidden=false;$('#nx').focus()}
        else{tried=true;b.classList.add('wrong');b.disabled=true;$('#fb').innerHTML=`<div class="fb bad">${S.retry||'فكّر مرة أخرى.'}</div>`}});
      $('#nx').onclick=()=>{i++;i<order.length?draw():result(el,S.id,score,order.length)};
    };draw();
  }

  /* tap: S.tasks [{title,sents[],bad[],fix{i:text},why}] — mark the sentences that don't belong */
  function tap(el,S){
    const order=S.keepOrder?S.tasks:shuffle(S.tasks);let p=0,score=0,total=0;
    const draw=()=>{const Tk=order[p];const flag=Tk.sents.map(()=>false);let checked=false;const nb=Tk.bad.length;
      el.innerHTML=head(S.id)+`<div class="card stack">${prog(order.length,p)}
       <h3>${Tk.title}</h3><p class="muted small">${S.prompt||'اضغط على الجملة التي لا تناسب، ثم اضغط «تحقّق».'} ${nb>1?`(في هذا النص ${AR(nb)} جمل)`:''}</p>
       <div class="passage trimtext">${Tk.sents.map((s,j)=>`<span class="sent" data-j="${j}" role="button" tabindex="0">${s}</span>`).join(' ')}</div>
       <div id="fb" class="stack" style="gap:10px"></div>
       <div class="row" style="justify-content:flex-end"><button class="btn" id="ck">تحقّق</button><button class="btn" id="nx" hidden>${p<order.length-1?'التالي ←':'النتيجة ←'}</button></div></div>`;
      const tg=sp=>{if(checked)return;const j=+sp.dataset.j;flag[j]=!flag[j];sp.classList.toggle('del',flag[j])};
      el.querySelectorAll('.sent').forEach(sp=>{sp.onclick=()=>tg(sp);sp.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tg(sp)}}});
      $('#ck').onclick=()=>{checked=true;let r=0;
        el.querySelectorAll('.sent').forEach(sp=>{const j=+sp.dataset.j,isBad=Tk.bad.includes(j),ok=isBad===flag[j];if(ok)r++;sp.classList.add(ok?'ok':'no');sp.style.cursor='default';
          if(isBad){sp.classList.add('del');if(Tk.fix&&Tk.fix[j])sp.insertAdjacentHTML('afterend',`<span class="fixnote">✎ ${Tk.fix[j]}</span>`)}});
        total+=Tk.sents.length;score+=r;
        $('#fb').innerHTML=`<div class="fb ${r===Tk.sents.length?'good':'tip'}"><b>${AR(r)} من ${AR(Tk.sents.length)} قرارات صحيحة.</b> ${Tk.why}</div>`;
        $('#ck').hidden=true;$('#nx').hidden=false};
      $('#nx').onclick=()=>{p++;p<order.length?draw():result(el,S.id,score,total)};
    };draw();
  }

  /* write: S.tasks [{id,title,kind,task,pics?,fields[{k,label,ph,ta,pic}],model}], S.checks(Tk,d)->[{ok,t}], S.meters(Tk,d)->[{lbl,val,note,cls}] */
  function write(el,S){
    let cur=S.tasks[0].id;
    const draw=()=>{const Tk=S.tasks.find(t=>t.id===cur);
      const d=store.drafts[cur]=Object.assign({},store.drafts[cur]||{});Tk.fields.forEach(f=>{if(d[f.k]==null)d[f.k]=''});
      el.innerHTML=head(S.id)+`<div class="stack">
       <div class="tabs">${S.tasks.map(t=>`<button class="tab ${t.id===cur?'on':''}" data-id="${t.id}"><b>${t.title}</b><small>${t.kind||''}</small></button>`).join('')}</div>
       <div class="fb tip">${Tk.task}</div>
       ${Tk.tips?`<details class="card"><summary style="cursor:pointer;font-weight:700">أفكار تساعدك</summary><div class="small" style="margin-top:8px">${Tk.tips}</div></details>`:''}
       <div class="card stack">${Tk.fields.map(f=>{const inp=f.ta?`<textarea id="f-${cur}-${f.k}" data-k="${f.k}" placeholder="${esc(f.ph||'')}">${esc(d[f.k])}</textarea>`:`<input id="f-${cur}-${f.k}" data-k="${f.k}" value="${esc(d[f.k])}" placeholder="${esc(f.ph||'')}">`;
          const box=`<div class="fld"><label for="f-${cur}-${f.k}">${f.label}</label>${f.hint?`<span class="hint">${f.hint}</span>`:''}${inp}<span class="cnt" data-c="${f.k}" style="font-size:.8rem;color:var(--muted);align-self:flex-end"></span></div>`;
          return f.pic?`<div class="wpanel">${f.pic}${box}</div>`:box}).join('')}
        <div class="meters" id="meters"></div><div id="tags"></div>
        <div class="row" style="justify-content:flex-end"><button class="btn ghost" id="cp">انسخ ما كتبت</button><button class="btn" id="rv">راجع كتابتي</button></div>
        <div id="report" class="stack"></div></div></div>`;
      el.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{cur=b.dataset.id;draw()});
      const live=()=>{Tk.fields.forEach(f=>{const c=el.querySelector(`[data-c="${f.k}"]`);if(c&&f.ta){const n=wc(d[f.k]);c.textContent=`${AR(n)} كلمة${f.min?(n<f.min?' · الأقل '+AR(f.min):' ✓'):''}`}});
        const all=Tk.fields.filter(f=>f.ta).map(f=>d[f.k]).join(' ');
        const ms=S.meters(Tk,d,all);$('#meters').innerHTML=ms.map(m=>`<div class="meter ${wc(all)<8?'':m.cls}"><span class="lbl">${m.lbl}</span><span class="val">${m.val}</span><span class="note">${m.note||''}</span></div>`).join('');
        $('#tags').innerHTML=S.tags?S.tags(Tk,d,all):''};
      el.querySelectorAll('[data-k]').forEach(x=>x.oninput=()=>{d[x.dataset.k]=x.value;save();live();$('#report').innerHTML=''});
      live();
      $('#cp').onclick=()=>{const txt=Tk.fields.map(f=>d[f.k]).filter(Boolean).join('\n\n');try{navigator.clipboard.writeText(txt).then(()=>{$('#cp').textContent='نُسخ ✓';setTimeout(()=>{const b=$('#cp');if(b)b.textContent='انسخ ما كتبت'},1500)},()=>{})}catch(e){}};
      $('#rv').onclick=()=>{const all=Tk.fields.filter(f=>f.ta).map(f=>d[f.k]).join(' ');
        if(wc(all)<15){$('#report').innerHTML='<div class="fb bad">اكتب أولًا، ثم راجع.</div>';return}
        const c=S.checks(Tk,d,all),met=c.filter(x=>x.ok).length,n=c.length,stars=met===n?3:met>=n-2?2:1;setStars(S.id,stars);
        $('#report').innerHTML=`<div class="card stack" style="background:var(--bg)"><div class="row" style="justify-content:space-between"><h3>تقرير المراجعة: ${AR(met)} من ${AR(n)}</h3>${starStr(stars)}</div>
         <ul class="check">${c.map(x=>`<li><span class="${x.ok?'mark-ok':'mark-no'}">${x.ok?'✓':'✗'}</span><span>${x.t}</span></li>`).join('')}</ul>
         ${S.selfCheck?`<div class="fb tip"><b>راجع بنفسك أيضًا:</b> ${S.selfCheck}</div>`:''}
         <p class="muted small">المراجع الآلي يبحث عن كلمات وعلامات في كتابتك، فقد يخطئ أحيانًا. الحكم الأخير لمعلّمك.</p>
         ${Tk.model?'<button class="btn ghost" id="sm">اعرض نموذجًا</button><div id="mdl"></div>':''}</div>`;
        if(Tk.model)$('#sm').onclick=()=>{$('#mdl').innerHTML=`<div class="final">${Tk.model}</div><p class="muted small">قارن نموذجك بهذا: ماذا أضاف؟ كيف بدأ وكيف ختم؟</p>`;$('#sm').hidden=true};
        $('#report').scrollIntoView({behavior:'smooth',block:'start'})};
    };draw();
  }

  const VIEWS={guide,quiz,order,sort,tap,write};
  function route(){
    const id=(location.hash||'').slice(1)||'home';const S=ST.find(s=>s.id===id);
    $('#nav').innerHTML=S?'<button class="back" id="homeBtn">→ خريطة الرحلة</button>':`<span class="credit-top">${J.sub||''}</span>`;
    if(S)$('#homeBtn').onclick=()=>go('home');
    const app=$('#app');app.innerHTML='';
    S?VIEWS[S.type](app,S):home(app);window.scrollTo(0,0);
  }
  window.addEventListener('hashchange',route);route();
};
})();
