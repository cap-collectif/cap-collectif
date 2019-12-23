@import
Feature: Import Commands

@database
Scenario: Admin wants to load prod data
  Given I run "capco:load-prod-data --force"
  Then the command exit code should be 0

@database
Scenario: Admin wants to import a consultation
  Given "opinions.csv" contains:
  """
  titre,type,contenu
  Article 8 bis d'la street avec "ça",Titre Ier|Chapitre Ier|Section 1, Blabla premier alinéa du I de l'article L. 371-1 du code de l'environnement est complété par les mots : « ainsi que la gestion de la lumière artificielle la nuit ».À l’échelon régional, il est proposé à l’article 7 de transformer les comités régionaux « trames verte et bleue » en comités régionaux de la biodiversité cités à l’article L. 371-3. Cette modification consiste principalement en un changement de nom, les comités régionaux actuels ayant déjà la possibilité d’aborder un champ large de questions touchant à la biodiversité au-delà de la politique de la trame verte et bleue. Pour autant, un ajustement de leurs missions et une modification des dispositions encadrant leur composition devront être opérées notamment pour y intégrer le cas échéant des représentants des enjeux marins. Des dispositions transitoires de maintien en l’état des instances régionales sont introduites de manière à ne pas devoir remettre en cause les instances actuelles « comités régionaux trame verte et bleue », très récemment installés et en plein travail d’élaboration des schémas régionaux de cohérence écologique, dont l’adoption doit rester la priorité actuelle de travail de ces comités."
  """
  Given I run "capco:import:consultation-from-csv vfs://opinions.csv admin@test.com elaboration-de-la-loi ,"
  Then the command exit code should be 0
  And I should see "1 opinions successfully created." in output

@database
# author can be either an existing user email or a unique Username
Scenario: Admin wants to import a BP
  Given "proposals.csv" contains:
  """
  name;author;district_name;address;collect_status;estimation;category;summary;body;"Evaluez l'importance de votre proposition";"Evaluez le coût de votre proposition"
  new proposition 1;aurelien@cap-collectif.com;Nord Saint-Martin;5 Allée Rallier-du-Baty 35000 Rennes;Rejeté;200 euros;Politique;blalala;blalblal body;très important;gratuit
  new proposition 2;Pierre Michel;Nord Saint-Martin;cacccccccccccccccccccccccccccccccccccccccccccxxxxxx;Rejeté;200 euros;Politique;blalala;blalblal body;nulle;pas chère
  new proposition 3;Pierre Michel;Nord Saint-Martin;cacccccccccccccccccccccccccccccccccccccccccccxxxxxx;Rejeté;200 euros;Politique;blalala;blalblal body;nulle;pas chère
  """
  Given I run "capco:import:proposals-from-csv vfs://proposals.csv proposalForm1"
  Then the command exit code should be 0
  And I should see "Creating a new user with a fake email and username: Pierre Michel" in output

@database
Scenario: Cap Collectif wants to create some users account from a CSV with custom fields
  Given "users.csv" contains:
  """
  email;username;Champ pas facultatif;Champ facultatif;Sangohan / Vegeta ?
  user_a@cap-collectif.com;Jean Michel;toto;tata;Sangohan
  user_b@cap-collectif.com;Po Paul;popo;popaul;Vegeta
  duplicated@cap-collectif.com;Duplicate;Duplicate;Duplicate;Vegeta
  duplicated@cap-collectif.com;Duplicate;Duplicate;Duplicate;Vegeta
  admin@cap-collectif.com;Already Present;Already Present;Already Present;Vegeta
  """
  Given I run a command "capco:create-users-account-from-csv" with parameters:
    | input | vfs://users.csv |
    | output | vfs://users_created.csv |
    | --with-custom-fields | true |
  Then the command exit code should be 0
  And I should see "Skipping 1 duplicated email(s)." in output
  And I should see "Skipping existing user: admin@cap-collectif.com" in output
  And I should see "[OK] 3 users created." in output
  Then the file "users_created.csv" should exist
  Then "users_created.csv" should start with:
  """
  email;confirmation_link
  """
  Then print the contents of file "users_created.csv"
  And user "user_a@cap-collectif.com" has response "toto" to question "6"
  And user "user_a@cap-collectif.com" has response "tata" to question "7"
  And user "user_a@cap-collectif.com" has response "Sangohan" to question "17"
  And user "user_b@cap-collectif.com" has response "popo" to question "6"
  And user "user_b@cap-collectif.com" has response "popaul" to question "7"
  And user "user_b@cap-collectif.com" has response "Vegeta" to question "17"

@database
Scenario: Cap Collectif wants to create some users account from a CSV with only firstname and lastname
  Given "users.csv" contains:
  """
  first_name;last_name
  Johnny;Yadlidée
  Jean-Michel;Palaref
  """
  Given I run a command "capco:create-users-account-from-csv" with parameters:
    | input | vfs://users.csv |
    | output | vfs://users_created.csv |
    | --with-password | true |
    | --generate-email | cap-collectif.com |
  Then the command exit code should be 0
  And I should see "[OK] 2 users created." in output
  Then the file "users_created.csv" should exist
  Then "users_created.csv" should start with:
  """
  first_name;last_name;email;password
  """
  And user "Johnny Yadlidée" should have email "johnny-yadlidee@cap-collectif.com"
  And user "Jean-Michel Palaref" should have email "jean-michel-palaref@cap-collectif.com"
  Then print the contents of file "users_created.csv"

@database
Scenario: Admin wants to import users from a CSV
  Given "users.csv" contains:
  """
  username;email;password
  john.doe;user_a@test.com;test
  mcfly;user_b@test.com;carlito
  """
  Given I run "capco:import:users vfs://users.csv ;"
  Then the command exit code should be 0
  And I should see "2 users successfully created." in output
