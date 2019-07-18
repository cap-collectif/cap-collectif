<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190717154855 extends AbstractMigration
{
    protected $consultationsByStep = [];

    public function postUp(Schema $schema)
    {
        foreach ($this->consultationsByStep as $consultationByStep) {
            $this->connection->update('opinion', [
                'consultation_id' => $consultationByStep['consultation_id']
            ], [
                'consultation_id' => $consultationByStep['step_id']
            ]);
        }
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->consultationsByStep = $this->connection->fetchAll('
            SELECT consultation.`id` AS consultation_id, step.id AS step_id
            FROM `consultation`
            LEFT JOIN step ON step.id = consultation.step_id
            GROUP BY step_id
        ');
        $this->addSql('SET FOREIGN_KEY_CHECKS=0');

        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B02773B21E9C');
        $this->addSql('DROP INDEX IDX_AB02B02773B21E9C ON opinion');
        $this->addSql('ALTER TABLE opinion CHANGE step_id consultation_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE opinion ADD CONSTRAINT FK_AB02B02762FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id)');
        $this->addSql('CREATE INDEX IDX_AB02B02762FF6CDF ON opinion (consultation_id)');

        $this->addSql('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('SET FOREIGN_KEY_CHECKS=0');

        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B02762FF6CDF');
        $this->addSql('DROP INDEX IDX_AB02B02762FF6CDF ON opinion');
        $this->addSql('ALTER TABLE opinion CHANGE consultation_id step_id CHAR(36) DEFAULT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE opinion ADD CONSTRAINT FK_AB02B02773B21E9C FOREIGN KEY (step_id) REFERENCES step (id)');
        $this->addSql('CREATE INDEX IDX_AB02B02773B21E9C ON opinion (step_id)');

        $this->addSql('SET FOREIGN_KEY_CHECKS=1');
    }
}
