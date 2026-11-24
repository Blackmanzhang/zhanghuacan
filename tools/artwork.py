"""Original raster illustrations for 海上有信. Run with Python, Pillow and NumPy."""
from pathlib import Path
from math import sin, cos, pi, exp
import random
import numpy as np
from PIL import Image, ImageDraw, ImageColor

OUT = Path(__file__).resolve().parents[1] / "public" / "art"
OUT.mkdir(parents=True, exist_ok=True)
rng = random.Random(23)
S = 2


def rgb(c):
    return np.array(ImageColor.getrgb(c), dtype=float)


def blend(a, b, t):
    return tuple(np.uint8(rgb(a)*(1-t)+rgb(b)*t))


class Print:
    def __init__(self, width, height, sky, ground):
        self.w, self.h = width, height
        self.im = Image.new("RGB", (width*S,height*S))
        self.draw = ImageDraw.Draw(self.im)
        for j in range(height*S):
            self.draw.line([(0,j),(width*S,j)], fill=blend(sky,ground,j/(height*S)))

    def pts(self, points):
        return [(round(x*S),round(y*S)) for x,y in points]

    def poly(self, points, color):
        self.draw.polygon(self.pts(points),fill=color)

    def line(self, points, color, width=1):
        self.draw.line(self.pts(points),fill=color,width=max(1,round(S*width)),joint="curve")

    def oval(self,x,y,rx,ry,color):
        self.draw.ellipse(self.pts([(x-rx,y-ry),(x+rx,y+ry)]),fill=color)

    def rect(self,x,y,w,h,color):
        self.poly([(x,y),(x+w,y),(x+w,y+h),(x,y+h)],color)

    def layer(self,profile,color):
        self.poly(profile+[(profile[-1][0],self.h+10),(profile[0][0],self.h+10)],color)

    def save(self,name,seed):
        im = self.im.resize((self.w,self.h),Image.Resampling.LANCZOS)
        pix = np.array(im).astype(float)
        n = np.random.default_rng(seed)
        fiber = n.normal(0,2.8,(self.h,self.w))+n.normal(0,0.48,(self.h,1))
        pix += fiber[:,:,None]
        im=Image.fromarray(np.uint8(np.clip(pix,0,255)))
        im.save(OUT / (name+".png"),optimize=True)


def curve(a,b,c,d,n=35):
    points=[]
    for i in range(n+1):
        t=i/n; u=1-t
        points.append((u**3*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t**3*d[0],
                       u**3*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t**3*d[1]))
    return points


def path(start,*parts):
    pts=[start]
    for b,c,d in parts:
        pts.extend(curve(pts[-1],b,c,d)[1:])
    return pts


def bird(g,x,y,s,col):
    g.poly(path((x,y),((x+3*s,y-3*s),(x+6*s,y-4*s),(x+10*s,y-3*s)),
                 ((x+6*s,y-3*s),(x+2*s,y),(x,y+2*s)),
                 ((x-3*s,y-1*s),(x-6*s,y-2*s),(x-11*s,y-1*s)),
                 ((x-8*s,y-4*s),(x-3*s,y-3*s),(x,y))),col)


def hills(g,pts,c,crags,depth=20):
    g.layer(pts,c)
    left=pts[0][0]; right=pts[-1][0]
    xx,yy=zip(*pts)
    for _ in range(int((right-left)*0.64)):
        x=rng.uniform(left,right)
        y=np.interp(x,xx,yy)+rng.uniform(2,depth)
        length=rng.uniform(2,13)
        g.line([(x,y),(x+length*0.65,y-length*0.26)],rng.choice(crags),0.55)


def sea(g, edge, base, inks, waves, step=5.3):
    xs=list(range(-4,g.w+6,4))
    points=[(x,edge(x)) for x in xs]
    g.layer(points,base)
    for row in np.arange(4,g.h-min(y for _,y in points)+48,step):
        i=-15+rng.uniform(-30,8)
        while i<g.w:
            length=rng.uniform(5,62)
            q=[(x,edge(x)+row+waves(x,row)) for x in np.linspace(i,i+length,max(5,int(length/3)))]
            if min(y-edge(x) for x,y in q)>1:
                g.line(q,rng.choice(inks),rng.uniform(.45,1.75))
            i+=length+rng.uniform(2,20)


def lighthouse(g,x,y,k):
    def P(points): return [(x+a*k,y+b*k) for a,b in points]
    def p(points,c):g.poly(P(points),c)
    def l(points,c,w=1):g.line(P(points),c,w*k)
    def r(a,b,w,h,c):p([(a,b),(a+w,b),(a+w,b+h),(a,b+h)],c)
    cream="#f9ead0"; shadow="#c3c7a9"; red="#ac543b"; dr="#654a3a"; ink="#2c5047"
    # Narrowing masonry tower and red bands with lit and unlit portions.
    def wall(t):return 25-11*t/150
    for lo,hi,col,shade in [(0,33,cream,shadow),(33,62,red,"#864936"),(62,92,cream,shadow),
                             (92,119,red,"#864936"),(119,148,cream,shadow)]:
        p([(-wall(lo),-lo),(wall(lo),-lo),(wall(hi),-hi),(-wall(hi),-hi)],col)
        p([(wall(lo)*0.25,-lo),(wall(lo),-lo),(wall(hi),-hi),(wall(hi)*.24,-hi)],shade)
        for yy in np.arange(lo+2,hi,4.8):
            a=wall(yy)
            l([(a*.28,-yy),(a*.98,-yy)],dr if col==red else "#aeb89d",.6)
    r(-26,-5,52,5,"#8f9477")
    for yy in [21,76,129]:
        r(-4,-yy-7,7,13,ink);r(-3,-yy-6,1.3,11,"#ecd59c")
    # Lantern room, balcony and handrail.
    r(-19,-151,38,5,ink);r(-22,-156,44,5,dr)
    r(-12,-174,24,18,"#d3e3d1")
    p([(-12,-174),(0,-174),(-8,-156),(-12,-156)],"#fae7ae")
    for xx in [-13,-7,1,9,13]:r(xx,-175,1.9,20,ink)
    p([(-19,-174),(-16,-178),(-3,-186),(2,-187),(17,-177),(19,-174)],red)
    p([(0,-186),(16,-178),(19,-174),(6,-174)],"#764732")
    l([(-20,-174),(20,-174)],ink,2);l([(0,-185),(0,-193)],ink,1.8)
    for xx in range(-24,25,5):l([(xx,-155),(xx,-164)],ink,.9)
    l([(-25,-164),(25,-164)],ink,1.4);l([(-25,-160),(25,-160)],ink,.7)
    # Low keeper's cottage.
    p([(23,-4),(70,-3),(70,-19),(47,-26),(23,-19)],"#e8d8ae")
    p([(48,-24),(70,-19),(70,-3),(48,-3)],"#b6b799")
    p([(17,-18),(30,-32),(57,-32),(73,-19),(49,-20)],red)
    p([(49,-20),(59,-30),(73,-19)],"#87513a")
    for xx in [29,38,58]:r(xx,-15,4,7,ink)


def hero():
    g=Print(1500,620,"#c6e1dc","#f1e8cf")
    g.oval(1190,163,62,62,"#e8b795")
    for i in range(55):
        y=rng.uniform(26,320);x=rng.uniform(550,1510);w=rng.uniform(15,130)
        g.line([(x,y),(x+w*.7,y-.8),(x+w,y)],"#e2e7d8",.7)
    for x,y,s in [(987,157,1.03),(1030,141,.76),(1054,161,.59),(1009,170,.55),
                 (1270,75,.77),(1300,66,.47),(861,207,.6)]:
        bird(g,x,y,s,"#5d7770")
    # Distant mountain range and fine, fading offshore swell.
    distant=path((606,359),((687,356),(733,329),(772,337)),((830,345),(858,315),(911,328)),
       ((949,330),(986,296),(1024,306)),((1070,328),(1103,287),(1153,294)),
       ((1210,299),(1291,262),(1357,286)),((1401,294),(1445,284),(1505,267)))
    hills(g,distant,"#a2bfb1",["#a9c3b4","#92b3a6"],16)
    e=lambda x:362+3*sin(x/74)
    sea(g,e,"#b2cfc0",["#d7dfc8","#95b9ac","#c9d6bd"],lambda x,r:1.7*sin(x/48+r/6),4.3)
    # Ochre, deeply cut promontory with horizontal strata.
    cliff=path((952,396),((1003,386),(1014,380),(1050,377)),((1090,373),(1100,357),(1134,350)),
       ((1162,344),(1175,334),(1204,325)),((1235,313),(1252,322),(1266,309)),
       ((1295,289),(1353,287),(1396,279)),((1450,265),(1474,261),(1503,262)))
    bottom=[(1504,405),(1475,412),(1452,407),(1418,429),(1389,419),(1360,441),(1325,426),
            (1282,442),(1250,426),(1224,438),(1191,415),(1154,421),(1128,404),(1088,407),(1053,397),(1004,401)]
    g.poly(cliff+bottom,"#b49c75")
    xx,yy=zip(*cliff)
    for i in range(132):
        x=rng.uniform(994,1500); top=np.interp(x,xx,yy); dep=rng.uniform(4,24+(x-994)*.077)
        d=rng.uniform(1,7)
        g.line([(x,top+dep),(x-d,top+dep+7),(x-d*2.7,top+dep+11)],rng.choice(["#667660","#8c8466","#c9b68c","#9c906c"]),rng.uniform(.7,2.4))
    shore=[(x,y+max(2,(x-955)*.06)+3*sin(x/11)) for x,y in cliff]
    g.poly(cliff+list(reversed(shore)),"#466f58")
    for i in range(340):
        x=rng.uniform(996,1501); y=np.interp(x,xx,yy)+rng.uniform(0,1)*max(1,(x-955)*.058)
        g.line([(x,y),(x+9,y-3)],rng.choice(["#6c8866","#335d50","#9ca77c"]),.9)
    # Cypress and low shrubs cluster behind the lighthouse.
    for _ in range(55):
        x=rng.uniform(1380,1510);yy0=np.interp(x,xx,yy)+2;h=rng.uniform(4,21)
        g.poly([(x-2,yy0),(x-3.5,yy0-h*.46),(x+.8,yy0-h),(x+3.7,yy0-h*.48),(x+3,yy0)],"#3b604f")
    lighthouse(g,1314,299,1.09)
    for x,y,s in [(1105,413,1.0),(1187,434,.8),(966,405,.5),(1254,451,1.1)]:
        g.poly([(x-17*s,y),(x-10*s,y-4*s),(x-4*s,y-8*s),(x+3*s,y-5*s),(x+11*s,y-6*s),(x+19*s,y)],"#698677")
        g.line([(x-20*s,y+1.5),(x+23*s,y+1.5)],"#e3debf",1.5)
    # Wide directional sea swells, with etched contour lines.
    for top,stretch,off,col,lines in [(459,34,0,"#94b8a7",["#baccb0","#739e8e"]),
            (499,37,.75,"#77a391",["#99b6a0","#5c8b7b","#a8bba1"]),
            (546,39,2,"#477e71",["#699889","#90ac91","#477969"]),
            (603,45,4,"#2c665c",["#548474","#779d84"])]:
        edge=lambda x,top=top,st=stretch,off=off:top+st*sin(x/200+off)+9*sin(x/72+off)+37*(1-x/1500)
        sea(g,edge,col,lines,lambda x,r:2.6*sin(x/39+r/23)+1.5*sin(x/74+r/7),4.6)
    # Very small sail, for scale.
    x,y=922,384
    g.poly([(x-11,y),(x+13,y),(x+7,y+3),(x-6,y+3)],"#527367")
    g.line([(x,y),(x,y-25)],"#726e50",1)
    g.poly([(x-1,y-24),(x-1,y-3),(x-11,y-3)],"#f3e7c8")
    g.poly([(x+1,y-18),(x+9,y-3),(x+1,y-3)],"#c19170")
    g.save("hero",31)


def waves():
    g=Print(720,400,"#ede8cf","#e8dcb9")
    for i in range(90):
        y=rng.uniform(5,235);x=rng.uniform(0,720)
        g.line([(x,y),(x+rng.uniform(2,42),y)],"#cbbfa6",.65)
    def breaker(x,y,sz,dark,mid,ivory):
        def p(points):return [(x+a*sz,y+b*sz) for a,b in points]
        def drawcurve(start,*seg):return p(path(start,*seg))
        out=drawcurve((-300,119),((-215,128),(-156,81),(-115,33)),((-68,-24),(-48,-101),(23,-114)),
                      ((65,-123),(108,-94),(99,-64)),((84,-81),(60,-83),(46,-67)),
                      ((9,-28),(98,17),(153,55)),((197,88),(211,109),(250,151)))
        area=out+p([(260,230),(-300,230)])
        g.poly(area,mid)
        painted=g.im.copy()
        # Engraved wave contours converge on the top of the crest.
        for i in range(25):
            f=i/24
            pts=drawcurve((-288+1.4*i,122+5*i),((-198,127+4*i),(-152+1.6*i,88+4*i),(-109+3*i,37+3*i)),
                          ((-63+2.2*i,-17+3*i),(-52+1.8*i,-95+6*i),(18+0.2*i,-104+9*i)))
            g.line(pts,dark if i%4 else ivory,(.95+(.3 if i%4==0 else 0))*sz)
        for i in range(18):
            pts=drawcurve((56+i*.7,-66+i*4),((49+i*1.8,-43+i*5),(77+i*2,-11+i*5),(151+i*2,47+i*5)),
                          ((188+i,72+i*5),(205+i,101+i*4),(248+i,135+i*5)))
            g.line(pts,dark,sz*.86)
        mask=Image.new("1",g.im.size,0)
        ImageDraw.Draw(mask).polygon(g.pts(area),fill=1)
        painted.paste(g.im,mask=mask)
        g.im=painted
        g.draw=ImageDraw.Draw(g.im)
        ridge=drawcurve((-173,81),((-111,28),(-94,-25),(-60,-67)),((-37,-99),(-9,-118),(24,-116)),
                        ((57,-119),(90,-103),(100,-81)))
        g.line(ridge,ivory,5.7*sz)
        for i in range(26):
            pt=ridge[int(len(ridge)*(.09+i*.033))];jx,jy=pt
            w=rng.uniform(4,10)*sz;h=rng.uniform(3,13)*sz
            g.line(curve((jx,jy),(jx+w*1.3,jy-h),(jx+2*w,jy-h*.4),(jx+w*1.8,jy+h*.22)),ivory,2.8*sz)
        for i in range(26):
            a=rng.uniform(-2.8,-.25);r=rng.uniform(31,95)
            cx=27+cos(a)*r;cy=-87+sin(a)*r*.58
            g.oval(x+cx*sz,y+cy*sz,rng.uniform(.6,2)*sz,rng.uniform(.6,2)*sz,ivory)
    breaker(521,214,.83,"#679397","#96b6ad","#f1ead4")
    breaker(206,244,1.27,"#2b6577","#578998","#f3ebcf")
    breaker(613,322,.9,"#245366","#467485","#e9e6c8")
    breaker(52,406,.65,"#1c4e61","#33667a","#e3debf")
    g.save("wave",1)


def lanterns():
    g=Print(720,400,"#e8d5ab","#d7b282")
    # Carved bands of timber rafters and bracket ends.
    g.poly([(0,0),(720,0),(720,27),(0,111)],"#754e38")
    for i in range(10):
        g.line([(0,13+i*9),(720,-69+i*9)],"#a27a52",1.4)
    for x,y in [(81,102),(338,71),(587,41)]:
        g.poly([(x-30,y-9),(x+28,y-17),(x+17,y+10),(x+8,y+12),(x+6,y+29),(x-9,y+31),(x-14,y+13)],"#8d6243")
    def lamp(cx,cy,rx,ry,ink):
        g.line([(cx,0),(cx,cy-ry-9)],"#5e4a37",2)
        g.oval(cx,cy,rx,ry,"#ad5c3c")
        for ix in np.arange(-.96,1,.048):
            bx=cx+rx*ix
            if abs(ix)<.6: c=blend("#edbc78","#bd7449",abs(ix))
            else: c=blend("#be794d","#a65a3e",min(1,(abs(ix)-.6)/.4))
            r=ry*np.sqrt(1-ix*ix)
            g.line([(bx,cy-r),(bx,cy+r)],c,max(1,rx*.05))
        for j in np.linspace(-.94,.94,13):
            pts=[(cx+rx*j*(.38+.62*sin(pi*t)**.74), cy-ry+2*ry*t) for t in np.linspace(.02,.98,45)]
            g.line(pts,ink,1.4)
        for t in np.arange(.1,.91,.032):
            a=rx*np.sqrt(1-(2*t-1)**2)
            g.line(curve((cx-a,cy-ry+2*ry*t),(cx-a*.4,cy-ry+2*ry*t+5),(cx+a*.4,cy-ry+2*ry*t+5),(cx+a,cy-ry+2*ry*t)),ink,.52)
        for sg in [-1,1]:
            y=cy+sg*(ry-3)
            g.rect(cx-rx*.36,y-4,rx*.72,8,"#674933");g.line([(cx-rx*.36,y),(cx+rx*.36,y)],"#c69b60",1.5)
        for j in range(-4,5):
            g.line([(cx+j*.35,cy+ry+3),(cx+j*.66,cy+ry+21),(cx+j,cy+ry+ry*.53+2*sin(j))],ink,1.2)
        g.oval(cx,cy+ry+13,3.6,4.5,"#a2633d")
    lamp(85,176,77,62,"#945a3e");lamp(552,210,115,98,"#975b3d");lamp(305,164,53,46,"#9a6849")
    g.save("lantern",2)


def leaves():
    g=Print(720,400,"#e1e2bf","#c5d0a6")
    # Botanical plate: curved stems and paired serrated leaves.
    def leaf(A,B,width,light,dark):
        dx=B[0]-A[0];dy=B[1]-A[1];n=np.hypot(dx,dy); nx=-dy/n;ny=dx/n
        def point(t,side):
            mid=sin(pi*t)*width*.115
            hw=sin(pi*t)**.88*width
            return (A[0]+dx*t+nx*(mid+side*hw),A[1]+dy*t+ny*(mid+side*hw))
        ts=np.linspace(0,1,65)
        for s,k in [(-1,dark),(1,light)]:
            outer=[point(t,s*(.93+.07*(i%4)/3)) for i,t in enumerate(ts)]
            g.poly(outer+[point(t,0) for t in ts[::-1]],k)
            for t in np.linspace(.10,.89,18):
                a=point(t,0);c=point(min(.98,t+.13),s*.93);b=point(t+.05,s*.52)
                g.line(curve(a,b,b,c), "#8b9b70" if s==-1 else "#637f5a", .8)
        g.line([point(t,0) for t in ts],"#d1ce92",1.5)
    patterns=[((84,423),(355,-12),[(.28,(-71,219),35),(.41,(312,288),48),(.58,(93,84),41),(.72,(379,126),38),(.88,(273,-20),28)]),
              ((433,439),(572,18),[(.23,(337,298),43),(.34,(682,297),47),(.54,(366,137),42),(.69,(696,101),39),(.85,(471,15),36),(.91,(601,-25),23)])]
    for a,b,branch in patterns:
        center=curve(a,(a[0]+85,a[1]-135),(b[0]-67,b[1]+110),b,100)
        g.line(center,"#5a7654",5);g.line(center,"#a6aa77",1.3)
        for f,end,w in branch:
            begin=center[int(f*100)];base=(begin[0]+(end[0]-begin[0])*.14,begin[1]+(end[1]-begin[1])*.14)
            g.line([begin,base],"#70845b",3)
            leaf(base,end,w,"#829868","#557953")
    g.save("leaf",3)


def boat():
    g=Print(720,400,"#c8d9c5","#e2d8ae")
    g.oval(520,82,40,40,"#e4c995")
    hills(g,path((0,184),((59,181),(82,163),(111,167)),((144,168),(151,146),(191,151)),
                 ((230,162),(246,131),(299,143)),((353,158),(448,124),(499,137)),
                 ((555,157),(606,138),(720,142))),"#99b5a2",["#acbb9f","#8ea997"],24)
    sea(g,lambda x:188+2*sin(x/69),"#81aa9a",["#aebfa2","#63988b","#c8c8a5"],lambda x,r:1.5*sin(x/29+r/9),4.9)
    # Small wheelhouse and fishing skiff tied alongside the weathered jetty.
    outline=path((145,268),((204,279),(319,286),(482,258)),((470,281),(444,298),(406,308)),
                 ((331,321),(233,317),(183,298)),((163,290),(152,279),(145,268)))
    g.poly(outline,"#345951")
    g.poly(path((150,270),((246,285),(395,281),(477,259)),((469,268),(452,277),(432,284)),
                ((318,304),(220,304),(174,286)),((161,281),(152,275),(150,270))),"#ae7950")
    g.line(curve((146,268),(245,285),(385,285),(484,258)),"#ebe0b8",4.5)
    g.line(curve((167,285),(274,313),(413,297),(459,279)),"#d3a673",1.4)
    g.poly([(288,279),(299,235),(355,232),(376,274)],"#e7d8ad")
    g.poly([(330,274),(335,234),(355,232),(376,274)],"#a3b5a1")
    g.poly([(290,238),(295,231),(356,228),(364,234)],"#496c60")
    for x in [301,312,323]:
        g.poly([(x,241),(x+8,241),(x+7,253),(x-2,253)],"#46695d")
    g.poly([(339,239),(351,238),(359,253),(337,253)],"#476e62")
    g.line([(243,278),(238,121)],"#5e5e46",3)
    g.line([(239,124),(207,275)],"#77765a",.9)
    g.line([(239,124),(431,268)],"#807c5e",.9)
    g.poly([(239,125),(267,132),(239,140)],"#b46c4c")
    for i in range(7):
        g.line([(237,180+i*4),(216,248+i*1.1),(198,271)],"#a9a283",1)
    for x in [231,397]:
        g.oval(x,288,5,7,"#3b5046");g.oval(x,288,2,3,"#8b8e6e")
    # Jetty enters from the right-hand edge, its piling reflected in the water.
    for x in [526,583,666,711]:
        g.poly([(x,243),(x+10,241),(x+10,325),(x+3,327)],"#675e48")
        g.line([(x+4,247),(x+5,322)],"#aa9168",1.5)
        for j in range(5):g.line([(x-1-j,329+j*3),(x+14+j,328+j*3)],"#779c89",1.5)
    g.poly([(510,239),(720,212),(720,226),(513,253)],"#897553")
    g.poly([(510,238),(720,207),(720,215),(510,244)],"#ceba8c")
    for x in [534,615,687]:
        g.rect(x,213-(x-534)*.12,6,24,"#78684d");g.oval(x+3,213-(x-534)*.12,3,1.5,"#baa580")
    g.line(curve((476,261),(499,275),(512,263),(536,220)),"#686149",1)
    for x,y,s in [(390,84,.86),(415,73,.68),(450,84,.51)]:bird(g,x,y,s,"#667f6a")
    g.save("boat",4)


def mountains():
    g=Print(720,400,"#dfe3cc","#eee2bd")
    g.oval(483,66,32,32,"#ecd3a6")
    def range_line(base,peaks):
        xs=np.arange(-5,728,3,dtype=float)
        yy=base+8*np.sin(xs/41)+5*np.sin(xs/18.3)
        for center,height,spread in peaks:
            yy-=height*np.exp(-np.abs((xs-center)/spread)**1.3)
        return list(zip(xs,yy))
    for line,col,incs in [
        (range_line(211,[(102,95,52),(167,78,66),(388,76,48),(594,112,64)]),"#b6c3a6",["#acbda3","#beccb1"]),
        (range_line(255,[(42,112,57),(221,111,43),(267,72,74),(506,86,60),(665,110,51)]),"#8eae99",["#799b88","#b2bfa0"]),
        (range_line(289,[(117,70,83),(327,134,72),(382,95,38),(660,112,70)]),"#648c78",["#80a18a","#507c68"]),
        (range_line(354,[(12,88,145),(508,84,70),(655,120,92)]),"#426e60",["#668976","#345c51"])]:
        hills(g,line,col,incs,55)
        xs,ys=zip(*line)
        for _ in range(180):
            x=rng.uniform(1,718); y=np.interp(x,xs,ys)+rng.uniform(3,40);d=rng.uniform(2,13)
            g.line([(x,y),(x-d*.9,y+d),(x-d*1.8,y+d*1.8)],rng.choice(incs),.65)
    # Long horizontal strips of valley mist crossing the engraved ridges.
    for i in range(32):
        x=rng.uniform(118,455);y=rng.uniform(284,307);w=rng.uniform(12,155)
        g.line([(x,y),(x+w*.6,y-1.1),(x+w,y)],rng.choice(["#97af91","#adbca0","#829f8b"]),.8)
    for x in np.arange(-5,722,6):
        y=np.interp(x,*zip(*line));h=rng.uniform(3,12)
        if y<279:
            g.poly([(x-2.2,y+2),(x,y-h),(x+2,y+2)],"#496f5d")
    g.save("mountain",5)


def moon():
    g=Print(720,400,"#233953","#788d93")
    for i in range(205):
        x=rng.uniform(2,718);y=rng.uniform(2,227);s=rng.uniform(.35,.98)
        g.oval(x,y,s,s,rng.choice(["#bac2a9","#8fa7a0","#83969a"]))
    g.oval(461,103,43,43,"#efe1ad")
    for i in range(70):
        y=rng.uniform(38,180);x=rng.uniform(330,587);w=rng.uniform(4,28)
        if (x-461)**2+(y-103)**2<37**2:
            g.line([(x,y),(min(461+32,x+w),y-.5)],"#e3d6a9",.65)
    for y,x,w in [(96,366,80),(105,499,76),(78,497,43),(125,397,54),(87,324,35)]:
        g.line(curve((x,y),(x+w*.28,y-1.7),(x+w*.74,y+1),(x+w,y-.4)),"#97a4a0",1.3)
    sea(g,lambda x:223+1.5*sin(x/89),"#526e78",["#6d8486","#354f65","#869795"],lambda x,r:1.4*sin(x/27+r/13),4.2)
    for i in range(232):
        dep=rng.uniform(0,152);half=8+dep*.44;x=461+rng.gauss(0,half*.39);y=224+dep
        w=rng.uniform(1,8+dep*.087)
        g.line([(x-w/2,y),(x+w*.32,y-.75),(x+w/2,y)],rng.choice(["#b0b5a1","#abb2a0","#dfd4a7"]),rng.uniform(.55,1.7))
    # Mountainous island and fishing boat in silhouette.
    g.poly(path((0,211),((35,202),(58,198),(82,205)),((104,208),(119,183),(141,191)),
                ((173,193),(191,221),(254,223)))+[(252,227),(0,228)],"#354d5a")
    g.poly(path((495,274),((531,281),(574,279),(604,267)),((597,278),(587,284),(576,287)),
                ((541,293),(513,289),(495,274))),"#293f4b")
    g.line([(551,278),(548,196)],"#263d4c",1.8)
    g.poly([(546,202),(546,270),(516,272)],"#adb5a6")
    g.poly([(551,213),(551,269),(580,267)],"#899f9b")
    for y in range(228,267,8):
        g.line([(548-(y-201)*.46,y),(546,y-1)],"#8d9e9b",.65)
    for y in [338,367,390]:
        xs=list(range(-4,729,4));pts=[(x,y+6*sin(x/53+y*.1)+5*sin(x/112+y*.13)) for x in xs]
        g.line(pts,"#779192",1.3)
    g.save("moon",6)


if __name__=="__main__":
    hero()
    waves()
    lanterns()
    leaves()
    boat()
    mountains()
    moon()
