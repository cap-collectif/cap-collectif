<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231213141342 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'mediator_participant_step';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE mediator_participant_step (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', mediator_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', participant_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', step_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_2541EA44F70452F0 (mediator_id), INDEX IDX_2541EA449D1C3019 (participant_id), INDEX IDX_2541EA4473B21E9C (step_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE mediator_participant_step ADD CONSTRAINT FK_2541EA44F70452F0 FOREIGN KEY (mediator_id) REFERENCES mediator (id)');
        $this->addSql('ALTER TABLE mediator_participant_step ADD CONSTRAINT FK_2541EA449D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id)');
        $this->addSql('ALTER TABLE mediator_participant_step ADD CONSTRAINT FK_2541EA4473B21E9C FOREIGN KEY (step_id) REFERENCES step (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE mediator_participant_step');
    }
}
