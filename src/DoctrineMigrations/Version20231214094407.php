<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231214094407 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add participant ON DELETE CASCADE in mediator_participant_step';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE mediator_participant_step DROP FOREIGN KEY FK_2541EA449D1C3019');
        $this->addSql('ALTER TABLE mediator_participant_step ADD CONSTRAINT FK_2541EA449D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE mediator_participant_step DROP FOREIGN KEY FK_2541EA449D1C3019');
        $this->addSql('ALTER TABLE mediator_participant_step ADD CONSTRAINT FK_2541EA449D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id)');
    }
}
