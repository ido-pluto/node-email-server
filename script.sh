docker rmi node-email-server
sudo docker build -t node-email-server .
sudo docker tag node-email-server idopluto/node-email-server:1.1.0
sudo docker tag node-email-server idopluto/node-email-server:latest
sudo docker push idopluto/node-email-server:1.1.0
sudo docker push idopluto/node-email-server:latest