<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150202114312 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE fos_user_group (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, roles LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\', UNIQUE INDEX UNIQ_583D1F3E5E237E06 (name), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE fos_user (id INT AUTO_INCREMENT NOT NULL, media_id INT DEFAULT NULL, email VARCHAR(255) NOT NULL, email_canonical VARCHAR(255) NOT NULL, enabled TINYINT(1) NOT NULL, salt VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, last_login DATETIME DEFAULT NULL, locked TINYINT(1) NOT NULL, expired TINYINT(1) NOT NULL, expires_at DATETIME DEFAULT NULL, confirmation_token VARCHAR(255) DEFAULT NULL, password_requested_at DATETIME DEFAULT NULL, roles LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\', credentials_expired TINYINT(1) NOT NULL, credentials_expire_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, date_of_birth DATETIME DEFAULT NULL, firstname VARCHAR(64) DEFAULT NULL, lastname VARCHAR(64) DEFAULT NULL, website VARCHAR(64) DEFAULT NULL, biography VARCHAR(1000) DEFAULT NULL, gender VARCHAR(1) DEFAULT NULL, locale VARCHAR(8) DEFAULT NULL, timezone VARCHAR(64) DEFAULT NULL, phone VARCHAR(64) DEFAULT NULL, facebook_uid VARCHAR(255) DEFAULT NULL, facebook_name VARCHAR(255) DEFAULT NULL, facebook_data LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:json)\', twitter_uid VARCHAR(255) DEFAULT NULL, twitter_name VARCHAR(255) DEFAULT NULL, twitter_data LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:json)\', gplus_uid VARCHAR(255) DEFAULT NULL, gplus_name VARCHAR(255) DEFAULT NULL, gplus_data LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:json)\', token VARCHAR(255) DEFAULT NULL, two_step_code VARCHAR(255) DEFAULT NULL, slug VARCHAR(255) NOT NULL, facebook_id VARCHAR(255) DEFAULT NULL, facebook_access_token VARCHAR(255) DEFAULT NULL, google_id VARCHAR(255) DEFAULT NULL, google_access_token VARCHAR(255) DEFAULT NULL, is_terms_accepted TINYINT(1) NOT NULL, city VARCHAR(255) DEFAULT NULL, username_canonical VARCHAR(255) DEFAULT NULL, username VARCHAR(255) DEFAULT NULL, UNIQUE INDEX UNIQ_957A6479A0D96FBF (email_canonical), INDEX IDX_957A6479EA9FDD75 (media_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE fos_user_user_group (user_id INT NOT NULL, group_id INT NOT NULL, INDEX IDX_B3C77447A76ED395 (user_id), INDEX IDX_B3C77447FE54D947 (group_id), PRIMARY KEY(user_id, group_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE media__gallery (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, context VARCHAR(64) NOT NULL, default_format VARCHAR(255) NOT NULL, enabled TINYINT(1) NOT NULL, updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE media__gallery_media (id INT AUTO_INCREMENT NOT NULL, gallery_id INT DEFAULT NULL, media_id INT DEFAULT NULL, position INT NOT NULL, enabled TINYINT(1) NOT NULL, updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_80D4C5414E7AF8F (gallery_id), INDEX IDX_80D4C541EA9FDD75 (media_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE media__media (id INT AUTO_INCREMENT NOT NULL, category_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, description TEXT DEFAULT NULL, enabled TINYINT(1) NOT NULL, provider_name VARCHAR(255) NOT NULL, provider_status INT NOT NULL, provider_reference VARCHAR(255) NOT NULL, provider_metadata LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:json)\', width INT DEFAULT NULL, height INT DEFAULT NULL, length NUMERIC(10, 0) DEFAULT NULL, content_type VARCHAR(255) DEFAULT NULL, content_size INT DEFAULT NULL, copyright VARCHAR(255) DEFAULT NULL, author_name VARCHAR(255) DEFAULT NULL, context VARCHAR(64) DEFAULT NULL, cdn_is_flushable TINYINT(1) DEFAULT NULL, cdn_flush_at DATETIME DEFAULT NULL, cdn_status INT DEFAULT NULL, updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_5C6DD74E12469DE2 (category_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE classification__category (id INT AUTO_INCREMENT NOT NULL, parent_id INT DEFAULT NULL, context VARCHAR(255) DEFAULT NULL, media_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, enabled TINYINT(1) NOT NULL, slug VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, position INT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_43629B36727ACA70 (parent_id), INDEX IDX_43629B36E25D857E (context), INDEX IDX_43629B36EA9FDD75 (media_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE classification__collection (id INT AUTO_INCREMENT NOT NULL, context VARCHAR(255) DEFAULT NULL, media_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, enabled TINYINT(1) NOT NULL, slug VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_A406B56AE25D857E (context), INDEX IDX_A406B56AEA9FDD75 (media_id), UNIQUE INDEX tag_collection (slug, context), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE classification__context (id VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, enabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE classification__tag (id INT AUTO_INCREMENT NOT NULL, context VARCHAR(255) DEFAULT NULL, name VARCHAR(255) NOT NULL, enabled TINYINT(1) NOT NULL, slug VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_CA57A1C7E25D857E (context), UNIQUE INDEX tag_context (slug, context), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE argument (id INT AUTO_INCREMENT NOT NULL, author_id INT DEFAULT NULL, opinion_id INT DEFAULT NULL, body LONGTEXT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, is_enabled TINYINT(1) NOT NULL, vote_count INT NOT NULL, type INT NOT NULL, is_trashed TINYINT(1) NOT NULL, trashed_at DATETIME DEFAULT NULL, trashed_reason LONGTEXT DEFAULT NULL, INDEX IDX_D113B0AF675F31B (author_id), INDEX IDX_D113B0A51885A6A (opinion_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE argument_vote (id INT AUTO_INCREMENT NOT NULL, argument_id INT DEFAULT NULL, voter_id INT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_C2E525743DD48F21 (argument_id), INDEX IDX_C2E52574EBB4B8AD (voter_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE category (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(100) NOT NULL, slug VARCHAR(255) NOT NULL, isEnabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE consultation (id INT AUTO_INCREMENT NOT NULL, author_id INT DEFAULT NULL, cover_id INT DEFAULT NULL, image_id INT DEFAULT NULL, title VARCHAR(100) NOT NULL, slug VARCHAR(255) NOT NULL, teaser LONGTEXT NOT NULL, body LONGTEXT NOT NULL, is_enabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, opinion_count INT NOT NULL, trashed_opinion_count INT NOT NULL, argument_count INT NOT NULL, trashed_argument_count INT NOT NULL, video VARCHAR(255) DEFAULT NULL, INDEX IDX_964685A6F675F31B (author_id), INDEX IDX_964685A6922726E9 (cover_id), INDEX IDX_964685A63DA5256D (image_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE footer_social_network (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, link VARCHAR(255) NOT NULL, style VARCHAR(20) NOT NULL, position INT NOT NULL, is_enabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE idea (id INT AUTO_INCREMENT NOT NULL, theme_id INT DEFAULT NULL, author_id INT DEFAULT NULL, media_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, body LONGTEXT NOT NULL, is_enabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, vote_count INT NOT NULL, is_trashed TINYINT(1) NOT NULL, trashed_at DATETIME DEFAULT NULL, trashed_reason LONGTEXT DEFAULT NULL, INDEX IDX_A8BCA4559027487 (theme_id), INDEX IDX_A8BCA45F675F31B (author_id), UNIQUE INDEX UNIQ_A8BCA45EA9FDD75 (media_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE idea_vote (id INT AUTO_INCREMENT NOT NULL, voter_id INT DEFAULT NULL, created_at DATETIME NOT NULL, Idea_id INT DEFAULT NULL, INDEX IDX_995930CF94D2D6E1 (Idea_id), INDEX IDX_995930CFEBB4B8AD (voter_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE menu (id INT AUTO_INCREMENT NOT NULL, type INT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE menu_item (id INT AUTO_INCREMENT NOT NULL, parent_id INT DEFAULT NULL, menu_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, link VARCHAR(255) DEFAULT NULL, is_enabled TINYINT(1) NOT NULL, is_deletable TINYINT(1) NOT NULL, isFullyModifiable TINYINT(1) NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, Page_id INT DEFAULT NULL, INDEX IDX_D754D550C3FB5A78 (Page_id), INDEX IDX_D754D550727ACA70 (parent_id), INDEX IDX_D754D550CCD7E912 (menu_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE newsletter_subscription (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, is_enabled TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_A82B55ADE7927C74 (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE opinion (id INT AUTO_INCREMENT NOT NULL, author_id INT DEFAULT NULL, opinion_type_id INT NOT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, body LONGTEXT NOT NULL, is_enabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, is_trashed TINYINT(1) NOT NULL, trashed_at DATETIME DEFAULT NULL, trashed_reason LONGTEXT DEFAULT NULL, vote_count_nok INT NOT NULL, vote_count_ok INT NOT NULL, vote_count_mitige INT NOT NULL, sources_count INT NOT NULL, arguments_count INT NOT NULL, Consultation_id INT DEFAULT NULL, INDEX IDX_AB02B027F675F31B (author_id), INDEX IDX_AB02B02728FD468D (opinion_type_id), INDEX IDX_AB02B027EA3A5241 (Consultation_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE opinion_type (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, short_name VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, position INT NOT NULL, vote_widget_type INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, color VARCHAR(50) NOT NULL, is_enabled TINYINT(1) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE opinion_vote (id INT AUTO_INCREMENT NOT NULL, opinion_id INT DEFAULT NULL, voter_id INT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, value INT NOT NULL, INDEX IDX_27D1F9BD51885A6A (opinion_id), INDEX IDX_27D1F9BDEBB4B8AD (voter_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE page (id INT AUTO_INCREMENT NOT NULL, media_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, body LONGTEXT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, is_enabled TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_140AB620EA9FDD75 (media_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE blog_post (id INT AUTO_INCREMENT NOT NULL, media_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, abstract LONGTEXT DEFAULT NULL, slug VARCHAR(255) NOT NULL, body LONGTEXT NOT NULL, is_published TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, published_at DATETIME DEFAULT NULL, updated_at DATETIME NOT NULL, INDEX IDX_BA5AE01DEA9FDD75 (media_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE blog_post_authors (post_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_E93872E54B89032C (post_id), INDEX IDX_E93872E5A76ED395 (user_id), PRIMARY KEY(post_id, user_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE reporting (id INT AUTO_INCREMENT NOT NULL, reporter_id INT DEFAULT NULL, opinion_id INT DEFAULT NULL, source_id INT DEFAULT NULL, argument_id INT DEFAULT NULL, idea_id INT DEFAULT NULL, status INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, body LONGTEXT NOT NULL, is_archived TINYINT(1) NOT NULL, INDEX IDX_BD7CFA9FE1CFE6F5 (reporter_id), INDEX IDX_BD7CFA9F51885A6A (opinion_id), INDEX IDX_BD7CFA9F953C1C61 (source_id), INDEX IDX_BD7CFA9F3DD48F21 (argument_id), INDEX IDX_BD7CFA9F5B6FEF7D (idea_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE site_color (id INT AUTO_INCREMENT NOT NULL, keyname VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, is_enabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, value VARCHAR(25) DEFAULT NULL, position INT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE site_image (id INT AUTO_INCREMENT NOT NULL, keyname VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, is_enabled TINYINT(1) NOT NULL, position INT NOT NULL, Media_id INT DEFAULT NULL, INDEX IDX_167D45A13E9BF23 (Media_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE site_parameter (id INT AUTO_INCREMENT NOT NULL, keyname VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, value LONGTEXT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, is_enabled TINYINT(1) NOT NULL, position INT NOT NULL, type INT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE social_network (id INT AUTO_INCREMENT NOT NULL, media_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, link VARCHAR(255) NOT NULL, position INT NOT NULL, is_enabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_EFFF5221EA9FDD75 (media_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE source (id INT AUTO_INCREMENT NOT NULL, author_id INT NOT NULL, opinion_id INT NOT NULL, category_id INT NOT NULL, media_id INT DEFAULT NULL, title VARCHAR(100) NOT NULL, slug VARCHAR(255) NOT NULL, link TINYTEXT DEFAULT NULL, body LONGTEXT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, is_enabled TINYINT(1) NOT NULL, type INT NOT NULL, vote_count_source INT NOT NULL, is_trashed TINYINT(1) NOT NULL, trashed_at DATETIME DEFAULT NULL, trashed_reason LONGTEXT DEFAULT NULL, INDEX IDX_5F8A7F73F675F31B (author_id), INDEX IDX_5F8A7F7351885A6A (opinion_id), INDEX IDX_5F8A7F7312469DE2 (category_id), UNIQUE INDEX UNIQ_5F8A7F73EA9FDD75 (media_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE source_vote (id INT AUTO_INCREMENT NOT NULL, source_id INT DEFAULT NULL, voter_id INT DEFAULT NULL, created_at DATETIME NOT NULL, INDEX IDX_5B9A0067953C1C61 (source_id), INDEX IDX_5B9A0067EBB4B8AD (voter_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE step (id INT AUTO_INCREMENT NOT NULL, consultation_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, start_at DATETIME NOT NULL, end_at DATETIME NOT NULL, position INT NOT NULL, type INT NOT NULL, is_enabled TINYINT(1) NOT NULL, body LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_43B9FE3C62FF6CDF (consultation_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE theme (id INT AUTO_INCREMENT NOT NULL, author_id INT DEFAULT NULL, media_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, teaser VARCHAR(255) NOT NULL, is_enabled TINYINT(1) NOT NULL, position INT NOT NULL, status INT NOT NULL, body LONGTEXT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_9775E708F675F31B (author_id), UNIQUE INDEX UNIQ_9775E708EA9FDD75 (media_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE theme_consultation (theme_id INT NOT NULL, consultation_id INT NOT NULL, INDEX IDX_611B32459027487 (theme_id), INDEX IDX_611B32462FF6CDF (consultation_id), PRIMARY KEY(theme_id, consultation_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE acl_classes (id INT UNSIGNED AUTO_INCREMENT NOT NULL, class_type VARCHAR(200) NOT NULL, UNIQUE INDEX UNIQ_69DD750638A36066 (class_type), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE acl_security_identities (id INT UNSIGNED AUTO_INCREMENT NOT NULL, identifier VARCHAR(200) NOT NULL, username TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_8835EE78772E836AF85E0677 (identifier, username), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE acl_object_identities (id INT UNSIGNED AUTO_INCREMENT NOT NULL, parent_object_identity_id INT UNSIGNED DEFAULT NULL, class_id INT UNSIGNED NOT NULL, object_identifier VARCHAR(100) NOT NULL, entries_inheriting TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_9407E5494B12AD6EA000B10 (object_identifier, class_id), INDEX IDX_9407E54977FA751A (parent_object_identity_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE acl_object_identity_ancestors (object_identity_id INT UNSIGNED NOT NULL, ancestor_id INT UNSIGNED NOT NULL, INDEX IDX_825DE2993D9AB4A6 (object_identity_id), INDEX IDX_825DE299C671CEA1 (ancestor_id), PRIMARY KEY(object_identity_id, ancestor_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE acl_entries (id INT UNSIGNED AUTO_INCREMENT NOT NULL, class_id INT UNSIGNED NOT NULL, object_identity_id INT UNSIGNED DEFAULT NULL, security_identity_id INT UNSIGNED NOT NULL, field_name VARCHAR(50) DEFAULT NULL, ace_order SMALLINT UNSIGNED NOT NULL, mask INT NOT NULL, granting TINYINT(1) NOT NULL, granting_strategy VARCHAR(30) NOT NULL, audit_success TINYINT(1) NOT NULL, audit_failure TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_46C8B806EA000B103D9AB4A64DEF17BCE4289BF4 (class_id, object_identity_id, field_name, ace_order), INDEX IDX_46C8B806EA000B103D9AB4A6DF9183C9 (class_id, object_identity_id, security_identity_id), INDEX IDX_46C8B806EA000B10 (class_id), INDEX IDX_46C8B8063D9AB4A6 (object_identity_id), INDEX IDX_46C8B806DF9183C9 (security_identity_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE fos_user ADD CONSTRAINT FK_957A6479EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
        $this->addSql(
            'ALTER TABLE fos_user_user_group ADD CONSTRAINT FK_B3C77447A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE fos_user_user_group ADD CONSTRAINT FK_B3C77447FE54D947 FOREIGN KEY (group_id) REFERENCES fos_user_group (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE media__gallery_media ADD CONSTRAINT FK_80D4C5414E7AF8F FOREIGN KEY (gallery_id) REFERENCES media__gallery (id)'
        );
        $this->addSql(
            'ALTER TABLE media__gallery_media ADD CONSTRAINT FK_80D4C541EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
        $this->addSql(
            'ALTER TABLE media__media ADD CONSTRAINT FK_5C6DD74E12469DE2 FOREIGN KEY (category_id) REFERENCES classification__category (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE classification__category ADD CONSTRAINT FK_43629B36727ACA70 FOREIGN KEY (parent_id) REFERENCES classification__category (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE classification__category ADD CONSTRAINT FK_43629B36E25D857E FOREIGN KEY (context) REFERENCES classification__context (id)'
        );
        $this->addSql(
            'ALTER TABLE classification__category ADD CONSTRAINT FK_43629B36EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE classification__collection ADD CONSTRAINT FK_A406B56AE25D857E FOREIGN KEY (context) REFERENCES classification__context (id)'
        );
        $this->addSql(
            'ALTER TABLE classification__collection ADD CONSTRAINT FK_A406B56AEA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE classification__tag ADD CONSTRAINT FK_CA57A1C7E25D857E FOREIGN KEY (context) REFERENCES classification__context (id)'
        );
        $this->addSql(
            'ALTER TABLE argument ADD CONSTRAINT FK_D113B0AF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE argument ADD CONSTRAINT FK_D113B0A51885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id)'
        );
        $this->addSql(
            'ALTER TABLE argument_vote ADD CONSTRAINT FK_C2E525743DD48F21 FOREIGN KEY (argument_id) REFERENCES argument (id)'
        );
        $this->addSql(
            'ALTER TABLE argument_vote ADD CONSTRAINT FK_C2E52574EBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE consultation ADD CONSTRAINT FK_964685A6F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE consultation ADD CONSTRAINT FK_964685A6922726E9 FOREIGN KEY (cover_id) REFERENCES media__media (id)'
        );
        $this->addSql(
            'ALTER TABLE consultation ADD CONSTRAINT FK_964685A63DA5256D FOREIGN KEY (image_id) REFERENCES media__media (id)'
        );
        $this->addSql(
            'ALTER TABLE idea ADD CONSTRAINT FK_A8BCA4559027487 FOREIGN KEY (theme_id) REFERENCES theme (id)'
        );
        $this->addSql(
            'ALTER TABLE idea ADD CONSTRAINT FK_A8BCA45F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE idea ADD CONSTRAINT FK_A8BCA45EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
        $this->addSql(
            'ALTER TABLE idea_vote ADD CONSTRAINT FK_995930CF94D2D6E1 FOREIGN KEY (Idea_id) REFERENCES idea (id)'
        );
        $this->addSql(
            'ALTER TABLE idea_vote ADD CONSTRAINT FK_995930CFEBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE menu_item ADD CONSTRAINT FK_D754D550C3FB5A78 FOREIGN KEY (Page_id) REFERENCES page (id)'
        );
        $this->addSql(
            'ALTER TABLE menu_item ADD CONSTRAINT FK_D754D550727ACA70 FOREIGN KEY (parent_id) REFERENCES menu_item (id)'
        );
        $this->addSql(
            'ALTER TABLE menu_item ADD CONSTRAINT FK_D754D550CCD7E912 FOREIGN KEY (menu_id) REFERENCES menu (id)'
        );
        $this->addSql(
            'ALTER TABLE opinion ADD CONSTRAINT FK_AB02B027F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE opinion ADD CONSTRAINT FK_AB02B02728FD468D FOREIGN KEY (opinion_type_id) REFERENCES opinion_type (id)'
        );
        $this->addSql(
            'ALTER TABLE opinion ADD CONSTRAINT FK_AB02B027EA3A5241 FOREIGN KEY (Consultation_id) REFERENCES consultation (id)'
        );
        $this->addSql(
            'ALTER TABLE opinion_vote ADD CONSTRAINT FK_27D1F9BD51885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id)'
        );
        $this->addSql(
            'ALTER TABLE opinion_vote ADD CONSTRAINT FK_27D1F9BDEBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE page ADD CONSTRAINT FK_140AB620EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
        $this->addSql(
            'ALTER TABLE blog_post ADD CONSTRAINT FK_BA5AE01DEA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
        $this->addSql(
            'ALTER TABLE blog_post_authors ADD CONSTRAINT FK_E93872E54B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id)'
        );
        $this->addSql(
            'ALTER TABLE blog_post_authors ADD CONSTRAINT FK_E93872E5A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9FE1CFE6F5 FOREIGN KEY (reporter_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9F51885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id)'
        );
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9F953C1C61 FOREIGN KEY (source_id) REFERENCES source (id)'
        );
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9F3DD48F21 FOREIGN KEY (argument_id) REFERENCES argument (id)'
        );
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9F5B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id)'
        );
        $this->addSql(
            'ALTER TABLE site_image ADD CONSTRAINT FK_167D45A13E9BF23 FOREIGN KEY (Media_id) REFERENCES media__media (id)'
        );
        $this->addSql(
            'ALTER TABLE social_network ADD CONSTRAINT FK_EFFF5221EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
        $this->addSql(
            'ALTER TABLE source ADD CONSTRAINT FK_5F8A7F73F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE source ADD CONSTRAINT FK_5F8A7F7351885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id)'
        );
        $this->addSql(
            'ALTER TABLE source ADD CONSTRAINT FK_5F8A7F7312469DE2 FOREIGN KEY (category_id) REFERENCES category (id)'
        );
        $this->addSql(
            'ALTER TABLE source ADD CONSTRAINT FK_5F8A7F73EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
        $this->addSql(
            'ALTER TABLE source_vote ADD CONSTRAINT FK_5B9A0067953C1C61 FOREIGN KEY (source_id) REFERENCES source (id)'
        );
        $this->addSql(
            'ALTER TABLE source_vote ADD CONSTRAINT FK_5B9A0067EBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE step ADD CONSTRAINT FK_43B9FE3C62FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id)'
        );
        $this->addSql(
            'ALTER TABLE theme ADD CONSTRAINT FK_9775E708F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE theme ADD CONSTRAINT FK_9775E708EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
        $this->addSql(
            'ALTER TABLE theme_consultation ADD CONSTRAINT FK_611B32459027487 FOREIGN KEY (theme_id) REFERENCES theme (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE theme_consultation ADD CONSTRAINT FK_611B32462FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE acl_object_identities ADD CONSTRAINT FK_9407E54977FA751A FOREIGN KEY (parent_object_identity_id) REFERENCES acl_object_identities (id)'
        );
        $this->addSql(
            'ALTER TABLE acl_object_identity_ancestors ADD CONSTRAINT FK_825DE2993D9AB4A6 FOREIGN KEY (object_identity_id) REFERENCES acl_object_identities (id) ON UPDATE CASCADE ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE acl_object_identity_ancestors ADD CONSTRAINT FK_825DE299C671CEA1 FOREIGN KEY (ancestor_id) REFERENCES acl_object_identities (id) ON UPDATE CASCADE ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE acl_entries ADD CONSTRAINT FK_46C8B806EA000B10 FOREIGN KEY (class_id) REFERENCES acl_classes (id) ON UPDATE CASCADE ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE acl_entries ADD CONSTRAINT FK_46C8B8063D9AB4A6 FOREIGN KEY (object_identity_id) REFERENCES acl_object_identities (id) ON UPDATE CASCADE ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE acl_entries ADD CONSTRAINT FK_46C8B806DF9183C9 FOREIGN KEY (security_identity_id) REFERENCES acl_security_identities (id) ON UPDATE CASCADE ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE fos_user_user_group DROP FOREIGN KEY FK_B3C77447FE54D947');
        $this->addSql('ALTER TABLE fos_user_user_group DROP FOREIGN KEY FK_B3C77447A76ED395');
        $this->addSql('ALTER TABLE argument DROP FOREIGN KEY FK_D113B0AF675F31B');
        $this->addSql('ALTER TABLE argument_vote DROP FOREIGN KEY FK_C2E52574EBB4B8AD');
        $this->addSql('ALTER TABLE consultation DROP FOREIGN KEY FK_964685A6F675F31B');
        $this->addSql('ALTER TABLE idea DROP FOREIGN KEY FK_A8BCA45F675F31B');
        $this->addSql('ALTER TABLE idea_vote DROP FOREIGN KEY FK_995930CFEBB4B8AD');
        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B027F675F31B');
        $this->addSql('ALTER TABLE opinion_vote DROP FOREIGN KEY FK_27D1F9BDEBB4B8AD');
        $this->addSql('ALTER TABLE blog_post_authors DROP FOREIGN KEY FK_E93872E5A76ED395');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9FE1CFE6F5');
        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F73F675F31B');
        $this->addSql('ALTER TABLE source_vote DROP FOREIGN KEY FK_5B9A0067EBB4B8AD');
        $this->addSql('ALTER TABLE theme DROP FOREIGN KEY FK_9775E708F675F31B');
        $this->addSql('ALTER TABLE media__gallery_media DROP FOREIGN KEY FK_80D4C5414E7AF8F');
        $this->addSql('ALTER TABLE fos_user DROP FOREIGN KEY FK_957A6479EA9FDD75');
        $this->addSql('ALTER TABLE media__gallery_media DROP FOREIGN KEY FK_80D4C541EA9FDD75');
        $this->addSql('ALTER TABLE classification__category DROP FOREIGN KEY FK_43629B36EA9FDD75');
        $this->addSql(
            'ALTER TABLE classification__collection DROP FOREIGN KEY FK_A406B56AEA9FDD75'
        );
        $this->addSql('ALTER TABLE consultation DROP FOREIGN KEY FK_964685A6922726E9');
        $this->addSql('ALTER TABLE consultation DROP FOREIGN KEY FK_964685A63DA5256D');
        $this->addSql('ALTER TABLE idea DROP FOREIGN KEY FK_A8BCA45EA9FDD75');
        $this->addSql('ALTER TABLE page DROP FOREIGN KEY FK_140AB620EA9FDD75');
        $this->addSql('ALTER TABLE blog_post DROP FOREIGN KEY FK_BA5AE01DEA9FDD75');
        $this->addSql('ALTER TABLE site_image DROP FOREIGN KEY FK_167D45A13E9BF23');
        $this->addSql('ALTER TABLE social_network DROP FOREIGN KEY FK_EFFF5221EA9FDD75');
        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F73EA9FDD75');
        $this->addSql('ALTER TABLE theme DROP FOREIGN KEY FK_9775E708EA9FDD75');
        $this->addSql('ALTER TABLE media__media DROP FOREIGN KEY FK_5C6DD74E12469DE2');
        $this->addSql('ALTER TABLE classification__category DROP FOREIGN KEY FK_43629B36727ACA70');
        $this->addSql('ALTER TABLE classification__category DROP FOREIGN KEY FK_43629B36E25D857E');
        $this->addSql(
            'ALTER TABLE classification__collection DROP FOREIGN KEY FK_A406B56AE25D857E'
        );
        $this->addSql('ALTER TABLE classification__tag DROP FOREIGN KEY FK_CA57A1C7E25D857E');
        $this->addSql('ALTER TABLE argument_vote DROP FOREIGN KEY FK_C2E525743DD48F21');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9F3DD48F21');
        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F7312469DE2');
        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B027EA3A5241');
        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3C62FF6CDF');
        $this->addSql('ALTER TABLE theme_consultation DROP FOREIGN KEY FK_611B32462FF6CDF');
        $this->addSql('ALTER TABLE idea_vote DROP FOREIGN KEY FK_995930CF94D2D6E1');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9F5B6FEF7D');
        $this->addSql('ALTER TABLE menu_item DROP FOREIGN KEY FK_D754D550CCD7E912');
        $this->addSql('ALTER TABLE menu_item DROP FOREIGN KEY FK_D754D550727ACA70');
        $this->addSql('ALTER TABLE argument DROP FOREIGN KEY FK_D113B0A51885A6A');
        $this->addSql('ALTER TABLE opinion_vote DROP FOREIGN KEY FK_27D1F9BD51885A6A');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9F51885A6A');
        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F7351885A6A');
        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B02728FD468D');
        $this->addSql('ALTER TABLE menu_item DROP FOREIGN KEY FK_D754D550C3FB5A78');
        $this->addSql('ALTER TABLE blog_post_authors DROP FOREIGN KEY FK_E93872E54B89032C');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9F953C1C61');
        $this->addSql('ALTER TABLE source_vote DROP FOREIGN KEY FK_5B9A0067953C1C61');
        $this->addSql('ALTER TABLE idea DROP FOREIGN KEY FK_A8BCA4559027487');
        $this->addSql('ALTER TABLE theme_consultation DROP FOREIGN KEY FK_611B32459027487');
        $this->addSql('ALTER TABLE acl_entries DROP FOREIGN KEY FK_46C8B806EA000B10');
        $this->addSql('ALTER TABLE acl_entries DROP FOREIGN KEY FK_46C8B806DF9183C9');
        $this->addSql('ALTER TABLE acl_object_identities DROP FOREIGN KEY FK_9407E54977FA751A');
        $this->addSql(
            'ALTER TABLE acl_object_identity_ancestors DROP FOREIGN KEY FK_825DE2993D9AB4A6'
        );
        $this->addSql(
            'ALTER TABLE acl_object_identity_ancestors DROP FOREIGN KEY FK_825DE299C671CEA1'
        );
        $this->addSql('ALTER TABLE acl_entries DROP FOREIGN KEY FK_46C8B8063D9AB4A6');
        $this->addSql('DROP TABLE fos_user_group');
        $this->addSql('DROP TABLE fos_user');
        $this->addSql('DROP TABLE fos_user_user_group');
        $this->addSql('DROP TABLE media__gallery');
        $this->addSql('DROP TABLE media__gallery_media');
        $this->addSql('DROP TABLE media__media');
        $this->addSql('DROP TABLE classification__category');
        $this->addSql('DROP TABLE classification__collection');
        $this->addSql('DROP TABLE classification__context');
        $this->addSql('DROP TABLE classification__tag');
        $this->addSql('DROP TABLE argument');
        $this->addSql('DROP TABLE argument_vote');
        $this->addSql('DROP TABLE category');
        $this->addSql('DROP TABLE consultation');
        $this->addSql('DROP TABLE footer_social_network');
        $this->addSql('DROP TABLE idea');
        $this->addSql('DROP TABLE idea_vote');
        $this->addSql('DROP TABLE menu');
        $this->addSql('DROP TABLE menu_item');
        $this->addSql('DROP TABLE newsletter_subscription');
        $this->addSql('DROP TABLE opinion');
        $this->addSql('DROP TABLE opinion_type');
        $this->addSql('DROP TABLE opinion_vote');
        $this->addSql('DROP TABLE page');
        $this->addSql('DROP TABLE blog_post');
        $this->addSql('DROP TABLE blog_post_authors');
        $this->addSql('DROP TABLE reporting');
        $this->addSql('DROP TABLE site_color');
        $this->addSql('DROP TABLE site_image');
        $this->addSql('DROP TABLE site_parameter');
        $this->addSql('DROP TABLE social_network');
        $this->addSql('DROP TABLE source');
        $this->addSql('DROP TABLE source_vote');
        $this->addSql('DROP TABLE step');
        $this->addSql('DROP TABLE theme');
        $this->addSql('DROP TABLE theme_consultation');
        $this->addSql('DROP TABLE acl_classes');
        $this->addSql('DROP TABLE acl_security_identities');
        $this->addSql('DROP TABLE acl_object_identities');
        $this->addSql('DROP TABLE acl_object_identity_ancestors');
        $this->addSql('DROP TABLE acl_entries');
    }
}
