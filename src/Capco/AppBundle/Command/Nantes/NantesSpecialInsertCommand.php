<?php

namespace Capco\AppBundle\Command\Nantes;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class NantesSpecialInsertCommand extends ContainerAwareCommand
{
    /** @var EntityManagerInterface */
    protected $em;

    protected $users = [];

    protected function configure(): void
    {
        $this->setName('capco:import:nantes-special')->setDescription(
            'Import last stuff missing for nantes'
        );
    }

    protected function initialize(InputInterface $input, OutputInterface $output): void
    {
        $this->em = $this->getContainer()->get('doctrine.orm.entity_manager');
        $this->em
            ->getConnection()
            ->getConfiguration()
            ->setSQLLogger(null);
    }

    protected function execute(InputInterface $input, OutputInterface $output): void
    {
        $formName = 'Formulaire pour "La Loire au coeur"';
        $output->writeln('<info>Creating "' . $formName . '" form...</info>');

        $proposalForm = (new ProposalForm())
            ->setTitle($formName)
            ->setTitleHelpText('Choisissez un titre pour votre proposition')
            ->setReference(2500)
            ->setDescriptionHelpText('Décrivez votre proposition');

        $this->em->persist($proposalForm);
        $this->em->flush();

        $output->writeln('<info>Successfully added "' . $formName . '" form.</info>');

        $step = $this->em
            ->getRepository(CollectStep::class)
            ->findOneBy(['slug' => 'vos-contributions-122']);
        $step->setProposalForm(null);
        $this->em->persist($step);
        $this->em->flush();
        $step->setProposalForm($proposalForm);
        $this->em->persist($step);
        $this->em->flush();

        $proposals = [
            [
                'description' =>
                    "<p>Madame, Monsieur,</p> <p>Le marché de la Petite Hollande est un espace de vie inscrit dans l'ADN de Nantes. Le challenge de ce projet est donc de maintenir cette activité tout en redonnant une place au geste architectural.</p> <p>Une piste pourrait être de \"remettre\" la Loire/l'eau au coeur de cet espace en jouant sur la transparence hydraulique. Les solutions techniques existent et notamment celles des industriels de la filière béton (cf. lien vers la vidéo) : ces solutions permettent de s'adapter aux espaces tout en restant pertienentes d'un point de vue entretien et coût global.&nbsp;</p> <p>Par ailleurs, de la difficulté de gérer&nbsp;la contrainte du tunnel ferroviaire souterrain, il pourrait être trouvé un axe d'innovation et de différenciation. Ainsi, décaissé une partie de ce tunnel en le végétalisant, par exemple, pourrait permettre de structurer l'espace.&nbsp;</p> <p>En espérant pouvoir échnager plus précisément sur ce projet et les réponses possibles.</p> <p>Cordialement,</p> <p>Olivier STEPHAN<br> olivier.stephan@unicem.fr&nbsp;</p>",
                'author' => $this->em
                    ->getRepository(User::class)
                    ->findOneBy(['email' => 'puncharelo@yahoo.fr']),
                'date' => new \DateTime('2018-11-06'),
                'videoLink' => 'https://vimeo.com/186245384',
            ],
            [
                'description' =>
                    "<p>Madame, Monsieur,</p> <p>J’habite à côté du marché de la petite Hollande, j'y vais faire mes courses, uniquement alimentaire, tous les samedis avec grand plaisir.</p> <p>1) Voici les points d'améliorations consensuels (d’après moi):</p> <p>* Installer un distributeur de billets</p> <p>* Trouver une solution pour les sacs et surtout les caisses en polystyrène des poissonniers, par jour de grand vent la place et le square Daviais sont une poubelle (même après le passage des équipes de nettoyage)</p> <p>* Prévoir l’installation de caméras (il règne un sentiment d'insécurité sur ce marché)</p> <p>* Installer plus de poubelles (lorsqu’un commerçant offre un abricot, il est difficile de trouver une poubelle pour y jeter le noyau)</p> <p>* Un peu moins de stands afin d’avoir des allées plus larges : actuellement avec une poussette il est difficile de circuler</p> <p>2) Voici les points d'améliorations que je souhaite :</p> <p>* Supprimer les stands vêtements, coque de téléphone, tapis et les remplacer par des stands liés à l’alimentation/boisson</p> <p>* Un peu moins de stands afin d’avoir des allées plus larges : actuellement avec une poussette il est difficile de circuler</p> <p>Cordialement</p> <p>A.B.</p>",
                'author' => $this->em
                    ->getRepository(User::class)
                    ->findOneBy(['email' => 'balade4@hotmail.fr']),
                'date' => new \DateTime('2018-11-07'),
                'videoLink' => '',
            ],
            [
                'description' =>
                    "<p>Bonjour</p> <p>J'habite Couëron et j'utilise le TER pour venir dans le centre-ville. Le projet de réaménagement de la Petite Hollande est excitant. Avant de tout défoncer et reconfigurer la place, serait-il possible d'imaginer un arrêt TER sous l'arrêt Tram Médiathèque (type station de métro) afin d'accéder immédiatement au centre-ville et ne pas engorger la gare de Nantes ainsi que le Tram pour y accéder ? Un jour il y aura un arrêt TER à Médiathèque : pourquoi dans ces conditions ne pas envisager dès maintenant cette possibilité, aujourd'hui simple, et faire bénéficier tous les voyageurs (étudiants, travailleurs, visiteurs) en provenance du Croisic jusqu'à Chantenay au centre de Nantes sans être contraint demain, de détruire ce que vous envisagez de réaliser aujourd'hui ?</p> <p>Gilles Armange</p> <p>&nbsp;</p>",
                'author' => $this->em
                    ->getRepository(User::class)
                    ->findOneBy(['email' => 'aarmange@free.fr']),
                'date' => new \DateTime('2018-10-16'),
                'videoLink' => '',
            ],
            [
                'description' =>
                    "<p>Bonjour,</p> <p>Chaque samedi, une fois le marché terminé, une brigade de nettoyeurs s'affaire&nbsp;sur le tarmac de la petite hollande. J'ai beaucoup d'estime pour eux, ils font un travail remarquable. Seulement, ce n'est plus tenable, on ne peut plus autoriser&nbsp;des commerçants à venir salir notre centre ville. Ils semblent totalement déresponsabilisés. Ce n'est pas à la ville de tout nettoyer, ni au contribuable de payer cette prestation. Ils arrivent sur une place propre, ils repartent en laissant la place propre. Aux abords de la piscine Léo Lagrange, de la passerelle Schoelcher puis du quai de la fosse des sacs plastiques ainsi que des papiers souillent l'espace public. Et quand le vent s'en mèle, c'est à la Loire d'ingérer tous ces déchets&nbsp;... GREEN CAPITALE ???</p> <p>C'est un emplacement fantastique pour un marché, oui mais avec des commerçants éco-responsables, sensibles à l'environnement. Cette place n'est pas une déchetterie&nbsp;!</p>",
                'author' => $this->em
                    ->getRepository(User::class)
                    ->findOneBy(['email' => 'yvan.moreau.perso@gmail.com']),
                'date' => new \DateTime('2018-10-27'),
                'videoLink' => '',
            ],
            [
                'description' =>
                    "<p><strong>Pour des lieux favorisant des éco-événements</strong></p> <p>&nbsp;</p> <p>Madame, Monsieur</p> <p>Les futurs espaces que nous co-construisons seront plus piétons, plus accessibles et plus adaptés aux enjeux de la transition écologique.</p> <p>Très probablement ils acceuilleront des événements, qui contribueront au bien-être des habitants, au vivre ensemble et à l'attractivité du territoire.</p> <p>L'exemple de la construction du miroir d'eau est un exemple interessant, qui aujourd'hui fédère les habitants. Malheureusement, Il n' a pas vraiment été concu dans l'idée d'accueillir des événements : pas de possibilité de se connecter au réseau éléctrique, pas de zone sécurisée de collecte de déchets, pas de toilettes, point d'eau ....</p> <p>Nous vous invitons donc à prendre en compte à la conception les fonctionnalités suivantes</p> <p>1- Imaginer plusieurs schémas d'usages événementiels des nouveaux lieux</p> <p>2- Pouvoir en tout lieu se connecter au réseau electrique par cables</p> <p>3- Avoir des zone sécurisées pour la collecte de déchets&nbsp; par les services de la ville. Y compris les bio dechet</p> <p>4- Prévoir parking à vélo</p> <p>5- Préparer des zones ombragées / naturelles</p> <p>6- Prévoir des bancs et places assises</p> <p>7 - Favoriser l'accès de véhicules techniques</p> <p>8 - Prévoir la possibilité d'installer des structures de type chapiteau / barnums temporaires voire définitifs (ex les nefs, jardins des fonderies</p> <p>9 Anticiper les risques de pollutions de la Loire ou les impacts sur la biodiversité en cas d'affluence</p> <p>10 ...</p> <p>Contribution proposée par <a href=\"http://www.reseau-eco-evenement.net/\">le réseau eco événement (REEVE)</a></p>",
                'author' => $this->em
                    ->getRepository(User::class)
                    ->findOneBy(['email' => 'dominique@reseau-ecoevenement.net']),
                'date' => new \DateTime('2018-10-28'),
                'videoLink' => '',
            ],
            [
                'description' =>
                    "<p>Certains commerces de ce secteur vivaient grace au stationnement du parking de l'ile gloriette qui va disparaitre.Est il prévu un mécanisme d'aide pour favoriser leurs déménagements en périphérie ?&nbsp;</p>",
                'author' => $this->em
                    ->getRepository(User::class)
                    ->findOneBy(['email' => 'yann@letempledujeu.fr']),
                'date' => new \DateTime('2018-11-13'),
                'videoLink' => '',
            ],
            [
                'description' =>
                    '<ol>  <li>&nbsp;</li>  <li>Nous voulons plus de grands et vieux arbres en ville, plus de plantes, de fleurs, plus d’espace, de paix, plus d’habitants satisfaits, plus de marchands, plus&nbsp;de beaux et bons produits. Nous voulons y circuler et nous déplacer gratuitement, librement et facilement à pied, en voiture en tram , bus, moto vélo, fauteuil roulant, skate…Nous voulons y stationner gratuitement. Nous, commerçants, artisans, usagers voulons y travailler paisiblement.Nous ne voulons plus d’argent public gaspillé&nbsp;&nbsp;au vu des sommes déjà engagées ( au moins depuis 2013)</li> </ol> <p>&nbsp;</p>  <ol>  <li> <h1>Nous voulons améliorer et préserver cet espace et son histoire. Carrier n’a plus besoin de voir couler les barques depuis son balcon. Le nom de&nbsp;Jean-Baptiste Daviais et le square qui lui a été dédié doivent demeurer au titre du devoir de mémoire de cet homme dont la vie fut exemplaire.</h1> </li> </ol>  <ol>  <li>Si ces idées vous plaisent partagez les. Merci</li>  <li>Claude Francheteau</li>  <li>&nbsp;</li> </ol>',
                'author' => $this->em
                    ->getRepository(User::class)
                    ->findOneBy(['email' => 'claude.francheteau@orange.fr']),
                'date' => new \DateTime('2018-10-26'),
                'videoLink' => '',
            ],
            [
                'description' =>
                    "<p>Bonjour,</p> <p>lors de la réunion publique du 10 septembre dernier,&nbsp;Johanna Rolland ( maire de la ville ) et son équipe, a présenté le projet de réforme de la place de la petite Hollande - Gloriette.</p> <p>Bien sûr, les \"nantais\" ( 30 !) seront consultés mais pas sur&nbsp;la pertinence de cette réforme.</p> <p>Ces trente représentants nous seront-ils présentés ?</p> <p>L’idée étant de \"réintroduire la nature dans la ville\", je ne comprends pas la nécessité que les&nbsp;grands et vieux arbres soient coupés, du square Daviais à la Loire, pour parvenir à une réussite végétalisée green/vert vegan bio \"urban jungle\" telle les places Graslin et royale, citées en exemple par l’adjoint à l’urbanisme....</p> <p>La con-construction éco-citoyenne démocratique partagée ensemble travaillera sur le long terme en préservant bien sûr le marché mais pas à cet endroit ( le temps des travaux dont on ignore ni la durée ni le coût).&nbsp;Je suppose que le marché du samedi sera sûrement déplacé sous les nefs des chantiers de l’atlantique (la place de la Bourse rendant impossible par sa surface le transfert de la plus que&nbsp;&nbsp;centaine de marchands)&nbsp;&nbsp; le temps des travaux dont on ignore ni la durée ni le coût. Puisqu’on nous assure qu’il sera maintenu à l’identique place de la petite Hollande - Gloriette, ça veut donc dire qu’on pourra toujours y stationner les camions des marchands, donc y stationner…alors que changer si ce n'est pour rien changer et &nbsp;faire payer les nantais ( -30) ?</p> <p>Un des&nbsp;commerçants du quartier a évoqué l'idée d'un pont ( passerelle dans le prolongement de la passerelle Schoelcher désservant piétons cyclistes...)&nbsp;) qui passerait par dessus les voies de circulation automobiles, les rendant ainsi beaucoup plus fluides.</p> <p>Le Square Daviais porte le nom d'un résistant qui s'est battu pour la liberté, nous devons être fidèles à cet exemple et ne serait-ce que pour ça , le préserver.</p> <p>Si ces idées vous plaisent partagez les. Merci.</p> <p>&nbsp;</p> <p>Claude Francheteau</p> <p>06 75 60 92 36</p> <p>&nbsp;</p>",
                'author' => $this->em
                    ->getRepository(User::class)
                    ->findOneBy(['email' => 'claude.francheteau@orange.fr']),
                'date' => new \DateTime('2018-10-24'),
                'videoLink' => '',
            ],
        ];

        foreach ($proposals as $key => $proposal) {
            if ($proposal['author']) {
                $description =
                    '' !== $proposal['videoLink']
                        ? $proposal['description'] .
                            '<br/><a href="' .
                            $proposal['videoLink'] .
                            '">Vidéo</a>'
                        : $proposal['description'];
                $proposal = (new Proposal())
                    ->setTitle('Contribution n° ' . $key + 1)
                    ->setAuthor($proposal['author'])
                    ->setPublishedAt($proposal['date'])
                    ->setUpdatedAt(new \DateTime())
                    ->setProposalForm($step->getProposalForm())
                    ->setReference(($key + 1) * 200)
                    ->setBody(html_entity_decode($description));
                $this->em->persist($proposal);
                $this->em->flush();
            }
        }
    }
}
