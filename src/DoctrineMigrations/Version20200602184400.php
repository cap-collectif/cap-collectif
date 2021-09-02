<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class Version20200602184400 extends AbstractMigration implements ContainerAwareInterface
{
    private $entityManager;
    private $uuidGenerator;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->entityManager = $container->get('doctrine')->getManager();
        $this->uuidGenerator = new UuidGenerator();
    }

    public function getDescription(): string
    {
        return 'Remove deprecated global.locale parameter';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DELETE FROM site_parameter WHERE keyname="global.locale"');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            $this->generateInsertSql(
                $this->connection->fetchColumn('SELECT code FROM locale WHERE is_default=1', [], 0)
            )
        );
    }

    private function generateInsertSql(string $locale): string
    {
        return 'INSERT INTO site_parameter ' .
            '(id, value, keyname, is_enabled, is_social_network_description, position, type, category)' .
            " VALUES ('" .
            $this->generateUuid() .
            "', '" .
            $locale .
            "', 'global.locale', 1, 0, 1, '9', 'settings.global')";
    }

    private function generateUuid(): string
    {
        return $this->uuidGenerator->generate($this->entityManager, null);
    }
}
