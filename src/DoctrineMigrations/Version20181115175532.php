<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Enum\ProposalFormObjectType;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20181115175532 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE proposal_form ADD object_type VARCHAR(255) DEFAULT \'proposal\' NOT NULL, ADD using_description TINYINT(1) NOT NULL, ADD description_mandatory TINYINT(1) NOT NULL, ADD using_summary TINYINT(1) NOT NULL, ADD using_illustration TINYINT(1) NOT NULL'
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
            'ALTER TABLE proposal_form DROP object_type, DROP using_description, DROP description_mandatory, DROP using_summary, DROP using_illustration'
        );
    }

    public function postUp(Schema $schema): void
    {
        $proposalForms = $this->connection->fetchAllAssociative(
            'SELECT id, summary_help_text, illustration_help_text from proposal_form'
        );
        foreach ($proposalForms as $proposalForm) {
            $data = ['object_type' => ProposalFormObjectType::PROPOSAL];
            $data['using_description'] = true;
            $data['description_mandatory'] = true;
            $data['using_summary'] = true;
            $data['using_illustration'] = true;

            $this->connection->update('proposal_form', $data, ['id' => $proposalForm['id']]);
        }
    }
}
