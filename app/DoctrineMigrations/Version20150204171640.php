<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150204171640 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema)
    {
        $blogMenuItemId = $this->connection->fetchColumn(
            'SELECT id FROM menu_item WHERE link = :link AND is_deletable = :deletable',
            ['link' => 'blog', 'deletable' => false]
        );

        if (!$blogMenuItemId) {
            $menuId = $this->connection->fetchColumn('SELECT id FROM menu WHERE type = 1');

            if (!$menuId) {
                $this->connection->insert('menu', array('type' => 1));
                $menuId = $this->connection->lastInsertId();
            }

            $date = (new \DateTime())->format('Y-m-d H:i:s');
            $this->connection->insert('menu_item', array(
                'title' => 'Actualités',
                'link' => 'blog',
                'is_enabled' => true,
                'is_deletable' => 0,
                'isFullyModifiable' => 0,
                'position' => 2,
                'menu_id' => $menuId,
                'parent_id' => null,
                'created_at' => $date,
                'updated_at' => $date,
            ));
        }
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema)
    {
        $blogMenuItemId = $this->connection->fetchColumn(
            'SELECT id FROM menu_item WHERE link = :link AND is_deletable = :deletable',
            ['link' => 'blog', 'deletable' => false]
        );

        if (null !== $blogMenuItemId) {
            $this->connection->delete('menu_item', array('id' => $blogMenuItemId));
        }
    }

    /**
     * Sets the Container.
     *
     * @param ContainerInterface|null $container A ContainerInterface instance or null
     *
     * @api
     */ public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }
}
