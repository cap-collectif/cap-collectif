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
final class Version20200602184401 extends AbstractMigration implements ContainerAwareInterface
{
    public const DEFAULT_FONTS = [
        [
            'name' => 'Open Sans',
            'family_name' => 'Open Sans, Arial, sans-serif',
            'is_custom' => false,
            'use_as_heading' => false,
            'use_as_body' => false
        ],
    ];
    private $generator;
    private $em;

    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {

    }

    public function postUp(Schema $schema): void
    {
        foreach (self::DEFAULT_FONTS as $font) {
            $this->connection->insert(
                'font',
                array_merge(
                    [
                        'id' => $this->generator->generate($this->em, null),
                        'created_at' => (new \DateTime())->format('Y-m-d H:i:s')
                    ],
                    $font
                )
            );
        }
    }

    public function down(Schema $schema): void
    {
    }

    public function setContainer(ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }
}
