import sys
src=open('/home/claude/hero_run.html').read();a=open('/home/claude/hero_side4.json').read()
out=sys.argv[1] if len(sys.argv)>1 else '/home/claude/hero_build.html'
open(out,'w').write(src.replace('__A__',a));print('built',out)
