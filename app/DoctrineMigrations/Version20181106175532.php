<?php declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Enum\ProposalFormObjectType;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20181106175532 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal_form ADD object_type VARCHAR(255) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal_form DROP object_type');
    }

    public function postUp(Schema $schema)
    {
        $proposalForms = $this->connection->fetchAll('SELECT id from proposal_form');
        foreach ($proposalForms as $proposalForm) {
            $this->connection->update(
                'proposal_form',
                ['object_type' => ProposalFormObjectType::PROPOSAL],
                ['id' => $proposalForm['id']]
            );
        }
    }
}
