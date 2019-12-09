<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150302153402 extends AbstractMigration implements ContainerAwareInterface
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

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $query = $em->createQuery(
            'SELECT si.id FROM Capco\AppBundle\Entity\SiteImage si WHERE si.keyname = :keyname'
        );
        $query->setParameter('keyname', 'image.default_avatar');
        $siteImages = $query->getArrayResult();
        $siteImagesNb = \count($siteImages);

        if ($siteImagesNb > 1) {
            for ($i = 1; $i < $siteImagesNb; ++$i) {
                $this->connection->delete('site_image', ['id' => $siteImages[$i]['id']]);
            }
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
