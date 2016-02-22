<?php

namespace Application\Migrations;

use Capco\MediaBundle\Entity\Media;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160222000651 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $context = $this->connection->fetchAll("
          SELECT id
          FROM classification__context
          WHERE id = ?"
        , ['default']);

        if (!$context) {
            $date = (new \DateTime())->format('Y-m-d H:i:s');
            $this->connection->insert('classification__context', array('id' => 'default', 'name' => 'Default', 'enabled' => 1, 'created_at' => $date, 'updated_at' => $date));
        }

        $category = $this->connection->fetchAll("
          SELECT id
          FROM classification__category
          WHERE name = ?"
        , ['root']);

        if (!$category) {
            $date = (new \DateTime())->format('Y-m-d H:i:s');
            $this->connection->insert('classification__category', array('context' => 'default', 'name' => 'root', 'slug' => 'root', 'enabled' => 1, 'created_at' => $date, 'updated_at' => $date));
        }

        $media = new Media();
        $media->setBinaryContent(realpath(dirname(__FILE__)).'/../Resources/img/votes_bar_image.png');
        $media->setEnabled(true);
        $media->setName('Image de la barre des votes');

        $this->container
            ->get('sonata.media.manager.media')
            ->save($media, 'default', 'sonata.media.provider.image')
        ;

        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $siteImage = [
            'keyname' => 'image.votes_bar',
            'category' => 'settings.appearance',
            'Media_id' => $media->getId(),
            'is_enabled' => true,
            'position' => 5,
            'created_at' => $date,
            'updated_at' => $date,
        ];

        $this->connection->insert('site_image', $siteImage);

    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->connection->delete('site_image', ['keyname' => 'image.votes_bar']);

    }
}
