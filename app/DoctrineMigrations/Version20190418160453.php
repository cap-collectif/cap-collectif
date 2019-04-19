<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190418160453 extends AbstractMigration
{
    private $consultationsStepTypes = [];

    public function postUp(Schema $schema): void
    {
        foreach ($this->consultationsStepTypes as $cst) {
            $this->connection->insert('consultation', [
                'id' => $cst['id'],
                'step_id' => $cst['step_id'],
                'title' => $cst['title'],
                'created_at' => $cst['created_at'],
                'updated_at' => $cst['updated_at'],
            ]);
        }
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->consultationsStepTypes = $this->connection->fetchAll(
            '
            SELECT cst.id, cst.step_id, cst.title, cst.created_at, cst.updated_at
            FROM consultation_step_type cst
            '
        );
        $this->addSql('SET FOREIGN_KEY_CHECKS=0');
        $this->addSql('ALTER TABLE opinion_type DROP FOREIGN KEY FK_F11F2BF09637EA18');
        $this->addSql(
            'CREATE TABLE consultation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', step_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', title VARCHAR(100) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_964685A673B21E9C (step_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE consultation ADD CONSTRAINT FK_964685A673B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE SET NULL'
        );
        $this->addSql('DROP TABLE consultation_step_type');
        $this->addSql('DROP INDEX IDX_F11F2BF09637EA18 ON opinion_type');
        $this->addSql(
            'ALTER TABLE opinion_type CHANGE consultation_step_type_id consultation_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE opinion_type ADD CONSTRAINT FK_F11F2BF062FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_F11F2BF062FF6CDF ON opinion_type (consultation_id)');
        $this->addSql('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('SET FOREIGN_KEY_CHECKS=0');
        $this->addSql('ALTER TABLE opinion_type DROP FOREIGN KEY FK_F11F2BF062FF6CDF');
        $this->addSql(
            'CREATE TABLE consultation_step_type (id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\', step_id CHAR(36) DEFAULT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\', title VARCHAR(100) NOT NULL COLLATE utf8_unicode_ci, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_64BADC9F73B21E9C (step_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB COMMENT = \'\' '
        );
        $this->addSql(
            'ALTER TABLE consultation_step_type ADD CONSTRAINT FK_64BADC9F73B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE SET NULL'
        );
        $this->addSql('DROP TABLE consultation');
        $this->addSql('DROP INDEX IDX_F11F2BF062FF6CDF ON opinion_type');
        $this->addSql(
            'ALTER TABLE opinion_type CHANGE consultation_id consultation_step_type_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE opinion_type ADD CONSTRAINT FK_F11F2BF09637EA18 FOREIGN KEY (consultation_step_type_id) REFERENCES consultation_step_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'CREATE INDEX IDX_F11F2BF09637EA18 ON opinion_type (consultation_step_type_id)'
        );
        $this->addSql('SET FOREIGN_KEY_CHECKS=1');
    }
}
