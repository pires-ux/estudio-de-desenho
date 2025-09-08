
/* ====== Variáveis ====== */
const gridCanvas = document.getElementById('gridCanvas');
const drawCanvas = document.getElementById('drawCanvas');
const canvasWrap = document.getElementById('canvasWrap');
const gctx = gridCanvas.getContext('2d');
const ctx = drawCanvas.getContext('2d');

let dpr = Math.max(1, window.devicePixelRatio || 1);
let tool = 'brush';
let color = '#111827';
let size = 8;
let drawing = false;
let last = { x: 0, y: 0 };
const history = [];
let historyIndex = -1;

/* ====== Funções ====== */
function resizeCanvases() {
  const rect = canvasWrap.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  dpr = window.devicePixelRatio || 1;
  [gridCanvas, drawCanvas].forEach(c => {
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    c.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
  });
  drawGrid();
}
function getPos(e){
  const rect = drawCanvas.getBoundingClientRect();
  if(e.touches) e = e.touches[0];
  return {x: e.clientX-rect.left, y: e.clientY-rect.top};
}
function startDraw(e){drawing=true;const p=getPos(e);last=p;ctx.beginPath();ctx.moveTo(p.x,p.y);}
function draw(e){if(!drawing)return;const p=getPos(e);ctx.globalCompositeOperation=tool==='eraser'?'destination-out':'source-over';ctx.strokeStyle=color;ctx.lineWidth=size;ctx.lineCap='round';ctx.lineTo(p.x,p.y);ctx.stroke();last=p;}
function endDraw(){if(!drawing)return;drawing=false;ctx.closePath();saveHistory();}
function saveHistory(){try{const data=drawCanvas.toDataURL();history.splice(historyIndex+1);history.push(data);if(history.length>50)history.shift();historyIndex=history.length-1;}catch{}}
function restore(i){const img=new Image();img.onload=()=>{ctx.clearRect(0,0,drawCanvas.width,drawCanvas.height);ctx.drawImage(img,0,0,drawCanvas.width/dpr,drawCanvas.height/dpr)};img.src=history[i];}
function undo(){if(historyIndex>0){historyIndex--;restore(historyIndex);}}
function redo(){if(historyIndex<history.length-1){historyIndex++;restore(historyIndex);}}
function drawGrid(){gctx.clearRect(0,0,gridCanvas.width,gridCanvas.height);if(!gridToggle.checked)return;gctx.strokeStyle='rgba(0,0,0,0.08)';for(let x=0;x<gridCanvas.width/dpr;x+=20){gctx.beginPath();gctx.moveTo(x,0);gctx.lineTo(x,gridCanvas.height/dpr);gctx.stroke();}for(let y=0;y<gridCanvas.height/dpr;y+=20){gctx.beginPath();gctx.moveTo(0,y);gctx.lineTo(gridCanvas.width/dpr,y);gctx.stroke();}}
function clearCanvas(){ctx.clearRect(0,0,drawCanvas.width,drawCanvas.height);saveHistory();}
function savePNG(){const link=document.createElement('a');link.download='desenho.png';link.href=drawCanvas.toDataURL();link.click();}
function importImage(file){const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{ctx.drawImage(img,0,0,drawCanvas.width/dpr,drawCanvas.height/dpr);saveHistory();};img.src=r.result;};r.readAsDataURL(file);}

/* ====== Controles ====== */
brushBtn.onclick=()=>{tool='brush';toolName.textContent='Pincel';};
eraserBtn.onclick=()=>{tool='eraser';toolName.textContent='Borracha';};
colorPicker.oninput=e=>{color=e.target.value;colorHex.value=color;};
colorHex.onchange=e=>{color=e.target.value;};
sizeRange.oninput=e=>{size=parseInt(e.target.value);sizeLabel.textContent=size;};
gridToggle.onchange=drawGrid;
saveBtn.onclick=savePNG;
undoBtn.onclick=undo;
redoBtn.onclick=redo;
clearBtn.onclick=clearCanvas;
fileInput.onchange=e=>{if(e.target.files[0])importImage(e.target.files[0]);};
document.querySelectorAll('.swatch').forEach(s=>s.onclick=()=>{color=s.dataset.color;colorPicker.value=color;colorHex.value=color;});

/* ====== Eventos ====== */
drawCanvas.addEventListener('mousedown',startDraw);
drawCanvas.addEventListener('mousemove',draw);
window.addEventListener('mouseup',endDraw);
drawCanvas.addEventListener('touchstart',startDraw,{passive:false});
drawCanvas.addEventListener('touchmove',draw,{passive:false});
window.addEventListener('touchend',endDraw);
window.addEventListener('resize',resizeCanvases);

/* ====== Atalhos ====== */
window.addEventListener('keydown',e=>{
  const ctrl=e.ctrlKey||e.metaKey;
  if(ctrl&&e.key==='z'){e.preventDefault();undo();}
  if(ctrl&&e.key==='y'){e.preventDefault();redo();}
  if(ctrl&&e.key==='s'){e.preventDefault();savePNG();}
});

/* ====== Inicial ====== */
resizeCanvases();
saveHistory();