import sys
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
spd=float(sys.argv[1]);n=int(sys.argv[2]);df=int(sys.argv[3]);out=sys.argv[4];path=sys.argv[5] if len(sys.argv)>5 else '/home/claude/hero_build.html'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1180,'height':700},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+path);pg.wait_for_timeout(2500)
    pg.evaluate("document.getElementById('au').click();document.getElementById('ps').click()")
    pg.evaluate("""(sp=>{LS.forEach(q=>{q.pu=0;q.lt=null;q.se=null;q.se0=null;q.ts=null});st.F=.3;st.X=0;st.t=0;st.atk=-1;st.dsh=-1;for(const kk of['ca','caw','sb','sbw','sf','sfw','Psw','gs','gsw','Pm','Pmw'])st[kk]=0;st.Pm=null;st.Pf=null;st.Pfv=0;
      window.__sp=sp;window.__adv=(m)=>{for(let i=0;i<m;i++){window.__f=frame(sp*VB,1/60);draw(window.__f)}return window.__f.legs[0].u}})(%f)"""%spd)
    pg.evaluate("__adv(300)")
    bb=pg.locator('#c').bounding_box()
    ims=[]
    for i in range(n):
        u=pg.evaluate(f"__adv({df})")
        f=f'/home/claude/ws_{i}.png';pg.screenshot(path=f,clip={'x':bb['x']+110,'y':bb['y']+60,'width':420,'height':430});ims.append((Image.open(f),u))
    cols=6;S=Image.new('RGB',(ims[0][0].width*cols,ims[0][0].height*((n+cols-1)//cols)));d=ImageDraw.Draw(S)
    for i,(im,u) in enumerate(ims):S.paste(im,((i%cols)*im.width,(i//cols)*im.height));d.text(((i%cols)*im.width+6,(i//cols)*im.height+6),f"u0 {u:.2f}",fill=(255,255,0))
    S.save(out);print('errs',errs[:3]);b.close()
