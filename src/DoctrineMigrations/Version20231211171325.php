<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231211171325 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add creator_id, owner_id, organizationOwner_id';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE consultation ADD creator_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', ADD owner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', ADD organizationOwner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE consultation ADD CONSTRAINT FK_964685A661220EA6 FOREIGN KEY (creator_id) REFERENCES fos_user (id)');
        $this->addSql('ALTER TABLE consultation ADD CONSTRAINT FK_964685A67E3C61F9 FOREIGN KEY (owner_id) REFERENCES fos_user (id)');
        $this->addSql('ALTER TABLE consultation ADD CONSTRAINT FK_964685A63ED06A91 FOREIGN KEY (organizationOwner_id) REFERENCES organization (id)');
        $this->addSql('CREATE INDEX IDX_964685A661220EA6 ON consultation (creator_id)');
        $this->addSql('CREATE INDEX IDX_964685A67E3C61F9 ON consultation (owner_id)');
        $this->addSql('CREATE INDEX IDX_964685A63ED06A91 ON consultation (organizationOwner_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE consultation DROP FOREIGN KEY FK_964685A661220EA6');
        $this->addSql('ALTER TABLE consultation DROP FOREIGN KEY FK_964685A67E3C61F9');
        $this->addSql('ALTER TABLE consultation DROP FOREIGN KEY FK_964685A63ED06A91');
        $this->addSql('DROP INDEX IDX_964685A661220EA6 ON consultation');
        $this->addSql('DROP INDEX IDX_964685A67E3C61F9 ON consultation');
        $this->addSql('DROP INDEX IDX_964685A63ED06A91 ON consultation');
        $this->addSql('ALTER TABLE consultation DROP creator_id, DROP owner_id, DROP organizationOwner_id');
    }
}
