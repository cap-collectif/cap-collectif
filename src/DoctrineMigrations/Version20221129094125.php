<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20221129094125 extends AbstractMigration implements ContainerAwareInterface
{
    private EntityManagerInterface $em;
    private UuidGenerator $generator;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->connection = $this->em->getConnection();
        $this->generator = new UuidGenerator();
    }

    public function getDescription(): string
    {
        return 'add id, organization_id to official_response_author and generate id';
    }

    public function postUp(Schema $schema): void
    {
        $table = 'official_response_author';
        $rows = $this->connection->fetchAllAssociative('SELECT official_response_id, user_id from ' . $table);
        if (\count($rows) > 0) {
            $this->write('-> Generating ' . \count($rows) . ' UUID(s)...');
            foreach ($rows as $row) {
                $officialResponseId = $row['official_response_id'];
                $userId = $row['user_id'];
                $uuid = $this->generator->generate($this->em, null);
                $this->connection->update(
                    $table,
                    ['id' => $uuid],
                    ['official_response_id' => $officialResponseId, 'user_id' => $userId]
                );
            }
        }
        $this->connection->executeQuery('ALTER TABLE official_response_author ADD PRIMARY KEY (id)');
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE official_response_author DROP PRIMARY KEY');
        $this->addSql('ALTER TABLE official_response_author ADD id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', ADD organization_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE user_id user_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE official_response_author ADD CONSTRAINT FK_7A8033732C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_7A8033732C8A3DE ON official_response_author (organization_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE official_response_author DROP FOREIGN KEY FK_7A8033732C8A3DE');
        $this->addSql('DROP INDEX IDX_7A8033732C8A3DE ON official_response_author');
        $this->addSql('ALTER TABLE official_response_author DROP id, DROP organization_id, CHANGE user_id user_id CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE official_response_author ADD PRIMARY KEY (official_response_id, user_id)');
    }
}
