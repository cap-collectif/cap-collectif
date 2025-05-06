<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220726152101 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'project.creator';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE project ADD creator_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EE61220EA6 FOREIGN KEY (creator_id) REFERENCES fos_user (id)'
        );
        $this->addSql('CREATE INDEX IDX_2FB3D0EE61220EA6 ON project (creator_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EE61220EA6');
        $this->addSql('DROP INDEX IDX_2FB3D0EE61220EA6 ON project');
        $this->addSql('ALTER TABLE project DROP creator_id');
    }

    public function postUp(Schema $schema): void
    {
        $projectIdData = $this->connection->fetchAllAssociative(
            'SELECT id from project WHERE creator_id IS NULL'
        );
        foreach ($projectIdData as $projectIdDatum) {
            $projectId = $projectIdDatum['id'];
            $authorId = $this->connection->fetchOne(
                'SELECT user_id FROM project_author WHERE project_id=? AND user_id IS NOT NULL LIMIT 1',
                [$projectId]
            );
            if ($authorId) {
                $this->connection->update(
                    'project',
                    ['creator_id' => $authorId],
                    ['id' => $projectId]
                );
            }
        }
    }
}
