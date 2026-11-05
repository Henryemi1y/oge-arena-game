import sys,json
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
kind=int(sys.argv[1]);t0=float(sys.argv[2]);df=int(sys.argv[3]);n=int(sys.argv[4]);path=sys.argv[5] if len(sys.argv)>5 else '/home/claude/hero_build.html'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1180,'height':700},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+path);pg.wait_for_timeout(2500)
    pg.evaluate("document.getElementById('au').click();document.getElementById('ps').click()")
    pg.evaluate("""(k=>{LS.forEach(q=>{q.pu=0;q.lt=null;q.se=null;q.se0=null;q.ts=null});st.F=.3;st.X=0;st.t=0;st.atk=-1;st.dsh=-1;for(const kk of['ca','caw','sb','sbw','sf','sfw','Psw','gs','gsw','Pm','Pmw'])st[kk]=0;st.Pm=null;st.Pf=null;st.Pfv=0;
      for(let i=0;i<120;i++)frame(0,1/60);tips.length=0;window.__n=0;__T.hit(k);window.__adv=(m)=>{for(let i=0;i<m;i++){window.__f=frame(0,1/60);draw(window.__f)}return window.__f.AT}})(%d)"""%kind)
    bb=pg.locator('#c').bounding_box();print(bb)
    fs=[];done=0
    for i in range(n):
        m=int(round(t0*60)) if i==0 else df
        at=pg.evaluate(f"__adv({m})")
        f=f'/home/claude/atk_{kind}_{i}.png';pg.screenshot(path=f,clip={'x':bb['x']+60,'y':bb['y']+30,'width':620,'height':470});fs.append(f)
        fs[-1]=(f,at)
    ims=[(Image.open(f),at) for f,at in fs];cols=5
    S=Image.new('RGB',(ims[0][0].width*cols,ims[0][0].height*((n+cols-1)//cols)));d=ImageDraw.Draw(S)
    for i,(im,at) in enumerate(ims):S.paste(im,((i%cols)*im.width,(i//cols)*im.height));d.text(((i%cols)*im.width+6,(i//cols)*im.height+6),f"AT {at:.3f}",fill=(255,255,0))
    S.save(f'/home/claude/atkstrip_{kind}.png');print('errs',errs[:3])
    b.close()
