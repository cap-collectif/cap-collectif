<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231024083432 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add mediator table, add mediator_id to votes';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE mediator (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', user_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', step_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_7C0966A3A76ED395 (user_id), INDEX IDX_7C0966A373B21E9C (step_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE mediator ADD CONSTRAINT FK_7C0966A3A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id)');
        $this->addSql('ALTER TABLE mediator ADD CONSTRAINT FK_7C0966A373B21E9C FOREIGN KEY (step_id) REFERENCES step (id)');
        $this->addSql('ALTER TABLE votes ADD mediator_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE votes ADD CONSTRAINT FK_518B7ACFF70452F0 FOREIGN KEY (mediator_id) REFERENCES mediator (id)');
        $this->addSql('CREATE INDEX IDX_518B7ACFF70452F0 ON votes (mediator_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACFF70452F0');
        $this->addSql('DROP TABLE mediator');
        $this->addSql('DROP INDEX IDX_518B7ACFF70452F0 ON votes');
        $this->addSql('ALTER TABLE votes DROP mediator_id');
    }
}
