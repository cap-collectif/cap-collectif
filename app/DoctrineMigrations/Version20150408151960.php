<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\Menu;
use Doctrine\DBAL\Migrations\AbstractMigration;
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
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');
    }

    public function postUp(Schema $schema)
    {

        $em = $this->container->get('doctrine.orm.entity_manager');

        $query = $em->createQuery("SELECT m.id FROM Capco\AppBundle\Entity\Menu m WHERE m.type = :type");
        $query->setParameter('type', Menu::TYPE_FOOTER);
        $menu = $query->getOneOrNullResult();

        if (null != $menu) {
            $menuId = $menu['id'];
        } else {
            $this->connection->insert('menu', array('type' => Menu::TYPE_FOOTER));
            $menuId = $this->connection->lastInsertId();
        }


        $this->connection->insert('menu_item', [
            'menu_id' => $menuId,
            'title' => 'Confidentialité',
            'position' => 5,
            'link' => 'confidentialite',
            'is_deletable' => false,
            'isFullyModifiable' => false,
            'is_enabled' => true
        ]);
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');
    }

    public function postDown(Schema $schema)
    {
        $this->connection->delete('menu_item', ['link' => 'confidentialite']);
    }
}
