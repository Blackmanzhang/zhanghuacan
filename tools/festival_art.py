"""Generate the Mid-Autumn woodblock print with the project's original printmaking tools."""
from math import sin, cos, pi
from random import Random
from artwork import Print, curve, path, bird, sea

R = Random(915)
g = Print(1180, 610, "#85afa9", "#e6d9ab")
# The unbroken moon and broad pools of ink are framed like a landscape print.
g.oval(829, 179, 114, 114, "#e7c077")
g.oval(827, 176, 109, 109, "#f5d699")
for i in range(330):
    x, y = R.uniform(720, 930), R.uniform(70, 279)
    if (x-827)**2 + (y-176)**2 < 98**2:
        g.line([(x,y),(x+R.uniform(1,8),y+.4)], R.choice(["#e9c986","#f9dfa7"]), .7)
for y in [70,98,144,173,205,230]:
    x=R.uniform(55,750); width=R.uniform(85,260)
    for j in range(5):
        g.line(curve((x+j*6,y+j*2),(x+width*.2,y+j*2-5),(x+width*.8,y+j*2+2),(x+width-j*5,y+j*2-1)),"#cccfb4",.9)
def coast(level,amplitude,phase,color):
    xs=list(range(-8,1191,4))
    outline=[(x,level+amplitude*(sin(x/127+phase)*.58+cos(x/65+phase)*.27+sin(x/22+phase)*.13)) for x in xs]
    g.layer(outline,color)
    for x,y in outline[::2]:
        g.line([(x,y+3),(x+R.uniform(-10,2),y+R.uniform(4,14))],color,.7)
coast(308,58,.3,"#8fa99b")
coast(337,54,1.7,"#688e82")
coast(359,36,2.4,"#416e65")
def roof(x,y,s):
    tile="#31594c"; wall="#d2ba8a"
    g.rect(x,y,36*s,15*s,wall)
    g.poly([(x-5*s,y+2*s),(x+4*s,y-8*s),(x+27*s,y-8*s),(x+40*s,y+2*s)],tile)
    g.line([(x-7*s,y),(x+3*s,y-6*s),(x+29*s,y-6*s),(x+41*s,y)],"#b48f66",1.2)
    for k in [6,16,26]:g.rect(x+k*s,y+4*s,4*s,7*s,"#3d594c")
# An abstract shoreline village and a many-tiered coastal pagoda.
for i in range(23):
    x=i*25-25;roof(x,355+4*sin(x/45),R.uniform(.54,1.2))
for i in range(14):
    x=900+i*24;roof(x,353+4*sin(x/51),R.uniform(.5,1))
def pagoda(x,base,s):
    for i in range(6):
        cy=base-i*14*s;w=(20-i*2.1)*s
        g.rect(x-w*.56,cy-11*s,w*1.12,13*s,"#d1b386")
        g.poly([(x-w*1.3,cy-12*s),(x-w*.55,cy-15*s),(x,cy-21*s),(x+w*.6,cy-15*s),(x+w*1.3,cy-12*s),(x+w*.8,cy-9*s),(x-w*.8,cy-9*s)],"#365b4d")
        for k in [-.3,0,.3]:g.rect(x+w*k-1,cy-7*s,2*s,5*s,"#486552")
    g.line([(x,base-91*s),(x,base-103*s)],"#3d604e",1.8)
pagoda(223,349, .93)
sea(g,lambda x:364+2*sin(x/150),"#779e8f",["#abc1a8","#638e83","#bed0b1","#91ad94"],lambda x,y:1.5*sin(x/48+y/23),6)
for j in range(170):
    y=R.uniform(370,585); wide=18+(y-360)*.48;x=R.gauss(826,wide*.45);l=R.uniform(4,30)
    g.line([(x-l,y),(x,y-.7),(x+l*.7,y)],R.choice(["#dbce97","#d2c695","#b5bd95"]),R.uniform(.7,2))
def junk(x,base,k):
    def point(xy):return [(x+a*k,base+b*k) for a,b in xy]
    def poly(xy,fill):g.poly(point(xy),fill)
    def line(xy,fill,width=1):g.line(point(xy),fill,max(.6,width*k))
    hull="#244b45"
    poly([(-82,-13),(-52,-4),(34,-4),(73,-11),(92,-25),(79,-5),(64,2),(49,8),(-46,11),(-73,4)],hull)
    line([(-76,-8),(-45,1),(41,-2),(73,-10)],"#c49761",2)
    poly([(-33,-12),(-27,-25),(11,-23),(23,-12)],"#986644")
    line([(-26,-19),(8,-18)],"#dfbb7d",2)
    for mx,height,width,colour in [(14,146,57,"#b36142"),(-39,90,35,"#bd784a")]:
        line([(mx+2,-6),(mx-1,-height-7)],hull,2.8)
        pts=[(mx+1,-height),(mx+width*.52,-height+10),(mx+width*.81,-height+28),(mx+width,-height*.48),(mx+width*.89,-24),(mx-3,-18),(mx-7,-height*.49)]
        poly(pts,colour)
        for j in range(7):
            f=j/7; yy=-height+11+f*(height-32)
            right=width*(.50+.48*sin((f+.1)*pi*.72))
            line([(mx-3,yy+3),(mx+right*.42,yy+2),(mx+right,yy-2)],"#784e39",1.65)
            line([(mx-1,yy+5),(mx+right*.92,yy+2)],"#d09963",1)
        line([(mx-1,-height),(mx+2,-10),(76,-10)],"#5a5c46",.9)
    line([(-92,16),(-34,17),(64,11)],"#5b8173",1.9)
junk(628,423,1.3)
junk(363,392,.35)
for depth,col in [(472,"#598c7c"),(535,"#376c61"),(588,"#27584f")]:
    edge=lambda x,d=depth: d+12*sin(x/112+d)+8*cos(x/50+d)-12*x/1180
    sea(g,edge,col,["#72a18a","#497e70","#8cab91"],lambda x,y:1.2*sin(x/29+y),6)
for x,y,s in [(580,119,.82),(609,99,.62),(644,110,.58),(867,80,.55),(901,95,.40)]:
    bird(g,x,y,s,"#446a5e")
g.save("midautumn",915)
