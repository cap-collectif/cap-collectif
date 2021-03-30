<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210330123715 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE fos_user CHANGE openid_access_token openid_access_token LONGTEXT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE blog_post CHANGE is_published is_published TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE district CHANGE display_on_map display_on_map TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE event CHANGE is_enabled is_enabled TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE font CHANGE use_as_heading use_as_heading TINYINT(1) DEFAULT \'0\' NOT NULL, CHANGE use_as_body use_as_body TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE footer_social_network CHANGE is_enabled is_enabled TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE locale CHANGE is_enabled is_enabled TINYINT(1) DEFAULT \'0\' NOT NULL, CHANGE is_published is_published TINYINT(1) DEFAULT \'0\' NOT NULL, CHANGE is_default is_default TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE menu_item CHANGE is_enabled is_enabled TINYINT(1) DEFAULT \'1\' NOT NULL, CHANGE is_deletable is_deletable TINYINT(1) DEFAULT \'1\' NOT NULL, CHANGE is_fully_modifiable is_fully_modifiable TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE newsletter_subscription CHANGE is_enabled is_enabled TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE official_response CHANGE is_published is_published TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE opinion_type CHANGE versionable versionable TINYINT(1) DEFAULT \'0\' NOT NULL, CHANGE linkable linkable TINYINT(1) DEFAULT \'0\' NOT NULL, CHANGE sourceable sourceable TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE page CHANGE is_enabled is_enabled TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE project CHANGE include_author_in_ranking include_author_in_ranking TINYINT(1) DEFAULT \'0\' NOT NULL, CHANGE is_external is_external TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE proposal_form CHANGE using_address using_address TINYINT(1) DEFAULT \'0\' NOT NULL, CHANGE require_proposal_in_a_zone require_proposal_in_a_zone TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE section CHANGE metrics_to_display_basics metrics_to_display_basics TINYINT(1) DEFAULT \'0\' NOT NULL, CHANGE metrics_to_display_events metrics_to_display_events TINYINT(1) DEFAULT \'0\' NOT NULL, CHANGE metrics_to_display_projects metrics_to_display_projects TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE site_color CHANGE is_enabled is_enabled TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE site_image CHANGE is_enabled is_enabled TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE site_parameter CHANGE is_enabled is_enabled TINYINT(1) DEFAULT \'1\' NOT NULL, CHANGE is_social_network_description is_social_network_description TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE source_category CHANGE isEnabled isEnabled TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE step CHANGE is_enabled is_enabled TINYINT(1) DEFAULT \'0\' NOT NULL, CHANGE allowing_progess_steps allowing_progess_steps TINYINT(1) DEFAULT \'0\''
        );
        $this->addSql(
            'ALTER TABLE synthesis CHANGE enabled enabled TINYINT(1) DEFAULT \'0\' NOT NULL, CHANGE editable editable TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE synthesis_element CHANGE published published TINYINT(1) DEFAULT \'0\' NOT NULL, CHANGE archived archived TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE theme CHANGE is_enabled is_enabled TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE user_group CHANGE is_deletable is_deletable TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE video CHANGE is_enabled is_enabled TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE official_response CHANGE is_published is_published TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE step CHANGE is_enabled is_enabled TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE fos_user CHANGE openid_access_token openid_access_token VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
        $this->addSql('ALTER TABLE blog_post CHANGE is_published is_published TINYINT(1) NOT NULL');
        $this->addSql(
            'ALTER TABLE district CHANGE display_on_map display_on_map TINYINT(1) NOT NULL'
        );
        $this->addSql('ALTER TABLE event CHANGE is_enabled is_enabled TINYINT(1) NOT NULL');
        $this->addSql(
            'ALTER TABLE font CHANGE use_as_heading use_as_heading TINYINT(1) NOT NULL, CHANGE use_as_body use_as_body TINYINT(1) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE footer_social_network CHANGE is_enabled is_enabled TINYINT(1) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE locale CHANGE is_enabled is_enabled TINYINT(1) NOT NULL, CHANGE is_published is_published TINYINT(1) NOT NULL, CHANGE is_default is_default TINYINT(1) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE menu_item CHANGE is_enabled is_enabled TINYINT(1) NOT NULL, CHANGE is_deletable is_deletable TINYINT(1) NOT NULL, CHANGE is_fully_modifiable is_fully_modifiable TINYINT(1) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE newsletter_subscription CHANGE is_enabled is_enabled TINYINT(1) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE official_response CHANGE is_published is_published TINYINT(1) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE opinion_type CHANGE versionable versionable TINYINT(1) NOT NULL, CHANGE linkable linkable TINYINT(1) NOT NULL, CHANGE sourceable sourceable TINYINT(1) NOT NULL'
        );
        $this->addSql('ALTER TABLE page CHANGE is_enabled is_enabled TINYINT(1) NOT NULL');
        $this->addSql(
            'ALTER TABLE project CHANGE include_author_in_ranking include_author_in_ranking TINYINT(1) NOT NULL, CHANGE is_external is_external TINYINT(1) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE proposal_form CHANGE using_address using_address TINYINT(1) NOT NULL, CHANGE require_proposal_in_a_zone require_proposal_in_a_zone TINYINT(1) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE section CHANGE metrics_to_display_basics metrics_to_display_basics TINYINT(1) NOT NULL, CHANGE metrics_to_display_events metrics_to_display_events TINYINT(1) NOT NULL, CHANGE metrics_to_display_projects metrics_to_display_projects TINYINT(1) NOT NULL'
        );
        $this->addSql('ALTER TABLE site_color CHANGE is_enabled is_enabled TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE site_image CHANGE is_enabled is_enabled TINYINT(1) NOT NULL');
        $this->addSql(
            'ALTER TABLE site_parameter CHANGE is_enabled is_enabled TINYINT(1) NOT NULL, CHANGE is_social_network_description is_social_network_description TINYINT(1) NOT NULL'
        );
        $this->addSql('ALTER TABLE source_category CHANGE isEnabled isEnabled TINYINT(1) NOT NULL');
        $this->addSql(
            'ALTER TABLE step CHANGE is_enabled is_enabled TINYINT(1) NOT NULL, CHANGE allowing_progess_steps allowing_progess_steps TINYINT(1) DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE synthesis CHANGE enabled enabled TINYINT(1) NOT NULL, CHANGE editable editable TINYINT(1) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE synthesis_element CHANGE published published TINYINT(1) NOT NULL, CHANGE archived archived TINYINT(1) NOT NULL'
        );
        $this->addSql('ALTER TABLE theme CHANGE is_enabled is_enabled TINYINT(1) NOT NULL');
        $this->addSql(
            'ALTER TABLE user_group CHANGE is_deletable is_deletable TINYINT(1) NOT NULL'
        );
        $this->addSql('ALTER TABLE video CHANGE is_enabled is_enabled TINYINT(1) NOT NULL');
        $this->addSql(
            'ALTER TABLE official_response CHANGE is_published is_published TINYINT(1) DEFAULT \'1\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE step CHANGE is_enabled is_enabled TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
    }
}
