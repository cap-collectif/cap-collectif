<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200306134305 extends AbstractMigration
{
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

        $this->addSql(
            'CREATE TABLE proposal_decision (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', post_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', updated_by CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', proposal_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', refused_reason CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', estimated_cost INT DEFAULT NULL, is_approved TINYINT(1) NOT NULL, is_done TINYINT(1) NOT NULL, updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_65F782604B89032C (post_id), INDEX IDX_65F7826016FE72E1 (updated_by), UNIQUE INDEX UNIQ_65F78260F4792058 (proposal_id), UNIQUE INDEX UNIQ_65F7826081B0B4FB (refused_reason), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE proposal_decision_maker (decision_maker_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', proposal_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_DA5E5855E50691FD (decision_maker_id), INDEX IDX_DA5E5855F4792058 (proposal_id), PRIMARY KEY(decision_maker_id, proposal_id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE proposal_decision ADD CONSTRAINT FK_65F782604B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id)'
        );
        $this->addSql(
            'ALTER TABLE proposal_decision ADD CONSTRAINT FK_65F7826016FE72E1 FOREIGN KEY (updated_by) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE proposal_decision ADD CONSTRAINT FK_65F78260F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
        $this->addSql(
            'ALTER TABLE proposal_decision ADD CONSTRAINT FK_65F7826081B0B4FB FOREIGN KEY (refused_reason) REFERENCES status (id)'
        );
        $this->addSql(
            'ALTER TABLE proposal_decision_maker ADD CONSTRAINT FK_DA5E5855E50691FD FOREIGN KEY (decision_maker_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE proposal_decision_maker ADD CONSTRAINT FK_DA5E5855F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
        $this->addSql('ALTER TABLE proposal_supervisor ADD updated_at DATETIME NOT NULL');
        $this->addSql(
            'ALTER TABLE proposal_assessment CHANGE estimation estimated_cost INT DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE proposal_decision');
        $this->addSql('DROP TABLE proposal_decision_maker');
        $this->addSql('ALTER TABLE proposal_supervisor DROP updated_at');
        $this->addSql(
            'ALTER TABLE proposal_assessment CHANGE estimated_cost estimation INT DEFAULT NULL'
        );
    }
}
