<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220121092223 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add missing xxx_using_jodit on contact_form proposal_form question questionnaire registration_form and step';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE contact_form ADD confidentiality_using_jodit_wysiwyg TINYINT(1) DEFAULT \'0\' NOT NULL, ADD body_using_jodit_wysiwyg TINYINT(1) DEFAULT \'0\' NOT NULL');
        $this->addSql('ALTER TABLE proposal_form ADD description_using_jodit_wysiwyg TINYINT(1) DEFAULT \'0\' NOT NULL');
        $this->addSql('ALTER TABLE question ADD description_using_jodit_wysiwyg TINYINT(1) DEFAULT \'0\' NOT NULL');
        $this->addSql('ALTER TABLE questionnaire ADD description_using_jodit_wysiwyg TINYINT(1) DEFAULT \'0\' NOT NULL');
        $this->addSql('ALTER TABLE registration_form ADD top_text_using_jodit_wysiwyg TINYINT(1) DEFAULT \'0\' NOT NULL, ADD bottom_text_using_jodit_wysiwyg TINYINT(1) DEFAULT \'0\' NOT NULL');
        $this->addSql('ALTER TABLE step ADD debate_content_using_jodit_wysiwyg TINYINT(1) DEFAULT \'0\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE contact_form DROP confidentiality_using_jodit_wysiwyg, DROP body_using_jodit_wysiwyg');
        $this->addSql('ALTER TABLE proposal_form DROP description_using_jodit_wysiwyg');
        $this->addSql('ALTER TABLE question DROP description_using_jodit_wysiwyg');
        $this->addSql('ALTER TABLE questionnaire DROP description_using_jodit_wysiwyg');
        $this->addSql('ALTER TABLE registration_form DROP top_text_using_jodit_wysiwyg, DROP bottom_text_using_jodit_wysiwyg');
        $this->addSql('ALTER TABLE step DROP debate_content_using_jodit_wysiwyg');
    }
}
