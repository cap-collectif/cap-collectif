<?php
namespace Application\Migrations;

use Capco\AppBundle\Entity\ProjectVisibilityMode;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180727151723 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE project ADD visibility INT NOT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE project DROP visibility');
    }

    public function postUp(Schema $schema)
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
