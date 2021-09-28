<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191029084430 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;
    private $generator;
    private $em;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function postUp(Schema $schema): void
    {
        $medias = $this->connection->fetchAllAssociative(
            'SELECT id from media__media where category_id = 2'
        );

        $categoryImages = $this->connection->fetchAllAssociative(
            'SELECT id from category_image where is_default = true'
        );
        $now = new \DateTime();

        if ($categoryImages) {
            return;
        }

        foreach ($medias as $media) {
            $categoryImage = [
                'id' => $this->generator->generate($this->em, null),
                'is_default' => 1,
                'image_id' => $media['id'],
                'updated_at' => $now->format('Y-m-d H:i:s'),
                'created_at' => $now->format('Y-m-d H:i:s'),
            ];

            $this->connection->insert('category_image', $categoryImage);
        }
    }

    public function up(Schema $schema): void
    {
        // TODO: Implement up() method.
    }

    public function down(Schema $schema): void
    {
        // TODO: Implement down() method.
    }
}
