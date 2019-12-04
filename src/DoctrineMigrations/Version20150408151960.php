<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
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
     * @param ContainerInterface|null $container A ContainerInterface instance or null
     *
     * @api
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );
    }

    public function postUp(Schema $schema): void
    {
        $menuId = $this->connection->fetchColumn('SELECT id FROM menu WHERE type = 2');

        if (!$menuId) {
            $this->connection->insert('menu', array('type' => 2));
            $menuId = $this->connection->lastInsertId();
        }

        $this->connection->insert('menu_item', [
            'menu_id' => $menuId,
            'title' => 'Confidentialité',
            'position' => 5,
            'link' => 'confidentialite',
            'is_deletable' => false,
            'isFullyModifiable' => false,
            'is_enabled' => true,
        ]);
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );
    }

    public function postDown(Schema $schema): void
    {
        $this->connection->delete('menu_item', ['link' => 'confidentialite']);
    }
}
