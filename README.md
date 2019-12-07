# cultmedia

# stop all docker container
#docker stop $(docker ps -a -q)

#list containers
#docker container ls

#enter container
docker exec -it cultmediaapi_web bash

#remove all containers
docker rm $(docker ps -aq)

#remove all images
docker rmi $(docker images -q)

#server
sudo docker system prune

#server
sudo rm -R data/

#git
git add .
git commit -m ''
git push

git pull

