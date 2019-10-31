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
final class Version20191031123246 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;
    private $generator;
    private $em;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
    }

    public function postUp(Schema $schema)
    {
        $medias = $this->connection->fetchAll(
            'SELECT id from media__media where content_type = "image/svg+xml"'
        );

        foreach ($medias as $media) {
            $this->connection->update('media__media', ['provider_status' => true], [$media['id']]);
        }
    }
}
