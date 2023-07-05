<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150408151960 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;

    /**
     * Sets the Container.
     *
     * @param null|ContainerInterface $container A ContainerInterface instance or null
     *
     * @api
     */
    public function setContainer(?ContainerInterface $container = null)
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
    }

    public function postUp(Schema $schema): void
    {
        $menuId = $this->connection->fetchOne('SELECT id FROM menu WHERE type = 2');

        if (!$menuId) {
            $this->connection->insert('menu', ['type' => 2]);
            $menuId = $this->connection->lastInsertId();
        }
        $date = (new \DateTime())->format('Y-m-d H:i:s');

        $this->connection->insert('menu_item', [
            'menu_id' => $menuId,
            'title' => 'Confidentialité',
            'position' => 5,
            'link' => 'confidentialite',
            'is_deletable' => 0,
            'isFullyModifiable' => 0,
            'is_enabled' => 1,
            'created_at' => $date,
            'updated_at' => $date,
        ]);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
    }

    public function postDown(Schema $schema): void
    {
        $this->connection->delete('menu_item', ['link' => 'confidentialite']);
    }
}
