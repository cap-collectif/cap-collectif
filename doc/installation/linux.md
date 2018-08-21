##### Spécifiques à Linux

Installez [docker](https://docs.docker.com/installation) et [docker-compose](https://docs.docker.com/compose/install/).


## Isoler le projet dans une VM

Installez [docker-machine](https://docs.docker.com/machine/install-machine/) et suivez la procédure ci-dessous:

```
# On construit notre machine capco
$ docker-machine create --driver virtualbox --virtualbox-memory 4096 --virtualbox-disk-size 30000 capco
$ docker-machine stop capco

# ouvrir virtualbox, chercher la machine capco, changer :
# - augmenter le nombre de processeur (le max que vous pouvez)
# - changer les "adaptater type" des deux cartes réseaux pour passer sur PCnet-FAST III

# On lance la machine et on s'y connecte (à lancer à chaque fois)
$ docker-machine start capco
$ eval "$(docker-machine env capco)"

# On note bien à ce moment l'adresse ip en 192.168.99.* car on en a besoin à plein d'endroits
$ docker-machine ip capco

# sudo vim /etc/hosts
192.168.99.101 capco.dev

# PATH_TO_PROJECT correspond à l'emplacement où vous avez mis le projet.

# sudo vim /etc/exports
"PATH_TO_PROJECT" 192.168.99.101(rw,no_subtree_check,all_squash,anonuid=1000,anongid=1000)

# relancer nfsd
sudo /etc/init.d/nfs-kernel-server reload

docker-machine ssh capco

# dans le ssh, attention, l'adresse ip n'est plus celle de tout à l'heure, c'est celle de l'hôte (interface vboxnetN)
sudo /usr/local/etc/init.d/nfs-client start
sudo mkdir -p PATH_TO_PROJECT && sudo mount -t nfs -o noatime,soft,nolock,vers=3,udp,proto=udp,rsize=8192,wsize=8192,namlen=255,timeo=10,retrans=3,nfsvers=3 -v 192.168.99.1:PATH_TO_PROJECT PATH_TO_PROJECT

# sortir du ssh
exit
```
