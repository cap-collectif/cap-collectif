# Spécifiques à OSX

```
# installer docker toolbox
$ brew cask install dockertoolbox

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

# sudo vim /etc/exports (501 correspond au uid et 20 au gid)
"/Users" 192.168.99.101 -alldirs -mapall=501:20

# relancer nfsd
sudo nfsd restart

docker-machine ssh capco

# dans le ssh, attention, l'adresse ip n'est plus celle de tout à l'heure, c'est celle de l'hôte (interface vboxnetN)
sudo umount /Users
sudo /usr/local/etc/init.d/nfs-client start
sudo mkdir -p /Users && sudo mount -t nfs -o noatime,soft,nolock,vers=3,udp,proto=udp,rsize=8192,wsize=8192,namlen=255,timeo=10,retrans=3,nfsvers=3 -v 192.168.99.1:/Users /Users

# sortir du ssh
exit
```
