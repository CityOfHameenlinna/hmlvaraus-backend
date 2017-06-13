#!/usr/bin/python2

import os
import md5
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'

SPA_DIR = BASE_DIR + 'hml-varaus-frontend/'

os.chdir(SPA_DIR)

IMG_DIR_DEV = SPA_DIR + 'img/'
FONT_DIR_DEV = SPA_DIR + 'fonts/'

CSS_DIR_PROD = BASE_DIR + 'static/css/'
JS_DIR_PROD = BASE_DIR + 'static/js/'
IMG_DIR_PROD = BASE_DIR + 'static/img/'
FONT_DIR_PROD = BASE_DIR + 'static/fonts/'
TEMPLATE_DIR_PROD = BASE_DIR + 'templates/'

INDEX_PROD = TEMPLATE_DIR_PROD + 'index.html'
INDEX_DEV = SPA_DIR + 'index.html'

if not os.path.isdir(JS_DIR_PROD):
    os.mkdir(JS_DIR_PROD)
if not os.path.isdir(CSS_DIR_PROD):
    os.mkdir(CSS_DIR_PROD)

css_output_filename = CSS_DIR_PROD + 'optimized-css.css'
js_output_filename = JS_DIR_PROD + 'optimized-js.js'

print('Running require.js optimization')

os.system('nodejs js/libs/r.js -o js/build-options.js')
os.system('nodejs js/libs/r.js -o cssIn=css/main.css out=' + css_output_filename + ' optimizeCss=standard')

print('Optimization done. Renaming css and js files to bust the cache.')

css = open(css_output_filename, 'rb')
css_data = css.read()
css.close()
css_data = css_data.replace('/img/hml-logot.png', '/static/img/hml-logot.png')
css_data = css_data.replace('/fonts/Share-Bold.ttf', '/static/fonts/Share-Bold.ttf')
css_data = css_data.replace('/fonts/Verdana.ttf', '/static/fonts/Verdana.ttf')
css_md5 = md5.new()
css_md5.update(css_data)
css_md5_filename = css_md5.hexdigest() + '.css'
css = open(css_output_filename, 'wb')
css.write(css_data)
css.close()

js = open(js_output_filename, 'r')
js_data = js.read()
js_md5 = md5.new()
js_md5.update(js_data)
js_md5_filename = js_md5.hexdigest() + '.js'
js.close()

os.rename(js_output_filename, JS_DIR_PROD + js_md5_filename)
os.rename(css_output_filename, CSS_DIR_PROD + css_md5_filename)

if os.path.isdir(IMG_DIR_PROD):
    shutil.rmtree(IMG_DIR_PROD)

if os.path.isdir(FONT_DIR_PROD):
    shutil.rmtree(FONT_DIR_PROD)

shutil.copytree(IMG_DIR_DEV, IMG_DIR_PROD)
shutil.copytree(FONT_DIR_DEV, FONT_DIR_PROD)

shutil.copy(INDEX_DEV, INDEX_PROD)

index_file = open(INDEX_PROD, 'rb')
index_data = index_file.read()
index_file.close()
index_data = '{% load static %}\n' + index_data
index_data = index_data.replace(' data-main="/js/app/config/config.js"', '')
index_data = index_data.replace('/css/main.css', '{% static \'css/' + css_md5_filename + '\' %}')
index_data = index_data.replace('/js/libs/require.js', '{% static \'js/' + js_md5_filename + '\' %}')
index_file = open(INDEX_PROD, 'wb')
index_file.write(index_data)
index_file.close()

print('Build done.')
