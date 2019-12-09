<?php
declare(strict_types=1);
namespace Application\Migrations;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20180804151723 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE project ADD visibility INT NOT NULL, DROP is_enabled');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE project ADD is_enabled TINYINT(1) NOT NULL, DROP visibility');
    }

    public function postUp(Schema $schema): void
    {
        $projects = $this->connection->fetchAll('SELECT id FROM project');
        foreach ($projects as $project) {
            $this->connection->update(
                'project',
                ['visibility' => ProjectVisibilityMode::VISIBILITY_PUBLIC],
                ['id' => $project['id']]
            );
        }
    }
}
