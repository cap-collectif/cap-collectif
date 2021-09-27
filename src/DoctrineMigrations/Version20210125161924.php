<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210125161924 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE fos_user ADD subscribed_to_proposal_news TINYINT(1) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE fos_user DROP subscribed_to_proposal_news');
    }

    public function postUp(Schema $schema): void
    {
        $adminsId = $this->connection->fetchAllAssociative(
            'select id from fos_user where roles like "%\"ROLE_ADMIN\"%";'
        );
        $q = $this->connection->prepare(
            'UPDATE fos_user SET subscribed_to_proposal_news = true where id IN(?)'
        );
        $q->bindValue(1, implode(',', $adminsId));
        $q->execute();
    }
}
