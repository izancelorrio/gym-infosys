##Estan comentados los prerequisitos de instalacion de docker, docker-compose y de unzip
##Descomentar si es necesario

#apt update
#apt install docker.io -y
#systemctl enable --now docker
#curl -L "https://github.com/docker/compose/releases/download/v2.29.1/docker-compose-$(uname -s)-$(uname -m)" \
#    -o /usr/local/bin/docker-compose
#sudo apt install unzip 
unzip gym-infosys
cd gym-infosys
chmod +x docker-compose.yml
docker-compose --env-file .env.local.docker up --build