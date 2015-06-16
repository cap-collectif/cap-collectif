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
class Version20150212164448 extends AbstractMigration implements ContainerAwareInterface
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

    }

    public function postUp(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $query = $em->createQuery("SELECT mi.id FROM Capco\AppBundle\Entity\MenuItem mi WHERE mi.link = :link AND mi.isDeletable = :isDeletable");
        $query->setParameter('link','ideas');
        $query->setParameter('isDeletable', false);
        $ideasMI = $query->getOneOrNullResult();

        if (null != $ideasMI) {
            $this->connection->update('menu_item', array('associated_features' => 'ideas'), array('id' => $ideasMI['id']));
        }

        $toggleManager = $this->container->get('capco.toggle.manager');
        $toggleManager->activate('ideas');
    }


    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postDown(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $query = $em->createQuery("SELECT mi.id FROM Capco\AppBundle\Entity\MenuItem mi WHERE mi.link = :link AND mi.isDeletable = :isDeletable");
        $query->setParameter('link','ideas');
        $query->setParameter('isDeletable', false);
        $ideasMI = $query->getOneOrNullResult();

        if (null != $ideasMI) {
            $this->connection->update('menu_item', array('associated_features' => 'ideas'), array('id' => $ideasMI['id']));
        }
    }

}
