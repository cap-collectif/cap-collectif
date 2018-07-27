<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Gedmo\Sluggable\Util\Urlizer;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150416174513 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE user_type ADD slug VARCHAR(255) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_F65F1BE05E237E06 ON user_type (name)');
    }

    public function postUp(Schema $schema)
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');

        // Force slug generation
        $types = $this->connection->fetchAll('SELECT id, name FROM user_type ut');
        foreach ($types as $type) {
            $slug = Urlizer::urlize($type['name'], '');
            $this->connection->update(
                'user_type',
                array('slug' => $slug),
                array('id' => $type['id'])
            );
        }

        // Add menu item
        $menuId = $this->connection->fetchColumn('SELECT id FROM menu WHERE type = 2');

        if (null == $menuId) {
            $this->connection->insert('menu', array('type' => 2));
            $menuId = $this->connection->lastInsertId();
        }

        $this->connection->insert('menu_item', [
            'menu_id' => $menuId,
            'title' => 'Liste des inscrits',
            'position' => 2,
            'link' => 'members',
            'is_deletable' => false,
            'is_fully_modifiable' => false,
            'is_enabled' => true,
            'updated_at' => $date,
            'created_at' => $date,
            'associated_features' => 'members_list',
        ]);

        // Add new site parameters
        $newParameters = [
            [
                'keyname' => 'members.pagination.size',
                'title' => "Nombre d'inscrits par page dans la liste des inscrits",
                'value' => 16,
                'position' => 783,
                'type' => 2,
                'updated_at' => $date,
                'created_at' => $date,
                'is_enabled' => true,
            ],
            [
                'keyname' => 'members.jumbotron.body',
                'title' => "Sous-titre de la liste des inscrits",
                'value' => '',
                'position' => 781,
                'type' => 1,
                'updated_at' => $date,
                'created_at' => $date,
                'is_enabled' => true,
            ],
            [
                'keyname' => 'members.jumbotron.title',
                'title' => "Titre de la liste des inscrits",
                'value' => 'Liste des inscrits',
                'position' => 780,
                'type' => 0,
                'updated_at' => $date,
                'created_at' => $date,
                'is_enabled' => true,
            ],
            [
                'keyname' => 'members.content.body',
                'title' => "Introduction de la page \"liste des inscrits\"",
                'value' => '',
                'position' => 782,
                'type' => 1,
                'updated_at' => $date,
                'created_at' => $date,
                'is_enabled' => true,
            ],
        ];

        foreach ($newParameters as $values) {
            $this->connection->insert('site_parameter', $values);
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP INDEX UNIQ_F65F1BE05E237E06 ON user_type');
        $this->addSql('ALTER TABLE user_type DROP slug');
    }

    public function postDown(Schema $schema)
    {
        // Delete menu item
        $this->connection->delete('menu_item', array('is_deletable' => 0, 'link' => 'members'));

        // Delete site parameters
        $params = [
            'members.pagination.size',
            'members.jumbotron.body',
            'members.jumbotron.title',
            'members.content.body',
        ];

        foreach ($params as $keyname) {
            $this->connection->delete('site_parameter', array('keyname' => $keyname));
        }
    }
}
