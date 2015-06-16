<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\MenuItem;
use Doctrine\DBAL\Migrations\AbstractMigration;
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
        $em = $this->container->get('doctrine.orm.entity_manager');

        $query = $em->createQuery("SELECT mi.id FROM Capco\AppBundle\Entity\MenuItem mi WHERE mi.link = :link AND mi.isDeletable = :isDeletable");
        $query->setParameter('link', 'blog');
        $query->setParameter('isDeletable', false);
        $blogMenuItem = $query->getOneOrNullResult();

        if (null == $blogMenuItem) {
            $query = $em->createQuery("SELECT m.id FROM Capco\AppBundle\Entity\Menu m WHERE m.type = :type");
            $query->setParameter('type', 1);
            $menu = $query->getOneOrNullResult();

            if (null != $menu) {
                $menuId = $menu['id'];
            } else {
                $this->connection->insert('menu', array('type' => 1));
                $menuId = $this->connection->lastInsertId();
            }

            $date = (new \DateTime())->format('Y-m-d H:i:s');
            $this->connection->insert('menu_item', array('title' => 'Actualités', 'link' => 'blog', 'is_enabled' => true, 'is_deletable' => 'false', 'isFullyModifiable' => false, 'position' => 2, 'menu_id' => $menuId, 'parent_id' => null, 'created_at' => $date, 'updated_at' => $date));
        }

    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postDown(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $query = $em->createQuery("SELECT mi.id FROM Capco\AppBundle\Entity\MenuItem mi WHERE mi.link = :link AND mi.isDeletable = :isDeletable");
        $query->setParameter('link', 'blog');
        $query->setParameter('isDeletable', false);
        $blogMenuItem = $query->getOneOrNullResult();

        if (null != $blogMenuItem) {
            $this->connection->delete('menu_item', array('id' => $blogMenuItem['id']));
        }
    }

    /**
     * Sets the Container.
     *
     * @param ContainerInterface|null $container A ContainerInterface instance or null
     *
     * @api
     */public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }
}
