<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200226172710 extends AbstractMigration
{
    public function getDescription(): string
    {
        return "Migrate proposal's supervisor and proposal's assessment";
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE proposal_supervisor (supervisor_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', proposal_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', assigned_by CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', created_at DATETIME NOT NULL, INDEX IDX_3FA3A18E19E9AC5F (supervisor_id), INDEX IDX_3FA3A18EF4792058 (proposal_id), INDEX IDX_3FA3A18E61A2AF17 (assigned_by), PRIMARY KEY(supervisor_id, proposal_id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE proposal_assessment (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', proposal_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', updated_by CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', state VARCHAR(255) NOT NULL, updated_at DATETIME NOT NULL, body LONGTEXT DEFAULT NULL, estimation INT DEFAULT NULL, officialResponse LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_85600E06F4792058 (proposal_id), INDEX IDX_85600E0616FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE proposal_supervisor ADD CONSTRAINT FK_3FA3A18E19E9AC5F FOREIGN KEY (supervisor_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE proposal_supervisor ADD CONSTRAINT FK_3FA3A18EF4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
        $this->addSql(
            'ALTER TABLE proposal_supervisor ADD CONSTRAINT FK_3FA3A18E61A2AF17 FOREIGN KEY (assigned_by) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE proposal_assessment ADD CONSTRAINT FK_85600E06F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
        $this->addSql(
            'ALTER TABLE proposal_assessment ADD CONSTRAINT FK_85600E0616FE72E1 FOREIGN KEY (updated_by) REFERENCES fos_user (id)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE proposal_supervisor');
        $this->addSql('DROP TABLE proposal_assessment');
    }
}
