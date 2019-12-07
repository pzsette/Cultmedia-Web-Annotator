from django.db import models
# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.core.mail import EmailMessage
from django.contrib.auth import get_user_model
import urllib.request
import json
import requests
import smtplib
import ssl


class CustomUser(AbstractUser):
    pass
    # add additional fields in here
    is_approved = models.BooleanField('approved', default=False)

    def __str__(self):
        return self.email

    def delete(self, *args, **kwargs):
        print ("Utente cancellato")
        id = self.id
        print (id)

        #Prendo tutte le annotazione dell'utente da cancellare
        baseurl = "http://0.0.0.0:8000/"
        response = urllib.request.urlopen(baseurl+"api/annotation/?user_id="+str(id))
        str_response = response.read().decode('utf-8')
        listAnnotatationsToDelete = json.loads(str_response)

        #Controllo se numro != 0
        if listAnnotatationsToDelete["count"] != 0:
            print("cancello tutte annotazioni account")
            # ciclo su tutte estraendo il corrispondente id
            for i in listAnnotatationsToDelete["results"]:
                annToDelete = i["id"]
                print(annToDelete)

                #prendo l'id dello shot corrispondente a ciascuna annotazione
                url = baseurl+"api/annotation/" + str(annToDelete) + "/"
                response = urllib.request.urlopen(url)
                str_response = response.read().decode('utf-8')
                obj = json.loads(str_response)
                correspondentShot = obj["shot"]

                #cancello l'annotazione
                ann_del_url = baseurl + 'api/annotation/' + str(annToDelete) + "/"
                requests.delete(ann_del_url)

                #prendo tutte le annotazioni rimaste sullo shot
                # FIX THIS
                url = baseurl+"api/annotation?shot_id=" + str(correspondentShot)
                response = urllib.request.urlopen(url)
                str_response = response.read().decode('utf-8')
                obj = json.loads(str_response)
                print("annotazioni rimaste")
                print(obj["count"])

                #controllo se !=0
                if obj["count"] == 0:
                    #se uguale a 0 metto nil su arousalAVG e valenceAVG dello shot
                    print("0 annotationi su questo shot")
                    # FIX THIS
                    shot_patch_url = baseurl + 'api/shots/' + str(correspondentShot) + "/"
                    shot_payload = {'arousal_avg': "", 'valence_avg': ""}
                    requests.patch(shot_patch_url, data=shot_payload)

                else:
                    #altrimenti ricalcolo media di entrambi i valori
                    print("sistemo annotazioni rimaste")
                    arousalSum = 0
                    valenceSum = 0
                    for i in obj["results"]:
                        print (i["arousal"])
                        arousalSum += i["arousal"]
                        valenceSum += i["valence"]
                    arousalAVG = arousalSum / obj["count"];
                    valenceAVG = valenceSum / obj["count"];
                    print ("arousalAVG " + str(arousalAVG))
                    print ("valenceAVG " + str(valenceAVG))

                    if arousalAVG < 4:
                        arousalAVG = -1
                    elif arousalAVG < 7:
                        arousalAVG = 0
                    else:
                        arousalAVG = 1

                    if valenceAVG < 4:
                        valenceAVG = -1
                    elif valenceAVG < 7:
                        valenceAVG = 0
                    else:
                        valenceAVG = 1

                    #assegno valori corretti in base alle annotazioni rimaste
                    shot_patch_url = baseurl + 'api/shots/' + str(correspondentShot) + "/"
                    shot_payload = {'arousal_avg': arousalAVG, 'valence_avg': valenceAVG}
                    requests.patch(shot_patch_url, data=shot_payload)

        super(CustomUser, self).delete(*args, **kwargs)

def registered_user(sender, instance, created, **kwargs):
    if created:
        print("New User email: "+instance.email)
        print("New username: "+instance.username)

        message = "Subject: New user registered.\nUser email: " + instance.email + "\nUsername: " + instance.username + "\nGo to cultmedia admin page to approve"

        user = get_user_model()
        admin_email = user.objects.filter(is_superuser=True)[0].email
        email = EmailMessage("Subject: New user registered", message, to=[admin_email])
        email.send()

post_save.connect(registered_user, sender=CustomUser)
