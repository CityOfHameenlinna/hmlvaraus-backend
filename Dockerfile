FROM docker.haltu.net/c-hameenlinna/varaus:2017-10-19


RUN sudo apt-get update && sudo apt-get -y install postgresql && \
sudo apt-get -y install rabbitmq-server && sudo /etc/init.d/postgresql restart && \
sudo -u postgres createdb venepaikka && \
sudo -u postgres createuser --createdb --echo venepaikka && \
sudo -u postgres psql -c "ALTER USER venepaikka WITH PASSWORD 'venepaikka'" && \
sudo -u postgres psql -c "ALTER USER venepaikka WITH SUPERUSER" && \
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE venepaikka TO venepaikka" && cd /var/www/varaus/ && \
sudo /etc/init.d/rabbitmq-server start && \
sudo /etc/init.d/nginx start
