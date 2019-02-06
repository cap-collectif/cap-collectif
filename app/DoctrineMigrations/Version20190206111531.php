<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190206111531 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('CREATE INDEX idx_slug ON proposal (slug, deleted_at)');
        $this->addSql(
            'CREATE INDEX idx_proposalform_published ON proposal (is_draft, trashed_at, published, proposal_form_id, deleted_at)'
        );
        $this->addSql(
            'CREATE INDEX idx_questionnaire_published ON reply (questionnaire_id, published)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP INDEX idx_slug ON proposal');
        $this->addSql('DROP INDEX idx_proposalform_published ON proposal');
        $this->addSql('DROP INDEX idx_questionnaire_published ON reply');
    }
}
