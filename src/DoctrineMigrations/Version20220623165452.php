<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220623165452 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'entities can have organizationOwner';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE blog_post ADD organizationOwner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE blog_post ADD CONSTRAINT FK_BA5AE01D3ED06A91 FOREIGN KEY (organizationOwner_id) REFERENCES organization (id)'
        );
        $this->addSql('CREATE INDEX IDX_BA5AE01D3ED06A91 ON blog_post (organizationOwner_id)');
        $this->addSql(
            'ALTER TABLE emailing_campaign ADD organizationOwner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE emailing_campaign ADD CONSTRAINT FK_6016BF9B3ED06A91 FOREIGN KEY (organizationOwner_id) REFERENCES organization (id)'
        );
        $this->addSql(
            'CREATE INDEX IDX_6016BF9B3ED06A91 ON emailing_campaign (organizationOwner_id)'
        );
        $this->addSql(
            'ALTER TABLE event ADD organizationOwner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA73ED06A91 FOREIGN KEY (organizationOwner_id) REFERENCES organization (id)'
        );
        $this->addSql('CREATE INDEX IDX_3BAE0AA73ED06A91 ON event (organizationOwner_id)');
        $this->addSql(
            'ALTER TABLE mailing_list ADD organizationOwner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE mailing_list ADD CONSTRAINT FK_15C473AF3ED06A91 FOREIGN KEY (organizationOwner_id) REFERENCES organization (id)'
        );
        $this->addSql('CREATE INDEX IDX_15C473AF3ED06A91 ON mailing_list (organizationOwner_id)');
        $this->addSql(
            'ALTER TABLE project ADD organizationOwner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EE3ED06A91 FOREIGN KEY (organizationOwner_id) REFERENCES organization (id)'
        );
        $this->addSql('CREATE INDEX IDX_2FB3D0EE3ED06A91 ON project (organizationOwner_id)');
        $this->addSql(
            'ALTER TABLE proposal_form ADD organizationOwner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E8343ED06A91 FOREIGN KEY (organizationOwner_id) REFERENCES organization (id)'
        );
        $this->addSql('CREATE INDEX IDX_72E9E8343ED06A91 ON proposal_form (organizationOwner_id)');
        $this->addSql(
            'ALTER TABLE questionnaire ADD organizationOwner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE questionnaire ADD CONSTRAINT FK_7A64DAF3ED06A91 FOREIGN KEY (organizationOwner_id) REFERENCES organization (id)'
        );
        $this->addSql('CREATE INDEX IDX_7A64DAF3ED06A91 ON questionnaire (organizationOwner_id)');
        $this->addSql(
            'ALTER TABLE user_identification_code_list ADD organizationOwner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE user_identification_code_list ADD CONSTRAINT FK_5047FF3E3ED06A91 FOREIGN KEY (organizationOwner_id) REFERENCES organization (id)'
        );
        $this->addSql(
            'CREATE INDEX IDX_5047FF3E3ED06A91 ON user_identification_code_list (organizationOwner_id)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE blog_post DROP FOREIGN KEY FK_BA5AE01D3ED06A91');
        $this->addSql('DROP INDEX IDX_BA5AE01D3ED06A91 ON blog_post');
        $this->addSql('ALTER TABLE blog_post DROP organizationOwner_id');
        $this->addSql('ALTER TABLE emailing_campaign DROP FOREIGN KEY FK_6016BF9B3ED06A91');
        $this->addSql('DROP INDEX IDX_6016BF9B3ED06A91 ON emailing_campaign');
        $this->addSql('ALTER TABLE emailing_campaign DROP organizationOwner_id');
        $this->addSql('ALTER TABLE event DROP FOREIGN KEY FK_3BAE0AA73ED06A91');
        $this->addSql('DROP INDEX IDX_3BAE0AA73ED06A91 ON event');
        $this->addSql('ALTER TABLE event DROP organizationOwner_id');
        $this->addSql('ALTER TABLE mailing_list DROP FOREIGN KEY FK_15C473AF3ED06A91');
        $this->addSql('DROP INDEX IDX_15C473AF3ED06A91 ON mailing_list');
        $this->addSql('ALTER TABLE mailing_list DROP organizationOwner_id');
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EE3ED06A91');
        $this->addSql('DROP INDEX IDX_2FB3D0EE3ED06A91 ON project');
        $this->addSql('ALTER TABLE project DROP organizationOwner_id');
        $this->addSql('ALTER TABLE proposal_form DROP FOREIGN KEY FK_72E9E8343ED06A91');
        $this->addSql('DROP INDEX IDX_72E9E8343ED06A91 ON proposal_form');
        $this->addSql('ALTER TABLE proposal_form DROP organizationOwner_id');
        $this->addSql('ALTER TABLE questionnaire DROP FOREIGN KEY FK_7A64DAF3ED06A91');
        $this->addSql('DROP INDEX IDX_7A64DAF3ED06A91 ON questionnaire');
        $this->addSql('ALTER TABLE questionnaire DROP organizationOwner_id');
        $this->addSql(
            'ALTER TABLE user_identification_code_list DROP FOREIGN KEY FK_5047FF3E3ED06A91'
        );
        $this->addSql('DROP INDEX IDX_5047FF3E3ED06A91 ON user_identification_code_list');
        $this->addSql('ALTER TABLE user_identification_code_list DROP organizationOwner_id');
    }
}
