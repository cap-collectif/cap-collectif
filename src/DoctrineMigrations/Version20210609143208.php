<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210609143208 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE proposal_social_networks (proposal_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', web_page_url VARCHAR(255) DEFAULT NULL, facebook_url VARCHAR(255) DEFAULT NULL, twitter_url VARCHAR(255) DEFAULT NULL, instagram_url VARCHAR(255) DEFAULT NULL, linked_in_url VARCHAR(255) DEFAULT NULL, youtube_url VARCHAR(255) DEFAULT NULL, PRIMARY KEY(proposal_id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE proposal_social_networks ADD CONSTRAINT FK_F96248ADF4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)');
        $this->addSql('ALTER TABLE proposal_form ADD using_web_page TINYINT(1) DEFAULT \'0\' NOT NULL, ADD using_facebook TINYINT(1) DEFAULT \'0\' NOT NULL, ADD using_twitter TINYINT(1) DEFAULT \'0\' NOT NULL, ADD using_instagram TINYINT(1) DEFAULT \'0\' NOT NULL, ADD using_linked_in TINYINT(1) DEFAULT \'0\' NOT NULL, ADD using_youtube TINYINT(1) DEFAULT \'0\' NOT NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE proposal_social_networks');
        $this->addSql('ALTER TABLE proposal_form DROP using_web_page, DROP using_facebook, DROP using_twitter, DROP using_instagram, DROP using_linked_in, DROP using_youtube');
    }
}
