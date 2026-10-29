<a id="command"></a> 🇫🇷 Les Commandes
=========

[⬅️](../README.md) Retour

### Sommaire
1. [Outils](#outils)
2. [Import](#import)
3. [Export](#export)
4. [Génération d'emails](#emails)
5. [Autres](#autres)



On a plus de 70 commandes différentes. Je ne vais détailler que les plus importantes

<a div="outils"></a> Outils
---

Activer / désactiver des features

      capco:toggle:disable                        
      capco:toggle:enable  # en dev, l'option --all permet d'activer toutes les features                    
      capco:toggle:list  

Indexation Elasticsearch

      capco:es:clean                              
      capco:es:create                             
      capco:es:create-analytics-test-index        
      capco:es:mapping                            
      capco:es:migrate                            
      capco:es:populate     

Importer les fixtures de pro ou benchmark

      capco:load-benchmark-data                   
      capco:load-prod-data

Réinitialiser l'instance

      capco:reinit
      capco:reset-feature-flags                   
      capco:reset:default-locale                  
      capco:reset:translate-parameters      

Trouver des doublons d'utilisateurs

      capco:find:duplicate-sso                    


<a div="import"></a> Import
---
l'import utilisateur classique

      capco:import:users
Il prend un csv avec username, email et password(facultatif)

      capco:import:idf-users

⬆ Le même import, avec les colonnes openid_id en plus et  

      capco:import-proposals:generate-header-csv
      capco:import:consultation-from-csv
      capco:import:consultation-modals-from-csv
      capco:import:idf-proposals-from-csv         
      capco:import:proposals-from-csv             
      capco:import:responses-from-csv
      capco:import:structure-from-csv
      capco:import:user-accounts-from-emails       


<a div="export"></a>Export
---

Pour les prochaines commandes d'export merci de ne pas utiliser graphQL, mais bien exporter en SQL pur, c'est plus rapide. Comme dans `capco:export:users`

      capco:export:analysis                       
      capco:export:consultation                   
      capco:export:debate                         
      capco:export:events                         
      capco:export:events:participants         
      capco:export:user                           
      capco:export:users   
      capco:export:legacyUsers  # la version legacy passe par graphql
      capco:export:projects-contributors          
      capco:export:collect-selection:contributions
      capco:export:questionnaire:contributions
      capco:export:step-contributors
      capco:export:applogs

`capco:export:events:participants --eventId=<id>` génère uniquement le CSV des
inscrits à l'évènement indiqué. Sans cette option, la commande conserve l'export
de tous les évènements éligibles avec inscriptions activées.


<a div="emails"></a>Génération d'emails - Obsolète ?
---  
      capco:make:message                          
      capco:make:notifier                         
      capco:make:processor 

<a div="magiclinks"></a> Génération de Magic Links
---  
Cette commande permet de créer des comptes à partir d'une liste d'emails.
Elle prend en paramètre un nom de fichier csv contenant une liste au même format que `var/magiclinks/template.csv`.
Le fichier utilisé doit être placé dans le dossier `var/magiclinks` et permettra la création d'un fichier csv suffixé de _complete qui contiendra la liste des tous les comptes non admin existants et nouvellement créés ainsi que leur lien de connexion.
Si des comptes ne peuvent pas être gérés (souvent des comptes softdeleted) ils seront placés dans un fichier .txt suffixé de _errors.

      capco:generate:magiclinks <file>

Les liens ainsi fournis ont une validitée déterminée par la variable d'environnement SYMFONY_MAGICLINKS_DURATION_IN_MINUTES.

<a div="autres"></a>Autres
---
 
      capco:fix:malformed-responses               
      capco:fix:opinion-types                     
      capco:follower-notifier                     
      capco:generate:map-token                    
      capco:migrate:eventAddress-to-jsonAddress   
      capco:migrate:theme-to-categories           
      capco:process_proposals                     
      capco:publisher                             
      capco:remind-user-account-confirmation      
      capco:remind-user-account-confirmation-before-step-close
      capco:send-emailing-campaign                
      capco:sms-credit-consumption-alert          
      capco:user:unsubscribe                      
      capco:api:create-token                      
      capco:check:user-invite-status              
      capco:compute:diff                          
      capco:compute:users-counters                
      capco:create-users-account-from-csv         
      capco:debate:invite          