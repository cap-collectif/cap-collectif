<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150206171059 extends AbstractMigration implements ContainerAwareInterface
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

    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE menu_item ADD associated_features LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:simple_array)\''
        );
    }

    public function postUp(Schema $schema)
    {
        $blogMenuItemId = $this->connection->fetchColumn(
            'SELECT id FROM menu_item WHERE link = :link',
            ['link' => 'blog']
        );

        if ($blogMenuItemId !== null) {
            $this->connection->update(
                'menu_item',
                array('associated_features' => 'blog'),
                array('id' => $blogMenuItemId)
            );
        }
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE menu_item DROP associated_features');
    }
}
