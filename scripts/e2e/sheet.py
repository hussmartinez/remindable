import sys
from PIL import Image
out, *files = sys.argv[1:]
ims=[Image.open(f).convert('RGB') for f in files]
w,h=300,650
cols=4; rows=(len(ims)+cols-1)//cols
sheet=Image.new('RGB',(cols*(w+8),rows*(h+8)),'white')
for i,im in enumerate(ims):
    im.thumbnail((w,h*3))
    im=im.crop((0,0,w,min(h,im.height)))
    sheet.paste(im,((i%cols)*(w+8),(i//cols)*(h+8)))
sheet.save(out)
