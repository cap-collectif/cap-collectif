<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190207112623 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('CREATE INDEX idx_enabled ON event (id, is_enabled)');
        $this->addSql('DROP INDEX idx_proposalform_published ON proposal');
        $this->addSql(
            'CREATE INDEX idx_proposalform_published ON proposal (id, is_draft, trashed_at, published, proposal_form_id, deleted_at)'
        );
        $this->addSql(
            'CREATE INDEX id_username_updated_at_idx ON fos_user (id, username, updated_at)'
        );
        $this->addSql(
            'CREATE INDEX new_email_confirmation_token_idx ON fos_user (new_email_confirmation_token)'
        );
        $this->addSql('CREATE INDEX reset_password_token_idx ON fos_user (reset_password_token)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP INDEX idx_enabled ON event');
        $this->addSql('DROP INDEX id_username_updated_at_idx ON fos_user');
        $this->addSql('DROP INDEX new_email_confirmation_token_idx ON fos_user');
        $this->addSql('DROP INDEX reset_password_token_idx ON fos_user');
        $this->addSql('DROP INDEX idx_proposalform_published ON proposal');
        $this->addSql(
            'CREATE INDEX idx_proposalform_published ON proposal (is_draft, trashed_at, published, proposal_form_id, deleted_at)'
        );
    }
}
