<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180615140246 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE opinion_relation');
        $this->addSql('ALTER TABLE opinion DROP connections_count');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE opinion_relation (opinion_source CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\', opinion_target CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\', INDEX IDX_986BCBE056C341F3 (opinion_source), INDEX IDX_986BCBE04F26117C (opinion_target), PRIMARY KEY(opinion_source, opinion_target)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE opinion_relation ADD CONSTRAINT FK_986BCBE04F26117C FOREIGN KEY (opinion_target) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE opinion_relation ADD CONSTRAINT FK_986BCBE056C341F3 FOREIGN KEY (opinion_source) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE opinion ADD connections_count INT NOT NULL');
    }
}
