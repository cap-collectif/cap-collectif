<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190628155716 extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE logic_jump DROP always');
        $this->addSql('ALTER TABLE question ADD always_jump_destination_question_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE question ADD CONSTRAINT FK_B6F7494EC418603E FOREIGN KEY (always_jump_destination_question_id) REFERENCES question (id)');
        $this->addSql('CREATE INDEX IDX_B6F7494EC418603E ON question (always_jump_destination_question_id)');

        $this->addSql('ALTER TABLE logic_jump ADD position INT NOT NULL');
        $this->addSql('ALTER TABLE logic_jump_condition ADD position INT NOT NULL');

        $this->addSql('ALTER TABLE logic_jump_condition CHANGE jump_id jump_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE question DROP FOREIGN KEY FK_B6F7494EC418603E');
        $this->addSql('ALTER TABLE question ADD CONSTRAINT FK_B6F7494EC418603E FOREIGN KEY (always_jump_destination_question_id) REFERENCES question (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE logic_jump_condition CHANGE jump_id jump_id CHAR(36) DEFAULT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE question DROP FOREIGN KEY FK_B6F7494EC418603E');
        $this->addSql('ALTER TABLE question ADD CONSTRAINT FK_B6F7494EC418603E FOREIGN KEY (always_jump_destination_question_id) REFERENCES question (id)');

        $this->addSql('ALTER TABLE logic_jump DROP position');
        $this->addSql('ALTER TABLE logic_jump_condition DROP position');

        $this->addSql('ALTER TABLE logic_jump ADD always TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE question DROP FOREIGN KEY FK_B6F7494EC418603E');
        $this->addSql('DROP INDEX IDX_B6F7494EC418603E ON question');
        $this->addSql('ALTER TABLE question DROP always_jump_destination_question_id');
    }
}
