import sys,json
from playwright.sync_api import sync_playwright
path=sys.argv[1] if len(sys.argv)>1 else '/home/claude/hero_build.html'
JS="""(()=>{LS.forEach(q=>{q.pu=0;q.lt=null;q.se=null;q.se0=null;q.ts=null});st.F=.3;st.X=0;st.t=0;st.atk=-1;st.dsh=-1;for(const k of['ca','caw','sb','sbw','sf','sfw','Psw','gs','gsw','Pm','Pmw'])st[k]=0;st.Pm=null;st.Pf=null;st.Pfv=0;
 for(let i=0;i<300;i++)frame(VB,1/60);
 let pf=null,mxF=0,mxT=0,mxG=0,mxK=0,pw=null,pth=null,fl=[],cad=0,F0=st.F;
 for(let i=0;i<240;i++){const f=frame(VB,1/60),l=f.legs[0],fx=Math.abs(l.r1-l.r2)*57.3,wx=f.X+l.ax;
  if(pf!=null){mxF=Math.max(mxF,Math.abs(fx-pf));mxT=Math.max(mxT,Math.abs(l.r1-pth)*57.3);if(l.u>=l.beta)mxG=Math.max(mxG,Math.abs(wx-pw))}
  pf=fx;pth=l.r1;pw=wx;fl.push(fx)}
 return {kneeVelMax:mxF,thighVelMax:mxT,swingFootGroundSpeedMax:mxG,vframe:VB/60,stepsPerSec:2*(st.F-F0)/4,flexMax:Math.max(...fl)}})()"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();pg.goto('file://'+path);pg.wait_for_timeout(2500)
    print(json.dumps(pg.evaluate(JS)));b.close()
