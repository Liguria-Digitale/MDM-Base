# MANUALE INSTALLAZIONE PROTOCOLLO E DOCUMENTALE

# INDICE

[1 COMPONENTI DEL RILASCIO](#1-componenti-del-rilascio)

[2 REQUISITI](#2-requisiti)

[3 PREPARAZIONE AMBIENTE](#3-preparazione-ambiente)

[4 CONFIGURAZIONE DIRECTORY](#4-configurazione-directory)

[5. INSTALLAZIONE MDM](#5-installazione-mdm)

[6 COMPILAZIONE SORGENTI ](#6-compilazione-sorgenti)

[7 ACCESSO A MDM](#6-accesso-a-mdm)

# 1 COMPONENTI DEL RILASCIO  

I componenti rilasciati sono i seguenti:

- **CHOC ALFRESCO AMP** : Modulo di estensione del Content Repository di Alfresco ECM
- **CHOC SHARE AMP** : Modulo di estensione del front-end Share di Alfresco ECM
- **CHOC INSTALL** : Script di installazione di MDM 

# 2 REQUISITI

Per le funzioni di conversione e manipolazione dei documenti sono necessarie le seguenti librerie di sistema:
- **ALFRESCO ECM 4.2+** : Alfresco ECM 
- **TESSERACT 4.1+** : motore OCR
- **QPDF 5.0+** : tool manipolazione file PDF
- **WKHTMLTOPDF 0.12+** : tool conversione da html a pdf

# 3 PREPARAZIONE AMBIENTE
Installazione Repository Centos EPEL
```
yum install epel-release
```
Installazione pacchetto GCC Dev Tools per compilazione librerie
```
yum groupinstall "Development Tools"
``` 
Installazione librerie Tesseract  
 ```
yum install tesseract tesseract-langpack-ita
 ```

Installazione librerire Qpdf e dipendenze
```
yum install qpdf libtiff-tools ghostscript
```
Installazione Wkhtmltopdf e dipendenze
```
yum install xorg-x11-fonts-75dpi xorg-x11-fonts-Type1 icu
wget https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.5/wkhtmltox-0.12.5-1.centos7.x86_64.rpm
rpm -ivh wkhtmltopdf
```


# 4 CONFIGURAZIONE DIRECTORY
Copiare il pacchetto mdm-install.zip (modulo CHOC INSTALL) sul server e scompattare
l'archivio nella directory di installazione di alfresco:
```
<ALFRESCO_HOME>/mdm
```
Effettuare una copia dei WAR Alfresco e Share in esecuzione sull'application server:
```
cp <ALFRESCO_HOME>/<APP_SERVER_DEPLOY_DIR>/alfresco.war  <ALFRESCO_HOME>/mdm/wars
cp <ALFRESCO_HOME>/<APP_SERVER_DEPLOY_DIR>/share.war  <ALFRESCO_HOME>/mdm/wars/    
```

# 5 INSTALLAZIONE MDM

Posizionarsi nella directory:
```
<ALFRESCO_HOME>/mdm/scripts
```

Aggiornare il path di installazione di Alfresco nello script choc-install.sh:
```
ALF_HOME=/home/alfresco/alfresco-community
DIR_WAR_ORIG=$ALF_HOME/mdm/wars
```
Eseguire lo script:
```
./choc-install.sh
```

## 6 COMPILAZIONE SORGENTI

MDM è un progetto Java Maven-based. La compilazione del sorgente prevede l'utilizzo di uno dei 
6 profili Maven pre-configurati a seconda della versione di Alfresco supportata:

**env-alfresco-6.2** : profilo Maven per Alfresco Communitiy 6.2  
**env-alfresco-5.2E** : profilo Maven per Alfresco Enterprise 5.2  
**env-alfresco-5.2** : profilo Maven per Alfresco Community 5.2  
**env-alfresco-5.1** : profilo Maven per Alfresco Community 5.1  
**env-alfresco-5.1E** : profilo Maven per Alfresco Enterprise 5.1E  
**env-alfresco-4.2** : profilo Maven per Alfresco Community 4.2  

Esempio compilazione MDM per Alfresco Community 5.2
``` 
mvn clean install -Penv-alfresco-5.2
```

**NOTA** : per compilare correttamente il sorgente è necessario l'accesso web autenticato al seguente repository Maven:
```http://maven.mawgroup.it/nexus/content/groups/private/```


# 8 ACCESSO A MDM

Accesso a MDM:
```
http://server_alfresco:8080/share
```
