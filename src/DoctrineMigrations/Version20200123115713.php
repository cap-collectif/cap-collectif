<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\ProjectHeaderType;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200123115713 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE project ADD header_type VARCHAR(255) NOT NULL, ADD cover_filter_opacity_percent INTEGER NOT NULL'
        );
    }

    public function postUp(Schema $schema): void
    {
        $projects = $this->connection->fetchAll('SELECT id FROM project');

        foreach ($projects as $project) {
            $this->connection->update(
                'project',
                [
                    'header_type' => ProjectHeaderType::THUMBNAIL,
                    'cover_filter_opacity_percent' => Project::DEFAULT_COVER_FILTER_OPACITY,
                ],
                ['id' => $project['id']]
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE project DROP header_type, DROP cover_filter_opacity_percent');
    }
}
