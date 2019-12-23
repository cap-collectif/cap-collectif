<?php

namespace Application\Migrations;

use Capco\AppBundle\SiteParameter\Resolver;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150320104826 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;

    /**
     * Sets the Container.
     *
     * @param ContainerInterface|null $container A ContainerInterface instance or null
     *
     * @api
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE section (id INT AUTO_INCREMENT NOT NULL, type VARCHAR(255) NOT NULL, title VARCHAR(100) NOT NULL, position INT NOT NULL, teaser LONGTEXT DEFAULT NULL, body LONGTEXT DEFAULT NULL, nb_objects INT DEFAULT NULL, enabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, associated_features LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:simple_array)\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
    }

    public function postUp(Schema $schema): void
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $date = new \DateTime();
        $created = $date->format('Y-m-d H:i:s');
        $updated = $created;

        $siteParameters = ['homepage.jumbotron2.title', 'homepage.jumbotron2.body'];

        $parameterResolver = $this->container->get(Resolver::class);

        $introTitle = $parameterResolver->getValue($siteParameters[0]);
        if (null == $introTitle) {
            $introTitle = 'Introduction';
        }

        $introBody = $parameterResolver->getValue($siteParameters[1]);

        $sections = [
            [
                'introduction',
                $introTitle,
                1,
                null,
                $introBody,
                null,
                true,
                $created,
                $updated,
                null
            ],
            ['videos', 'Vidéos', 2, null, null, 3, true, $created, $updated, null],
            ['consultations', 'Consultations', 3, null, null, 4, true, $created, $updated, null],
            ['themes', 'Thèmes', 3, null, null, 4, true, $created, $updated, 'themes'],
            ['ideas', 'Idées', 4, null, null, 4, true, $created, $updated, 'ideas'],
            ['news', 'Actualités', 5, null, null, 3, true, $created, $updated, 'blog'],
            ['events', 'Évènements', 6, null, null, 3, true, $created, $updated, 'calendar'],
            [
                'newsletter',
                "Lettre d'information",
                7,
                null,
                null,
                null,
                true,
                $created,
                $updated,
                'newsletter'
            ],
            [
                'social-networks',
                "Restez à l'écoute",
                8,
                null,
                null,
                null,
                true,
                $created,
                $updated,
                null
            ],
            ['figures', 'Chiffres clés', 9, null, null, null, false, $created, $updated, null]
        ];

        foreach ($sections as $values) {
            $query = $em->createQuery(
                'SELECT s.id FROM Capco\\AppBundle\\Entity\\Section s WHERE s.title = :title'
            );
            $query->setParameter('title', $values[1]);
            $section = $query->getOneOrNullResult();

            if (null == $section) {
                $this->connection->executeQuery(
                    'INSERT INTO section (type, title, position, teaser, body, nb_objects, enabled, updated_at, created_at, associated_features) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    $values
                );
            }
        }

        foreach ($siteParameters as $key) {
            $this->connection->delete('site_parameter', ['keyname' => $key]);
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $em = $this->container->get('doctrine.orm.entity_manager');

        $query = $em->createQuery(
            'SELECT s.id, s.title, s.body FROM Capco\\AppBundle\\Entity\\Section s WHERE s.type = :intro'
        );
        $query->setParameter('intro', 'introduction');
        $intro = $query->getOneOrNullResult();

        $date = new \DateTime();
        $created = $date->format('Y-m-d H:i:s');
        $updated = $created;

        $siteParameters = [
            [
                'homepage.jumbotron2.title',
                "Titre de l'introduction",
                $intro['title'],
                $created,
                $updated,
                true,
                140,
                0
            ],
            [
                'homepage.jumbotron2.body',
                "Texte de l'introduction",
                $intro['body'],
                $created,
                $updated,
                true,
                150,
                1
            ]
        ];

        foreach ($siteParameters as $values) {
            $query = $em->createQuery(
                'SELECT sp.id FROM Capco\\AppBundle\\Entity\\SiteParameter sp WHERE sp.keyname = :keyname'
            );
            $query->setParameter('keyname', $values[0]);
            $param = $query->getOneOrNullResult();

            if (null == $param) {
                $this->connection->executeQuery(
                    'INSERT INTO site_parameter (keyname, title, value, created_at, updated_at, is_enabled, position, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    $values
                );
            }
        }

        $this->addSql('DROP TABLE section');
    }
}
