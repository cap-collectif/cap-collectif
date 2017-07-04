@import
Feature: Import Commands

@database
Scenario: Admin wants to load prod data
    Given I run "capco:load-prod-data --force"
    Then the command exit code should be 0

@database
Scenario: Admin wants to create a PJL
    Given I run "capco:import:pjl-from-csv"
    Then the command exit code should be 0

@database
Scenario: Admin wants to import a consultation
    Given "opinions.csv" contains:
    """
    "titre";"type";"contenu";"contexte"
    "Article 7 bis";"Titre Ier|Chapitre Ier|Section 1";"Le premier alinéa du I de l'article L. 371-1 du code de l'environnement est complété par les mots : « ainsi que la gestion de la lumière artificielle la nuit ».";"À l’échelon régional, il est proposé à l’article 7 de transformer les comités régionaux « trames verte et bleue » en comités régionaux de la biodiversité cités à l’article L. 371-3. Cette modification consiste principalement en un changement de nom, les comités régionaux actuels ayant déjà la possibilité d’aborder un champ large de questions touchant à la biodiversité au-delà de la politique de la trame verte et bleue. Pour autant, un ajustement de leurs missions et une modification des dispositions encadrant leur composition devront être opérées notamment pour y intégrer le cas échéant des représentants des enjeux marins. Des dispositions transitoires de maintien en l’état des instances régionales sont introduites de manière à ne pas devoir remettre en cause les instances actuelles « comités régionaux trame verte et bleue », très récemment installés et en plein travail d’élaboration des schémas régionaux de cohérence écologique, dont l’adoption doit rester la priorité actuelle de travail de ces comités."
    """
    Given I run "capco:import:consultation-from-csv vfs://opinions.csv admin@test.com collecte-des-avis"
    Then the command exit code should be 0

@database
Scenario: Admin wants to import a consultation with apostrophes in title
    Given "opinions.csv" contains:
    """
    "titre";"type";"contenu";"contexte"
    "Article 8 bis d'la street avec "ça"";"Titre Ier|Chapitre Ier|Section 1";"Le premier alinéa du I de l'article L. 371-1 du code de l'environnement est complété par les mots : « ainsi que la gestion de la lumière artificielle la nuit ».";"À l’échelon régional, il est proposé à l’article 7 de transformer les comités régionaux « trames verte et bleue » en comités régionaux de la biodiversité cités à l’article L. 371-3. Cette modification consiste principalement en un changement de nom, les comités régionaux actuels ayant déjà la possibilité d’aborder un champ large de questions touchant à la biodiversité au-delà de la politique de la trame verte et bleue. Pour autant, un ajustement de leurs missions et une modification des dispositions encadrant leur composition devront être opérées notamment pour y intégrer le cas échéant des représentants des enjeux marins. Des dispositions transitoires de maintien en l’état des instances régionales sont introduites de manière à ne pas devoir remettre en cause les instances actuelles « comités régionaux trame verte et bleue », très récemment installés et en plein travail d’élaboration des schémas régionaux de cohérence écologique, dont l’adoption doit rester la priorité actuelle de travail de ces comités."
    """
    Given I run "capco:import:consultation-from-csv vfs://opinions.csv admin@test.com collecte-des-avis"
    Then the command exit code should be 0

@database
Scenario: Admin wants to create a PJL
    Given "emails.csv" contains:
    """
    email;username
    user_a@test.com;Jean Michel
    user_b@test.com;Po Paul
    """
    Given I run "capco:create-users-account-from-csv vfs://emails.csv vfs://users_created.csv"
    Then the command exit code should be 0
    And I should see "2 users created." in output
    Then the file "users_created.csv" should exist
    Then "users_created.csv" should start with:
    """
    email,confirmation_link
    """
    Then print the contents of file "users_created.csv"
