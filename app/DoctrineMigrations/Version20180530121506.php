<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180530121506 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE user_requirement (user_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', requirement_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', value TINYINT(1) NOT NULL, INDEX IDX_72249CC5A76ED395 (user_id), INDEX IDX_72249CC57B576F77 (requirement_id), PRIMARY KEY(user_id, requirement_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE requirement (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', step_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', type VARCHAR(255) NOT NULL, `label` VARCHAR(255) DEFAULT NULL, position INT NOT NULL, INDEX IDX_DB3F555073B21E9C (step_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE user_requirement ADD CONSTRAINT FK_72249CC5A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE user_requirement ADD CONSTRAINT FK_72249CC57B576F77 FOREIGN KEY (requirement_id) REFERENCES requirement (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE requirement ADD CONSTRAINT FK_DB3F555073B21E9C FOREIGN KEY (step_id) REFERENCES step (id)'
        );
        $this->addSql('ALTER TABLE step ADD requirements_reason VARCHAR(255) DEFAULT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE user_requirement DROP FOREIGN KEY FK_72249CC57B576F77');
        $this->addSql('DROP TABLE user_requirement');
        $this->addSql('DROP TABLE requirement');
        $this->addSql('ALTER TABLE step DROP requirements_reason');
    }
}
