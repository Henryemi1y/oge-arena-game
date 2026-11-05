from playwright.sync_api import sync_playwright
import json,sys
url=sys.argv[1] if len(sys.argv)>1 else 'file:///home/claude/hero_build.html'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1180,'height':700});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    pg.goto(url);pg.wait_for_timeout(3500)
    r=json.loads(pg.evaluate("JSON.stringify(window.__crit)"))
    for x in r['R']:print(f"{x[0]:34s} {x[1]:8.3f} {x[2]:10s} thr {x[3]}  -> {x[4]}")
    print('score',r['score'],'jk',r.get('jk'),r.get('jt'),'errs',errs[:3]);b.close()
