"""Собирает демо походок: встраивает src/engine/walker.js в src/characters/walkers.tpl.html. python3 tools/build_walkers.py [out]"""
import os, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
w = open(os.path.join(R, 'src/engine/walker.js'), encoding='utf-8').read()
t = open(os.path.join(R, 'src/characters/walkers.tpl.html'), encoding='utf-8').read()
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(R, 'src/characters/walkers.html')
open(out, 'w', encoding='utf-8').write(t.replace('/*__WALKER__*/', w)); print('built', out)
