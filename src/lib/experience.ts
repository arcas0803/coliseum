import * as T from 'three';
import {ArchitectureWorld} from './architecture-world';
import {chapters,type TourPose} from './tour';
import {historicalCopy} from './historical-copy';
const root=document.querySelector<HTMLElement>('#experience')!;
const host=document.querySelector<HTMLElement>('#webgl-world')!;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const track=document.querySelector<HTMLElement>('#tour-track')!;
const progressbar=document.querySelector<HTMLElement>('#tour-progress')!;
const chapterNav=document.querySelector<HTMLElement>('#chapter-nav')!;
const previous=document.querySelector<HTMLButtonElement>('#previous-chapter')!;
const next=document.querySelector<HTMLButtonElement>('#next-chapter')!;
let world:ArchitectureWorld,active=-1,current=0,target=0,raf=0,last=performance.now(),disposed=false;
let viewportHeight=innerHeight;
const offsets=()=>{const values=[0];for(let i=0;i<chapters.length-1;i++)values.push(values[i]+Math.max(650,viewportHeight*(chapters[i].scrollSpan||1.8)));return values;};
let chapterOffsets=offsets();
function scrollProgress(y:number){let index=0;while(index<chapterOffsets.length-2&&y>=chapterOffsets[index+1])index++;return T.MathUtils.clamp(index+(y-chapterOffsets[index])/(chapterOffsets[index+1]-chapterOffsets[index]),0,chapters.length-1);}
function scrollPosition(progress:number){const index=Math.min(chapters.length-2,Math.floor(progress));return T.MathUtils.lerp(chapterOffsets[index],chapterOffsets[index+1],progress-index);}
const paths=chapters.slice(1).map((chapter,i)=>{
 const nodes=[chapters[i].pose,...(chapter.via||[]),chapter.pose];
 return {position:new T.CatmullRomCurve3(nodes.map(n=>new T.Vector3(...n.position)),false,'centripetal'),target:new T.CatmullRomCurve3(nodes.map(n=>new T.Vector3(...n.target)),false,'centripetal')};
});
const scalarKeys=['fov','section','roof','deck','ground','lift','gate','hatch'] as const;
const smooth=(x:number)=>{const t=T.MathUtils.clamp(x,0,1);return t*t*t*(t*(t*6-15)+10);};
function sample(progress:number):TourPose{
 const index=Math.min(chapters.length-1,Math.floor(progress)),a=chapters[index].pose;
 if(index===chapters.length-1)return {...a};
 const b=chapters[index+1].pose,local=progress-index,u=smooth((local-.08)/.8),curve=paths[index];
 let cameraU=u;
 if(chapters[index+1].id==='velarium')cameraU=smooth(local/.5);
 if(chapters[index+1].id==='ordenes')cameraU=smooth((local-.32)/.62);
 const frame={...a,position:curve.position.getPointAt(cameraU).toArray(),target:curve.target.getPointAt(cameraU).toArray()} as TourPose;
 for(const key of scalarKeys)frame[key]=T.MathUtils.lerp(a[key],b[key],u);
 if(chapters[index+1].id==='maquinaria'){frame.hatch=smooth(local/.3);frame.deck=smooth(local/.4);}
 if(chapters[index+1].id==='elevacion'){
  const height=5.2*smooth((local-.08)/.8);frame.lift=height;frame.position=[-11.3,2.7+height,-2.7];
  const look=smooth((local-.72)/.23),direction=new T.Vector3(-.7,-1.5,-1.3).normalize().lerp(new T.Vector3(0,.1,-60).normalize(),look).normalize();frame.target=new T.Vector3(...frame.position).addScaledVector(direction,25).toArray() as [number,number,number];
 }
 if(chapters[index+1].id==='conjunto'){
  const walk=smooth(local/.25),z=T.MathUtils.lerp(-2.7,4,walk),angle=Math.PI*2*smooth((local-.4)/.56);frame.position=[-11.3,7.9,z];frame.target=[-11.3+Math.sin(angle)*60,8,z-Math.cos(angle)*60];frame.hatch=1-smooth((local-.25)/.15);
 }
 if(chapters[index+1].id==='hipogeo')frame.deck=1-smooth((local-.12)/.76);
 if(chapters[index+1].id==='velarium')frame.roof=smooth((local-.35)/.6);
 if(chapters[index+1].id==='ordenes'){const closing=smooth((local-.02)/.36);frame.section=1-closing;frame.roof=1-closing;}

 return frame;
}
function showChapter(index:number){
 if(active===index)return;if(active>=0&&!reduced.matches)document.querySelector('.chapter-story')!.animate([{opacity:.2},{opacity:1}],{duration:450,easing:'ease-out'});active=index;const chapter={...chapters[index],...historicalCopy[chapters[index].id]};root.dataset.chapter=chapter.id;
 document.querySelector('#chapter-label')!.textContent=chapter.label;
 document.querySelector('#chapter-date')!.textContent=chapter.date;
 document.querySelector('#chapter-title')!.textContent=chapter.title;
 document.querySelector('#chapter-text')!.textContent=chapter.text;
 document.querySelector('#chapter-why')!.textContent=chapter.why;
 document.querySelector('#chapter-note')!.textContent=chapter.note;
 document.querySelector('#chapter-count')!.textContent=String(index+1).padStart(2,'0')+' / '+String(chapters.length).padStart(2,'0');
 document.querySelector('#current-chapter')!.textContent=chapter.label;
 document.querySelector('#announcement')!.textContent=`${index+1} de ${chapters.length}. ${chapter.label}. ${chapter.title}`;
 const source=document.querySelector<HTMLAnchorElement>('#chapter-source')!;source.hidden=!chapter.source;if(chapter.source)source.href=chapter.source;source.textContent=`Fuente: ${chapter.sourceLabel} ↗`;source.title='Parco archeologico del Colosseo · Abrir en una nueva pestaña';
 chapterNav.querySelectorAll('button').forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
 previous.disabled=index===0;next.disabled=index===chapters.length-1;
 history.replaceState({chapter:chapter.id},'',`#${chapter.id}`);
}
function readScroll(){target=scrollProgress(scrollY);}
function resize(preserve=false){const progress=scrollProgress(scrollY);viewportHeight=innerHeight;chapterOffsets=offsets();track.style.height=(chapterOffsets.at(-1)!+innerHeight)+'px';if(preserve)window.scrollTo({top:scrollPosition(progress),behavior:'instant'});readScroll();}
function toChapter(index:number){window.scrollTo({top:scrollPosition(T.MathUtils.clamp(index,0,chapters.length-1)),behavior:reduced.matches?'instant':'smooth'});}
function tick(now:number){
 if(disposed)return;raf=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.2);last=now;
 current=reduced.matches?target:current+(target-current)*(1-Math.exp(-dt*4.2));if(Math.abs(current-target)<.0005)current=target;
 const index=Math.min(chapters.length-1,Math.floor(current+.35));showChapter(index);
 const frame=reduced.matches?chapters[index].pose:sample(current);world.guidedFrame(frame);
 progressbar.style.transform=`scaleX(${current/(chapters.length-1)})`;
 const percent=String(Math.round(current/(chapters.length-1)*100));if(progressbar.parentElement!.getAttribute('aria-valuenow')!==percent)progressbar.parentElement!.setAttribute('aria-valuenow',percent);
}
for(const [index,chapter] of chapters.entries()){
 const label=historicalCopy[chapter.id].label;
 const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',`${index+1}. ${label}`);button.title=label;button.innerHTML='<span></span>';button.addEventListener('click',()=>toChapter(index));chapterNav.append(button);
}
const themeToggle=document.querySelector<HTMLButtonElement>('#theme-toggle')!;
function applyTheme(){
 const dark=document.documentElement.dataset.theme==='dark';
 themeToggle.setAttribute('aria-pressed',String(dark));themeToggle.title=dark?'Activar modo claro':'Activar modo oscuro';
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#171f1b':'#e9ece4');
 world?.setTheme(dark);
}
function toggleTheme(){document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('coliseum-theme',document.documentElement.dataset.theme);}catch{}applyTheme();}
themeToggle.addEventListener('click',toggleTheme);
applyTheme();
const story=document.querySelector<HTMLElement>('.chapter-story')!;
const storyObserver=new ResizeObserver(()=>root.style.setProperty('--story-height',`${story.offsetHeight}px`));storyObserver.observe(story);
const initial=location.hash.slice(1),initialIndex=chapters.findIndex(c=>c.id===initial);
try{
 world=new ArchitectureWorld(host,()=>{},()=>{});root.dataset.engine='3d';applyTheme();resize();
 if(initialIndex>0){window.scrollTo({top:scrollPosition(initialIndex),behavior:'instant'});readScroll();}else readScroll();
 current=target;showChapter(Math.min(chapters.length-1,Math.floor(current+.35)));world.guidedFrame(sample(current));raf=requestAnimationFrame(tick);
 Object.defineProperty(window,'coliseum',{configurable:true,value:{get state(){return {...world.state,chapter:chapters[active]?.id,progress:current,scrollTarget:target}},project:(point:[number,number,number])=>world.project(point)}});
}catch(error){document.querySelector('#chapter-text')!.textContent='No se pudo iniciar la escena. Recarga la página con la aceleración gráfica activada.';root.dataset.engine='unavailable';console.error(error);}
const onScroll=()=>readScroll(),onResize=()=>resize(true);window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onResize);
previous.addEventListener('click',()=>toChapter(active-1));next.addEventListener('click',()=>toChapter(active+1));
const home=document.querySelector<HTMLAnchorElement>('.brand')!;home.addEventListener('click',event=>{event.preventDefault();toChapter(0);});
const onKey=(event:KeyboardEvent)=>{if(event.target instanceof HTMLElement&&event.target.closest('button,a,input,textarea,summary'))return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();toChapter(active+(event.key==='ArrowRight'?1:-1));}};
document.addEventListener('keydown',onKey);
const hashChange=()=>{const index=chapters.findIndex(c=>c.id===location.hash.slice(1));if(index>=0)toChapter(index);};window.addEventListener('hashchange',hashChange);
if(import.meta.hot)import.meta.hot.dispose(()=>{disposed=true;storyObserver.disconnect();themeToggle.removeEventListener('click',toggleTheme);cancelAnimationFrame(raf);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onResize);window.removeEventListener('hashchange',hashChange);document.removeEventListener('keydown',onKey);world?.destroy();});
