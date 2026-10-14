import * as T from 'three';
import type {TourPose} from './tour';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export type Space='exterior'|'column'|'arch'|'gallery'|'interior'|'arena'|'underground'|'foundation'|'gladiators';
export type Pick={detail:string;point:T.Vector3;order?:number;object:T.Object3D;instance?:number};
type Pose={position:T.Vector3;target:T.Vector3;fov?:number};
const V=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
const ellipse=(angle:number,r=1,y=0)=>V(94.5*r*Math.cos(angle),y,78*r*Math.sin(angle));
const N=80,step=Math.PI*2/N;
const mat=(color:number)=>new T.MeshStandardMaterial({color,roughness:.94,metalness:0});
function ringGeometry(r0:number,r1:number,y:number,h:number,segments=160,aisles=false,openings:number[]=[]){return ovalGeometry(94.5*r0,78*r0,94.5*r1,78*r1,y,h,segments,aisles,openings);}
function ovalGeometry(x0:number,z0:number,x1:number,z1:number,y:number,h:number,segments=160,aisles=false,openings:number[]=[]){
 const vertices:number[]=[],indices:number[]=[];
 for(let i=0;i<segments;i++){
  if(aisles&&(i%20===0||i%20===19))continue;const mid=(i+.5)*Math.PI*2/segments;if(openings.some(a=>Math.abs(Math.atan2(Math.sin(mid-a),Math.cos(mid-a)))<.052))continue;
  const a=i*Math.PI*2/segments,b=(i+1)*Math.PI*2/segments;const start=vertices.length/3;
  for(const height of [y,y+h])for(const [x,z,t] of [[x0,z0,a],[x1,z1,a],[x1,z1,b],[x0,z0,b]])vertices.push(x*Math.cos(t),height,z*Math.sin(t));
  for(const [a,b,c,d] of [[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]])indices.push(start+a,start+c,start+b,start+a,start+d,start+c);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);const flat=g.toNonIndexed();flat.computeVertexNormals();return flat;
}
function annularVault(radius:number,y:number){
 const vertices:number[]=[],indices:number[]=[];
 for(let i=0;i<160;i++)for(let j=0;j<12;j++){if(i===0||i===39||i===40||i===159)continue;
  const start=vertices.length/3;
  for(const r of [2.2,2.65])for(const [a,b] of [[i*Math.PI/80,j*Math.PI/12],[(i+1)*Math.PI/80,j*Math.PI/12],[(i+1)*Math.PI/80,(j+1)*Math.PI/12],[i*Math.PI/80,(j+1)*Math.PI/12]]){
   const p=ellipse(a,radius,y+5.1+r*Math.sin(b));p.x+=Math.cos(a)*r*Math.cos(b);p.z+=Math.sin(a)*r*Math.cos(b);vertices.push(p.x,p.y,p.z);
  }
  const faces=[[0,3,2,1],[4,5,6,7]];if(j===0)faces.push([0,1,5,4]);if(j===11)faces.push([2,3,7,6]);if(i===1||i===41)faces.push([3,0,4,7]);if(i===38||i===158)faces.push([1,2,6,5]);for(const [a,b,c,d] of faces)indices.push(start+a,start+b,start+c,start+a,start+c,start+d);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);const flat=g.toNonIndexed();flat.computeVertexNormals();return flat;
}
function arenaFloor(y:number,height:number,rx=38,rz=22){
 const shape=new T.Shape();shape.absellipse(0,0,rx,rz,0,Math.PI*2,false,0);
 const hole=new T.Path();hole.moveTo(-13.9,1.35);hole.lineTo(-10.1,1.35);hole.lineTo(-10.1,4.65);hole.lineTo(-13.9,4.65);hole.closePath();shape.holes.push(hole);
 const geometry=new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:80});geometry.rotateX(-Math.PI/2);geometry.translate(0,y,0);return geometry;
}
function extrude(shape:T.Shape,depth=2.6){const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:12});g.translate(0,0,-depth);return g;}
function wedge(a:number,b:number){const shape=new T.Shape();const ri=2.12,ro=2.83;shape.moveTo(ri*Math.cos(a),5.35+ri*Math.sin(a));shape.lineTo(ro*Math.cos(a),5.35+ro*Math.sin(a));shape.absarc(0,5.35,ro,a,b,false);shape.lineTo(ri*Math.cos(b),5.35+ri*Math.sin(b));shape.absarc(0,5.35,ri,b,a,true);shape.closePath();return extrude(shape);}
const moved=(g:T.BufferGeometry,x=0,y=0,z=0)=>g.translate(x,y,z);
const cylinder=(r1:number,r0:number,h:number,y:number)=>moved(new T.CylinderGeometry(r1,r0,h,16),0,y,0);
function capitalGeometry(order:number){
 const parts=[cylinder(.54,.48,.18,9.08),cylinder(.66,.54,.25,9.28),moved(new T.BoxGeometry(1.35,.23,1.35),0,9.52,0)];
 if(order===1){for(const x of [-.55,.55]){const g=new T.TorusGeometry(.26,.065,6,16);g.translate(x,9.24,.43);parts.push(g);}}
 if(order===2){
  parts.push(cylinder(.65,.44,.7,9.15));
  const leaf=new T.Shape();leaf.moveTo(0,0);leaf.bezierCurveTo(-.15,.09,-.2,.35,-.08,.49);leaf.lineTo(0,.62);leaf.lineTo(.08,.49);leaf.bezierCurveTo(.2,.35,.15,.09,0,0);
  for(let tier=0;tier<2;tier++)for(let i=0;i<8;i++){const a=(i+tier*.5)*Math.PI/4;const g=new T.ExtrudeGeometry(leaf,{depth:.075,bevelEnabled:false,curveSegments:6});g.rotateX(-.34);g.translate(0,8.66+tier*.3,.44+tier*.05);g.rotateY(a);parts.push(g);}
  for(const x of [-.5,.5])for(const z of [-.5,.5]){const g=new T.TorusGeometry(.13,.04,5,12,Math.PI*1.6);g.rotateY(Math.sign(z)*Math.PI/4);g.translate(x,9.5,z);parts.push(g);}
 }
 return mergeGeometries(parts.map(g=>g.index?g.toNonIndexed():g))!;
}
export class ArchitectureWorld {
 renderer:T.WebGLRenderer;scene=new T.Scene();camera:T.PerspectiveCamera;controls:OrbitControls;
 private raycaster=new T.Raycaster();private picks:T.Object3D[]=[];private lastFrame=performance.now();private selected:T.Mesh|T.InstancedMesh|null=null;private selectedInstance:number|undefined;
 private pointLight:T.PointLight;private time=0;private opacity=1;private targetOpacity=1;private raf=0;private moving=false;private dragging=false;private start=new T.Vector2();
 private deck:T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;private sand:T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;private roof=new T.Group();private foundations=new T.Group();private architecture=new T.Group();private lift=new T.Group();private columnPieces:T.InstancedMesh[]=[];private exploded=0;private explodeTarget=0;private liftTime=-1;
 private access=new T.Group();private podium!:T.Mesh;private gate!:T.Mesh;private gateOpen=0;private gateTarget=0;private entryAngle=Math.PI/2;private columnAnchor=V(-3.1,0,78.3);
 private materials:Record<string,T.MeshStandardMaterial>;
 private shadowPending=false;private shadowTime=0;private liftRopes:T.Mesh[]=[];private liftWheel!:T.Mesh;private hatchHinge=new T.Group();private deckProgress=0;private arenaHalves=[new T.Group(),new T.Group()];private arenaPlanes=[new T.Plane(V(-1,0,0),0),new T.Plane(V(1,0,0),0)];private roofDeployment=-1;private roofRopes!:T.LineSegments;private guided=false;private sectionCaps=new T.Group();private section=false;private sectionPlanes=[new T.Plane(V(-1,0,0),0),new T.Plane(V(0,0,-1),0)];
 private materialMode='';private disposed=false;private resizeObserver:ResizeObserver;private activeSpace:Space='exterior';private focusAngle=Math.PI/2;private focusOrder=0;
 private hiddenForInterior:T.Object3D[]=[];private ground:T.Mesh;private wood:T.Mesh;
 constructor(private host:HTMLElement,private onPick:(pick:Pick)=>void,private onFrame:()=>void){
  this.renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.setClearColor(0xe9ece4);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.02;
  this.renderer.localClippingEnabled=true;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.needsUpdate=true;this.renderer.shadowMap.type=T.PCFShadowMap;
  this.camera=new T.PerspectiveCamera(43,1,.08,1200);this.camera.position.set(160,118,170);
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(0,19,0);this.controls.enableDamping=true;this.controls.dampingFactor=.07;this.controls.minDistance=3;this.controls.maxDistance=420;this.controls.maxPolarAngle=Math.PI*.88;this.controls.enablePan=true;
  host.replaceChildren(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-label','Coliseo tridimensional: arrastra para orbitar y pulsa sus estructuras para explorarlas.');
  this.materials={travertine:mat(0xd7cfb4),marble:mat(0xeae6d6),brick:mat(0xbba38b),concrete:mat(0xb4b0a0),wood:mat(0x8d7251),sand:mat(0xcfbd8a),cloth:mat(0xece5ca),metal:mat(0x696852)};
  this.scene.add(new T.HemisphereLight(0xfffced,0x8c967e,1.6));const sun=new T.DirectionalLight(0xfff8e8,2.2);sun.position.set(100,170,85);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);Object.assign(sun.shadow.camera,{left:-120,right:120,top:120,bottom:-120,near:1,far:400});sun.shadow.bias=-.001;sun.shadow.normalBias=.15;this.scene.add(sun);
  this.pointLight=new T.PointLight(0xffe8b5,0,30,1.6);this.scene.add(this.pointLight);
  this.scene.add(this.foundations,this.architecture,this.roof);this.architecture.add(this.access);
  this.ground=new T.Mesh(new T.PlaneGeometry(4000,4000),mat(0xe9ece4));this.ground.rotation.x=-Math.PI/2;this.ground.position.y=-6.3;this.ground.receiveShadow=true;this.scene.add(this.ground);
  this.mesh(ringGeometry(0,1.065,-6,5.6),this.materials.concrete,'foundation',this.foundations);
  this.mesh(ringGeometry(0,1.04,-.4,.4),this.materials.travertine,'foundation',this.foundations);
  this.buildFacade();this.buildSeating();this.buildGalleries();this.buildAccess();this.buildUnderground();
  this.deck=this.mesh(arenaFloor(5.55,.42),this.materials.wood.clone(),'arena',this.architecture);this.deck.material.transparent=true;this.deck.userData.material='wood';
  this.sand=this.mesh(arenaFloor(5.98,.03,37.9,21.9),this.materials.sand.clone(),'arena',this.architecture);this.sand.material.transparent=true;this.sand.userData.material='sand';this.sand.receiveShadow=false;
  this.wood=this.mesh(arenaFloor(5.91,.02,37.8,21.8),this.materials.wood,'wood',this.architecture);
  for(let i=-30;i<=30;i+=8){const length=Math.sqrt(Math.max(0,1-i*i/1600))*41;const seam=new T.Mesh(new T.BoxGeometry(.06,.035,length),this.materials.wood);seam.position.set(i,5.98,0);this.architecture.add(seam);seam.userData.deckSeam=true;}
  for(const x of [-24,0,12,24]){const hatch=new T.Mesh(new T.BoxGeometry(3.7,.045,3.2),this.materials.wood.clone());hatch.position.set(x,6.04,-3);hatch.userData={detail:'hatch',material:'wood',deckSeam:true};this.architecture.add(hatch);this.picks.push(hatch);}
  this.hatchHinge.position.set(-13.9,6.04,-3);this.hatchHinge.userData.deckSeam=true;this.architecture.add(this.hatchHinge);
  const hatchLid=this.mesh(new T.BoxGeometry(3.8,.13,3.3),this.materials.wood,'hatch',this.hatchHinge);hatchLid.position.x=1.9;
  this.buildArenaHalves();this.buildRoof();this.roof.visible=false;
  this.scene.add(this.sectionCaps);this.sectionCaps.visible=false;
  const capX=new T.Mesh(new T.BoxGeometry(.025,5.6,83.07),this.materials.concrete.clone());capX.position.set(.014,-3.2,41.535);this.sectionCaps.add(capX);
  const capZ=new T.Mesh(new T.BoxGeometry(100.64,5.6,.025),this.materials.concrete.clone());capZ.position.set(50.32,-3.2,.014);this.sectionCaps.add(capZ);
  host.addEventListener('pointerdown',e=>{this.start.set(e.clientX,e.clientY);this.dragging=false;});host.addEventListener('pointermove',e=>{if(Math.hypot(e.clientX-this.start.x,e.clientY-this.start.y)>5)this.dragging=true;});
  host.addEventListener('click',e=>{if(this.guided||this.moving||this.dragging)return;const r=this.renderer.domElement.getBoundingClientRect();this.raycaster.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),this.camera);const hit=this.raycaster.intersectObjects(this.picks,false).find(h=>h.object.visible&&this.visibleAncestors(h.object)&&!(this.section&&h.point.x>0&&h.point.z>0));if(!hit)return;const data=hit.object.userData;const order=hit.instanceId!==undefined&&data.orders?data.orders[hit.instanceId]:data.order;this.highlight(hit.object as T.Mesh,hit.instanceId);onPick({detail:data.detail||'facade',point:hit.point,order,object:hit.object,instance:hit.instanceId});});
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);this.resize();this.controls.update();this.tick();
 }
 private visibleAncestors(object:T.Object3D){for(let o:T.Object3D|null=object;o;o=o.parent)if(!o.visible)return false;return true;}
 private mesh(g:T.BufferGeometry,m:T.MeshStandardMaterial,detail:string,parent:T.Object3D=this.architecture){const mesh=new T.Mesh(g,m);mesh.userData={detail,material:Object.keys(this.materials).find(k=>this.materials[k]===m)};mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);this.picks.push(mesh);return mesh;}
 private instances(g:T.BufferGeometry,m:T.MeshStandardMaterial,poses:T.Matrix4[],detail:string,orders?:number[]){const mesh=new T.InstancedMesh(g,m,poses.length);poses.forEach((p,i)=>{mesh.setMatrixAt(i,p);mesh.setColorAt(i,new T.Color(0xffffff));});mesh.instanceMatrix.needsUpdate=true;mesh.userData={detail,orders,material:'travertine'};mesh.castShadow=true;mesh.receiveShadow=true;this.architecture.add(mesh);this.picks.push(mesh);return mesh;}
 private matrix(t:number,y:number,offset=0,x=0){const q=new T.Quaternion().setFromAxisAngle(V(0,1,0),Math.PI/2-t);const p=ellipse(t,1,y).add(V(Math.cos(t)*offset,0,Math.sin(t)*offset));p.add(V(Math.sin(t)*x,0,-Math.cos(t)*x));return new T.Matrix4().compose(p,q,V(1,1,1));}
 private buildFacade(){
  const poses:T.Matrix4[]=[],orders:number[]=[];for(let l=0;l<3;l++)for(let i=0;i<N;i++){const a=i*step;poses.push(this.matrix(a,l*11));orders.push(l);}
  const pillar=new T.BoxGeometry(1.22,5.35,2.6);pillar.translate(-2.76,2.675,-1.3);const pillar2=pillar.clone();pillar2.translate(5.52,0,0);this.instances(mergeGeometries([pillar,pillar2])!,this.materials.travertine,poses,'pillar',orders);
  const wedgeGeometries=Array.from({length:11},(_,i)=>wedge(i*Math.PI/11+.006,(i+1)*Math.PI/11-.006));this.instances(mergeGeometries(wedgeGeometries)!,this.materials.travertine,poses,'arch',orders);
  const spandrel=new T.Shape();spandrel.moveTo(-3.36,5.35);spandrel.lineTo(-2.85,5.35);for(let i=0;i<=24;i++){const a=Math.PI-i*Math.PI/24;spandrel.lineTo(2.85*Math.cos(a),5.35+2.85*Math.sin(a));}spandrel.lineTo(3.36,5.35);spandrel.lineTo(3.36,10.6);spandrel.lineTo(-3.36,10.6);spandrel.closePath();this.instances(extrude(spandrel),this.materials.travertine,poses,'facade',orders);
  const baseGeometry=mergeGeometries([moved(new T.BoxGeometry(1.18,.28,1.18),0,.14,0),cylinder(.56,.61,.25,.4),cylinder(.48,.56,.2,.62)].map(g=>g.index?g.toNonIndexed():g))!;
  for(let l=0;l<3;l++){
   const cols=Array.from({length:N},(_,i)=>this.matrix(i*step,l*11,.32,-3.1));this.columnPieces.push(this.instances(baseGeometry,this.materials.travertine,cols,'base',Array(N).fill(l)));this.instances(cylinder(.39,.48,8.15,4.75),this.materials.travertine,cols,'column',Array(N).fill(l));this.columnPieces.push(this.instances(capitalGeometry(l),this.materials.travertine,cols,'capital',Array(N).fill(l)));
   this.mesh(ringGeometry(.965,1.009,l*11+10.65,.5),this.materials.travertine,'cornice');
  }
  // Each attic bay has real thickness; alternating bays contain open windows.
  const solid:T.Matrix4[]=[],open:T.Matrix4[]=[],pilasters:T.Matrix4[]=[];
  for(let i=0;i<N;i++){(i%2?solid:open).push(this.matrix(i*step,33.3));pilasters.push(this.matrix(i*step,33.3,.18,-3.1));}
  this.instances(moved(new T.BoxGeometry(6.7,14,2.2),0,7,-1.1),this.materials.travertine,solid,'attic');
  const windowWall=mergeGeometries([moved(new T.BoxGeometry(6.7,5.2,2.2),0,2.6,-1.1),moved(new T.BoxGeometry(6.7,6.45,2.2),0,10.775,-1.1),moved(new T.BoxGeometry(2.65,2.35,2.2),-2.025,6.375,-1.1),moved(new T.BoxGeometry(2.65,2.35,2.2),2.025,6.375,-1.1)])!;
  this.instances(windowWall,this.materials.travertine,open,'attic');
  this.instances(moved(new T.BoxGeometry(.8,12.8,.38),0,6.4,0),this.materials.travertine,pilasters,'attic');
  this.instances(capitalGeometry(2).scale(.8,.8,.7).translate(0,5.1,0),this.materials.travertine,pilasters,'attic');
  const shields=solid.map(m=>m.clone().multiply(new T.Matrix4().makeTranslation(0,6.4,.2)));
  const shieldGeo=new T.CylinderGeometry(.76,.76,.12,24);shieldGeo.rotateX(Math.PI/2);this.instances(shieldGeo,mat(0x91816a),shields,'clipea');
  for(const [y,r,h] of [[47.35,1.012,.3],[47.65,1.019,.35],[48,1.023,.45]])this.mesh(ringGeometry(.962,r,y,h),this.materials.travertine,'cornice');
  // Fine masonry courses and layered entablatures remain geometry at close range.
  const seams:T.BufferGeometry[]=[];
  for(let l=0;l<3;l++)for(let row=0;row<22;row++){const y=l*11+.45+row*.46;if(y%11<5.35){for(const x of [-2.76,2.76])seams.push(moved(new T.BoxGeometry(1.2,.018,.015),x,y,.009));}else if(y%11>8.25)seams.push(moved(new T.BoxGeometry(6.65,.018,.015),0,y,.009));}
  this.instances(mergeGeometries(seams)!,mat(0xbeb59f),Array.from({length:N},(_,i)=>this.matrix(i*step,0)),'facade');
  for(let l=0;l<3;l++)for(const [y,r,h] of [[9.85,1.002,.12],[10.05,1.006,.22],[10.38,1.011,.16]])this.mesh(ringGeometry(.966,r,l*11+y,h),this.materials.travertine,'cornice');
  const dentilPoses:T.Matrix4[]=[];for(let l=0;l<3;l++)for(let i=0;i<N*4;i++)dentilPoses.push(this.matrix(i*step/4,l*11+10.27,.45));this.instances(new T.BoxGeometry(.3,.2,.35),this.materials.travertine,dentilPoses,'cornice');
  // Sculptural silhouettes indicate the reconstructed statuary of the upper arcades.
  const statueParts=[moved(new T.CylinderGeometry(.27,.42,1.55,10),0,1.1,0),moved(new T.SphereGeometry(.24,10,8),0,2.14,0),moved(new T.BoxGeometry(.65,.24,.65),0,.12,0)];
  for(const side of [-1,1]){const arm=new T.CylinderGeometry(.1,.13,.9,8);arm.rotateZ(side*.2);arm.translate(side*.34,1.28,0);statueParts.push(arm);}
  const statues=Array.from({length:N*2},(_,i)=>this.matrix((i%N)*step,Math.floor(i/N)*11+11.2,-1.4));this.instances(mergeGeometries(statueParts.map(g=>g.index?g.toNonIndexed():g))!,this.materials.marble,statues,'statues');
 }
 private buildSeating(){
  const edges:number[]=[],seats:T.BufferGeometry[][]=[[],[],[],[]];
  const bands=[{count:10,width:8.4,rise:.52,gap:2.4},{count:16,width:13.4,rise:.62,gap:2.8},{count:16,width:13.4,rise:.72,gap:2.5},{count:6,width:5.8,rise:.7,gap:0}];
  let x=41,z=25,y=6.3;
  bands.forEach((band,k)=>{
   const width=band.width/band.count;
   for(let row=0;row<band.count;row++){
    seats[k].push(ovalGeometry(x,z,x+width,z+width,y,band.rise,160,true));
    for(let i=0;i<160;i++){if(i%20===0||i%20===19)continue;for(const t of [i*Math.PI*2/160,(i+1)*Math.PI*2/160])edges.push(x*Math.cos(t),y+band.rise+.015,z*Math.sin(t));}
    // Joint lines divide the benches into human-sized seating places.
    const places=Math.round(Math.PI*2*Math.sqrt((x*x+z*z)/2)/.65);
    for(let j=0;j<places;j++){const a=j*Math.PI*2/places;if(Math.abs(Math.sin(a*4))<.2)continue;const c=Math.cos(a),sn=Math.sin(a),top=y+band.rise+.012;edges.push(x*c,y+.06,z*sn,x*c,top,z*sn,x*c,top,z*sn,(x+width)*c,top,(z+width)*sn);}
    x+=width;z+=width;y+=band.rise;
   }
   const seatMesh=this.mesh(mergeGeometries(seats[k])!,k===3?this.materials.wood:this.materials.marble,['ima','media','summa','wooden_seats'][k]);
   seatMesh.userData.material=k===3?'wood':'marble';
   if(band.gap){this.mesh(ovalGeometry(x+band.gap-.5,z+band.gap-.5,x+band.gap,z+band.gap,y+.18,1.02),this.materials.marble,'balustrade');this.mesh(ovalGeometry(x,z,x+band.gap,z+band.gap,y,.22),this.materials.travertine,'praecinctio');this.mesh(ovalGeometry(x+.1,z+.1,x+.35,z+.35,y+.22,1),this.materials.marble,'balustrade');x+=band.gap;z+=band.gap;y+=1.15;}
  });
  const edgeGeometry=new T.BufferGeometry();edgeGeometry.setAttribute('position',new T.Float32BufferAttribute(edges,3));this.architecture.add(new T.LineSegments(edgeGeometry,new T.LineBasicMaterial({color:0xa8aa98,transparent:true,opacity:.65})));
  // Short stairs fill the radial aisle gaps; their smaller risers serve walking.
  const stairs:T.BufferGeometry[]=[];
  const profile=[[0,0],[8.4,5.2],[10.8,6.35],[24.2,16.27],[27,17.42],[40.4,28.94],[42.9,30.09],[48.7,34.29]];
  for(let i=0;i<8;i++){const angle=i*Math.PI/4;for(let j=0;j<94;j++){const r=j/94,d=48.7*r;if(d>14&&d<(i===2?21:18))continue;const index=Math.max(1,profile.findIndex(([distance])=>distance>=d));const [d0,y0]=profile[index-1],[d1,y1]=profile[index];const y=6.3+T.MathUtils.lerp(y0,y1,(d-d0)/(d1-d0));const pos=V((41+d)*Math.cos(angle),y,(25+d)*Math.sin(angle));const g=new T.BoxGeometry(3.6+4.5*r,2.2,.56);g.rotateY(Math.PI/2-angle);g.translate(pos.x,pos.y-1.1,pos.z);stairs.push(g);const half=(3.6+4.5*r)/2;const tangent=V(Math.sin(angle),0,-Math.cos(angle));const edge=pos.clone().add(V(-Math.cos(angle)*.28,.012,-Math.sin(angle)*.28));const l=edge.clone().addScaledVector(tangent,-half),rEdge=edge.clone().addScaledVector(tangent,half);edges.push(l.x,l.y,l.z,rEdge.x,rEdge.y,rEdge.z);}}
  this.mesh(mergeGeometries(stairs)!,this.materials.travertine,'stairs');edgeGeometry.setAttribute('position',new T.Float32BufferAttribute(edges,3));
  // Vomitoria are bounded openings, with a dark recess rather than an exposed void.
  const portal=new T.Shape();portal.moveTo(-1.65,2.15);portal.absarc(0,2.15,1.65,Math.PI,0,true);portal.lineTo(2.05,2.15);portal.absarc(0,2.15,2.05,0,Math.PI,false);portal.closePath();
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4,group=new T.Group();group.position.set(55.3*Math.cos(a),14.8,39.3*Math.sin(a));group.rotation.y=Math.PI/2-a;this.architecture.add(group);
   const roof=this.mesh(extrude(portal,.65),this.materials.travertine,'vomitorium',group);roof.position.z=.4;
   for(const x of [-1.86,1.86]){const wall=this.mesh(new T.BoxGeometry(.42,3.8,4.7),this.materials.marble,'vomitorium',group);wall.position.set(x,1.9,2.1);}
   const lid=this.mesh(new T.BoxGeometry(4.15,.4,4.7),this.materials.marble,'vomitorium',group);lid.position.set(0,4.02,2.1);
   const floor=this.mesh(new T.BoxGeometry(3.3,.35,4.7),this.materials.travertine,'vomitorium',group);floor.position.set(0,.12,2.1);
   if(i!==2){const shade=this.mesh(new T.BoxGeometry(3.3,3.65,.08),mat(0x555448),'vomitorium',group);shade.position.set(0,1.9,4.45);}
  }

  this.mesh(ovalGeometry(40.6,24.6,41.2,25.2,6,1.1,160,false,[0,Math.PI/2]),this.materials.marble,'podium');
  this.podium=this.mesh(ovalGeometry(38.3,22.3,40.8,24.8,6,2,160,false,[0,Math.PI/2]),this.materials.marble,'podium');
  // The upper portico is a columned circulation space behind the highest seats.
  const porticoPoses=Array.from({length:N},(_,i)=>this.matrix(i*step,40.65,-5));
  const col=mergeGeometries([cylinder(.32,.39,5.2,2.8),moved(new T.BoxGeometry(.9,.2,.9),0,.1,0),moved(new T.BoxGeometry(.95,.3,.95),0,5.6,0)].map(g=>g.index?g.toNonIndexed():g))!;
  this.instances(col,this.materials.marble,porticoPoses,'portico');
  this.mesh(ringGeometry(.90,.975,46.4,.35),this.materials.travertine,'portico');
 }
 private buildGalleries(){
  // Concentric vaulted arcades carry the stepped seating; the section exposes them.
  const archGeo=mergeGeometries([moved(new T.BoxGeometry(1.1,5.35,2),-2.75,2.675,-1),moved(new T.BoxGeometry(1.1,5.35,2),2.75,2.675,-1),...Array.from({length:11},(_,i)=>wedge(i*Math.PI/11+.004,(i+1)*Math.PI/11-.004))].map(g=>g.index?g.toNonIndexed():g))!;
  for(const [radius,levels] of [[.92,[0,11,22]],[.80,[0,10,19]],[.67,[0,9]],[.54,[0]]] as [number,number[]][]){
   const poses:T.Matrix4[]=[];
   for(const y of levels)for(let i=0;i<N;i++){if(i===0||i===20)continue;const a=i*step;const matrix=this.matrix(a,y);matrix.setPosition(ellipse(a,radius,y));matrix.scale(V(radius,1,1));poses.push(matrix);}
   this.instances(archGeo,this.materials.brick,poses,'annular');
   for(const y of levels){if(y)this.mesh(ringGeometry(radius-.035,radius+.035,y-.4,.4,160,false,[Math.PI/2]),this.materials.concrete,'annular');this.mesh(annularVault(radius,y),this.materials.concrete,'vault');}
  }
  const radial:T.BufferGeometry[]=[];
  for(let i=0;i<40;i++){if(i===0||i===10)continue;const a=i*Math.PI/20;for(let j=0;j<4;j++){const r=.56+j*.105,h=5.7+j*7.1;const p=ellipse(a,r,h/2);const g=new T.BoxGeometry(.65,h,5.5);g.rotateY(Math.PI/2-a);g.translate(p.x,p.y,p.z);radial.push(g);}}
  this.mesh(mergeGeometries(radial)!,this.materials.concrete,'radial');
 }
 private buildAccess(){
  // A continuous radial passage connects the south facade and the cavea.
  const start=67,end=77,width=4.24;
  for(const x of [-2.65,2.65]){const wall=this.mesh(new T.BoxGeometry(1.05,5.35,end-start),this.materials.brick,'brick',this.access);wall.position.set(x,2.675,(start+end)/2);}
  const joints:T.BufferGeometry[]=[];
  for(const side of [-1,1])for(let row=0;row<14;row++){const y=.25+row*.36;joints.push(moved(new T.BoxGeometry(.018,.027,end-start),side*2.12,y,(start+end)/2));for(let z=start+(row%2)*.55;z<end;z+=1.1)joints.push(moved(new T.BoxGeometry(.018,.36,.026),side*2.12,y+.18,z));}
  const jointMesh=new T.Mesh(mergeGeometries(joints)!,mat(0xc5b49c));this.access.add(jointMesh);
  const arch=new T.Shape();arch.moveTo(-2.26,5.35);arch.absarc(0,5.35,2.26,Math.PI,0,true);arch.lineTo(2.75,5.35);arch.absarc(0,5.35,2.75,0,Math.PI,false);arch.closePath();const vault=this.mesh(extrude(arch,end-start),this.materials.concrete,'vault',this.access);vault.position.z=end;
  for(let z=start;z<=end;z+=4){const archGeo=mergeGeometries(Array.from({length:11},(_,i)=>wedge(i*Math.PI/11+.008,(i+1)*Math.PI/11-.008)))!;archGeo.scale(1,1,.11);const rib=this.mesh(archGeo,this.materials.travertine,'arch',this.access);rib.position.z=z;}
  const floor=this.mesh(new T.BoxGeometry(width,.12,end-start),this.materials.travertine,'floor',this.access);floor.position.set(0,.06,(start+end)/2);
  for(let z=start;z<=end;z+=2){const seam=new T.Mesh(new T.BoxGeometry(width,.015,.025),this.materials.concrete);seam.position.set(0,.128,z);this.access.add(seam);}
  // A sloping stair gallery reaches the open south vomitorium at the middle tier.
  const stairCount=66,run=23,rise=14.8;
  for(let i=0;i<stairCount;i++){const height=(i+1)*rise/stairCount,z=67-(i+.5)*run/stairCount;const tread=this.mesh(new T.BoxGeometry(3.3,.3,run/stairCount+.02),this.materials.travertine,'stairs',this.access);tread.position.set(0,height-.15,z);}
  const ramp=(geometry:T.BufferGeometry)=>{const points=geometry.getAttribute('position');for(let i=0;i<points.count;i++)points.setY(i,points.getY(i)-points.getZ(i)*rise/run);geometry.computeVertexNormals();geometry.translate(0,0,67);return geometry;};
  for(const x of [-1.9,1.9])this.mesh(ramp(moved(new T.BoxGeometry(.5,2.15,run),x,1.075,-run/2)),this.materials.brick,'vault',this.access);
  const ceiling=new T.Shape();ceiling.moveTo(-1.65,2.15);ceiling.absarc(0,2.15,1.65,Math.PI,0,true);ceiling.lineTo(2.05,2.15);ceiling.absarc(0,2.15,2.05,0,Math.PI,false);ceiling.closePath();this.mesh(ramp(extrude(ceiling,run)),this.materials.concrete,'vault',this.access);
  const landing=this.mesh(new T.BoxGeometry(3.3,.3,5),this.materials.travertine,'floor',this.access);landing.position.set(0,14.65,41.5);
  // Schematic east service entrance, associated with the Ludus Magnus route.
  for(const z of [-2.9,2.9]){const m=this.mesh(new T.BoxGeometry(35,4.8,.8),this.materials.brick,'gladiators');m.position.set(57,2.4,z);}
  const serviceFloor=this.mesh(new T.BoxGeometry(35,.14,5.1),this.materials.travertine,'gladiators');serviceFloor.position.set(57,.07,0);
  const serviceShape=new T.Shape();serviceShape.moveTo(-2.5,4.8);serviceShape.absarc(0,4.8,2.5,Math.PI,0,true);serviceShape.lineTo(3.1,4.8);serviceShape.absarc(0,4.8,3.1,0,Math.PI,false);serviceShape.closePath();const serviceVault=this.mesh(extrude(serviceShape,20),this.materials.concrete,'vault');serviceVault.rotation.y=Math.PI/2;serviceVault.position.x=74;
  for(let i=0;i<10;i++){const stair=this.mesh(new T.BoxGeometry(1.25,.58,4.8),this.materials.travertine,'gladiators');stair.position.set(54-i*1.25,.3+i*.58,0);}
  const exit=new T.Mesh(new T.BoxGeometry(.35,4,5.4),this.materials.wood);exit.position.set(41,8,0);this.gate=exit;exit.userData={detail:'gladiators'};this.architecture.add(exit);this.picks.push(exit);
 }
 private buildUnderground(){
  this.mesh(ovalGeometry(0,0,37.8,21.8,0,.08),this.materials.concrete,'hypogeum');
  this.mesh(ovalGeometry(37,21,37.8,21.8,.08,4.5),this.materials.brick,'hypogeum');
  const opening=new T.Shape();opening.moveTo(-1.65,2.2);opening.absarc(0,2.2,1.65,Math.PI,0,true);opening.lineTo(2.05,2.2);opening.absarc(0,2.2,2.05,0,Math.PI,false);opening.closePath();
  const arcade=mergeGeometries([extrude(opening,.6),moved(new T.BoxGeometry(.65,2.2,.6),-1.97,1.1,-.3),moved(new T.BoxGeometry(.65,2.2,.6),1.97,1.1,-.3),moved(new T.BoxGeometry(4.6,.7,.6),0,4.2,-.3)].map(g=>g.index?g.toNonIndexed():g))!;
  const positions:T.Matrix4[]=[];
  for(const z of [-3.7,3.7])for(let x=-27.6;x<=28;x+=4.6){if(z<0&&x>-17&&x<-8)continue;positions.push(new T.Matrix4().makeTranslation(x,0,z));}
  this.instances(arcade,this.materials.brick,positions,'hypogeum');
  // Transverse supports stay permeable: arched bays connect the service spaces.
  const cross:T.Matrix4[]=[];
  for(const x of [-24,0,12,24])for(const z of [-13,13]){const matrix=new T.Matrix4().makeRotationY(Math.PI/2);matrix.setPosition(x,0,z);cross.push(matrix);}
  this.instances(arcade,this.materials.brick,cross,'hypogeum');
  const beams:T.BufferGeometry[]=[],joints:number[]=[];
  for(let x=-30;x<=30;x+=5){beams.push(moved(new T.BoxGeometry(.3,.4,42*Math.sqrt(1-x*x/(38*38))),x,5.1,0));joints.push(x,.09,-18,x,.09,18);}
  for(const z of [-18,-12,-6,0,6,12,18]){const half=36*Math.sqrt(1-z*z/484);joints.push(-half,.09,z,half,.09,z);}
  this.mesh(mergeGeometries(beams)!,this.materials.wood,'wood');
  const jointGeometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(joints,3));this.architecture.add(new T.LineSegments(jointGeometry,new T.LineBasicMaterial({color:0x9a9785,transparent:true,opacity:.45})));
  const frames:T.Matrix4[]=[],platforms:T.Matrix4[]=[],wheels:T.Matrix4[]=[];
  for(const x of [-27,-18,-9,0,9,18,27])for(const zz of [-15,-8,8,15]){
   if(x===-9&&zz===-8)continue;const z=Math.abs(x)>20?zz*.85:zz;
   frames.push(new T.Matrix4().makeTranslation(x,0,z));platforms.push(new T.Matrix4().makeTranslation(x,.65,z));wheels.push(new T.Matrix4().makeTranslation(x,1.5,z-1.5));
  }
  const frameParts:T.BufferGeometry[]=[];
  for(const x of [-1.25,1.25])for(const z of [-.95,.95])frameParts.push(moved(new T.BoxGeometry(.15,4.8,.15),x,2.4,z));
  for(const x of [-1.25,1.25])frameParts.push(moved(new T.BoxGeometry(.2,.22,2.2),x,4.75,0));
  frameParts.push(moved(new T.BoxGeometry(2.7,.25,.25),0,4.75,0));
  this.instances(mergeGeometries(frameParts)!,this.materials.wood,frames,'lift');
  this.instances(new T.BoxGeometry(2.45,.18,1.9),this.materials.wood,platforms,'lift');
  const wheelParts:T.BufferGeometry[]=[new T.TorusGeometry(.55,.07,6,20)];
  for(let i=0;i<6;i++){const spoke=new T.BoxGeometry(.055,1.04,.07);spoke.rotateZ(i*Math.PI/6);wheelParts.push(spoke);}
  this.instances(mergeGeometries(wheelParts.map(g=>g.index?g.toNonIndexed():g))!,this.materials.wood,wheels,'lift');
  const ropeParts:T.BufferGeometry[]=[];
  for(const x of [-1.15,1.15])ropeParts.push(moved(new T.CylinderGeometry(.035,.035,4.1,6),x,2.65,0));
  this.instances(mergeGeometries(ropeParts)!,mat(0xab9672),frames,'lift');
  const pulleys=[-1.15,1.15].map(x=>moved(new T.TorusGeometry(.19,.045,6,16),x,4.65,0));this.instances(mergeGeometries(pulleys)!,this.materials.metal,frames,'lift');
  for(const x of [-13.5,-10.5]){const pulley=this.mesh(new T.TorusGeometry(.24,.05,6,20),this.materials.metal,'lift');pulley.position.set(x,5.65,-3);}
  this.lift.position.set(-12,0,-3);this.architecture.add(this.lift);
  const platform=this.mesh(new T.BoxGeometry(3.3,.35,2.7),this.materials.wood,'lift',this.lift);platform.position.y=.65;
  for(const x of [-1.65,1.65])for(const z of [-1.35,1.35]){const post=this.mesh(new T.BoxGeometry(.22,5.7,.22),this.materials.wood,'lift');post.position.set(-12+x,2.85,-3+z);}
  const winchParts:T.BufferGeometry[]=[new T.TorusGeometry(.6,.08,6,20)];for(let i=0;i<6;i++){const spoke=new T.BoxGeometry(.08,1.15,.09);spoke.rotateZ(i*Math.PI/6);winchParts.push(spoke);}
  this.liftWheel=this.mesh(mergeGeometries(winchParts)!,this.materials.wood,'lift');this.liftWheel.rotation.y=Math.PI/2;this.liftWheel.position.set(-9.9,1,-7);
  const axle=this.mesh(new T.CylinderGeometry(.18,.18,3.8,12),this.materials.wood,'lift');axle.rotation.z=Math.PI/2;axle.position.set(-12,1,-7);
  for(const x of [-1.5,1.5]){const rope=this.mesh(new T.CylinderGeometry(.045,.045,1,6),this.materials.wood,'lift');rope.position.set(-12+x,3.05,-3);this.liftRopes.push(rope);}
 }
 private buildArenaHalves(){
  const pieces=[this.deck,this.sand,this.wood,...this.architecture.children.filter(o=>o.userData.deckSeam)];
  this.arenaHalves.forEach((group,index)=>{this.architecture.add(group);group.visible=false;
   for(const piece of pieces){if(!(piece instanceof T.Mesh))continue;const copy=piece.clone();const material=(piece.material as T.MeshStandardMaterial).clone();material.transparent=false;material.opacity=1;material.depthWrite=true;material.clippingPlanes=[this.arenaPlanes[index]];material.clipIntersection=false;material.clipShadows=true;copy.material=material;copy.userData={...copy.userData,arenaHalf:true};group.add(copy);}
  });
 }
 private openArena(progress:number){
  this.deckProgress=progress;const distance=progress*43;
  this.arenaHalves.forEach((group,i)=>{group.visible=progress>.0001&&progress<.999;group.position.x=(i===0?-1:1)*distance;this.arenaPlanes[i].constant=-distance;});
 }
 private buildRoof(){
  const masts:T.Matrix4[]=[],brackets:T.Matrix4[]=[],ropes:number[]=[];
  for(let i=0;i<240;i++){const a=i*Math.PI*2/240;masts.push(new T.Matrix4().makeTranslation(...ellipse(a,.997,50.8).toArray()));brackets.push(this.matrix(a,45.8,.3));}
  this.instances(new T.CylinderGeometry(.085,.12,6.5,8),this.materials.wood,masts,'velarium');
  this.instances(new T.BoxGeometry(.55,.48,1.15),this.materials.travertine,brackets,'velarium');
  for(let i=0;i<80;i++){
   const a=i*step,b=(i+1)*step;const points=[ellipse(a,.993,52.8),ellipse(b,.993,52.8),ellipse(b,.53,45.2),ellipse(a,.53,45.2)];
   const g=new T.BufferGeometry().setFromPoints(points);g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();g.computeBoundingSphere();const material=this.materials.cloth.clone();material.side=T.DoubleSide;material.color.set(i%2?0xdfd5bf:0xede5d4);const panel=new T.Mesh(g,material);panel.userData={detail:'velarium',sector:i};this.roof.add(panel);this.picks.push(panel);
   for(const p of [ellipse(a,.996,54),ellipse(a,.53,45.2),ellipse(b,.53,45.2),ellipse(a,.53,45.2)])ropes.push(p.x,p.y,p.z);
  }
  const line=new T.BufferGeometry();line.setAttribute('position',new T.Float32BufferAttribute(ropes,3));line.computeBoundingSphere();this.roofRopes=new T.LineSegments(line,new T.LineBasicMaterial({color:0x8d7b5c}));this.roof.add(this.roofRopes);
 }
 private unfoldRoof(progress:number){
  if(Math.abs(progress-this.roofDeployment)<.0001)return;this.roofDeployment=progress;
  const radius=T.MathUtils.lerp(.991,.53,progress),height=T.MathUtils.lerp(52.75,45.2,progress);
  const ropes=this.roofRopes.geometry.getAttribute('position') as T.BufferAttribute;
  this.roof.children.forEach(object=>{
   if(!(object instanceof T.Mesh)||object.userData.sector===undefined)return;
   const i=object.userData.sector,a=i*step,b=(i+1)*step,innerA=ellipse(a,radius,height),innerB=ellipse(b,radius,height);
   const points=object.geometry.getAttribute('position') as T.BufferAttribute;points.setXYZ(2,innerB.x,innerB.y,innerB.z);points.setXYZ(3,innerA.x,innerA.y,innerA.z);points.needsUpdate=true;object.geometry.computeVertexNormals();
   for(const [j,point] of [ellipse(a,.996,54),innerA,innerB,innerA].entries())ropes.setXYZ(i*4+j,point.x,point.y,point.z);
  });ropes.needsUpdate=true;
 }
 async sectionToggle(){
  this.section=!this.section;this.applySection();
  if(this.section){this.activeSpace='exterior';await this.travel([this.pose([153,119,153],[0,18,0],43)],2200);}
  return this.section;
 }
 private applySection(){
  this.sectionCaps.visible=this.section;
  this.scene.traverse(object=>{if(!object.userData.arenaHalf&&object.parent!==this.sectionCaps&&object!==this.ground&&(object instanceof T.Mesh||object instanceof T.LineSegments)){const materials=Array.isArray(object.material)?object.material:[object.material];for(const material of materials){material.clippingPlanes=this.section?this.sectionPlanes:[];material.clipIntersection=true;material.clipShadows=true;material.needsUpdate=true;}}});
  this.renderer.shadowMap.needsUpdate=true;
 }
 private resize(){const r=this.host.getBoundingClientRect();this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/Math.max(1,r.height);this.camera.updateProjectionMatrix();this.onFrame();}
 private tick=()=>{if(this.disposed)return;this.raf=requestAnimationFrame(this.tick);if(document.hidden)return;const now=performance.now();const dt=Math.min((now-this.lastFrame)/1000,this.guided?.2:.04);this.lastFrame=now;this.time+=dt;this.opacity+=(this.targetOpacity-this.opacity)*(1-Math.exp(-dt*6));for(const mesh of [this.deck,this.sand]){mesh.material.opacity=this.guided?1:this.opacity;const visible=(this.guided?this.deckProgress<.0001:this.opacity>.015)&&!(mesh===this.sand&&this.materialMode==='wood');if(mesh.visible!==visible)this.renderer.shadowMap.needsUpdate=true;mesh.visible=visible;mesh.material.depthWrite=this.opacity>.9;}this.wood.visible=this.guided?this.deckProgress<.0001:this.opacity>.015;this.architecture.children.forEach(o=>{if(o.userData.deckSeam&&!o.userData.arenaHalf)o.visible=this.guided?this.deckProgress<.0001:this.opacity>.8;});
  if(this.liftTime>=0){this.liftTime+=dt;const t=this.liftTime;this.renderer.shadowMap.needsUpdate=true;this.lift.position.y=t<2?T.MathUtils.smoothstep(t,0,2)*4.6:t<3?4.6:t<5?(1-T.MathUtils.smoothstep(t,3,5))*4.6:0;if(t>=5)this.liftTime=-1;}
  if(Math.abs(this.gateTarget-this.gateOpen)>.001)this.renderer.shadowMap.needsUpdate=true;this.gateOpen+=(this.gateTarget-this.gateOpen)*(1-Math.exp(-dt*5));this.gate.position.y=8+this.gateOpen*5;if(!this.guided)this.controls.update();this.pointLight.position.copy(this.camera.position);
  if(this.guided){this.shadowPending=this.shadowPending||this.renderer.shadowMap.needsUpdate;this.renderer.shadowMap.needsUpdate=this.shadowPending&&now-this.shadowTime>100;if(this.renderer.shadowMap.needsUpdate){this.shadowPending=false;this.shadowTime=now;}}
  this.renderer.render(this.scene,this.camera);this.onFrame();};
 guidedFrame(frame:TourPose){
  if(!this.guided){
   this.guided=true;this.controls.enabled=false;this.ground.material=new T.ShadowMaterial({color:0x596349,opacity:.10});this.renderer.domElement.setAttribute('aria-label','Recorrido arquitectónico del Coliseo. Desplázate por la página para avanzar.');
   this.scene.traverse(object=>{if(!object.userData.arenaHalf&&object.parent!==this.sectionCaps&&object!==this.ground&&(object instanceof T.Mesh||object instanceof T.LineSegments)){const materials=Array.isArray(object.material)?object.material:[object.material];for(const material of materials){material.clippingPlanes=this.sectionPlanes;material.clipIntersection=true;material.clipShadows=true;material.needsUpdate=true;}}});
   this.roof.traverse(object=>{if(object instanceof T.Mesh||object instanceof T.LineSegments){const material=object.material as T.Material;material.transparent=true;material.needsUpdate=true;}});
  }
  const oldSection=this.sectionPlanes[0].constant,oldLift=this.lift.position.y,oldHatch=this.hatchHinge.rotation.z,oldDeck=this.deckProgress,oldRoof=this.roof.visible,oldGround=this.ground.visible;
  const cut=110*(1-frame.section);for(const plane of this.sectionPlanes)plane.constant=cut;
  this.section=frame.section>.99;this.sectionCaps.visible=this.section;
  this.controls.target.set(...frame.target);
  const fit=T.MathUtils.lerp(1,Math.max(1,1.22/this.camera.aspect),T.MathUtils.smoothstep(frame.position[1],35,65));
  this.camera.position.set(...frame.position).sub(this.controls.target).multiplyScalar(fit).add(this.controls.target);this.camera.fov=frame.fov;this.camera.near=T.MathUtils.lerp(.12,1.5,T.MathUtils.smoothstep(frame.position[1],12,45));this.camera.updateProjectionMatrix();this.camera.lookAt(this.controls.target);
  this.openArena(1-frame.deck);this.targetOpacity=1;this.ground.visible=frame.ground>.001;(this.ground.material as T.ShadowMaterial).opacity=.1*frame.ground;
  this.unfoldRoof(frame.roof);this.roof.visible=frame.roof>.001;this.roof.traverse(object=>{if(object instanceof T.Mesh||object instanceof T.LineSegments){const material=object.material as T.Material;material.opacity=T.MathUtils.smootherstep(frame.roof,0,.055);material.depthWrite=material.opacity>.95;}});
  this.hatchHinge.rotation.z=Math.PI*.55*frame.hatch;this.lift.position.y=frame.lift;this.lift.visible=frame.hatch>.01||frame.deck<.99;
  const attachment=.475+frame.lift;for(const rope of this.liftRopes){rope.scale.y=Math.max(.04,5.65-attachment);rope.position.y=(5.65+attachment)/2;}
  this.liftWheel.rotation.x=frame.lift*2.4;this.gateTarget=frame.gate;
  this.pointLight.intensity=30*(1-T.MathUtils.smootherstep(frame.position[1],6,14));
  if(Math.abs(cut-oldSection)>.025||Math.abs(this.opacity-this.targetOpacity)>.025||Math.abs(frame.lift-oldLift)>.025||Math.abs(oldHatch-this.hatchHinge.rotation.z)>.001||Math.abs(oldDeck-this.deckProgress)>.001||oldRoof!==this.roof.visible||oldGround!==this.ground.visible)this.renderer.shadowMap.needsUpdate=true;
 }
 project(point:[number,number,number]){const p=V(...point).project(this.camera);return {x:(p.x+1)/2*this.host.clientWidth,y:(1-p.y)/2*this.host.clientHeight,visible:!(this.section&&point[0]>0&&point[2]>0)&&p.z<1&&p.z>-1&&Math.abs(p.x)<1.15&&Math.abs(p.y)<1.15};}
 private highlight(object:T.Mesh,instance?:number){if(this.selected instanceof T.InstancedMesh&&this.selectedInstance!==undefined){this.selected.setColorAt(this.selectedInstance,new T.Color(0xffffff));this.selected.instanceColor!.needsUpdate=true;}else if(this.selected&&this.selected.userData.originalColor){(this.selected.material as T.MeshStandardMaterial).color.copy(this.selected.userData.originalColor);}
  this.selected=object;this.selectedInstance=instance;if(object instanceof T.InstancedMesh&&instance!==undefined){object.setColorAt(instance,new T.Color(0x9cbf89));object.instanceColor!.needsUpdate=true;}else{const previous=object.material as T.MeshStandardMaterial;object.material=previous.clone();object.userData.originalColor=previous.color.clone();(object.material as T.MeshStandardMaterial).color.set(0x9cbf89);}}
 highlightMaterial(id:string){this.materialMode=id;for(const object of this.picks){if(!(object instanceof T.Mesh))continue;const material=object.material as T.MeshStandardMaterial;if(!material.userData.baseColor)material.userData.baseColor=material.color.clone();material.color.copy(material.userData.baseColor);if(object.userData.material===id)material.color.lerp(new T.Color(0x90b478),.65);}}
 roofToggle(){this.roof.visible=!this.roof.visible;this.renderer.shadowMap.needsUpdate=true;return this.roof.visible;}
 liftPlay(){this.liftTime=0;}
 zoom(delta:number){const direction=this.camera.position.clone().sub(this.controls.target);this.camera.position.copy(this.controls.target).add(direction.multiplyScalar(delta>0?.86:1.16));}
 featurePoint(height:number):[number,number,number]{return [this.columnAnchor.x,this.focusOrder*11+height,this.columnAnchor.z];}
 accessPoint(x:number,y:number,z:number):[number,number,number]{return this.access.localToWorld(V(x,y,z)).toArray() as [number,number,number];}
 private accessPose(position:number[],target:number[],fov=61):Pose{return {position:this.access.localToWorld(V(position[0],position[1],position[2])),target:this.access.localToWorld(V(target[0],target[1],target[2])),fov};}
 private pose(position:number[],target:number[],fov=43):Pose{return {position:V(position[0],position[1],position[2]),target:V(target[0],target[1],target[2]),fov};}
 private async travel(poses:Pose[],duration:number){const start:Pose={position:this.camera.position.clone(),target:this.controls.target.clone(),fov:this.camera.fov};const nodes=[start,...poses];const path=new T.CatmullRomCurve3(nodes.map(n=>n.position),false,'centripetal');const targetPath=new T.CatmullRomCurve3(nodes.map(n=>n.target),false,'centripetal');const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;const previousEnabled=this.controls.enabled;this.controls.enabled=false;this.moving=true;
  await new Promise<void>(resolve=>{const start=performance.now();const tick=()=>{if(this.disposed){resolve();return;}const t=calm?1:Math.min(1,(performance.now()-start)/duration);const u=t*t*(3-2*t);this.camera.position.copy(path.getPoint(u));this.controls.target.copy(targetPath.getPoint(u));this.camera.fov=T.MathUtils.lerp(nodes[0].fov||43,poses.at(-1)?.fov||43,u);this.camera.updateProjectionMatrix();this.camera.lookAt(this.controls.target);this.onFrame();if(t<1)requestAnimationFrame(tick);else resolve();};tick();});this.controls.enabled=previousEnabled;this.moving=false;
 }
 async go(space:Space,pick?:Pick){if(this.section&&['column','arch','gallery','arena','gladiators'].includes(space)){this.section=false;this.applySection();}const from=this.activeSpace;this.activeSpace=space;this.materialMode='';this.targetOpacity=['underground','gladiators'].includes(space)?0:1;this.pointLight.intensity=['gallery','gladiators'].includes(space)?30:0;this.renderer.shadowMap.needsUpdate=true;this.roof.visible=false;this.ground.visible=space!=='foundation';
  if(pick){this.focusAngle=Math.atan2(pick.point.z/78,pick.point.x/94.5);this.focusOrder=pick.order||0;this.entryAngle=Math.round(this.focusAngle/step)*step;}
  if(space==='exterior'){if(from==='gallery')await this.travel([this.accessPose([0,3.7,70],[0,4,90],61),this.accessPose([0,3.7,86],[0,5,112],58),this.accessPose([0,9,111],[0,12,65],48),this.pose([160,118,170],[0,19,0])],4900);else await this.travel([this.pose([160,118,170],[0,19,0])],1800);}
  if(space==='arch'&&!pick)this.focusAngle=Math.round(this.focusAngle/step)*step;
  if(space==='column'||space==='arch'){const t=this.focusAngle;const y=space==='column'?this.focusOrder*11+5:this.focusOrder*11+5.5;const at=pick?V(pick.point.x,y,pick.point.z):ellipse(t,1,y).add(space==='column'?V(Math.sin(t)*-3.1,0,Math.cos(t)*3.1):V(0,0,0));this.columnAnchor.copy(at);const out=at.clone().add(V(Math.cos(t)*16,space==='arch'?2:1,Math.sin(t)*16));await this.travel([{position:out,target:at,fov:39}],1900);}
  if(space==='gallery'){
   const radius=ellipse(this.entryAngle).length();this.access.rotation.y=Math.atan2(94.5*Math.cos(this.entryAngle),78*Math.sin(this.entryAngle));this.access.scale.z=radius/78;this.access.updateMatrixWorld(true);this.podium.geometry.dispose();this.podium.geometry=ovalGeometry(38.3,22.3,40.8,24.8,6,2,160,false,[0,this.entryAngle]);
   if(['exterior','column','arch','foundation'].includes(from)){await this.travel([this.accessPose([0,8,110],[0,5,76],48),this.accessPose([0,3.8,87],[0,4,66],58),this.accessPose([0,3.7,73],[0,3.8,54],61),this.accessPose([0,3.7,54],[0,4,36],61)],6200);}
   else await this.travel([this.accessPose([0,8,31],[0,4.5,55],60),this.accessPose([0,3.7,54],[0,4,74],61)],3200);
  }
  if(space==='interior'){
   if(from==='gallery')await this.travel([this.accessPose([0,4.5,43],[0,5.2,32],61),this.accessPose([0,8.8,36],[0,10,10],58),this.accessPose([0,17,18],[0,12,-15],54),this.pose([45,75,87],[0,20,0],54)],5300);
   else await this.travel([this.pose([45,75,87],[0,20,0],54)],2100);
  }
  if(space==='arena'){this.gateTarget=from==='gladiators'?1:0;if(from==='gladiators')await this.travel([this.pose([53,4.1,0],[41,7,0],61),this.pose([47,6.5,0],[36,8,0],61),this.pose([41,8.7,0],[20,9,0],58),this.pose([36,9,0],[15,9,0],58),this.pose([12,9.7,20],[0,10,-25],58)],5300);else await this.travel([this.pose([12,25,28],[0,6,0],48),this.pose([12,9.7,20],[0,10,-25],58)],3300);}
  if(space==='underground')await this.travel([this.pose([30,42,34],[0,1,0],48)],2400);
  if(space==='foundation')await this.travel([this.pose([90,13,116],[22,-2,72],48)],2200);
  if(space==='gladiators'){this.gateTarget=0;await this.travel([this.pose([66,2.8,0],[38,3,0],61),this.pose([61,3.8,0],[41,6.8,0],61)],3500);}
 }
 reset(){void this.go(this.activeSpace);}
 get state(){return {space:this.activeSpace,moving:this.moving,camera:this.camera.position.toArray(),target:this.controls.target.toArray(),deckOpacity:this.opacity,arenaOpening:this.deckProgress,hatchOpening:this.hatchHinge.rotation.z/(Math.PI*.55),liftHeight:this.lift.position.y,section:this.section,roof:this.roof.visible,roofDeployment:this.roofDeployment,drawCalls:this.renderer.info.render.calls};}
 setTheme(dark:boolean){this.renderer.setClearColor(dark?0x171f1b:0xe9ece4);}
 destroy(){this.disposed=true;cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();this.controls.dispose();this.renderer.dispose();this.renderer.forceContextLoss();}
}
