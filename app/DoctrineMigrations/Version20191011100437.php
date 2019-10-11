<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191011100437 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE responses_medias DROP FOREIGN KEY FK_EE827965EA9FDD75');
        $this->addSql('ALTER TABLE responses_medias DROP FOREIGN KEY FK_EE827965FBF32840');
        $this->addSql(
            'ALTER TABLE responses_medias ADD CONSTRAINT FK_EE827965EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE responses_medias ADD CONSTRAINT FK_EE827965FBF32840 FOREIGN KEY (response_id) REFERENCES response (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE proposal_evaluation DROP FOREIGN KEY FK_61119603F4792058');
        $this->addSql(
            'ALTER TABLE proposal_evaluation ADD CONSTRAINT FK_61119603F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
        $this->addSql('ALTER TABLE responses_medias DROP FOREIGN KEY FK_EE827965FBF32840');
        $this->addSql('ALTER TABLE responses_medias DROP FOREIGN KEY FK_EE827965EA9FDD75');
        $this->addSql(
            'ALTER TABLE responses_medias ADD CONSTRAINT FK_EE827965FBF32840 FOREIGN KEY (response_id) REFERENCES response (id)'
        );
        $this->addSql(
            'ALTER TABLE responses_medias ADD CONSTRAINT FK_EE827965EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
        $this->addSql('ALTER TABLE proposal_evaluation DROP FOREIGN KEY FK_61119603F4792058');
        $this->addSql(
            'ALTER TABLE proposal_evaluation ADD CONSTRAINT FK_61119603F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
    }
}
