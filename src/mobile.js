/**
 * Mobile and tablet controls for SECTOR Studio.
 * Editor panels become drawers; play mode uses a virtual directional pad
 * and drag-to-look on the right half of the viewport.
 */
export function installMobile(renderer, callbacks) {
  const tools = document.querySelector('aside.tools');
  const inspector = document.querySelector('aside.inspector');
  const header = document.querySelector('header');
  const workspace = document.querySelector('.workspace');
  const mapWrap = document.getElementById('mapWrap');
  const viewWrap = document.getElementById('viewWrap');
  const toolbar = document.createElement('div');
  toolbar.className = 'mobile-toolbar';
  toolbar.innerHTML = '<button type="button" id="toggleTools" aria-expanded="false" aria-controls="mobileTools">☰ Tools</button><button type="button" id="toggleInspector" aria-expanded="false" aria-controls="mobileInspector">⚙ Properties</button><span class="mobile-mode-label">SECTOR Studio</span>';
  header.after(toolbar);
  tools.id = 'mobileTools';
  inspector.id = 'mobileInspector';
  const close = () => {
    tools.classList.remove('drawer-open');
    inspector.classList.remove('drawer-open');
    toolbar.querySelectorAll('button').forEach(b => b.setAttribute('aria-expanded','false'));
  };
  const toggle = (target, button) => {
    const wasOpen = target.classList.contains('drawer-open');
    close();
    if (!wasOpen) {
      target.classList.add('drawer-open');
      button.setAttribute('aria-expanded','true');
    }
  };
  toolbar.querySelector('#toggleTools').onclick = e => toggle(tools,e.currentTarget);
  toolbar.querySelector('#toggleInspector').onclick = e => toggle(inspector,e.currentTarget);
  tools.addEventListener('click',e=>{if(e.target.closest('button')&&window.innerWidth<850)close()});
  const controls = document.createElement('div');
  controls.className = 'touch-controls';
  controls.setAttribute('aria-label','Touch movement controls');
  controls.innerHTML = '<div class="touch-dpad"><button data-key="KeyW" class="up" aria-label="Move forward">▲</button><button data-key="KeyA" class="left" aria-label="Strafe left">◀</button><button data-key="KeyS" class="down" aria-label="Move backward">▼</button><button data-key="KeyD" class="right" aria-label="Strafe right">▶</button></div><div class="touch-look-hint">Drag here to look around ↔</div><button class="touch-run" data-key="ShiftLeft" aria-label="Run">RUN</button>';
  viewWrap.append(controls);
  for(const b of controls.querySelectorAll('[data-key]')){
    const key=b.dataset.key;
    const press=e=>{e.preventDefault();e.stopPropagation();renderer.keys.add(key);b.classList.add('pressed');try{b.setPointerCapture(e.pointerId)}catch{}};
    const release=e=>{e.preventDefault();e.stopPropagation();renderer.keys.delete(key);b.classList.remove('pressed')};
    b.addEventListener('pointerdown',press);
    for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,release);
  }
  const look=controls.querySelector('.touch-look-hint');
  let lastX=null;
  look.addEventListener('pointerdown',e=>{e.preventDefault();lastX=e.clientX;look.setPointerCapture(e.pointerId)});
  look.addEventListener('pointermove',e=>{if(lastX===null||!renderer.active)return;renderer.angle-=(e.clientX-lastX)*.008;lastX=e.clientX});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])look.addEventListener(type,()=>{lastX=null});
  document.getElementById('play').addEventListener('click',close);
  document.getElementById('mapTab').addEventListener('click',close);
  document.getElementById('viewTab').addEventListener('click',close);
  // Avoid sticky movement when focus changes or the app goes into background.
  window.addEventListener('blur',()=>renderer.keys.clear());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)renderer.keys.clear()});
  // Pinch zoom for the 2D map is implemented in the editor's canvas handlers.
  const pointers=new Map();let previousDistance=0;
  mapWrap.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY})},{passive:true});
  mapWrap.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId))return;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2){
      const [a,b]=[...pointers.values()];
      const distance=Math.hypot(a.x-b.x,a.y-b.y);
      if(previousDistance>0)callbacks.zoom(distance/previousDistance);
      previousDistance=distance;
    }
  },{passive:true});
  const end=e=>{pointers.delete(e.pointerId);if(pointers.size<2)previousDistance=0};
  mapWrap.addEventListener('pointerup',end);
  mapWrap.addEventListener('pointercancel',end);
  // Prevent long-press selection while manipulating the map.
  mapWrap.addEventListener('contextmenu',e=>e.preventDefault());
}
