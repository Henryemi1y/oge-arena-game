import sys,json,math
from playwright.sync_api import sync_playwright
path=sys.argv[1] if len(sys.argv)>1 else '/home/claude/hero_build.html'
JS="""(k=>{LS.forEach(q=>{q.pu=0;q.lt=null;q.se=null;q.se0=null;q.ts=null});st.F=.3;st.X=0;st.t=0;st.atk=-1;st.dsh=-1;for(const kk of['ca','caw','sb','sbw','sf','sfw','Psw','gs','gsw','Pm','Pmw'])st[kk]=0;st.Pm=null;st.Pf=null;st.Pfv=0;
 for(let i=0;i<120;i++)frame(0,1/60);__T.hit(k);const o=[];let n=0;
 while(n<200){const f=frame(0,1/60);n++;const a=f.arm[0],j=J.armN,dx=j.fist[0]-j.el[0],dy=j.fist[1]-j.el[1],fx=a.ex+dx*Math.cos(a.rf)-dy*Math.sin(a.rf),fy=a.ey+dx*Math.sin(a.rf)+dy*Math.cos(a.rf),ph=a.rf+a.w,vx=Math.cos(ph)*Math.cos(a.ya||0),vy=Math.sin(ph),ln=Math.max(.04,Math.hypot(vx,vy)),ang=Math.atan2(vy,vx);
  const L=f.legs;o.push({n,AT:f.AT,ak:f.ak,fx:a.ru-a.rf,w:a.w,ya:a.ya,fxF:f.arm[1].ru-f.arm[1].rf,tipx:fx+f.ox+Math.cos(ang)*SWH*.82*ln,tipy:fy+Math.sin(ang)*SWH*.82*ln,P:f.P,ox:f.ox,lean:f.lean,cl0:L[0].cl,cl1:L[1].cl,w0x:f.ox+L[0].ax,w1x:f.ox+L[1].ax,w0y:L[0].ay,w1y:L[1].ay,hold:f.hit1?1:0,LG:f.LGw,kf:L[1].r1-L[1].r2,kr:L[0].r1-L[0].r2});
  if(f.AT<0&&n>20)break}
 return o})"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+path);pg.wait_for_timeout(2500)
    for k in range(3):
        r=pg.evaluate(JS+f"({k})")
        fx=[x['fx'] for x in r];w=[x['w'] for x in r]
        print(f"kind {k}: frames {len(r)} elbow fx min {min(fx):.2f} max {max(fx):.2f} | wrist w {min(w):.2f}..{max(w):.2f} | far-arm fx {min(x['fxF'] for x in r):.2f}..{max(x['fxF'] for x in r):.2f}")
        print("  tip y max (below ground>0)",round(max(x['tipy'] for x in r),1),"clamp frames",sum(1 for x in r if x['cl0']>5 or x['cl1']>5),"max cl",round(max(max(x['cl0'],x['cl1']) for x in r),1),"P min",round(min(x['P'] for x in r)),"ox max",round(max(x['ox'] for x in r)))
        mm=[x for x in r if x['AT']>=0.0]
        # foot slip while planted
        sl=0;prev=None;slr=0
        for x in r:
            if prev and x['LG']>.995 and prev['LG']>.995: sl=max(sl,abs(x['w1x']-prev['w1x']),abs(x['w0x']-prev['w0x']))
            if prev and x['AT']>=.0: slr=max(slr,abs(x['w1x']-prev['w1x'])*(1 if x['w1y']>-135 else 0),abs(x['w0x']-prev['w0x'])*(1 if x['w0y']>-135 else 0))
            prev=x
        print("  foot dx/frame planted(LG>.97):",round(sl,2),"grounded-foot dx/frame any phase:",round(slr,1),"knee flex front/rear max deg",round(max(abs(x['kf']) for x in r)*57.3),round(max(abs(x['kr']) for x in r)*57.3), "hip margin",round(min(min(x['ox']-x['w0x'],x['w1x']-x['ox']) for x in r if abs(x['ox'])>40),1),"| at LG>.97 knee front/rear",round(max(abs(x['kf']) for x in r if x['LG']>.97)*57.3),round(max(abs(x['kr']) for x in r if x['LG']>.97)*57.3))
        print("  hold frames:",sum(1 for x in r if x['hold']), 'AT end',round(r[-1]['AT'],2),'n',r[-1]['n'])
    print(errs[:3]);b.close()
