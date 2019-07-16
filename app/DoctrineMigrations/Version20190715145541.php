<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190715145541 extends AbstractMigration
{
    protected $consultationSteps;

    public function postUp(Schema $schema)
    {
        foreach ($this->consultationSteps as $consultationStep) {
            $this->connection->update(
                'consultation',
                [
                    'title_help_text' => $consultationStep['title_help_text'],
                    'opinion_count_shown_by_section' =>
                        (int) $consultationStep['opinion_count_shown_by_section'],
                    'description_help_text' => $consultationStep['description_help_text'],
                    'moderating_on_create' => $consultationStep['moderating_on_create'],
                    'moderating_on_update' => $consultationStep['moderating_on_update']
                ],
                [
                    'step_id' => $consultationStep['id']
                ]
            );
        }
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->consultationSteps = $this->connection->fetchAll(
            'SELECT id, opinion_count_shown_by_section, title_help_text, description_help_text, moderating_on_create, moderating_on_update
                FROM step
                WHERE step.step_type = "consultation"
            '
        );

        $this->addSql(
            'ALTER TABLE consultation ADD opinion_count_shown_by_section INT NOT NULL, ADD title_help_text VARCHAR(255) DEFAULT NULL, ADD description_help_text VARCHAR(255) DEFAULT NULL, ADD moderating_on_create TINYINT(1) DEFAULT \'0\' NOT NULL, ADD moderating_on_update TINYINT(1) DEFAULT \'0\' NOT NULL, ADD meta_description VARCHAR(160) DEFAULT NULL, ADD custom_code LONGTEXT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE step DROP opinion_count_shown_by_section, DROP title_help_text, DROP description_help_text, DROP moderating_on_create, DROP moderating_on_update'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE consultation DROP opinion_count_shown_by_section, DROP title_help_text, DROP description_help_text, DROP moderating_on_create, DROP moderating_on_update, DROP meta_description, DROP custom_code'
        );
        $this->addSql(
            'ALTER TABLE step ADD opinion_count_shown_by_section INT DEFAULT NULL, ADD title_help_text VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci, ADD description_help_text VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci, ADD moderating_on_create TINYINT(1) DEFAULT \'0\', ADD moderating_on_update TINYINT(1) DEFAULT \'0\''
        );
    }
}
