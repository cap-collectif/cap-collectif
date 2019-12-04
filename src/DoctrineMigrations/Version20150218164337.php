<?php
namespace Application\Migrations;

use Capco\AppBundle\Entity\SiteParameter;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Capco\AppBundle\Toggle\Manager;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150218164337 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

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
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE event (id INT AUTO_INCREMENT NOT NULL, media_id INT DEFAULT NULL, theme_id INT DEFAULT NULL, author_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, body LONGTEXT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, startAt DATETIME NOT NULL, endAt DATETIME NOT NULL, is_enabled TINYINT(1) NOT NULL, zipCode INT DEFAULT NULL, address VARCHAR(255) DEFAULT NULL, city VARCHAR(255) DEFAULT NULL, nbAddress INT DEFAULT NULL, nameAddress VARCHAR(255) DEFAULT NULL, link VARCHAR(255) DEFAULT NULL, UNIQUE INDEX UNIQ_3BAE0AA7EA9FDD75 (media_id), INDEX IDX_3BAE0AA759027487 (theme_id), INDEX IDX_3BAE0AA7F675F31B (author_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA7EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA759027487 FOREIGN KEY (theme_id) REFERENCES theme (id)'
        );
        $this->addSql(
            'ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA7F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id)'
        );
        $this->addSql('ALTER TABLE theme_consultation DROP PRIMARY KEY');
        $this->addSql('ALTER TABLE theme_consultation ADD PRIMARY KEY (consultation_id, theme_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE event');
        $this->addSql('ALTER TABLE theme_consultation DROP PRIMARY KEY');
        $this->addSql('ALTER TABLE theme_consultation ADD PRIMARY KEY (theme_id, consultation_id)');
    }

    public function postUp(Schema $schema): void
    {
        $toggleManager = $this->container->get(Manager::class);
        $toggleManager->activate('calendar');

        $date = new \DateTime();
        $created = $date->format('Y-m-d H:i:s');
        $updated = $created;

        $newParameters = array(
            array(
                'events.jumbotron.title',
                'Titre de la page "Liste des événements"',
                'Événements',
                301,
                SiteParameter::$types['rich_text'],
                true,
                $created,
                $updated,
            ),
            array(
                'events.jumbotron.body',
                'Accroche de la page "Liste des événements"',
                '',
                302,
                SiteParameter::$types['rich_text'],
                true,
                $created,
                $updated,
            ),
            array(
                'events.content.body',
                'Description de la page "Liste des événements"',
                '',
                303,
                SiteParameter::$types['rich_text'],
                true,
                $created,
                $updated,
            ),
        );

        foreach ($newParameters as $values) {
            $paramId = $this->connection->fetchColumn(
                'SELECT id FROM site_parameter WHERE keyname = :keyname',
                ['keyname' => $values[0]]
            );
            if (!$paramId) {
                $this->connection->executeQuery(
                    "INSERT INTO site_parameter (keyname, title, value, position, type, is_enabled, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    $values
                );
            }
        }

        $menuId = $this->connection->fetchColumn('SELECT id FROM menu WHERE type = 1');

        if (!$menuId) {
            $this->connection->insert('menu', array('type' => 1));
            $menuId = $this->connection->lastInsertId();
        }

        $newMenuValues = array(
            'Événements',
            'event',
            1,
            0,
            0,
            3,
            null,
            $menuId,
            'calendar',
            $created,
            $updated,
        );

        $menuItemId = $this->connection->fetchColumn(
            'SELECT id FROM menu_item WHERE link = :link AND is_deletable = :deletable',
            ['link' => $newMenuValues[1], 'deletable' => $newMenuValues[3]]
        );
        if (!$menuItemId) {
            $this->connection->executeQuery(
                "INSERT INTO menu_item (title, link, is_enabled, is_deletable, isFullyModifiable, position, parent_id, menu_id, associated_features, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                $newMenuValues
            );
        }
    }

    public function postDown(Schema $schema): void
    {
        $toggleManager = $this->container->get(Manager::class);
        $toggleManager->deactivate('calendar');

        $newParameters = array(
            array('events.jumbotron.title'),
            array('events.jumbotron.body'),
            array('events.content.body'),
        );

        $newMenu = array(array('event'));

        foreach ($newParameters as $values) {
            $this->connection->executeQuery(
                "DELETE FROM site_parameter WHERE keyname = ?",
                $values
            );
        }

        foreach ($newMenu as $values) {
            $this->connection->executeQuery("DELETE FROM menu_item WHERE link = ?", $values);
        }
    }
}
