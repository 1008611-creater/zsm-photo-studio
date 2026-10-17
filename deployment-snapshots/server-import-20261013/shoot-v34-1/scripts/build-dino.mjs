// One editable vector description produces both the SVG illustration and Rive scene.
// No raster source is edited; no Rive scripts or account signing are required.
import {mkdirSync,writeFileSync} from 'node:fs';
const edge='#83ad93',dark='#343a31';
const gradients={
 mint:{from:'#d6f4d8',mid:'#b2dec0',to:'#80b294',x:-45,y:-66,r:138},
 arm:{from:'#d2efd4',mid:'#a6d6b7',to:'#78a98b',x:-9,y:-16,r:45},
 cream:{from:'#fffdef',mid:'#f6efd9',to:'#dcd0b5',x:-35,y:-22,r:115},
 eye:{from:'#505345',mid:'#34392e',to:'#22291f',x:-2,y:-4,r:11},
 spike:{from:'#cff0d1',mid:'#a9d6b5',to:'#7baa8b',x:-9,y:-18,r:49}
};
const ellipse=(name,x,y,w,h,fill,stroke='',opacity=1)=>({name,x,y,w,h,fill,stroke,opacity,kind:'ellipse'});
const rect=(name,x,y,w,h,fill,r=0)=>({name,x,y,w,h,fill,r,kind:'rect'});
const group=(name,id,x,y,children,opacity=1)=>({name,id,x,y,children,opacity,kind:'group'});
// Detached Bezier handles preserve the plump, continuous silhouette of the ANS original.
const path=(name,x,y,vertices,fill,stroke='',closed=true)=>({name,x,y,vertices,fill,stroke,closed,kind:'path'});
const eye=side=>[ellipse(side+' Eye',side==='Left'?-37:37,0,11,15,'eye'),ellipse(side+' Glint',side==='Left'?-39:35,-4,2,2.5,'#e5eddc','',.35)];
const drawing=[
 ellipse('Shadow',121,235,148,12,'#cad9ce','',.5),
 group('Body','0:10',120,216,[
  path('Tail',0,0,[[66,-35,66,-24,76,-42],[103,-15,107,-34,112,-3],[100,3,109,9,91,6],[63,-2,68,8,62,-9]],'mint',edge),
  ellipse('Left Spike',-10,-180,40,58,'spike',edge),ellipse('Middle Spike',30,-169,31,46,'spike',edge),ellipse('Right Spike',60,-151,24,38,'spike',edge),
  path('Silhouette',0,0,[[-83,-85,-82,-65,-100,-125],[-19,-164,-60,-164,17,-171],[65,-143,46,-164,88,-117],[84,-65,92,-88,79,-42],[88,-10,92,-26,78,20],[0,18,62,35,-47,28],[-76,4,-71,27,-89,-12],[-74,-58,-93,-36,-78,-64]],'mint',edge),
  ellipse('Belly Shadow',0,-31,111,99,'#83ac92','',.28),
  ellipse('Belly',-2,-34,113,94,'cream'),
  ellipse('Chin Shadow',0,-86,137,42,'#769d82','',.18),
  ellipse('Muzzle',-1,-95,148,53,'cream'),
  {name:'Smile',kind:'smile',x:0,y:-103,fill:'',stroke:dark},
  group('Eyes','0:30',0,-119,[...eye('Left'),...eye('Right')]),
  ellipse('Left Foot Shadow',-48,13,37,13,'#729d80','',.3),ellipse('Right Foot Shadow',48,13,37,13,'#729d80','',.3),
  ellipse('Left Foot',-47,7,40,36,'arm',edge),ellipse('Right Foot',47,7,40,36,'arm',edge),
  group('Left Arm','0:21',-64,-73,[ellipse('Left Arm Shadow',1,19,28,49,'#6e987b','',.25),ellipse('Left Hand',-3,15,29,49,'arm',edge)]),
  group('Right Arm','0:22',65,-73,[ellipse('Right Arm Shadow',-1,19,31,49,'#6e987b','',.25),ellipse('Right Hand',2,15,33,50,'arm',edge)]),
  group('Camera','0:40',0,-65,[rect('Camera Top',-11,-17,24,10,dark,4),rect('Camera Body',0,0,62,39,'#404a40',10),ellipse('Lens Rim',1,0,29,29,'#e4ddc8'),ellipse('Lens',1,0,22,22,'#566b66'),ellipse('Lens Light',-3,-4,8,8,'#a5d5c2'),rect('Flash',22,-10,7,5,'#faf4df',2)],0),
  group('Celebration','0:50',0,-179,[{name:'Left Star',kind:'star',x:-97,y:48,w:18,h:18,fill:'#eabb71'},{name:'Right Star',kind:'star',x:93,y:8,w:22,h:22,fill:'#eabb71'},ellipse('Spark',88,41,7,7,'#e2a7a2')],0)
 ])
];
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;');
function svg(s){
 if(s.kind==='group')return `<g id="${s.name.replaceAll(' ','-')}" transform="translate(${s.x} ${s.y})" opacity="${s.opacity}">${s.children.map(svg).join('')}</g>`;
 const attrs=`fill="${gradients[s.fill]?'url(#'+s.fill+')':(s.fill||'none')}" stroke="${s.stroke||'none'}" stroke-width="${s.kind==='smile'?2.2:.7}" stroke-linecap="round" opacity="${s.opacity??1}"`;
 if(s.kind==='ellipse')return `<ellipse id="${s.name.replaceAll(' ','-')}" cx="${s.x}" cy="${s.y}" rx="${s.w/2}" ry="${s.h/2}" ${attrs}/>`;
 if(s.kind==='rect')return `<rect x="${s.x-s.w/2}" y="${s.y-s.h/2}" width="${s.w}" height="${s.h}" rx="${s.r}" ${attrs}/>`;
 if(s.kind==='path')return `<path d="M ${s.vertices[0][0]} ${s.vertices[0][1]} ${s.vertices.map((v,i)=>{const next=s.vertices[(i+1)%s.vertices.length];return `C ${v[4]} ${v[5]} ${next[2]} ${next[3]} ${next[0]} ${next[1]}`;}).join(' ')} ${s.closed?'Z':''}" transform="translate(${s.x} ${s.y})" ${attrs}/>`;
 if(s.kind==='smile')return `<path d="M ${s.x-10} ${s.y} C ${s.x-7} ${s.y+8} ${s.x+7} ${s.y+8} ${s.x+10} ${s.y}" ${attrs}/>`;
 return `<path d="M ${s.x} ${s.y-s.h/2} L ${s.x+3} ${s.y-3} L ${s.x+s.w/2} ${s.y} L ${s.x+3} ${s.y+3} L ${s.x} ${s.y+s.h/2} L ${s.x-3} ${s.y+3} L ${s.x-s.w/2} ${s.y} L ${s.x-3} ${s.y-3} Z" ${attrs}/>`;
}
const color=c=>'FF'+c.slice(1).toUpperCase();
const paint=s=>{const g=gradients[s.fill];return g?`<Fill><RadialGradient startX="${g.x}" startY="${g.y}" endX="${g.x+g.r}" endY="${g.y}">${[[g.from,0],[g.mid,.62],[g.to,1]].map(([c,p])=>`<GradientStop colorValue="${color(c)}" position="${p}"/>`).join('')}</RadialGradient></Fill>`:(s.fill?`<Fill><SolidColor colorValue="${color(s.fill)}"/></Fill>`:'');};
function rml(s){
 if(s.kind==='group')return `<Node name="${esc(s.name)}" id="${s.id}" x="${s.x}" y="${s.y}" opacity="${s.opacity}">${[...s.children].reverse().map(rml).join('')}</Node>`;
 let path;if(s.kind==='ellipse')path=`<Ellipse width="${s.w}" height="${s.h}"/>`;
 else if(s.kind==='rect')path=`<Rectangle width="${s.w}" height="${s.h}" cornerRadiusTL="${s.r}"/>`;
 else if(s.kind==='path')path=`<PointsPath isClosed="${s.closed}">${s.vertices.map(([x,y,ix,iy,ox,oy])=>`<CubicDetachedVertex x="${x}" y="${y}" inRotation="${Math.atan2(iy-y,ix-x)}" inDistance="${Math.hypot(ix-x,iy-y)}" outRotation="${Math.atan2(oy-y,ox-x)}" outDistance="${Math.hypot(ox-x,oy-y)}"/>`).join('')}</PointsPath>`;
 else if(s.kind==='star')path=`<Star width="${s.w}" height="${s.h}" points="4" innerRadius="0.3"/>`;
 else path='<PointsPath isClosed="false"><CubicDetachedVertex x="-10" y="0" inRotation="0" inDistance="0" outRotation="1.249" outDistance="9.49"/><CubicDetachedVertex x="10" y="0" inRotation="1.893" inDistance="9.49" outRotation="0" outDistance="0"/></PointsPath>';
 return `<Shape name="${esc(s.name)}" x="${s.x}" y="${s.y}" opacity="${s.opacity??1}">${path}${paint(s)}${s.stroke?`<Stroke thickness="${s.kind==='smile'?2.2:.7}" cap="round"><SolidColor colorValue="${color(s.stroke)}"/></Stroke>`:''}</Shape>`;
}
const keys=(id,prop,frames)=>`<KeyedObject objectId="${id}"><KeyedProperty property="${prop}">${frames.map(([frame,value])=>`<KeyFrameDouble frame="${frame}" value="${value}" interpolationType="cubic"><CubicEaseInterpolator x1="0.3" y1="0" x2="0.3" y2="1"/></KeyFrameDouble>`).join('')}</KeyedProperty></KeyedObject>`;
const actions=['Idle','Wave','Think','Photo','Celebrate','Sleep'];
const defaultTracks={'0:10':{y:[[0,216],[60,213],[120,216]],rotation:[[0,0],[60,.015],[120,0]],scaleX:[[0,1]],scaleY:[[0,1]]},'0:21':{rotation:[[0,0]]},'0:22':{rotation:[[0,0]]},'0:30':{scaleY:[[0,1],[88,1],[92,.08],[96,1],[120,1]]},'0:40':{opacity:[[0,0]]},'0:50':{opacity:[[0,0]],rotation:[[0,0]]}};
const timelines=actions.map((name,index)=>{
 const t=structuredClone(defaultTracks);
 if(index===1){t['0:22'].rotation=[[0,0],[22,-1.5],[38,-1.15],[54,-1.65],[70,-1.15],[86,-1.5],[120,0]];t['0:10'].rotation=[[0,0],[40,-.055],[80,.035],[120,0]];}
 if(index===2){t['0:21'].rotation=[[0,0],[30,1.1],[85,1.1],[120,0]];t['0:10'].rotation=[[0,0],[35,-.12],[80,-.12],[120,0]];}
 if(index===3){t['0:40'].opacity=[[0,0],[18,1],[100,1],[120,0]];t['0:21'].rotation=[[0,0],[22,1.1],[100,1.1],[120,0]];t['0:22'].rotation=[[0,0],[22,-1.1],[100,-1.1],[120,0]];t['0:30'].scaleY=[[0,1],[54,1],[58,.08],[65,1],[120,1]];}
 if(index===4){t['0:50'].opacity=[[0,0],[14,1],[100,1],[120,0]];t['0:10'].y=[[0,216],[25,204],[45,216],[70,208],[90,216],[120,216]];t['0:21'].rotation=[[0,0],[20,1.9],[95,1.9],[120,0]];t['0:22'].rotation=[[0,0],[20,-1.9],[95,-1.9],[120,0]];t['0:50'].rotation=[[0,-.1],[60,.12],[120,-.1]];}
 if(index===5){t['0:30'].scaleY=[[0,1],[25,.08],[100,.08],[120,1]];t['0:10'].rotation=[[0,0],[35,.08],[90,.08],[120,0]];}
 return `<LinearAnimation name="${name}" id="0:${100+index}" duration="120" fps="60" loopValue="loop">${Object.entries(t).flatMap(([id,props])=>Object.entries(props).map(([p,f])=>keys(id,p,f))).join('')}</LinearAnimation>`;
});
const bind=(id,key=636)=>`<BindablePropertyNumber><DataBindContext sourcePathIds="0:400-0:${id}" propertyKey="${key}"/></BindablePropertyNumber>`;
const condition=(value)=>`<TransitionViewModelCondition opValue="equal"><TransitionPropertyViewModelComparator>${bind(402)}</TransitionPropertyViewModelComparator><TransitionValueNumberComparator value="${value}"/></TransitionViewModelCondition>`;
const states=actions.map((_,i)=>`<AnimationState id="0:${200+i}" animationId="0:${100+i}" x="${180+i*160}" y="${i%2?100:0}" reset="true">${actions.map((_,j)=>i===j?'':`<StateTransition stateToId="0:${200+j}" duration="180">${condition(j)}</StateTransition>`).join('')}</AnimationState>`).join('');
// Gaze binds directly to small pupil/head translations; data remains local to the page.
let art=[...drawing].reverse().map(rml).join('');
art=art.replace('<Node name="Eyes" id="0:30" x="0" y="-119" opacity="1">','<Node name="Eyes" id="0:30" x="0" y="-119" opacity="1"><DataBindContext sourcePathIds="0:400-0:403" propertyKey="13"/><DataBindContext sourcePathIds="0:400-0:404" propertyKey="14"/>');
const source=`<Rive version="1" kind="fragment"><Artboard width="240" height="264" name="Dino" id="0:2" defaultStateMachineId="0:7" viewModelId="0:400" viewModelInstanceId="0:401">${art}<StateMachine name="Dino" id="0:7"><StateMachineLayer name="Personality" id="0:8"><AnyState x="200" y="-160"/><ExitState x="600" y="-160"/><EntryState x="0" y="0"><StateTransition stateToId="0:200"/></EntryState>${states}</StateMachineLayer></StateMachine>${timelines.join('')}</Artboard><ViewModel name="Dino" id="0:400" defaultInstanceId="0:401"><ViewModelPropertyNumber name="action" id="0:402"/><ViewModelPropertyNumber name="lookX" id="0:403"/><ViewModelPropertyNumber name="lookY" id="0:404"/><ViewModelInstance name="Default" id="0:401" exports="true"><ViewModelInstanceNumber viewModelPropertyId="0:402" propertyValue="0"/><ViewModelInstanceNumber viewModelPropertyId="0:403" propertyValue="0"/><ViewModelInstanceNumber viewModelPropertyId="0:404" propertyValue="-119"/></ViewModelInstance></ViewModel></Rive>`;
mkdirSync('public/mascot',{recursive:true});mkdirSync('design/dino',{recursive:true});
writeFileSync('public/mascot/vibe-dino.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 264" role="img" aria-label="vibephoto 的薄荷绿小恐龙"><defs>${Object.entries(gradients).map(([id,g])=>`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${g.x}" cy="${g.y}" r="${g.r}"><stop offset="0" stop-color="${g.from}"/><stop offset=".62" stop-color="${g.mid}"/><stop offset="1" stop-color="${g.to}"/></radialGradient>`).join('')}</defs>${drawing.map(svg).join('')}</svg>`);
writeFileSync('design/dino/scene.rml',source.replace('viewModelInstanceId="0:401">','viewModelInstanceId="0:401" styleId="0:5"><LayoutComponentStyle id="0:5" name="Dino Layout"/>'));
console.log('Authored SVG and RML: 5 actions + idle, view model action/lookX/lookY, zero scripts.');
