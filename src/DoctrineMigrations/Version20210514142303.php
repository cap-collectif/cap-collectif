<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210514142303 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_invite_groups (user_invite_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', group_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_33EC0EF3EAA1FAA3 (user_invite_id), INDEX IDX_33EC0EF3FE54D947 (group_id), PRIMARY KEY(user_invite_id, group_id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE user_invite_groups ADD CONSTRAINT FK_33EC0EF3EAA1FAA3 FOREIGN KEY (user_invite_id) REFERENCES user_invite (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_invite_groups ADD CONSTRAINT FK_33EC0EF3FE54D947 FOREIGN KEY (group_id) REFERENCES user_group (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE user_invite_groups');
    }
}
