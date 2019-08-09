<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190809085810 extends AbstractMigration
{
    protected $consultationsByStep = [];

    public function postUp(Schema $schema)
    {
        foreach ($this->consultationsByStep as $consultationByStep) {
            list(
                $opinion_count,
                $trashed_opinion_count,
                $opinion_versions_count,
                $trashed_opinion_versions_count,
                $argument_count,
                $trashed_argument_count,
                $sources_count,
                $trashed_sources_count,
                $votes_count,
                $contributors_count
            ) = [
                $consultationByStep['opinion_count'],
                $consultationByStep['trashed_opinion_count'],
                $consultationByStep['opinion_versions_count'],
                $consultationByStep['trashed_opinion_versions_count'],
                $consultationByStep['argument_count'],
                $consultationByStep['trashed_argument_count'],
                $consultationByStep['sources_count'],
                $consultationByStep['trashed_sources_count'],
                $consultationByStep['votes_count'],
                $consultationByStep['contributors_count']
            ];
            $this->connection->update(
                'consultation',
                compact(
                    'opinion_count',
                    'trashed_opinion_count',
                    'opinion_versions_count',
                    'trashed_opinion_versions_count',
                    'argument_count',
                    'trashed_argument_count',
                    'sources_count',
                    'trashed_sources_count',
                    'votes_count',
                    'contributors_count'
                ),
                [
                    'step_id' => $consultationByStep['step_id']
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

        $this->consultationsByStep = $this->connection->fetchAll('
            SELECT consultation.`id` AS consultation_id, step.id AS step_id, 
            step.opinion_count, step.trashed_opinion_count, step.opinion_versions_count, 
            step.trashed_opinion_versions_count, step.argument_count, step.trashed_argument_count, 
            step.sources_count, step.trashed_sources_count, step.votes_count, step.contributors_count
            FROM `consultation`
            LEFT JOIN step ON step.id = consultation.step_id
            GROUP BY step_id
        ');

        $this->addSql(
            'ALTER TABLE consultation ADD illustration_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', ADD description LONGTEXT DEFAULT NULL, ADD opinion_count INT NOT NULL, ADD trashed_opinion_count INT NOT NULL, ADD opinion_versions_count INT NOT NULL, ADD trashed_opinion_versions_count INT NOT NULL, ADD argument_count INT NOT NULL, ADD trashed_argument_count INT NOT NULL, ADD sources_count INT NOT NULL, ADD trashed_sources_count INT NOT NULL, ADD votes_count INT NOT NULL, ADD contributors_count INT NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE consultation ADD CONSTRAINT FK_964685A65926566C FOREIGN KEY (illustration_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_964685A65926566C ON consultation (illustration_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE consultation DROP FOREIGN KEY FK_964685A65926566C');
        $this->addSql('DROP INDEX IDX_964685A65926566C ON consultation');
        $this->addSql(
            'ALTER TABLE consultation DROP illustration_id, DROP description, DROP opinion_count, DROP trashed_opinion_count, DROP opinion_versions_count, DROP trashed_opinion_versions_count, DROP argument_count, DROP trashed_argument_count, DROP sources_count, DROP trashed_sources_count, DROP votes_count, DROP contributors_count'
        );
    }
}
