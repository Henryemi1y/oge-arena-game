// hero.js — герой-мечник. Анимация перенесена из src/hero/hero_run.html без изменений логики: frame, legPose, ik,
// runPelvis, таблица ATK, рисование drawChar/drawArm/drawLeg/drawCape и критик critic(). Для игры добавлены: мир 2,5D (ось z,
// масштаб по глубине, мировая позиция), управление, очередь ударов, геометрия клинка для попаданий, урон, режим души.
const Hero=(()=>{
const A=ASSETS.hero,J=A.J,L1=J.leg.knee[1]-J.leg.hip[1],L2=J.leg.ankle[1]-J.leg.knee[1],SOLE=J.leg.H-J.leg.ankle[1],REACH=L1+L2+SOLE,LMAX=(L1+L2)*.985,VB=REACH*.78,AX=J.leg.hip[0],HEEL=-66,BALL=117,SWH=800,O=24,YC=525,SL=200,PB=150,PF=215,YN=205,NP=[190,205];
let BW=.56,LW0=.12,WLP=0,TRP=.3,WD=.34,HD=.03,AE=.65,KV=1,ER=1.6,F0=3,WP=.32,PHC=.28,PHM=.58,PHT=.02,SW=.72,RW=400,SR=1.2,WH=0,LP=0,AK=0,LF=.27,PFLOOR=40,DPK=.4,DTR=4,SKA=0,SKB=.5,SKW=20;const RH0=.05,RA=.016,LW=(L1+L2)-.4,LC=(L1+L2)-.08;
let SC=.3,GY=0,GX=0; // в игре мир сдвигается и масштабируется трансформацией холста
// производительность: детали героя уменьшаются заранее (q=HQ), а рисуются в прежних единицах исходника
const HQ=.3,preScale=(im,q)=>{const c=cv(Math.max(1,Math.round(im.width*q)),Math.max(1,Math.round(im.height*q))),x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(im,0,0,c.width,c.height);c.q=c.width/im.width;return c},
 DI=(img,x,y)=>{const q=img.q||1;ctx.drawImage(img,x,y,img.width/q,img.height/q)};
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),sm=x=>{x=cl(x,0,1);return x*x*(3-2*x)},lp=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2,fr=x=>((x%1)+1)%1;
const ld=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s});
const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const sub=(im,x0,y0,x1,y1)=>{const c=cv(x1-x0,y1-y0);c.getContext('2d').drawImage(im,x0,y0,x1-x0,y1-y0,0,0,x1-x0,y1-y0);return c};
const crop=(im,y0,y1)=>sub(im,0,y0,im.width,y1);
function patch(im,cx,cy,r){const c=cv(2*r,2*r),x=c.getContext('2d');x.drawImage(im,cx-r,cy-r,2*r,2*r,0,0,2*r,2*r);x.globalCompositeOperation='destination-in';const g=x.createRadialGradient(r,r,r*.62,r,r,r);g.addColorStop(0,'#000');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,2*r,2*r);return c}
const dk=c=>{const d=cv(c.width,c.height),x=d.getContext('2d');x.drawImage(c,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(2,4,14,.36)';x.fillRect(0,0,d.width,d.height);return d};
const ARMSPLIT={N:216,F:215},FOFF={};let IMG;function init(){return Promise.all(['body','cape','armN','armF','leg','sword','guard'].map(k=>ld(A.img[k]))).then(([body,cape,armN,armF,leg,sword,guard])=>{
 const K=J.leg.knee[1],N=J.leg.ankle[1],P={body,cape,sword,guard,head:sub(body,0,0,body.width,YN+16),tt:sub(body,0,YN,body.width,YC+12),nc:patch(body,115,215,56),sb:sub(body,0,YC,SL+8,body.height),sf:sub(body,SL,YC,body.width,body.height)};
 Object.assign(P,{thigh:crop(leg,0,K+O),shin:crop(leg,K-O,N+O),foot:crop(leg,N-O,leg.height),kc:patch(leg,AX,K,66),ac:patch(leg,AX,N,54)});
 // рука режется по верхнему краю наруча (конец бинта): манжета и весь наруч целиком едут с предплечьем; под сгибом — круглая подкладка из бинта
 for(const[k,im]of[['N',armN],['F',armF]]){const E=J['arm'+k].el[1],Ys=ARMSPLIT[k];P['upper'+k]=crop(im,0,Ys+4);P['fore'+k]=crop(im,Ys-4,im.height);FOFF[k]=E-(Ys-4);P['ec'+k]=patch(im,J['arm'+k].el[0],Ys-30,34)}
 for(const k of['thigh','shin','foot','kc','ac','guard','upperN','foreN','ecN','upperF','foreF','ecF'])P[k+'D']=dk(P[k]);
 for(const k in P)P[k]=preScale(P[k],HQ);IMG=P})}
// ---------------- походка / бег ----------------
const st={X:0,F:.3,t:0,atk:-1,dsh:-1,Pa:0};
const LS=[{pu:0,lt:null,se:null},{pu:0,lt:null,se:null}];
// угол стопы в опоре: в ходьбе пятка→плоско→носок, в беге — плавный перекат с пятки на носок на всю опору
const aSt=(w,g,m)=>lp(w<.25?-.15*(1-sm(w/.25)):w<.6?0:.5*sm((w-.6)/.4),w<.45?lp(-.15,.08,sm(w/.45)):lp(.08,AE,Math.pow(cl((w-.45)/.55,0,1),ER)),g)*m;
function legPose(i,u,m,g,beta,step,S,lift,Pfl,sb,dt){const w=u/beta,Q=LS[i],off=-.07*REACH*g,td=step/2+off;let rel,ly=0,a;
 if(Q.pu>.85&&u<.15||Q.lt==null)Q.lt=st.X+td-step*w;
 // в стойке ноги плавно собираются в ровное положение под телом
 if(sb>0){const k=1-Math.exp(-5*dt*sb);if(u<beta)Q.lt+=(st.X+td-step*w-Q.lt)*k;else if(Q.se0!=null)Q.se0+=(-step/2+off-Q.se0)*k}
 if(u<beta){rel=Q.lt-st.X;Q.se=rel;a=aSt(w,g,1)}
 else{if(Q.pu<beta&&Q.se!=null)Q.se0=Q.se;const p0=Q.se0??(-step/2+off),tl=(u-beta)/(1-beta),t=tl+WH*g*Math.pow(Math.sin(Math.PI*tl),3),t2=t*t,t3=t2*t,m0=-S*(1-beta);const t4=t2*t2,t5=t4*t;rel=(1-10*t3+15*t4-6*t5)*p0+(t-6*t3+8*t4-3*t5)*m0+(10*t3-15*t4+6*t5)*td+(-4*t3+7*t4-3*t5)*m0;{const wk=1-sm(g/.4);if(wk>0){const Vs=-m0,Dl=td-p0+Vs,r=TRP,vp=1/(1-r),ramp=x=>vp*(x/2-r/(2*Math.PI)*Math.sin(Math.PI*x/r)),sg=tl<r?ramp(tl):tl>1-r?1-ramp(1-tl):vp*(r/2+tl-r),r2=p0+Dl*sg+m0*tl;rel=lp(rel,r2,wk)}}const tw=tl+.45*g*tl*(1-tl);ly=Math.pow(Math.sin(Math.PI*tw),2+LP*g+WLP*(1-g))*lift;a=lp(lp(.5,AE,g),-.15,sm(tl))+g*ER*(AE-.08)/.55*(1-beta)/beta*tl*Math.pow(1-tl,6)}
 Q.pu=u;ly*=m;a*=m;const wt=u<beta?sm(u/.1)*sm((beta-u)/.1):0,s=cl((a+.15)/.65,0,1),cx=lp(HEEL,BALL,s);
 let axv=rel-(cx*Math.cos(a)-SOLE*Math.sin(a)),ayh=ly+cx*Math.sin(a)+SOLE*Math.cos(a);
 // опорная стопа не может уйти дальше, чем достаёт нога при допустимой высоте таза: тогда стопа подтягивается, а таз не проваливается
 if(u<beta&&Pfl!=null){const vt=Pfl-ayh,axm=Math.sqrt(Math.max(0,LC*LC-vt*vt));if(vt>0&&Math.abs(axv)>axm){const c=cl(axv,-axm,axm);rel+=c-axv;axv=c;Q.lt=st.X+rel;Q.se=rel}}
 return{u,rel,lift:ly,a,wt,beta,ax:axv,ay:-ayh}}
function ik(hx,hy,ax,ay,Q,dt,fr=0,sk=0){let dx=ax-hx,dy=ay-hy,d=Math.hypot(dx,dy),c=0;const mx=L1+L2-.05;
 // стопа в воздухе: перед пределом длины ноги дистанция мягко насыщается (без излома траектории), опорная стопа не трогается
 if(fr>0&&d>1){const cs=12,ds=-cs*Math.log(Math.exp(-d/cs)+Math.exp(-mx/cs)),dd=d+(ds-d)*fr;dx*=dd/d;dy*=dd/d;d=dd}
if(d>mx){c=d-mx;dx*=mx/d;dy*=mx/d;d=mx}if(d<Math.abs(L1-L2)+1)d=Math.abs(L1-L2)+1;
 const a0=Math.atan2(dy,dx);let al=Math.acos(cl((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1));
 // «мягкое колено»: вблизи прямой ноги угол сгиба сглаживается во времени (иначе колено щёлкает при выпрямлении); смещение стопы при этом доли единицы
 if(Q){const th=Math.acos(cl((d*d-L1*L1-L2*L2)/(2*L1*L2),-1,1)),k=1-sm((th-SKA)/SKB);Q.ts=(Q.ts==null||sk<=0||th<=Q.ts)?th:th+(Q.ts-th)*Math.exp(-SKW*dt);if(sk>0&&k>0){const t2=Math.max(th+(Q.ts-th)*k*sk,0),d2=Math.sqrt(L1*L1+L2*L2+2*L1*L2*Math.cos(t2));d=Math.min(mx,d2);al=Math.acos(cl((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1))}}
 return{kx:hx+L1*Math.cos(a0-al),ky:hy+L1*Math.sin(a0-al),ax:hx+d*Math.cos(a0),ay:hy+d*Math.sin(a0),cl:c}}
// высота таза в беге выводится из опорной ноги: контакт ≈17° сгиба, середина опоры ≈36° (амортизация), в момент отрыва нога прямая (разгибание бедро-колено-стопа); дальше полёт по параболе (баллистика), скорости на стыках совпадают
const runPelvisOld=()=>{const ps=fr((st.F-.33/2)*2);return(LMAX+SOLE)-RH0*REACH-RA*REACH*Math.cos(TAU*ps)};
function runPelvis(g,m,beta,step,off0){
 const geo=(w,ph)=>{const a=aSt(w,g,m),s=cl((a+.15)/.65,0,1),cx0=lp(HEEL,BALL,s),axx=step/2+off0-w*step-(cx0*Math.cos(a)-SOLE*Math.sin(a)),ayh=cx0*Math.sin(a)+SOLE*Math.cos(a),d2=L1*L1+L2*L2+2*L1*L2*Math.cos(ph);return ayh+Math.sqrt(Math.max(0,d2-axx*axx))},
 Pc=geo(0,PHC),Pt=geo(1,PHT),S1=(geo(1,0)-geo(.97,0))/.03,T=.5-beta,k=T/beta,e=1e-3,
 dw=(geo(e,PHC)-Pc)/e,dph=(geo(0,PHC+e)-Pc)/e,vts=KV*Math.max(0,S1)*k,vcs=(dw+dph*F0)*k,
 her=(x,p0,m0,p1,m1,dx)=>{const x2=x*x,x3=x2*x;return(2*x3-3*x2+1)*p0+(x3-2*x2+x)*dx*m0+(-2*x3+3*x2)*p1+(x3-x2)*dx*m1};
 // сгиб колена в опоре: быстро нарастает после контакта (амортизация), затем монотонно разгибается до прямой ноги к отрыву; высота таза = ногой из геометрии стопы
 const fl=w=>w<WP?her(w/WP,PHC,F0,PHM,0,WP):her((w-WP)/(1-WP),PHM,0,PHT,0,1-WP),
 u0=fr(st.F),u1=fr(st.F+.5);
 if(u0<beta)return geo(u0/beta,fl(u0/beta));if(u1<beta)return geo(u1/beta,fl(u1/beta));
 const u=(u0>=beta&&u0<.5)?u0:u1,sf=cl((u-beta)/T,0,1);
 return her(sf,Pt,vts,Pc,vcs,1)}
const shp=(x,k)=>k<.01?x:Math.tanh(k*x)/Math.tanh(k),smin=(a,K)=>{const m=Math.min(...a);return m-Math.log(a.reduce((q,v)=>q+Math.exp(-K*(v-m)),0))/K},rot=(dx,dy)=>Math.atan2(-dx,dy),spr=(k,tg,dt,kk=110,dd=15)=>{st[k+'w']=(st[k+'w']||0)+(kk*(tg-(st[k]||0))-dd*(st[k+'w']||0))*dt;st[k]=(st[k]||0)+st[k+'w']*dt;return st[k]};
// ---------------- удары: ключевые позы ----------------
// ru — плечо, rf — предплечье (сгиб локтя fx=ru-rf всегда ≥0), w — кисть (клинок = rf+w), ya — разворот клинка из плоскости (0 — в плоскости, π — назад),
// ln — наклон корпуса, ox — сдвиг таза вперёд, LG — вес выпада, Ff/Rr — где стоят передняя и задняя стопы (в мире), fru/ffx — свободная рука, cp — взмах плаща;
// e: 0 плавно, 1 разгон (в удар), 2 торможение (после удара), 3 линейно
const CHN=['ru','rf','w','ya','ln','ox','LG','Ff','Rr','fru','ffx','cp'];
function mkA(T,hs,tr,rows){let p=null;const R=rows.map(r=>{const o={...(p||{}),...r};p=o;return o});return{T,hs,tr,R}}
const eas=[x=>sm(x),x=>Math.pow(x,2.2),x=>1-Math.pow(1-x,2.2),x=>x];
function atkKey(A,t){const R=A.R;let i=0;while(i<R.length-2&&t>=R[i+1].t)i++;const a=R[i],b=R[i+1],u=cl((t-a.t)/(b.t-a.t),0,1),e=eas[b.e||0](u),o={};for(const c of CHN)o[c]=a[c]+(b[c]-a[c])*e;return o}
const G0={ru:-1.1,rf:-1.8,w:.1,ya:0,ln:0,ox:0,LG:0,Ff:190,Rr:-225,fru:.35,ffx:.7,cp:0};
const ATK=[
 // 0 — удар сверху
 mkA(.80,[.30,.305],[.205,.34],[{t:0,...G0},{t:.18,e:0,ru:-2.4,rf:-2.9,w:.5,ln:-.12,ox:-16,LG:.4,fru:.95,ffx:.5,cp:-.12},
  {t:.24,e:1,ru:-1.55,rf:-2.0,w:.7,ln:.14,ox:30,LG:.9,fru:.6,ffx:.9,cp:.1},{t:.30,e:1,ru:-.78,rf:-.78,w:.9,ln:.32,ox:56,LG:1,fru:.1,ffx:1.1,cp:.3},
  {t:.305,e:3,ru:-.76,rf:-.76,ln:.34,ox:58},{t:.52,e:2,ru:-.45,rf:-.55,ln:.30,fru:.5,ffx:.8,cp:.1},{t:.80,e:0,...G0,ln:.04}]),
 // 1 — горизонтальный: замах назад (рука и клинок за спиной), дуга перед героем, проводка наискось вверх
 mkA(.86,[.36,.365],[.235,.375],[{t:0,...G0},{t:.24,e:0,ru:.7,rf:.15,w:-.45,ya:2.9,ln:-.16,ox:-26,LG:.5,Ff:219,Rr:-235,fru:-.6,ffx:.6,cp:-.15},
  {t:.30,e:1,ru:-.5,rf:-.55,w:.85,ya:1.35,ln:.10,ox:20,LG:.85,fru:.4,ffx:.9,cp:.1},{t:.36,e:1,ru:-1.05,rf:-1.12,w:.9,ya:0,ln:.34,ox:70,LG:1,fru:.9,ffx:1.2,cp:.35},
  {t:.365,e:3,ru:-1.0,rf:-1.08,ln:.36,ox:74},{t:.56,e:2,ru:-.7,rf:-1.7,w:.5,ya:-.9,ln:.30,fru:.7,ffx:1,cp:.1},{t:.86,e:0,...G0,ln:.04}]),
 // 2 — снизу вверх по диагонали
 mkA(.84,[.35,.355],[.215,.37],[{t:0,...G0},{t:.22,e:0,ru:.9,rf:.8,w:.45,ln:-.10,ox:-22,LG:.5,Ff:200,Rr:-220,fru:-.4,ffx:.5,cp:-.1},
  {t:.285,e:1,ru:-.2,rf:-.3,w:.75,ln:.12,ox:25,LG:.9,fru:.3,ffx:.8,cp:.1},{t:.35,e:1,ru:-1.7,rf:-1.8,w:.85,ln:.30,ox:55,LG:1,fru:.8,ffx:1.2,cp:.3},
  {t:.355,e:3,ru:-1.72,rf:-1.82,ln:.32,ox:58},{t:.56,e:2,ru:-1.9,rf:-2.0,ln:.28,fru:.6,ffx:1,cp:.1},{t:.84,e:0,...G0,ln:.04}])];
const BK=1300,BD=54,WMIN=-.55,WMAX=.95;
function frame(v0,dt){dt=cl(dt,1/240,.05);if(!Number.isFinite(st.Pf)||!Number.isFinite(st.Pfv)){st.Pf=null;st.Pfv=0}let v=v0,D=0,AT=-1;st.t+=dt;
 if(st.dsh>=0){st.dsh+=dt;D=sm(st.dsh/.05)*(1-sm((st.dsh-.18)/.1));v=Math.max(v,VB*(1.3+2*D));if(st.dsh>.34)st.dsh=-1}
 const A_=ATK[st.ak|0];if(st.atk>=0){const hs=A_.hs,sl=st.atk>=hs[0]&&st.atk<hs[1]?.06:1;st.atk+=dt*sl;if(sl==1&&st.atk>hs[0]&&st.atk-dt<hs[0])st.atk=hs[0];AT=st.atk;if(AT>A_.T)st.atk=-1}
 const vm=Math.min(v,2.6*VB),g=cl(spr('gs',sm((vm/VB-1.1)/.5),dt,36,12),0,1),m=sm(vm/(VB*.3)),beta=lp(BW,.33,g),S=lp(SW*REACH,SR*REACH,g),step=beta*S,lift=lp(LW0,LF,g)*REACH;
 const KA=AT>=0?atkKey(A_,AT):null,W=KA?sm(AT/.09)*(1-sm((AT-(A_.T-.22))/.22)):0,shk=KA&&AT>=A_.hs[0]&&AT<A_.hs[1]?Math.sin(st.t*110)*3.5:0;let hit1=false;if(KA&&AT>=A_.hs[0]&&!st.hd){st.hd=1;hit1=true}
 st.X+=v*dt;{const sb=sm((25-vm)/17),f0=fr(st.F),tgp=Math.abs(f0-.3)<Math.abs(f0-.8)?.3:.8,sr=cl((tgp-f0)*4,-.9,.9);st.F+=lp(vm/S,sr,sb)*dt}
 const off0=-.07*REACH*g,Rst=w=>{const a=aSt(w,g,m),s=cl((a+.15)/.65,0,1),cx0=lp(HEEL,BALL,s),axx=step/2+off0-w*step-(cx0*Math.cos(a)-SOLE*Math.sin(a));return cx0*Math.sin(a)+SOLE*Math.cos(a)+Math.sqrt(Math.max(0,LW*LW-axx*axx))};
 const Rpk=Math.max(Rst(.2),Rst(.3),Rst(.4),Rst(.5)),Pr=lp(runPelvisOld(),beta<.46?runPelvis(g,m,beta,step,off0):runPelvisOld(),sm((g-.45)/.5)),Pfl=lp(Rpk-8,Pr,g)-D*.07*REACH-PFLOOR;
 const sbi=sm((25-vm)/17);
 const Lg=[0,.5].map((o,i)=>legPose(i,fr(st.F+o),m,g,beta,step,S,lift,Pfl,sbi,dt));
 if(D>0){const ps=[[.36,-.05,-.35],[-.4,-.12,.55]];Lg.forEach((l,i)=>{l.ax=lp(l.ax,ps[i][0]*REACH,D);l.ay=lp(l.ay,-SOLE-ps[i][1]*-REACH*.0-Math.abs(ps[i][1])*REACH,D);l.a=lp(l.a,ps[i][2],D)})}
 let oxA=0,LGw=0,PLc=0;
 if(KA&&W>.001){oxA=KA.ox*W*(1-.6*g);LGw=KA.LG*W*(1-g);
  if(LGw>.001){const ft=(wx,a)=>{const s_=cl((a+.15)/.65,0,1),c_=lp(HEEL,BALL,s_);return{ax:wx-oxA-(c_*Math.cos(a)-SOLE*Math.sin(a)),ayh:c_*Math.sin(a)+SOLE*Math.cos(a),a}},
   Fo=ft(KA.Ff,-.04),Ro=ft(KA.Rr,.5);
   // задняя нога почти прямая (опора и толчок), таз опускается ровно настолько, насколько она позволяет
   PLc=Ro.ayh+Math.sqrt(Math.max(0,(LW-.05)**2-Ro.ax**2));
   // стопы не скользят по земле: при входе в выпад и при возврате они переставляются (подъём стопы), в опоре — стоят
   const ent=AT<A_.hs[0],sn=x=>Math.sin(Math.PI*cl(x,0,1)),lfR=ent?30*sn(LGw/.45):40*sn((1-LGw)/.7),lfF=ent?45*sn((LGw-.35)/.65):40*sn((1-LGw-.3)/.7);
   [[1,Fo,lfF],[0,Ro,lfR]].forEach(([i,T_,lf])=>{const l=Lg[i];l.ax=lp(l.ax,T_.ax,LGw);l.ay=lp(l.ay,-T_.ayh-lf,LGw);l.a=lp(l.a,T_.a,LGw);l.wt=lp(l.wt,lf>2?0:1,LGw)})}}
 const K=.035,Praw=-Math.log(Lg.reduce((q,l)=>q+Math.exp(-K*(-l.ay+Math.sqrt(Math.max(0,LC*LC-l.ax*l.ax))+RW*(1-l.wt))),0))/K;
 // таз при ходьбе: гладкая «волна» над опорной ногой (низ — в момент постановки стопы, верх — середина опоры), ноги почти прямые
 const dpk=lp(-.3,DPK,m),Ppk=Rpk-dpk;
 // ходьба: нога ставится ПРЯМОЙ и остаётся прямой всю опору — таз едет по дуге над ней (перевёрнутый маятник); сгибается нога только в конце опоры, пока таз опускается к постановке следующей
 const sW=fr(st.F)%.5,wL=sW/beta,Rw=w=>{const a=aSt(w,g,m),s_=cl((a+.15)/.65,0,1),cx0=lp(HEEL,BALL,s_),axx=step/2+off0-w*step-(cx0*Math.cos(a)-SOLE*Math.sin(a));return cx0*Math.sin(a)+SOLE*Math.cos(a)+Math.sqrt(Math.max(0,(L1+L2-.2)**2-axx*axx))},
 PN=lp(Rw(wL),Rw(0)-.3,sm((sW-WD)/(.5-HD-WD))),Pbob=Ppk-(Ppk-PN)*m;
 const Kq=14,Pcap=smin(Lg.map(l=>-l.ay+Math.sqrt(Math.max(0,LC*LC-l.ax*l.ax))),Kq),Pt=smin([Pbob,Pcap],Kq);
 // вниз таз идёт сразу (ограничение длиной ноги), вверх — с ограничением скорости и ускорения, без рывка после смены походки
 if(st.Pf==null){st.Pf=Pt;st.Pfv=0}{const vd=(Pt-st.Pf)/dt;if(vd<=0){st.Pfv=Math.min(st.Pfv,vd);st.Pf=Pt}else{const AM=(4.8+95*(1-g)*sm((m-.9)/.1))*REACH,vc=Math.min(.5*REACH,Math.sqrt(2*AM*(Pt-st.Pf)),st.Pfv+AM*dt);st.Pfv=Math.min(vd,Math.max(vc,0));st.Pf+=st.Pfv*dt}}const Pwalk=st.Pf;
 const Prun=smin([Pr,Praw+1],8);let P=lp(Pwalk,Prun,g)-D*.07*REACH+(m<1?(Math.sin(st.t*1.8)-1)*.12*(1-m):0);if(LGw>.001)P=lp(P,PLc,LGw);P+=shk*.5;
 const gs=sm(g/.6),sw=AT>=0?(AT<.2?sm(AT/.2):AT<.3?1:0):0,hy=-P,legs=Lg.map((l,li)=>{const k=ik(0,hy,l.ax,l.ay,LS[li],dt,m*gs*(l.u>=l.beta?sm((l.u-l.beta)/.06):1-sm(l.u/(.2*l.beta))),l.u>=l.beta?1:1-sm(l.u/(.2*l.beta)));return{...l,...k,r1:rot(k.kx,k.ky-hy),r2:rot(k.ax-k.kx,k.ay-k.ky),r3:l.a}});
 const AS=0,LNa=KA?KA.ln*W:0;
 const lean=lp(lp(.03,.08,m),.4,g)+.012*Math.sin(st.F*TAU*2)*m+D*.38+LNa-(st.hurtL||0);st.Pa+=(P-st.Pa)*Math.min(1,dt*2.5);
 const dyn=D*.38+LNa*.55,hrot=.03-lean+.5*dyn,hdy=0; // голова едет вместе с телом (шея), а взгляд держится в одну точку: поворот головы гасит наклон корпуса
 const sx=J.body.sh[0]-J.body.hip[0],sy=J.body.sh[1]-J.body.hip[1],shx=sx*Math.cos(lean)-sy*Math.sin(lean),shy=sx*Math.sin(lean)+sy*Math.cos(lean);
 const ox=oxA,tg=.04+.26*cl(vm/VB,0,2.4)+D*.5+(KA?KA.cp*W:0)+.03*Math.sin(st.F*TAU*2);spr('ca',tg,dt,60,9);
 const cxl=J.body.cape[0]-J.body.hip[0],cyl=J.body.cape[1]-J.body.hip[1],cx=cxl*Math.cos(lean)-cyl*Math.sin(lean),cy=hy+cxl*Math.sin(lean)+cyl*Math.cos(lean);
 const r0=legs[0].r1,r1_=legs[1].r1,sp_=cl(vm/VB,0,1.7),tB=.65*Math.max(r0,r1_)+.03*Math.sin(st.t*8)*sp_,tF=1.15*Math.min(r0,r1_)+.04*Math.sin(st.t*9+1)*sp_;spr('sb',tB,dt);spr('sf',tF,dt);
 const arm=[['armN',0],['armF',.5]].map(([k,o])=>{const j=J[k],n=k=='armN',am=n?lp(.3,.42,g):lp(.5,.85,g),th=am*shp(Math.cos(TAU*(st.F+o+.5)),AK*g)*m;let ru=-th+Math.sin(st.t*1.8+o)*.03*(1-m),sp0=th/.5,fx=(n?lp(.18,1.2,g):lp(.28,1.35,g))+.15*(sp0+Math.sqrt(sp0*sp0+.04))*(1-g),rf;
  fx*=lp(.4,1,m);rf=ru-fx;
  if(D>0){ru=lp(ru,n?.9:1.1,D);rf=lp(rf,n?.5:.7,D)}
  let wT=0,w=0,ya=0;
  if(KA){const fxb=cl(ru-rf,0,2.7);if(n){ru=lp(ru,KA.ru,W);rf=ru-cl(lp(fxb,KA.ru-KA.rf,W),0,2.7);wT=lp(0,KA.w,W);ya=KA.ya*W}else{ru=lp(ru,KA.fru,W);rf=ru-cl(lp(fxb,KA.ffx,W),0,2.7)}}
  const lx=j.el[0]-j.sh[0],ly=j.el[1]-j.sh[1],ex=shx+lx*Math.cos(ru)-ly*Math.sin(ru),ey=hy+shy+lx*Math.sin(ru)+ly*Math.cos(ru);const fdx=j.fist[0]-j.el[0],fdy=j.fist[1]-j.el[1],fy=ey+fdx*Math.sin(rf)+fdy*Math.cos(rf);
  // клинок тяжёлый: угол клинка догоняет кисть пружиной с инерцией; кисть доворачивается только в пределах возможного, клинок не уходит под землю
  if(n){if(KA){if(!st.bo){st.bo=1;st.bl=rf;st.blw=0}st.blw+=(BK*(rf+wT-st.bl)-BD*st.blw)*dt;st.bl+=st.blw*dt;
   const ph=st.bl,yv=Math.cos(ya),Lb=SWH*.82,sy_=Math.sin(ph),lim=(-10-fy)/Lb;let phc=ph;if(sy_>lim&&Math.hypot(Math.cos(ph)*yv,sy_)>.3){const a_=Math.asin(cl(lim,-1,1));phc=Math.cos(ph)>=0?a_:Math.PI-a_}
   w=cl(phc-rf,WMIN,WMAX);st.bl=rf+w}else st.bo=0}
  return{ru,rf,w,ya,ex,ey}});
 return{Pr,Praw,Pbob,Pcap,PN,m,g,D,hy,P,legs,lean,shx,shy,arm,v,cx,cy,ca:Math.max(st.ca,lean+.06),sb:st.sb,sf:st.sf,hrot,hdy,ox,shk,AS,AT,ak:st.ak|0,hit1,LGw,X:st.X}}
// ---------------- рисование ----------------
let tips=[]; // след клинка (локальные координаты героя)
function pc(img,x,y,px,py,r){ctx.save();ctx.translate(GX+x*SC,GY+y*SC);ctx.rotate(r);ctx.scale(SC,SC);DI(img,-px,-py);ctx.restore()}
function drawLeg(l,hy,d){const D=d?'D':'';pc(IMG['shin'+D],l.kx,l.ky,AX,O,l.r2);pc(IMG['foot'+D],l.ax,l.ay,AX,O,l.r3);pc(IMG['thigh'+D],0,hy,AX,J.leg.hip[1],l.r1);
 pc(IMG['kc'+D],l.kx,l.ky,66,66,(l.r1+l.r2)/2);pc(IMG['ac'+D],l.ax,l.ay,54,54,(l.r2+l.r3)/2);pc(IMG['guard'+D],l.kx,l.ky,J.guard.piv[0],J.guard.piv[1],(l.r1+l.r2)/2)}
function drawArm(a,f,near,rec,K,DK,mode='all'){const k=K||(near?'N':'F'),D=DK!=null?DK:(near?'':'D'),j=J['arm'+k];
 if(near&&mode!='arm'&&mode!='fist'){const dx=j.fist[0]-j.el[0],dy=j.fist[1]-j.el[1],fx=a.ex+dx*Math.cos(a.rf)-dy*Math.sin(a.rf),fy=a.ey+dx*Math.sin(a.rf)+dy*Math.cos(a.rf),im=IMG.sword,w=im.width*SWH/im.height,ph=a.rf+a.w,vx=Math.cos(ph)*Math.cos(a.ya||0),vy=Math.sin(ph),ln=Math.max(.04,Math.hypot(vx,vy)),ang=Math.atan2(vy,vx);
  if(rec){tips.push({x:fx+f.ox+Math.cos(ang)*SWH*.82*ln,y:fy+Math.sin(ang)*SWH*.82*ln,bx:fx+f.ox+Math.cos(ang)*SWH*.2*ln,by:fy+Math.sin(ang)*SWH*.2*ln,X:f.X,t:st.t});if(f.hit1)st.fl={x:fx+f.ox+Math.cos(ang)*SWH*.74*ln,y:fy+Math.sin(ang)*SWH*.74*ln,t:st.t}}
  ctx.save();ctx.translate(GX+fx*SC,GY+fy*SC);ctx.rotate(ang+Math.PI/2);ctx.scale(SC,SC*ln);ctx.drawImage(im,-w/2,-SWH*.82,w,SWH);ctx.restore()}
 if(mode=='sword')return;
 if(mode=='fist'){const dx=j.fist[0]-j.el[0],dy=j.fist[1]-j.el[1],fx=a.ex+dx*Math.cos(a.rf)-dy*Math.sin(a.rf),fy=a.ey+dx*Math.sin(a.rf)+dy*Math.cos(a.rf);ctx.save();ctx.beginPath();ctx.arc(GX+fx*SC,GY+fy*SC,62*SC,0,TAU);ctx.clip();pc(IMG['fore'+k+D],a.ex,a.ey,j.el[0],FOFF[k],a.rf);ctx.restore();return}
 pc(IMG['upper'+k+D],f.shx,f.hy+f.shy,j.sh[0],j.sh[1],a.ru);pc(IMG['ec'+k+D],a.ex,a.ey,34,34,a.ru);pc(IMG['fore'+k+D],a.ex,a.ey,j.el[0],FOFF[k],a.rf)}
function drawCape(f){const c=IMG.cape,q=c.q||1,w=c.width/q,h=c.height/q,n=26,sh=h/n,top=J.cape.top,sp=cl(f.v/VB,0,2.6);ctx.save();ctx.translate(GX+f.cx*SC,GY+f.cy*SC);ctx.rotate(f.ca);ctx.scale(SC,SC);
 for(let i=0;i<n;i++){const u=i/n,dx=Math.sin(st.t*7+u*6)*(6+30*sp)*u*u;ctx.drawImage(c,0,i*sh*q,c.width,(sh+1)*q,-top[0]+dx,-top[1]+i*sh,w,sh+1)}ctx.restore()}
function drawChar(f,rec){const far=f.legs[1],near=f.legs[0],hx=J.body.hip[0],hy_=J.body.hip[1];ctx.save();ctx.translate(f.ox*SC,0);
 const sk=(f.shk||0)*SC,L_=FACE<0;ctx.save();ctx.translate(sk,0);if(L_)drawArm(f.arm[0],f,true,rec,'N','D');else drawArm(f.arm[1],f,false);ctx.restore();drawLeg(far,f.hy,true);drawLeg(near,f.hy,false);ctx.translate(sk,0);
 ctx.save();ctx.translate(GX,GY+f.hy*SC);ctx.rotate(f.lean);ctx.scale(SC,SC);
 ctx.save();ctx.translate(PB-hx,YC-hy_);ctx.rotate(f.sb);DI(IMG.sb,-PB,0);ctx.restore();ctx.save();ctx.translate(PF-hx,YC-hy_);ctx.rotate(f.sf);DI(IMG.sf,-(PF-SL),0);ctx.restore();
 ctx.translate(-hx,-hy_);DI(IMG.tt,0,YN);
 ctx.save();ctx.translate(NP[0],NP[1]);ctx.rotate(f.hrot);ctx.translate(0,f.hdy);DI(IMG.head,-NP[0],-NP[1]);ctx.restore();
 ctx.save();ctx.translate(115,215);ctx.rotate(f.hrot*.5);DI(IMG.nc,-56,-56);ctx.restore();ctx.restore();
 drawCapeOver(f);
 if(L_){drawArm(f.arm[1],f,false,false,'N','','arm')}else drawArm(f.arm[0],f,true,rec);ctx.restore()}
function drawCapeOver(f){drawCape(f)}
let FACE=1;
// ---------------- критик (из hero_run.html) ----------------
// ---------------- критик ----------------
function critic(){const dt=1/60,T=30,pf=t=>t<2?0:t<5?lp(0,1,(t-2)/3):t<8?1:t<10?lp(1,2.3,(t-8)/2):t<14?2.3:t<16?lp(2.3,.4,(t-14)/2):t<18?lp(.4,1.6,(t-16)/2):t<20?lp(1.6,0,(t-18)/2):t<22?0:t<24?lp(0,2.3,(t-22)/2):2.3;
 const sv=JSON.stringify(st),old={...st},oldLS=JSON.parse(JSON.stringify(LS));LS.forEach(q=>{q.pu=0;q.lt=null;q.se=null;q.se0=null;q.ts=null});st.F=.3;st.X=0;st.t=0;st.atk=-1;st.dsh=-1;for(const k of['ca','caw','sb','sbw','sf','sfw','Psw','gs','gsw'])st[k]=0;st.Ps=null;st.Pm=null;st.Pmw=0;st.Pf=null;st.Pfv=0;
 const Hd_=[],Fx_=[],Pn_=[],Gr_=[];const M={jumpR:0,slip:0,slipT:0,sole:0,clamp:0,stretch:0,jump:0,fl:0},prev=[null,null],Ps=[],th=[],ar=[],Pw_=[];let Pa_=0,Pbr=1e9;let pj=null,pj2=null,pg=0;
 for(let n=0;n<T*60;n++){const t=n*dt,v=pf(t)*VB,f=frame(v,dt),steady=Math.abs(f.g-pg)<1e-4&&(f.g<.002||f.g>.998);pg=f.g;if(t>14&&t<17.5&&f.g<.8)Pbr=Math.min(Pbr,f.P);
  f.legs.forEach((l,i)=>{const wx=f.X+l.rel,stance=l.u<l.beta*.97&&l.u>.03&&f.v>=25;if(prev[i]&&stance&&prev[i].st){const d=Math.abs(wx-prev[i].wx);if(steady)M.slip=Math.max(M.slip,d);else M.slipT=Math.max(M.slipT,d)}prev[i]={wx,st:stance};
   if(f.v>=25&&l.wt>.99){const s=cl((l.a+.15)/.65,0,1),cx=lp(HEEL,BALL,s);M.sole=Math.max(M.sole,Math.abs(l.ay+(cx*Math.sin(l.a)+SOLE*Math.cos(l.a))))}
   M.clamp+=l.cl>5?1:0;M.stretch=Math.max(M.stretch,Math.abs(Math.hypot(l.kx,l.ky-f.hy)-L1),Math.abs(Math.hypot(l.ax-l.kx,l.ay-l.ky)-L2))});
  const cur=[f.legs[0].r1,f.legs[0].r2,f.legs[0].r3,f.legs[1].r1,f.legs[1].r2,f.legs[1].r3,f.arm[0].ru,f.arm[0].rf,f.arm[1].ru,f.arm[1].rf,f.lean,f.sb,f.sf,f.hrot];
  if(pj&&pj2)for(let k=0;k<cur.length;k++){const q=Math.abs(cur[k]-2*pj[k]+pj2[k])/Math.max(1,(f.v/VB)**2);if(q>M.jump){M.jump=q;M.jk=k;M.jt=t}if(f.g>.998&&q>M.jumpR){M.jumpR=q;M.jkR=k}}pj2=pj;pj=cur;
  if(f.g>.99){Ps.push(f.P);const f0=f.legs[0],f1=f.legs[1];if(f0.wt<.01&&f1.wt<.01)M.fl++}
  if(f.v>=VB*.95&&f.g<.001){th.push(f.legs[0].r1);ar.push(f.arm[0].ru)}if(f.g>.998&&t>=11&&t<14)Gr_.push((f.lean+f.hrot)*57.3);if(Math.abs(f.v-VB)<1&&f.g<.001&&t>=5.8&&t<8.5){{Hd_.push((f.lean+f.hrot)*57.3);f.legs.forEach(l=>{if(l.wt>.9&&l.u<l.beta*.6)Fx_.push(Math.abs(l.r1-l.r2)*57.3)})};Pw_.push(f.P);Pn_.push(n);if(Pw_.length>2&&Pn_[Pn_.length-3]==n-2)Pa_=Math.max(Pa_,Math.abs(Pw_[Pw_.length-1]-2*Pw_[Pw_.length-2]+Pw_[Pw_.length-3]))}}
 const sf_=Object.assign(st,old);st.Pm=null;st.Pmw=0;st.Pf=null;st.Pfv=0;oldLS.forEach((q,i)=>Object.assign(LS[i],q));
 const rg=Math.max(...Ps)-Math.min(...Ps),mean=a=>a.reduce((x,y)=>x+y,0)/a.length,cor=(a,b)=>{const ma=mean(a),mb=mean(b);let n=0,da=0,db=0;for(let i=0;i<a.length;i++){n+=(a[i]-ma)*(b[i]-mb);da+=(a[i]-ma)**2;db+=(b[i]-mb)**2}return n/Math.sqrt(da*db)},c=cor(th,ar);
 const sc=(v,thr)=>v<=thr?10:Math.round(10*cl(1-(v-thr)/(3*thr),0,1)*10)/10,fl=M.fl/60;
 const R=[['Скольжение стопы',M.slip,'ед/кадр',.05,sc(M.slip,.05)],['… при торможении (стопа втягивается)',M.slipT,'ед/кадр',10,sc(M.slipT,10)],['Подсадка таза при торможении',Math.max(0,(Math.min(...Pw_)-Pbr)/(L1+L2)*100),'% ноги',8,sc(Math.max(0,(Math.min(...Pw_)-Pbr)/(L1+L2)*100),8)],['Стопа над землёй',M.sole,'ед',1,sc(M.sole,1)],['Растяжение костей',M.stretch,'ед',.5,sc(M.stretch,.5)],['Нога не достаёт (IK)',M.clamp,'кадров',0,sc(M.clamp,.5)],
  ['Качание таза (шаг)',(Math.max(...Pw_)-Math.min(...Pw_))/(L1+L2)*100,'% ноги',6,sc((Math.max(...Pw_)-Math.min(...Pw_))/(L1+L2)*100,6)],
  ['Полуприсед: сгиб колена (шаг)',mean(Fx_),'°',25,sc(mean(Fx_),25)],['Макс. сгиб опорного колена',Math.max(...Fx_),'°',35,sc(Math.max(...Fx_),35)],['Взгляд: поворот головы (шаг)',Math.max(...Hd_)-Math.min(...Hd_),'°',1,sc(Math.max(...Hd_)-Math.min(...Hd_),1)],['Взгляд: поворот головы (бег)',Math.max(...Gr_)-Math.min(...Gr_),'°',1,sc(Math.max(...Gr_)-Math.min(...Gr_),1)],['Рывок таза (шаг)',Pa_,'ед/кадр²',2,sc(Pa_,2)],['Колебание таза (бег)',rg/(L1+L2)*100,'% ноги',9,sc(rg/(L1+L2)*100,9)],['Фаза полёта (бег)',fl,'с',.05,fl>.05?10:Math.round(fl/.05*100)/10],['Рывок сустава (ускорение)',M.jump,'рад/кадр²',.03,sc(M.jump,.03)],['… только бег',M.jumpR,'рад/кадр²',.03,sc(M.jumpR,.03)],['Руки против ног',c,'корр.',-.7,c<-.7?10:sc(c+1.7,1)]];
 return{R,jk:M.jk,jt:M.jt,score:Math.min(...R.map(r=>r[4]))}}
// ================= игра =================
const H={x:1000,z:.62,hp:100,maxhp:100,inv:0,hurt:0,dead:0,SV:0,SZ:0,soul:false,f:null,hist:[],swing:0,hitSet:new Set(),blade:null,prevBlade:null,combo:{n:0,q:0,last:-9},t:0,kbv:0,flash:0,alpha:1,stepAcc:0,hidden:false};
function reset(x,z){Object.assign(H,{x,z,hp:H.maxhp,inv:0,hurt:0,dead:0,SV:0,SZ:0,soul:false,hist:[],blade:null,prevBlade:null,combo:{n:0,q:0,last:-9},kbv:0,flash:0,alpha:1,hidden:false});
 Object.assign(st,{X:0,F:.3,t:0,atk:-1,dsh:-1,Pa:0,Pf:null,Pfv:0,hurtL:0});LS.forEach(q=>{q.pu=0;q.lt=null;q.se=null;q.se0=null;q.ts=null});FACE=1;H.f=frame(0,DT)}
function hit(k){if(st.atk<0&&!H.dead){st.atk=0;st.ak=k;st.hd=0;st.bo=0;H.swing++;H.hitSet=new Set();Snd.swing(k);return true}return false}
function dash(){if(st.dsh<0&&!H.dead){st.dsh=0;H.inv=Math.max(H.inv,.38);Snd.dash();FX.dust(H.x,H.z,4,.4)}}
// ЛКМ: три удара по очереди; клик во время удара ставится в очередь; пауза >1,5 с — серия заново (как в hero_run.html)
function cbHit(){const c=H.combo;if(st.atk<0){if(H.t-c.last>1.5)c.n=0;hit(c.n);c.n=(c.n+1)%3;c.last=H.t;c.q=0}else c.q=1}
// геометрия клинка в локальных координатах героя (та же, что в drawArm при рисовании меча)
function bladeLocal(f){const j=J.armN,a=f.arm[0],dx=j.fist[0]-j.el[0],dy=j.fist[1]-j.el[1],fx=a.ex+dx*Math.cos(a.rf)-dy*Math.sin(a.rf),fy=a.ey+dx*Math.sin(a.rf)+dy*Math.cos(a.rf),ph=a.rf+a.w,vx=Math.cos(ph)*Math.cos(a.ya||0),vy=Math.sin(ph),ln=Math.max(.04,Math.hypot(vx,vy)),ang=Math.atan2(vy,vx);
 return{bx:fx+f.ox+Math.cos(ang)*SWH*.1*ln,by:fy+Math.sin(ang)*SWH*.1*ln,tx:fx+f.ox+Math.cos(ang)*SWH*.82*ln,ty:fy+Math.sin(ang)*SWH*.82*ln}}
function toWorld(lx,ly,x=H.x,z=H.z,face=FACE){const s=W.CS*zs(z);return{x:x+face*lx*s,y:zy(z)+ly*s}}
// inp: {x,z,run,dash,combo,atk(0..2|-1)}
function update(dt,inp){
 H.t+=dt;const atk=st.atk>=0;let tg=inp.x*(inp.run?2.3:1),tz=inp.z*(inp.run?1.7:1)*.8;if(atk||H.dead){tg=0;tz=0}
 let want=tg;if(H.SV*tg<0||(Math.abs(H.SV)<.04&&tg*FACE<0))want=0;
 const acc=(Math.abs(want)<Math.abs(H.SV)?(atk?5.5:4.2):2.6)*dt;H.SV+=cl(want-H.SV,-acc,acc);if(Math.abs(H.SV)<.04&&tg*FACE<0)FACE=-FACE;
 H.SZ+=cl(tz-H.SZ,-3.2*dt,3.2*dt);if(Math.abs(H.SZ)<1e-3&&!tz)H.SZ=0;
 if(inp.dash)dash();if(inp.combo)cbHit();if(inp.atk>=0)hit(inp.atk);
 H.calm=(H.calm||0)+dt;if(H.calm>4&&!H.dead&&H.hp<H.maxhp)H.hp=Math.min(H.maxhp,H.hp+2.5*dt); // вне боя здоровье понемногу возвращается
 H.hurt=Math.max(0,H.hurt-dt);st.hurtL=.28*sm(H.hurt/.25);H.inv=Math.max(0,H.inv-dt);H.flash=Math.max(0,H.flash-dt*4);
 const k=Math.hypot(H.SV,H.SZ),X0=st.X,f=frame(k*VB,dt),dX=st.X-X0,s=W.CS*zs(H.z);H.f=f;
 if(H.combo.q&&st.atk<0)cbHit();if(st.atk>=0)H.combo.last=H.t;
 // путь кадра (по нему идёт фаза стоп) раскладывается на x и z; рывок — вперёд по взгляду
 if(f.D>0&&k<1e-3)H.x+=dX*s*FACE;else if(k>1e-6){const ex=f.D>0?Math.max(0,dX-k*VB*dt):0;H.x+=(dX-ex)*s*(H.SV/k)+ex*s*FACE;H.z+=(dX-ex)*s*(H.SZ/k)/ZPX}
 if(H.kbv){H.x+=H.kbv*dt;H.kbv*=Math.exp(-dt*9);if(Math.abs(H.kbv)<2)H.kbv=0}
 H.x=cl(H.x,W.XMIN,W.XMAX);H.z=cl(H.z,.02,1);
 // шаги: звук и лёгкая пыль на постановке стопы
 f.legs.forEach((l,i)=>{const on=l.u<l.beta&&f.v>=25;if(on&&!H['st'+i]){Snd.step(.15+.25*f.g,0);if(f.g>.5)FX.dust(H.x+FACE*l.rel*s,H.z,2,.15)}H['st'+i]=on});
 // клинок в мире — только в окне удара (след клинка)
 H.prevBlade=H.blade;H.blade=null;
 if(st.atk>=0){const A_=ATK[st.ak];if(st.atk>=A_.tr[0]-.03&&st.atk<=A_.tr[1]+.01){const b=bladeLocal(f),p=toWorld(b.bx,b.by),q=toWorld(b.tx,b.ty);H.blade={x1:p.x,y1:p.y,x2:q.x,y2:q.y,z:H.z,ak:st.ak,swing:H.swing,hit1:f.hit1}}}
 H.hist.push({f,x:H.x,z:H.z,face:FACE});if(H.hist.length>14)H.hist.shift();
 return f}
function damage(n,fromX,kb=1){if(H.dead||H.inv>0||H.soul)return false;H.calm=0;H.hp=Math.max(0,H.hp-n);H.inv=.7;H.hurt=.35;H.flash=1;H.kbv=Math.sign(H.x-fromX||1)*kb*170;Snd.hurt();Cam.kick(5+n*.35);FX.sparks(H.x,H.z,110,8,'255,140,120',260);if(H.hp<=0)H.dead=1;return true}
// рисование в мире
function drawAt(f,x,z,face,alpha,rec){
 SC=W.CS*zs(z);GX=0;GY=0;const F0=FACE;FACE=face;
 ctx.save();ctx.translate(sx(x),zy(z));if(face<0)ctx.scale(-1,1);ctx.globalAlpha=alpha;drawChar(f,rec);
 if(rec){
  tips=tips.filter(p=>st.t-p.t<.16);if(f.AT>=ATK[f.ak].tr[0]&&f.AT<ATK[f.ak].tr[1]&&tips.length>1){ctx.save();ctx.lineCap='round';for(let i=1;i<tips.length;i++){const a=tips[i-1],b=tips[i],al=1-(st.t-b.t)/.16;ctx.strokeStyle=`rgba(190,225,255,${.7*al})`;ctx.lineWidth=16*al*SC/.3;ctx.shadowColor='#6fb4ff';ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(a.x*SC,a.y*SC);ctx.lineTo(b.x*SC,b.y*SC);ctx.stroke()}ctx.restore()}
  if(st.fl&&st.t-st.fl.t<.16){const a=1-(st.t-st.fl.t)/.16,X=st.fl.x*SC,Y=st.fl.y*SC,r=70*SC/.3*(1+.8*(1-a)),gr=ctx.createRadialGradient(X,Y,0,X,Y,r);gr.addColorStop(0,`rgba(255,255,255,${.9*a})`);gr.addColorStop(.35,`rgba(170,215,255,${.5*a})`);gr.addColorStop(1,'rgba(120,180,255,0)');ctx.fillStyle=gr;ctx.fillRect(X-r,Y-r,2*r,2*r)}}
 ctx.restore();FACE=F0}
function draw(){const f=H.f;if(!f||H.hidden)return;
 if(f.D>.05){for(const k of[3,6,9,12]){const h=H.hist[H.hist.length-1-k];if(h)drawAt(h.f,h.x,h.z,h.face,.3*(1-k/14)*H.alpha,false)}}
 drawAt(f,H.x,H.z,FACE,H.alpha,true);
 if(H.flash>0){ctx.save();ctx.globalCompositeOperation='lighter';drawAt(f,H.x,H.z,FACE,.55*H.flash,false);ctx.restore()}
 if(H.inv>0&&!H.soul&&f.D<.05&&Math.floor(H.t*20)%2)drawAt(f,H.x,H.z,FACE,.25,false)}
function shadow(){if(!H.hidden)drawShadow(H.x,H.z,40,.4)}
function height(){return 1180*W.CS*zs(H.z)}
return{init,update,draw,shadow,damage,reset,hit,dash,critic,frame,bladeLocal,toWorld,height,H,st,LS,ATK,get FACE(){return FACE},set FACE(v){FACE=v},VB,J};
})();
