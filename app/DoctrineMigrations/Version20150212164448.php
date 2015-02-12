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
        $ideasMI = $em->getRepository('CapcoAppBundle:MenuItem')->findOneBy(array(
            'link' => 'ideas',
            'isDeletable' => false,
        ));

        if (null != $ideasMI) {
            $ideasMI->setAssociatedFeatures(array('ideas'));
            $em->persist($ideasMI);
            $em->flush();
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
        $ideasMI = $em->getRepository('CapcoAppBundle:MenuItem')->findOneBy(array(
            'link' => 'ideas',
            'isDeletable' => false,
        ));

        if (null != $ideasMI) {
            $ideasMI->setAssociatedFeatures(array());
            $em->persist($ideasMI);
            $em->flush();
        }
    }

}
