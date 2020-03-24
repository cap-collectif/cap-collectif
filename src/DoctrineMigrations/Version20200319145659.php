<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200319145659 extends AbstractMigration
{
    public function getDescription() : string
    {
        return 'Migrate proposal analysis and analyst.';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE proposal_analyst (proposal_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', analyst_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', assigned_by CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_A0F1CC7F4792058 (proposal_id), INDEX IDX_A0F1CC761A2AF17 (assigned_by), INDEX IDX_A0F1CC7F65B3645 (analyst_id), PRIMARY KEY(proposal_id, analyst_id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE proposal_analysis (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', proposal_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', updated_by CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', state VARCHAR(255) NOT NULL, comment LONGTEXT DEFAULT NULL, updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_E168FB18F4792058 (proposal_id), INDEX IDX_E168FB1816FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE proposal_analyst ADD CONSTRAINT FK_A0F1CC7F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)');
        $this->addSql('ALTER TABLE proposal_analyst ADD CONSTRAINT FK_A0F1CC761A2AF17 FOREIGN KEY (assigned_by) REFERENCES fos_user (id)');
        $this->addSql('ALTER TABLE proposal_analyst ADD CONSTRAINT FK_A0F1CC7F65B3645 FOREIGN KEY (analyst_id) REFERENCES fos_user (id)');
        $this->addSql('ALTER TABLE proposal_analysis ADD CONSTRAINT FK_E168FB18F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)');
        $this->addSql('ALTER TABLE proposal_analysis ADD CONSTRAINT FK_E168FB1816FE72E1 FOREIGN KEY (updated_by) REFERENCES fos_user (id)');
        $this->addSql('ALTER TABLE response ADD analysis_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE response ADD CONSTRAINT FK_3E7B0BFB7941003F FOREIGN KEY (analysis_id) REFERENCES proposal_analysis (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_3E7B0BFB7941003F ON response (analysis_id)');
        $this->addSql('ALTER TABLE proposal_supervisor CHANGE assigned_by assigned_by CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE proposal_decision ADD state VARCHAR(255) NOT NULL, DROP is_done, CHANGE updated_by updated_by CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE response DROP FOREIGN KEY FK_3E7B0BFB7941003F');
        $this->addSql('DROP TABLE proposal_analyst');
        $this->addSql('DROP TABLE proposal_analysis');
        $this->addSql('ALTER TABLE proposal_decision ADD is_done TINYINT(1) NOT NULL, DROP state, CHANGE updated_by updated_by CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE proposal_supervisor CHANGE assigned_by assigned_by CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('DROP INDEX IDX_3E7B0BFB7941003F ON response');
        $this->addSql('ALTER TABLE response DROP analysis_id');
    }
}
