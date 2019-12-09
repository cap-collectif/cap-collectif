<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\DBALException;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Finder\Finder;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191029084430 extends AbstractMigration implements ContainerAwareInterface
{
    private $generator;
    private $em;
    private $logger;
    protected $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
        $this->logger = $container->get('logger');
    }

    public function postUp(Schema $schema)
    {
        $medias = $this->connection->fetchAll(
            'SELECT id from media__media where category_id = 2'
        );

        $categoryImages = $this->connection->fetchAll(
            'SELECT id from category_image where is_default = true'
        );
        $now = new \DateTime();

        if($categoryImages) {
            return;
        }

        foreach ($medias as $media) {
            $categoryImage = [
                'id' => $this->generator->generate($this->em, null),
                'is_default' => true,
                'image_id' => $media['id'],
                'updated_at' => $now->format('Y-m-d H:i:s'),
                'created_at' => $now->format('Y-m-d H:i:s')
            ];

            $this->connection->insert('category_image', $categoryImage);
        }
    }

    public function up(Schema $schema)
    {
        // TODO: Implement up() method.
    }

    public function down(Schema $schema)
    {
        // TODO: Implement down() method.
    }
}
