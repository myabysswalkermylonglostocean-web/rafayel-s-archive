const $ = s => document.querySelector(s);
let site, map = {};

const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function inline(s) {
  return esc(s)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}
const cells = r => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

function video(u) {
  const m = u.match(/(?:shorts\/|youtu\.be\/|v=|embed\/)([\w-]{11})/);
  if (!m) return `<p><a href="${esc(u)}">${esc(u)}</a></p>`;
  const short = /shorts\//.test(u);
  return `<div class="vid${short ? ' short' : ''}"><iframe src="https://www.youtube-nocookie.com/embed/${m[1]}" title="Video" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
}

function md(src) {
  const L = src.replace(/\r/g, '').split('\n'), o = [];
  let i = 0, m;
  while (i < L.length) {
    const l = L[i];
    if (!l.trim()) { i++; continue; }
    if ((m = l.match(/^\[video\]\((.+)\)\s*$/))) { o.push(video(m[1])); i++; }
    else if ((m = l.match(/^(#{1,4})\s+(.*)/))) { o.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); i++; }
    else if (/^---+$/.test(l)) { o.push('<hr>'); i++; }
    else if (l.startsWith('>')) {
      const b = []; while (i < L.length && L[i].startsWith('>')) b.push(L[i++].replace(/^>\s?/, ''));
      o.push(`<blockquote>${md(b.join('\n'))}</blockquote>`);
    } else if (/^\s*[-*]\s/.test(l)) {
      const b = []; while (i < L.length && /^\s*[-*]\s/.test(L[i])) b.push(`<li>${inline(L[i++].replace(/^\s*[-*]\s/, ''))}</li>`);
      o.push(`<ul>${b.join('')}</ul>`);
    } else if (l.includes('|') && /^\s*\|?\s*:?-{2,}/.test(L[i + 1] || '')) {
      const h = cells(l); i += 2; const rows = [];
      while (i < L.length && L[i].includes('|')) rows.push(cells(L[i++]));
      o.push(`<div class="tw"><table><thead><tr>${h.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    } else {
      const b = [];
      while (i < L.length && L[i].trim() && !/^(#{1,4}\s|>|---+$)/.test(L[i])) b.push(inline(L[i++]));
      o.push(`<p>${b.join('<br>')}</p>`);
    }
  }
  return o.join('\n');
}

function flat(items, parent) {
  items.forEach(x => { x.parent = parent; map[x.slug] = x; if (x.children) flat(x.children, x); });
}
const link = x => `<a href="#/${x.slug}" data-s="${x.slug}">${x.title}</a>`;
function navHTML(items) {
  return '<ul>' + items.map(x => `<li${x.children ? ' class="has"' : ''}>${link(x)}${x.children ? '<ul class="sub">' + x.children.map(c => `<li>${link(c)}</li>`).join('') + '</ul>' : ''}</li>`).join('') + '</ul>';
}

function pick(i) {
  const p = site.hero.picks[i], img = $('#stageImg');
  img.style.opacity = 0;
  img.onload = () => { img.style.opacity = 1; };
  img.src = p.image; img.alt = p.title;
  $('#stageCap').textContent = p.title;
  document.querySelectorAll('#pickList button').forEach((b, j) => b.setAttribute('aria-pressed', j === i));
}

async function route() {
  const slug = location.hash.replace(/^#\/?/, '') || 'home';
  const node = map[slug];
  const page = $('#page');
  document.body.classList.remove('open');
  $('#menuBtn').setAttribute('aria-expanded', 'false');
  document.body.classList.toggle('home', slug === 'home');
  $('#hero').hidden = slug !== 'home';
  document.querySelectorAll('#nav a').forEach(a => a.classList.remove('on'));
  for (let p = node; p; p = p.parent) document.querySelectorAll(`#nav a[data-s="${p.slug}"]`).forEach(a => a.classList.add('on'));
  if (!node) { page.innerHTML = '<h1>Không tìm thấy trang</h1><p>Trang này không tồn tại. Hãy chọn một mục trong menu.</p>'; return; }

  const trail = []; for (let p = node.parent; p; p = p.parent) trail.unshift(`<a href="#/${p.slug}">${p.title}</a>`);
  $('#crumbs').innerHTML = slug === 'home' ? '' : ['<a href="#/home">Trang chủ</a>', ...trail, node.title].join(' / ');
  document.title = slug === 'home' ? site.title : `${node.title} – ${site.title}`;

  let html = '';
  try {
    const r = await fetch(`content/${slug}.md`);
    if (r.ok) html = md(await r.text());
  } catch (e) {}
  if (!html && !node.children) html = `<h1>${node.title}</h1><p>Trang này chưa có nội dung. Thêm bản dịch vào file <code>content/${slug}.md</code>.</p>`;
  if (!html) html = `<h1>${node.title}</h1>`;
  if (node.children) html += '<ul class="kids">' + node.children.map(c => `<li><a href="#/${c.slug}">${c.title}</a></li>`).join('') + '</ul>';
  page.innerHTML = html;
  window.scrollTo(0, 0);
}

(async function init() {
  site = await (await fetch('site.json')).json();
  flat(site.menu, null);
  $('#nav').innerHTML = navHTML(site.menu);
  const h = site.hero;
  $('#tagline').textContent = h.text;
  $('#cta').textContent = h.cta.label; $('#cta').href = '#/' + h.cta.slug;
  $('#more').href = '#/' + h.more;
  $('#pickList').innerHTML = h.picks.map((p, i) => `<button type="button" aria-label="${p.title}" aria-pressed="false" style="background-image:url('${p.image}')"></button>`).join('');
  document.querySelectorAll('#pickList button').forEach((b, i) => b.onclick = () => pick(i));
  pick(0);
  $('#foot').innerHTML = md(site.footer);
  $('#menuBtn').onclick = () => {
    const open = document.body.classList.toggle('open');
    $('#menuBtn').setAttribute('aria-expanded', open);
  };
  window.addEventListener('hashchange', route);
  route();
})();
