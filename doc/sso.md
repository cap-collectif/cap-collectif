Le fonctionnement des SSOs
===
[⬅️ Retour](../README.md)

Notes :
On ne peut pas avoir plusieurs SSOs d'activé, ça pose un problème de déconnexion. Le cas n'arrivant pas chez les clients, on a pas développé cette partie.

Un petit outil pratique : [jwt.io](https://jwt.io/)



OpenID
---
<!-- you need to install mermaid on your IDE -->

Au clique sur le bouton se connecter
```mermaid

sequenceDiagram
    redirectToServiceAction->>associateToService: appel
    associateToService->>getAuthorizationUrl: appel
    getAuthorizationUrl->>getInstanceName: appel
    associateToService->>redirectToServiceAction: Je te renvoie l'url de redirection
    Note left of redirectToServiceAction: Redirige vers la  page de <br/>connection au SSO !
```

A la connection depuis le SSO OpenID

```mermaid

sequenceDiagram
    loadUserByOAuthUserResponse->>getUser:  
    loadUserByOAuthUserResponse->>adduserToGroup: 
    
Note left of loadUserByOAuthUserResponse: Retourne l'utilisateur connecté 
```


FranceConnect
---

- Cadrage du projet : https://partenaires.franceconnect.gouv.fr/monprojet/cadrage
- La doc https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service

Au clique sur le bouton se connecter
```mermaid

sequenceDiagram
    redirectToServiceAction->>modifyOptions: appel
    modifyOptions->>FranceConnectOptionsModifier.getAllowedData: appel
    redirectToServiceAction->>FranceConnectOptionsModifier.getAuthorizationUrl: appel
    FranceConnectOptionsModifier.getAuthorizationUrl->>redirectToServiceAction.getAuthorizationUrl: Je te renvoie l'url de redirection
    Note left of redirectToServiceAction: Redirige vers la  page de <br/>connection au SSO !
```
A la connection depuis le SSO FranceConnect

```mermaid

sequenceDiagram
    loadUserByOAuthUserResponse->>getUser:  
    getUser->>mapFranceConnectData:  
    getUser->>setFranceConnectIdToken:  
    loadUserByOAuthUserResponse->>adduserToGroup: 
    
Note left of loadUserByOAuthUserResponse: Retourne l'utilisateur connecté 
```
