
function go(id,btn){
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    if(btn)btn.classList.add('active');
    const body=document.querySelector('.site-body');
    if(id==='markets'){body.classList.add('markets-wide');}
    else{body.classList.remove('markets-wide');}
    // Lazy load news only when tab is clicked
    if(id==='news' && document.getElementById('feed').querySelector('.loading')){
        loadNews();
    }
    if(id==='analysis' && document.getElementById('art-feed').querySelector('.loading')){
        loadAnalysis();
    }
    window.scrollTo({top:0,behavior:'smooth'});
}

function searchStock(){
    const q=document.getElementById('stock-search-input').value.trim().toUpperCase();
    if(!q)return;
    window.open('https://www.tradingview.com/symbols/'+q+'/', '_blank');
}

function submitNewsletter(e){
    e.preventDefault();
    const emailEl = document.getElementById('nl-email') || document.getElementById('nl-email-home');
    const email = e.target.querySelector('input[type="email"]').value;
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled=true; btn.style.opacity='.6';
    const url='https://timetocompound.us13.list-manage.com/subscribe/post-json?u=e718b16a3b0cc8798bdcda989&id=edad42aae8&f_id=00b700e9f0&EMAIL='+encodeURIComponent(email)+'&c=mcCallback';
    window.mcCallback=function(data){
        if(data.result==='success'){
            btn.textContent='✅ Done!';
        } else {
            if(data.msg && data.msg.indexOf('already subscribed')>-1){
                btn.textContent='✅ Done!';
            } else {
                btn.textContent='❌ Try again';
            }
        }
        btn.disabled=false; btn.style.opacity='1';
        const s=document.getElementById('mc-jsonp');
        if(s) s.remove();
    };
    const script=document.createElement('script');
    script.id='mc-jsonp';
    script.src=url;
    document.body.appendChild(script);
    setTimeout(()=>{if(btn.disabled){btn.disabled=false;btn.style.opacity='1';}},5000);
}

function toggleLang(){document.body.classList.toggle('en');}

function toggleTheme(){
    const b=document.body,i=document.getElementById('theme-icon');
    if(b.getAttribute('data-theme')==='dark'){b.removeAttribute('data-theme');i.className='fas fa-moon';}
    else{b.setAttribute('data-theme','dark');i.className='fas fa-sun';}
}

const imgs=['prices-move-large.jpg','blockchain-large.jpg','compound-large.jpg','fed-large.jpg'];
function ri(){return imgs[Math.floor(Math.random()*imgs.length)];}
function fd(ds){return new Date(ds).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});}

const FEEDS=[
    {url:'https://finance.yahoo.com/news/rssindex',src:'Yahoo Finance'},
    {url:'https://www.investing.com/rss/news.rss',src:'Investing.com'},
    {url:'https://cointelegraph.com/rss',src:'CoinTelegraph'}
];

async function loadNews(){
    const container=document.getElementById('feed');
    const results=await Promise.all(FEEDS.map(f=>
        fetch('https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(f.url)+'&t='+Date.now())
        .then(r=>r.json()).then(d=>d.status==='ok'?d.items.map(i=>({...i,src:f.src})):[]).catch(()=>[])
    ));
    let items=results.flat().sort((a,b)=>new Date(b.pubDate)-new Date(a.pubDate));
    if(items.length>0){
        const h=items[0];
        document.getElementById('hero').innerHTML=`
        <div class="featured" onclick="window.open('${h.link}','_blank')">
            <div class="featured-img-wrap"><img src="compound-large.jpg" class="featured-img" alt="Featured"></div>
            <div class="featured-body">
                <div class="featured-kicker">${h.src}</div>
                <h2 class="featured-title">${h.title}</h2>
                <p class="featured-desc">${h.description.replace(/<[^>]*>?/gm,'').substring(0,200)}...</p>
                <div class="featured-meta">${fd(h.pubDate)}</div>
            </div>
        </div>`;
        items.shift();
    }
    container.innerHTML='';
    items.forEach(item=>{
        let desc=item.description.replace(/<[^>]*>?/gm,'').substring(0,110)+'...';
        container.innerHTML+=`
        <a href="${item.link}" target="_blank" class="art-card">
            <img src="${ri()}" alt="${item.src}" loading="lazy">
            <div class="art-body">
                <div class="art-kicker">${item.src}</div>
                <h3 class="art-title">${item.title}</h3>
                <p class="art-desc">${desc}</p>
                <div class="art-date">${fd(item.pubDate)}</div>
            </div>
        </a>`;
    });
}

async function loadAnalysis(){
    fetch('https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent('https://www.investing.com/rss/market_overview.rss')+'&t='+Date.now())
    .then(r=>r.json()).then(data=>{
        const c=document.getElementById('art-feed'); c.innerHTML='';
        if(data.items) data.items.slice(0,6).forEach(item=>{
            let desc=item.description.replace(/<[^>]*>?/gm,'').substring(0,110)+'...';
            c.innerHTML+=`<a href="${item.link}" target="_blank" class="art-card">
                <img src="${ri()}" loading="lazy">
                <div class="art-body"><div class="art-kicker">Analysis</div><h3 class="art-title">${item.title}</h3><p class="art-desc">${desc}</p><div class="art-date">${fd(item.pubDate)}</div></div></a>`;
        });
    }).catch(()=>{});
}

// News & Analysis load lazily when their tab is clicked (see go() function)
// ── DYNAMIC ARTICLES FROM articles.json ──
const TAG_LABELS = {
  macro: 'Macro', beginner: 'Beginner', crypto: 'Crypto',
  investing: 'Investing', guide: 'Guide', new: 'New'
};

function buildTags(tags) {
  return tags.map(t => `<span class="tag tag-${t}">${TAG_LABELS[t] || t}</span>`).join('');
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'});
}

function buildCard(a) {
  const isFeatured = a.featured || a.tags.includes('new');
  const border = isFeatured ? 'style="border-left:3px solid var(--gold);"' : '';
  const meta = a.meta_el
    ? `<div class="analysis-meta"><span class="lang-el">${a.meta_el}</span><span class="lang-en">${a.meta_en}</span></div>`
    : a.readtime
      ? `<div class="analysis-meta">${fmtDate(a.date)} · ${a.readtime} min read</div>`
      : '';
  return `
    <a href="${a.id}.html" class="analysis-item" ${border}>
      <img src="${a.image}" alt="${a.title_en}" loading="lazy">
      <div class="analysis-body">
        <div class="analysis-tags">${buildTags(a.tags)}</div>
        <div class="lang-el"><h3 class="analysis-title">${a.title_el}</h3><p class="analysis-desc">${a.desc_el}</p></div>
        <div class="lang-en"><h3 class="analysis-title">${a.title_en}</h3><p class="analysis-desc">${a.desc_en}</p></div>
        ${meta}
      </div>
    </a>`;
}

async function loadArticles() {
  try {
    const res = await fetch('articles.json?t=' + Date.now());
    const articles = await res.json();

    // ── HOME: featured (latest article) + 4-card grid ──
    const allArticles = articles.filter(a => a.id !== 'calculator');
    const featured = allArticles[0];
    const gridArticles = allArticles.slice(1, 5);

    // Featured card
    const featEl = document.getElementById('home-featured');
    if (featured) {
      featEl.innerHTML = `
        <a href="${featured.id}.html" class="home-featured" style="text-decoration:none;color:inherit;">
          <div class="home-feat-img-wrap">
            <img src="${featured.image}" class="home-feat-img" alt="${featured.title_en}">
          </div>
          <div class="home-feat-body">
            <div class="home-feat-kicker">
              ${TAG_LABELS[featured.tags[0]] || featured.tags[0]}
              ${featured.tags.includes('new') ? '<span class="home-feat-new">NEW</span>' : ''}
            </div>
            <div class="home-feat-title lang-el">${featured.title_el}</div>
            <div class="home-feat-title lang-en">${featured.title_en}</div>
            <div class="home-feat-desc lang-el">${featured.desc_el}</div>
            <div class="home-feat-desc lang-en">${featured.desc_en}</div>
            <div class="home-feat-meta">${fmtDate(featured.date)}${featured.readtime ? ' · ' + featured.readtime + ' min read' : ''}</div>
            <div class="home-feat-cta lang-el">Διάβασε το άρθρο →</div>
            <div class="home-feat-cta lang-en">Read article →</div>
          </div>
        </a>`;
    }

    // 2x2 grid
    const gridEl = document.getElementById('home-grid');
    gridEl.innerHTML = gridArticles.map(a => `
      <a href="${a.id}.html" class="home-art-card">
        <img src="${a.image}" alt="${a.title_en}" loading="lazy">
        <div class="home-art-body">
          <div class="home-art-kicker">${TAG_LABELS[a.tags[0]] || a.tags[0]}</div>
          <div class="home-art-title lang-el">${a.title_el}</div>
          <div class="home-art-title lang-en">${a.title_en}</div>
          <div class="home-art-desc lang-el">${a.desc_el}</div>
          <div class="home-art-desc lang-en">${a.desc_en}</div>
          <div class="home-art-meta">${fmtDate(a.date)}${a.readtime ? ' · ' + a.readtime + ' min' : ''}</div>
        </div>
      </a>`).join('');

    // ── MY ANALYSIS full list ──
    const myList = document.getElementById('my-list');
    const myArticles = articles.filter(a => a.section === 'my');
    myList.innerHTML = myArticles.map(buildCard).join('');

    // ── ACADEMY full list ──
    const acadList = document.getElementById('academy-list');
    const acadArticles = articles.filter(a => a.section === 'academy');
    acadList.innerHTML = acadArticles.map(buildCard).join('');

  } catch(e) {
    console.error('Could not load articles.json', e);
  }
}

loadArticles();

