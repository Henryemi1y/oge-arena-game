from playwright.sync_api import sync_playwright
import json,sys
url='file:///home/claude/hero_build.html'
t0=float(sys.argv[1]);t1=float(sys.argv[2])
JS="""([t0,t1])=>{const dt=1/60,pf=t=>t<2?0:t<5?lp(0,1,(t-2)/3):t<8?1:t<10?lp(1,2.3,(t-8)/2):t<14?2.3:t<16?lp(2.3,.4,(t-14)/2):t<18?lp(.4,1.6,(t-16)/2):t<20?lp(1.6,0,(t-18)/2):t<22?0:t<24?lp(0,2.3,(t-22)/2):2.3;
 LS.forEach(q=>{q.pu=0;q.lt=null;q.se=null;q.se0=null;q.ts=null});st.F=.3;st.X=0;st.t=0;st.atk=-1;st.dsh=-1;for(const k of['ca','caw','sb','sbw','sf','sfw','Psw','gs','gsw'])st[k]=0;st.Ps=null;st.Pm=null;st.Pmw=0;st.Pf=null;st.Pfv=0;
 const out=[];let pj=null,pj2=null;
 for(let n=0;n<t1*60;n++){const t=n*dt,v=pf(t)*VB,f=frame(v,dt);
  const cur=[f.legs[0].r1,f.legs[0].r2,f.legs[0].r3,f.legs[1].r1,f.legs[1].r2,f.legs[1].r3];let q=[];if(pj&&pj2)q=cur.map((c,k)=>Math.abs(c-2*pj[k]+pj2[k]));pj2=pj;pj=cur;
  if(t>=t0)out.push({t:+t.toFixed(3),g:+f.g.toFixed(3),v:+(v/VB).toFixed(2),P:+f.P.toFixed(1),Pr:+f.Pr.toFixed(1),u0:+f.legs[0].u.toFixed(3),u1:+f.legs[1].u.toFixed(3),b:+f.legs[0].beta.toFixed(3),cl0:+f.legs[0].cl.toFixed(1),cl1:+f.legs[1].cl.toFixed(1),q:q.map(x=>+x.toFixed(3)),r1:+cur[0].toFixed(3),r2:+cur[1].toFixed(3),rel:+f.legs[0].rel.toFixed(1),ax:+f.legs[0].ax.toFixed(1),ay:+f.legs[0].ay.toFixed(1),a:+f.legs[0].a.toFixed(3),ly:+f.legs[0].lift.toFixed(1),hy:+f.hy.toFixed(1),X:+f.X.toFixed(1)})}
 return out}"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();pg.goto(url);pg.wait_for_timeout(2500)
    r=pg.evaluate(JS,[t0,t1])
    for x in r:print(x)
    b.close()
