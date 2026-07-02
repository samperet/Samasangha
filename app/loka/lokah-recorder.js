/* eslint-disable */
// @ts-nocheck
// Vendored, unmodified Lokah Choir voice-collector widget (see README in the
// original drop). Driven from LokaWidgetRecorder.tsx.
/*
 * lokah-recorder.js — minimal Lokah Choir voice collector
 * Plays the main loop, shows scrolling subtitles, records a voice take, and hands
 * the audio back to your app (callback and/or upload). No dependencies.
 *
 * Usage (plain HTML or any bundler / Next.js client component):
 *   import { createLokahRecorder } from './lokah-recorder.js';
 *   const rec = createLokahRecorder('#choir', {
 *     loopUrl: '/lokah/loop.mp3',     // path to the bundled loop.mp3
 *     ballUrl: '/lokah/ball.png',     // optional; falls back to a dot
 *     uploadUrl: '/api/voices',       // optional: POST the recording here (FormData)
 *     onComplete: (blob, meta) => {}, // optional: receive the Blob yourself
 *   });
 *
 * Recorded takes start at the top of the loop, so they roughly line up with it
 * (fine-tune offsets later). meta = { name, loopMs, mime, sizeBytes }.
 */

const LYRICS =
`Lo-kah Sama-stah Sukhi-no Bha-van-tu
Lo-kah Sama-stah Sukhi-no Bha-van-tu
Lo-kah Sama-stah Sukhi-no Bha-van-tu
Lo-kah Sama-stah Sukhi-no Bha-van-tu
om
Shan-ti Shan-ti
om
Shan-ti Shan-ti
Shan-ti`;

// per-syllable timings (seconds from loop start), one per syllable
const TIMINGS = [1.908,3.237,4.741,6.024,7.405,8.769,11.086,11.469,12.125,12.775,14.168,15.434,16.763,18.104,19.393,21.685,22.045,22.725,23.375,24.652,26.074,27.427,28.686,29.969,32.239,32.645,33.365,34.015,35.321,36.674,37.998,39.234,40.569,42.949,43.286,43.942,46.014,49.991,50.844,51.297,52.62,56.475,60.544,61.496,61.85,63.22,66.982,72.2];

// Per-syllable melody notes, one per syllable — the melody drawn on the staff.
// Auto-detected from the loop with YIN pitch tracking (the four "Lokah…" repeats
// were averaged for a clean phrase); the phrase is roughly C# minor.
const NOTES = ["G#3","C#3","E3","F#3","E3","F#3","E3","E3","C#3","G#3","C#3","E3","F#3","E3","F#3","E3","E3","C#3","G#3","C#3","E3","F#3","E3","F#3","E3","E3","C#3","G#3","C#3","E3","F#3","E3","F#3","E3","E3","C#3","D3","D3","D3","D3","D3","D3","D3","D3","D3","C#3","C#3","D3"];

// Note name -> MIDI number, so each note can be placed on the staff by pitch.
function noteToMidi(name){
  const m=/^([A-G]#?)(-?\d)$/.exec(name); if(!m) return null;
  const idx={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11}[m[1]];
  return idx==null?null:idx+(parseInt(m[2],10)+1)*12;
}
const NOTE_MIDIS=NOTES.map(noteToMidi).filter(m=>m!=null);
const NOTE_MIN=Math.min.apply(null,NOTE_MIDIS), NOTE_MAX=Math.max.apply(null,NOTE_MIDIS);

const CSS = `
.lokah-rec{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#2c2616;max-width:640px}
.lokah-rec .lk-stage{background:#eaf2fc;border:1px solid #cfe0f5;border-radius:14px;padding:6px;overflow:hidden}
.lokah-rec .lk-cv{display:block;width:100%;height:168px}
.lokah-rec .lk-controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px}
.lokah-rec button{font:inherit;border-radius:10px;padding:9px 16px;cursor:pointer;border:1px solid #e6d8b8;background:#f4ecd6;color:#2c2616;transition:.12s}
.lokah-rec button:hover{background:#ecdfbf}
.lokah-rec .lk-rec{background:linear-gradient(180deg,#e0524f,#b3322f);border-color:transparent;color:#fff;font-weight:600}
.lokah-rec .lk-rec:hover{filter:brightness(1.06)}
.lokah-rec .lk-rec.lk-recording{animation:lk-pulse 1.1s infinite}
@keyframes lk-pulse{0%,100%{box-shadow:0 0 0 0 rgba(224,82,79,.5)}50%{box-shadow:0 0 0 8px rgba(224,82,79,0)}}
.lokah-rec .lk-name{font:inherit;border:1px solid #e6d8b8;border-radius:10px;padding:8px 10px;background:#fffdf6;color:#2c2616;min-width:150px}
.lokah-rec .lk-status{color:#94865f;font-size:13px}
.lokah-rec .lk-selfview{display:none;width:100%;max-height:240px;margin-top:10px;border-radius:14px;background:#000;object-fit:cover;transform:scaleX(-1)}`;

function injectCSS(){ if(document.getElementById('lokah-rec-css'))return;
  const s=document.createElement('style'); s.id='lokah-rec-css'; s.textContent=CSS; document.head.appendChild(s); }

function buildUnits(){
  const lines = LYRICS.split('\n').filter(l=>l.trim()).map(line=>({
    words: line.trim().split(/\s+/).flatMap(word =>
      word.split(/[-‐-―−－]/).filter(Boolean).map((s,i)=>({text:s, ws:i===0, t:null})) )
  }));
  const flat=[]; lines.forEach(l=>l.words.forEach(w=>flat.push(w)));
  flat.forEach((w,i)=>{ w.t = i<TIMINGS.length ? TIMINGS[i] : null; w.note = i<NOTES.length ? NOTES[i] : null; w.midi = w.note ? noteToMidi(w.note) : null; });
  return lines;
}

export function createLokahRecorder(target, options){
  const host = typeof target==='string' ? document.querySelector(target) : target;
  if(!host) throw new Error('lokah-recorder: target element not found');
  const opt = Object.assign({ loopUrl:'loop.mp3', ballUrl:'ball.png', uploadUrl:null,
    fieldName:'voice', onComplete:null, onError:null, collectName:true,
    showControls:true, loopOnce:false, onRecordStart:null, withVideo:false }, options||{});
  injectCSS();

  const lines = buildUnits();

  host.classList.add('lokah-rec');
  host.innerHTML =
    '<div class="lk-stage"><canvas class="lk-cv"></canvas></div>'+
    (opt.withVideo ? '<video class="lk-selfview" autoplay muted playsinline></video>' : '')+
    (opt.showControls ?
    '<div class="lk-controls">'+
      (opt.collectName?'<input class="lk-name" placeholder="Your name (optional)" maxlength="40">':'')+
      '<button class="lk-play" type="button">Play loop</button>'+
      '<button class="lk-rec" type="button">Record</button>'+
      '<span class="lk-status"></span>'+
    '</div>' : '');

  const cv=host.querySelector('.lk-cv'), g=cv.getContext('2d');
  const playBtn=host.querySelector('.lk-play'), recBtn=host.querySelector('.lk-rec');
  const statusEl=host.querySelector('.lk-status'), nameEl=host.querySelector('.lk-name');
  const selfView=host.querySelector('.lk-selfview');

  const audio=new Audio(); audio.src=opt.loopUrl; audio.loop=true; audio.preload='auto';
  const ball=new Image(); let ballReady=false; ball.onload=()=>{ballReady=true;}; if(opt.ballUrl) ball.src=opt.ballUrl;

  const dpr=()=>window.devicePixelRatio||1;
  function size(){ const r=cv.getBoundingClientRect(); cv.width=Math.max(2,r.width)*dpr(); cv.height=Math.max(2,r.height)*dpr(); g.setTransform(dpr(),0,0,dpr(),0,0); }

  function draw(){
    const w=cv.width/dpr(), h=cv.height/dpr(); g.clearRect(0,0,w,h);
    const lt=audio.currentTime;                 // loop=true makes this wrap 0..duration
    const fs=Math.round(h*0.165), wordGap=fs*0.82, lineGap=fs*2.4;
    g.font='600 '+fs+'px -apple-system,BlinkMacSystemFont,sans-serif'; g.textBaseline='middle';
    const hyW=g.measureText('-').width;
    const units=[]; let x=0;
    lines.forEach((line,li)=>{ if(li>0)x+=lineGap;
      line.words.forEach((u,wi)=>{ if(wi>0&&u.ws)x+=wordGap;
        const lead=u.ws?0:hyW, tw=g.measureText(u.text).width;
        units.push({u,x,cx:x+lead+tw/2,w:lead+tw}); x+=lead+tw; }); });
    const timed=units.filter(z=>z.u.t!=null);
    let syll=units.length?units[0].cx:0, frac=0, lin=syll;
    if(timed.length){ let cur=null,next=null;
      for(let i=0;i<timed.length;i++){ if(timed[i].u.t<=lt){cur=timed[i];next=timed[i+1]||null;} else {if(!cur)next=timed[i];break;} }
      if(cur&&next){ frac=Math.max(0,Math.min(1,(lt-cur.u.t)/Math.max(0.001,next.u.t-cur.u.t))); syll=cur.cx+(next.cx-cur.cx)*frac; }
      else if(cur){ syll=cur.cx; } else if(next){ syll=next.cx; }
      let n=timed.length,st=0,sx=0; for(let i=0;i<n;i++){st+=timed[i].u.t;sx+=timed[i].cx;}
      const mt=st/n,mx=sx/n; let num=0,den=0; for(let i=0;i<n;i++){const dt=timed[i].u.t-mt;num+=dt*(timed[i].cx-mx);den+=dt*dt;}
      lin=mx+(den>1e-6?num/den:0)*(lt-mt);
    }
    const markerX=w*0.5, scrollX=markerX-lin;

    // ── Staff (top): five lines + treble clef, with a note-head for every
    //    syllable placed by pitch and scrolling in step with the words below. ──
    const staffGap=h*0.066, staffTop=h*0.12, staffBot=staffTop+staffGap*4, clefW=h*0.30;
    g.strokeStyle='rgba(120,145,180,0.55)'; g.lineWidth=1.25;
    for(let k=0;k<5;k++){ const y=Math.round(staffTop+k*staffGap)+0.5;
      g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
    const rng=Math.max(1,NOTE_MAX-NOTE_MIN), stepPx=staffGap/2;          // line/space = half a "step"
    const noteY=(m)=> staffBot - Math.round(((m-NOTE_MIN)/rng)*8)*stepPx; // snap to the nearest line/space
    const headRx=staffGap*0.66, headRy=staffGap*0.48, midY=(staffTop+staffBot)/2;
    units.forEach(z=>{ if(z.u.midi==null) return; const cx=z.cx+scrollX; if(cx<-headRx||cx>w+headRx) return;
      const y=noteY(z.u.midi), lit=z.u.t!=null&&z.u.t<=lt, col=lit?'#2f6fc0':'rgba(120,145,180,0.5)';
      g.strokeStyle=col; g.lineWidth=Math.max(1.4,staffGap*0.14); g.beginPath();   // stem: up for low notes, down for high
      if(y>=midY){ g.moveTo(cx+headRx*0.9,y-headRy*0.3); g.lineTo(cx+headRx*0.9,y-staffGap*2.7); }
      else       { g.moveTo(cx-headRx*0.9,y+headRy*0.3); g.lineTo(cx-headRx*0.9,y+staffGap*2.7); }
      g.stroke();
      g.save(); g.translate(cx,y); g.rotate(-0.33);                                 // tilted filled note-head
      g.beginPath(); g.ellipse(0,0,headRx,headRy,0,0,7); g.fillStyle=col; g.fill(); g.restore(); });

    // ── Lyrics (bottom) ──
    const baseY=h*0.88;
    g.font='600 '+fs+'px -apple-system,BlinkMacSystemFont,sans-serif'; g.textBaseline='middle';
    units.forEach(z=>{ const sx=z.x+scrollX; if(sx>w+60||sx+z.w<-60)return;
      if(!z.u.ws){ g.fillStyle='rgba(120,145,180,0.5)'; g.fillText('-',sx,baseY); }
      g.fillStyle=(z.u.t!=null&&z.u.t<=lt)?'#2f6fc0':'#5c7a99'; g.fillText(z.u.text, sx+(z.u.ws?0:hyW), baseY); });

    // fade the scroll-in/out edges; the wider left fade clears a margin for the clef
    const fade=(a,b)=>{ const gr=g.createLinearGradient(a,0,b,0); gr.addColorStop(0,'rgba(234,242,252,1)'); gr.addColorStop(1,'rgba(234,242,252,0)'); g.fillStyle=gr; g.fillRect(Math.min(a,b),0,Math.abs(b-a),h); };
    fade(0,clefW); fade(w,w-42);

    // treble clef ("the fancy S"), pinned at the left over the fade
    g.save(); g.textAlign='center'; g.textBaseline='alphabetic';
    g.font=(staffGap*9)+'px "Bravura","Noto Music",Georgia,"Times New Roman",serif';
    g.fillStyle='#27517f'; g.fillText('\u{1D11E}', clefW*0.46, staffBot+staffGap*1.2);
    g.restore();

    // ── Karaoke pointer: the winged heart bounces on top of the words ──
    const bw=Math.round(h*0.22), bh=ballReady?bw*ball.naturalHeight/ball.naturalWidth:bw*0.45;
    const bx=Math.max(bw/2,Math.min(w-bw/2, markerX+(syll-lin))), by=baseY-fs*0.95-Math.sin(Math.PI*frac)*(fs*0.7);
    if(ballReady) g.drawImage(ball, bx-bw/2, by-bh/2, bw, bh);
    else { g.beginPath(); g.arc(bx,by,Math.max(5,h*0.05),0,7); g.fillStyle='#fff'; g.fill(); g.lineWidth=2; g.strokeStyle='#2f6fc0'; g.stroke(); }
    g.textBaseline='alphabetic';
  }

  let raf=0; function frame(){ draw(); raf=requestAnimationFrame(frame); }
  size(); frame(); window.addEventListener('resize', size);

  function setStatus(msg, err){ if(!statusEl) return; statusEl.textContent=msg||''; statusEl.style.color=err?'#b3322f':''; }

  if(playBtn) playBtn.onclick=()=>{ if(audio.paused){ audio.play().catch(()=>{}); playBtn.textContent='Pause'; }
    else { audio.pause(); playBtn.textContent='Play loop'; } };

  // ---- recording ----
  let mediaRec=null, chunks=[], stream=null, recording=false, lastBlob=null;
  let videoActive=!!opt.withVideo;   // may drop to audio-only if no camera is available
  function ext(m){ return /mp4|m4a|aac/.test(m)?'mp4':/ogg/.test(m)?'ogg':'webm'; }

  // Show the live camera in the self-view once we have a stream with video.
  function attachSelf(){
    if(!selfView || !stream) return;
    try{ selfView.srcObject=stream; selfView.style.display='block'; const p=selfView.play&&selfView.play(); if(p&&p.catch) p.catch(()=>{}); }catch(e){}
  }

  // Best MediaRecorder mime for the active capture mode.
  function pickMime(){
    if(typeof MediaRecorder==='undefined' || !MediaRecorder.isTypeSupported) return '';
    const vids=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'];
    const auds=['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/mp4'];
    return (videoActive?vids:auds).find(t=>MediaRecorder.isTypeSupported(t))||'';
  }

  // Acquire the mic (and the camera, when withVideo) ahead of time so the
  // permission prompt doesn't interrupt a count-in. If the camera can't be
  // opened we fall back to audio-only. record() reuses the cached stream.
  async function getStream(){
    if(stream) return true;
    const aud={echoCancellation:true,noiseSuppression:true,autoGainControl:false};
    if(videoActive){
      try{ stream=await navigator.mediaDevices.getUserMedia({audio:aud,video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}}}); attachSelf(); return true; }
      catch(e){ videoActive=false; }   // no camera / denied — carry on with audio only
    }
    try{ stream=await navigator.mediaDevices.getUserMedia({audio:aud}); return true; }
    catch(e){ setStatus('Microphone blocked: '+(e.message||e.name), true); if(opt.onError) opt.onError(e); return false; }
  }

  // Returns true once the mic (and camera, when asked) is granted.
  async function prepareMic(){ return getStream(); }

  // "Bless" the audio element with a gesture-initiated (muted) play so a later
  // timer-driven play() (e.g. after a count-in) isn't blocked by autoplay rules.
  // Call this from within a click handler.
  function unlock(){
    try{
      audio.muted=true;
      const p=audio.play();
      const done=()=>{ try{ audio.pause(); audio.currentTime=0; }catch(e){} audio.muted=false; };
      if(p&&typeof p.then==='function') p.then(done).catch(()=>{ audio.muted=false; });
      else done();
    }catch(e){ audio.muted=false; }
  }

  // Start a take. Can be driven by the built-in button or programmatically via
  // the returned handle's record(). With loopOnce, the loop plays a single pass
  // and recording auto-stops when it ends. Returns true if it started.
  async function startRecording(){
    if(recording) return false;
    if(!await getStream()) return false;
    const mime=pickMime();
    const recOpts=mime?{mimeType:mime}:undefined;
    if(recOpts && videoActive) recOpts.videoBitsPerSecond=2500000;   // keep video takes a sane size
    try{ mediaRec=new MediaRecorder(stream, recOpts); }
    catch(e){ try{ mediaRec=new MediaRecorder(stream); }catch(e2){ setStatus('Recording not supported here', true); if(opt.onError) opt.onError(e2); return false; } }
    chunks=[]; mediaRec.ondataavailable=e=>{ if(e.data&&e.data.size) chunks.push(e.data); };
    mediaRec.onstop=onRecStop;
    if(opt.loopOnce) audio.loop=false;                    // record a single pass
    audio.currentTime=0; await audio.play().catch(()=>{});
    if(playBtn) playBtn.textContent='Pause';
    audio.onended=()=>{ if(recording) stopRecording(); };  // auto-stop at loop end
    mediaRec.start(); recording=true;
    if(recBtn){ recBtn.textContent='Stop'; recBtn.classList.add('lk-recording'); }
    setStatus('Recording — sing along…');
    if(opt.onRecordStart){ try{ opt.onRecordStart(); }catch(e){} }
    return true;
  }
  function stopRecording(){ if(recording && mediaRec){ try{mediaRec.stop();}catch(e){} } }

  if(recBtn) recBtn.onclick=()=>{ recording ? stopRecording() : startRecording(); };

  async function onRecStop(){
    recording=false; audio.onended=null;
    if(recBtn){ recBtn.textContent='Record'; recBtn.classList.remove('lk-recording'); }
    if(!chunks.length){ setStatus('Nothing recorded — try again', true); if(opt.onError) opt.onError(new Error('Nothing recorded')); return; }
    const blob=new Blob(chunks,{type:(mediaRec&&mediaRec.mimeType)||(videoActive?'video/webm':'audio/webm')}); lastBlob=blob;
    const meta={ name: nameEl?nameEl.value.trim():'', loopMs: Math.round((audio.duration||0)*1000), mime: blob.type, sizeBytes: blob.size,
      hasVideo: !!(videoActive && stream && stream.getVideoTracks && stream.getVideoTracks().length>0) };
    if(opt.onComplete){ try{ opt.onComplete(blob, meta); }catch(e){} }
    if(opt.uploadUrl){
      setStatus('Uploading…');
      try{
        const fd=new FormData(); fd.append(opt.fieldName, blob, 'voice.'+ext(blob.type));
        if(meta.name) fd.append('name', meta.name); fd.append('loopMs', String(meta.loopMs));
        const res=await fetch(opt.uploadUrl,{method:'POST',body:fd}); if(!res.ok) throw new Error('HTTP '+res.status);
        setStatus('Saved — thank you for your voice!');
      }catch(e){ setStatus('Upload failed: '+e.message, true); if(opt.onError) opt.onError(e); }
    } else if(opt.onComplete){ setStatus('Recorded — passed to your app.'); }
    else { setStatus('Recorded, but no uploadUrl or onComplete is set.', true); }
  }

  return {
    play:()=>audio.play(), pause:()=>audio.pause(),
    prepare:()=>prepareMic(), unlock:()=>unlock(),
    record:()=>startRecording(), stopRecording:()=>stopRecording(),
    isRecording:()=>recording, getLastRecording:()=>lastBlob,
    destroy(){ cancelAnimationFrame(raf); window.removeEventListener('resize', size); audio.pause();
      if(selfView){ try{ selfView.srcObject=null; }catch(e){} }
      if(stream) stream.getTracks().forEach(t=>t.stop()); host.innerHTML=''; host.classList.remove('lokah-rec'); }
  };
}

export default createLokahRecorder;
