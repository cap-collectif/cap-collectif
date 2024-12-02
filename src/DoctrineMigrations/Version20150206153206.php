<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150206153206 extends AbstractMigration implements ContainerAwareInterface
{
    private ?ContainerInterface $container = null;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $query = $em->createQuery(
            'SELECT si.id FROM Capco\\AppBundle\\Entity\\SiteImage si WHERE si.keyname = :keyname'
        );
        $query->setParameter('keyname', 'image.default_avatar');
        $siteImage = $query->getOneOrNullResult();

        if (null != $siteImage) {
            $this->connection->update(
                'site_image',
                ['is_enabled' => 0],
                ['id' => $siteImage['id']]
            );
        }
    }

    public function down(Schema $schema): void
    {
    }

    public function postDown(Schema $schema): void
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $query = $em->createQuery(
            'SELECT si.id FROM Capco\\AppBundle\\Entity\\SiteImage si WHERE si.keyname = :keyname'
        );
        $query->setParameter('keyname', 'image.default_avatar');
        $siteImage = $query->getOneOrNullResult();

        if (null != $siteImage) {
            $this->connection->update(
                'site_image',
                ['is_enabled' => 1],
                ['id' => $siteImage['id']]
            );
        }
    }
}
