<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20181011134709 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE logic_jump (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', origin_id INT NOT NULL, destination_id INT DEFAULT NULL, INDEX IDX_DD5F9E8D56A273CC (origin_id), INDEX IDX_DD5F9E8D816C6140 (destination_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE logic_jump_condition (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', question_id INT NOT NULL, jump_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', value_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', operator VARCHAR(10) NOT NULL, condition_type VARCHAR(255) NOT NULL, INDEX IDX_A7F4B1AC1E27F6BF (question_id), INDEX IDX_A7F4B1AC7AD85FE5 (jump_id), INDEX IDX_A7F4B1ACF920BBA2 (value_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE logic_jump ADD CONSTRAINT FK_DD5F9E8D56A273CC FOREIGN KEY (origin_id) REFERENCES question (id)'
        );
        $this->addSql(
            'ALTER TABLE logic_jump ADD CONSTRAINT FK_DD5F9E8D816C6140 FOREIGN KEY (destination_id) REFERENCES question (id)'
        );
        $this->addSql(
            'ALTER TABLE logic_jump_condition ADD CONSTRAINT FK_A7F4B1AC1E27F6BF FOREIGN KEY (question_id) REFERENCES question (id)'
        );
        $this->addSql(
            'ALTER TABLE logic_jump_condition ADD CONSTRAINT FK_A7F4B1AC7AD85FE5 FOREIGN KEY (jump_id) REFERENCES logic_jump (id)'
        );
        $this->addSql(
            'ALTER TABLE logic_jump_condition ADD CONSTRAINT FK_A7F4B1ACF920BBA2 FOREIGN KEY (value_id) REFERENCES question_choice (id)'
        );
        $this->addSql('ALTER TABLE logic_jump ADD always TINYINT(1) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE logic_jump_condition DROP FOREIGN KEY FK_A7F4B1AC7AD85FE5');
        $this->addSql('DROP TABLE logic_jump');
        $this->addSql('DROP TABLE logic_jump_condition');
    }
}
