<a id="mailer"></a> 🇫🇷 Les Fixtures
=========

[⬅️](../README.md) Retour

### Sommaire
1. [Présentation](#presentation)
2. [Comment formater les données ?](#data)

<a div="presentation"></a> 1 Présentation
---

Notre système, se base sur le bundle [AliceFixture](https://github.com/theofidry/AliceBundle). Le dossier [`fixtures`](../fixtures) les contient. Il y en a pour dev, prod et benchmark. 
Le but des fixtures est de couvrir un maximum de cas dans les tests

Pour ajouter un fichier de fixtures, il faut le référencer dans  [CustomOrderFilesLocator](../src/Capco/AppBundle/DataFixtures/ORM/CustomOrderFilesLocator.php).

<a div="data"></a> 2 Comment formater les données ?
---

Pour créer plusieurs entrés d'un type, il est possible de la faire en une fois, comme ceci
```yaml
  commentVote{2..50}:
    id: 9000<current()>
    comment: '@evComment<current()>'
    user: '@user<current()>'
```

Si possible donnez pour nom et id de votre fixture ce qu'elle représente, comme ceci

```yaml
    eventParthenay:
        id: eventParthenay
        createdAt: <identity((new \DateTime('2022-10-04')))>
        startAt: <identity((new \DateTime('2030-05-12')))>
        endAt: <identity((new \DateTime('2030-05-14')))>
        enabled: true
        owner: '@organization1'
        creator: '@user5'
```
