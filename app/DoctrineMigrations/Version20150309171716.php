<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150309171716 extends AbstractMigration implements ContainerAwareInterface
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

    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema)
    {
        $menuId = $this->connection->fetchColumn('SELECT id FROM menu WHERE type = 1');

        if (!$menuId) {
            $this->connection->insert('menu', array('type' => 1));
            $menuId = $this->connection->lastInsertId();
        }

        $menuItemId = $this->connection->fetchColumn(
            'SELECT id FROM menu_item WHERE link = :link AND is_deletable = :deletable',
            ['link' => 'events', 'deletable' => false]
        );

        if (!$menuItemId) {
            $menuItemId = $this->connection->fetchColumn(
                'SELECT id FROM menu_item WHERE link = :link AND is_deletable = :deletable',
                ['link' => 'event', 'deletable' => false]
            );
        }

        if (null !== $menuItemId) {
            $this->connection->update(
                'menu_item',
                array('link' => 'events', 'associated_features' => 'blog'),
                array('id' => $menuItemId)
            );
        } else {
            $date = new \DateTime();
            $formattedDate = $date->format('Y-m-d H:i:s');

            $this->connection->insert('menu_item', array(
                'parent_id' => null,
                'menu_id' => $menuId,
                'title' => 'Évènements',
                'link' => 'events',
                'is_enabled' => true,
                'is_deletable' => false,
                'isFullyModifiable' => false,
                'position' => 3,
                'created_at' => $formattedDate,
                'updated_at' => $formattedDate,
                'Page_id' => null,
                'associated_features' => 'blog',
            ));
        }
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
