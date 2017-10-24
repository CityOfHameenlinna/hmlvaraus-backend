[![Stories in Ready](https://badge.waffle.io/City-of-Helsinki/respa.png?label=ready&title=Ready)](https://waffle.io/City-of-Helsinki/respa)
[![Build Status](https://api.travis-ci.org/City-of-Helsinki/respa.svg?branch=master)](https://travis-ci.org/City-of-Helsinki/respa)
[![Coverage Status](https://coveralls.io/repos/City-of-Helsinki/respa/badge.svg?branch=master&service=github)](https://coveralls.io/github/City-of-Helsinki/respa?branch=master)

respa – Resource reservation and management service
===================

Installation
------------

# Using Docker (tested and working)

This project uses both python2.7 and python3.5. Python2.7 is used only when building frontend. Python3.5 is used to all manage.py commands.

Frontend has been done with backbone so there's no normal static root. Instead it uses nginx to map the js files to the project. That's why you run the django on the port 8010 but can access the site on port 8011.

*Prerequisities:*
- Docker

*Docker:*
- Get the most recent docker image on `https://code.haltu.net/c-hameenlinna/varaus/container_registry`
- Run your venepaikkavarus container ```docker run --rm -ti -p 8010:8010 -p 8011:8011 -v $(dirname $SSH_AUTH_SOCK):$(dirname $SSH_AUTH_SOCK) -e SSH_AUTH_SOCK=$SSH_AUTH_SOCK -v <path_to_local_repo>:/var/www/varaus docker.haltu.net/c-hameenlinna/varaus:<revision> /bin/bash```
-example:```docker run --rm -ti -p 8010:8010 -p 8011:8011 -v $(dirname $SSH_AUTH_SOCK):$(dirname $SSH_AUTH_SOCK) -e SSH_AUTH_SOCK=$SSH_AUTH_SOCK -v /home/atzu/Documents/varaus:/var/www/varaus docker.haltu.net/c-hameenlinna/varaus:2017-10-2 /bin/bash```

*Running the server*
- Create a new postgres database (PG already installed)
- Project root can be found in location `var/www/varaus/`
- Create local_settings to project root with correct DB info *example:*
```DEBUG = True
DATABASES = {
  'default': {
  'ENGINE': 'django.contrib.gis.db.backends.postgis',
  'NAME': 'venepaikka',
  'USER': 'venepaikka',
  'PASSWORD': 'venepaikka',
  'HOST': '127.0.0.1',
  'PORT': '5432',
  'ATOMIC_REQUESTS': True,
 }
}```
- Run migrations `python manage.py migrate`
- Start NGINX `sudo /etc/init.d/nginx start`
- install dependencies by running `pip3 install -r requirements.txt`
- go to `cd var/www/varaus/hml-varaus-frontend`
- Build front end by running `python build.py` with python2
- go back to `var/www/varaus/` by running `cd ..`
- Run your project with `python3 manage.py runserver 0.0.0.0:8010`
- You can access the site now on `localhost:8011`


# Using virtualenv (not tested)
### Prepare virtualenv

     virtualenv -p /usr/bin/python3 ~/.virtualenvs/
     workon respa

### Install required packages

Install all required packages with pip command:

     pip install -r requirements.txt

### Create the database

```shell
sudo -u postgres createuser -L -R -S respa
sudo -u postgres psql -d template1 -c "create extension hstore;"
sudo -u postgres createdb -Orespa respa
sudo -u postgres psql respa -c "CREATE EXTENSION postgis;"
```

### Run Django migrations and import data

```shell
python manage.py migrate
python manage.py createsuperuser  # etc...
python manage.py geo_import --municipalities finland
python manage.py geo_import --divisions helsinki
python manage.py resources_import --all tprek
python manage.py resources_import --all kirjastot
```

Ready to roll!

### Setting up PostGIS/GEOS/GDAL on Windows (x64) / Python 3

* Install PGSQL from http://get.enterprisedb.com/postgresql/postgresql-9.4.5-1-windows-x64.exe
  * At the end of installation, agree to run Stack Builder and have it install the PostGIS bundle
* Install OSGeo4W64 from http://download.osgeo.org/osgeo4w/osgeo4w-setup-x86_64.exe
  * The defaults should do
* Add the osgeo4w64 bin path to your PATH
  * Failing to do this while setting `GEOS_LIBRARY_PATH`/`GDAL_LIBRARY_PATH` will result in
    "Module not found" errors or similar, which can be annoying to track down.

Running tests
-------------

Respa uses the [pytest](http://pytest.org/latest/) test framework.

To run the test suite,

```shell
$ py.test .
```

should be enough.

```shell
$ py.test --cov-report html .
```

to generate a HTML coverage report.


Requirements
------------

This project uses two files for requirements. The workflow is as follows.

`requirements.txt` is not edited manually, but is generated
with `pip-compile`.

`requirements.txt` always contains fully tested, pinned versions
of the requirements. `requirements.in` contains the primary, unpinned
requirements of the project without their dependencies.

In production, deployments should always use `requirements.txt`
and the versions pinned therein. In development, new virtualenvs
and development environments should also be initialised using
`requirements.txt`. `pip-sync` will synchronize the active
virtualenv to match exactly the packages in `requirements.txt`.

In development and testing, to update to the latest versions
of requirements, use the command `pip-compile`. You can
use [requires.io](https://requires.io) to monitor the
pinned versions for updates.

To remove a dependency, remove it from `requirements.in`,
run `pip-compile` and then `pip-sync`. If everything works
as expected, commit the changes.
