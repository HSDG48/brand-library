# Static TTF instances of the HS variable fonts, so opentype.js can outline the wordmarks.
# Run: py scripts/fonts/hs-instances.py   (from brand-library/, needs fontTools + brotli)
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
import shutil

SRC = 'brands/hs-digital/source/fonts/'
OUT = 'assets/fonts/'
for family, file, name, axes in [
    ('Bricolage Grotesque', 'BricolageGrotesque-Variable.woff2', 'BricolageGrotesque-ExtraBold.ttf', {'wght': 800, 'opsz': 96}),
    ('Bricolage Grotesque', 'BricolageGrotesque-Variable.woff2', 'BricolageGrotesque-Medium.ttf', {'wght': 500, 'opsz': 96}),
    ('Manrope', 'Manrope-Variable.woff2', 'Manrope-SemiBold.ttf', {'wght': 600}),
    ('Manrope', 'Manrope-Variable.woff2', 'Manrope-Bold.ttf', {'wght': 700}),
]:
    f = TTFont(SRC + file)
    instantiateVariableFont(f, axes, inplace=True)
    f.flavor = None
    f.save(OUT + name)
    print(name)
# The browser documents use the variable fonts directly.
for file in ['BricolageGrotesque-Variable.woff2', 'Manrope-Variable.woff2']:
    shutil.copy(SRC + file, OUT + file)
