<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20161114173009 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE project_type (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, slug LONGTEXT NOT NULL, color VARCHAR(25) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql('ALTER TABLE project ADD project_type_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EE535280F6 FOREIGN KEY (project_type_id) REFERENCES project_type (id)'
        );
        $this->addSql('CREATE INDEX IDX_2FB3D0EE535280F6 ON project (project_type_id)');
    }

    public function postUp(Schema $schema): void
    {
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->connection->createQueryBuilder()
            ->insert('project_type')
            ->values(['title' => '?', 'slug' => '?', 'color' => '?'])
            ->setParameter(0, 'project.types.callForProject')
            ->setParameter(1, 'call-for-projects')
            ->setParameter(2, '#d9534f')
            ->execute();
        $this->connection->createQueryBuilder()
            ->insert('project_type')
            ->values(['title' => '?', 'slug' => '?', 'color' => '?'])
            ->setParameter(0, 'project.types.consultation')
            ->setParameter(1, 'consultation')
            ->setParameter(2, '#337ab7')
            ->execute();
        $this->connection->createQueryBuilder()
            ->insert('project_type')
            ->values(['title' => '?', 'slug' => '?', 'color' => '?'])
            ->setParameter(0, 'project.types.interpellation')
            ->setParameter(1, 'interpellation')
            ->setParameter(2, '#5cb85c')
            ->execute();
        $this->connection->createQueryBuilder()
            ->insert('project_type')
            ->values(['title' => '?', 'slug' => '?', 'color' => '?'])
            ->setParameter(0, 'project.types.participatoryBudgeting')
            ->setParameter(1, 'participatory-budgeting')
            ->setParameter(2, '#5bc0de')
            ->execute();
        $this->connection->createQueryBuilder()
            ->insert('project_type')
            ->values(['title' => '?', 'slug' => '?', 'color' => '?'])
            ->setParameter(0, 'project.types.petition')
            ->setParameter(1, 'petition')
            ->setParameter(2, '#f0ad4e')
            ->execute();
        $this->connection->createQueryBuilder()
            ->insert('project_type')
            ->values(['title' => '?', 'slug' => '?', 'color' => '?'])
            ->setParameter(0, 'project.types.publicInquiry')
            ->setParameter(1, 'public-inquiry')
            ->setParameter(2, '#337ab7')
            ->execute();
        $this->connection->createQueryBuilder()
            ->insert('project_type')
            ->values(['title' => '?', 'slug' => '?', 'color' => '?'])
            ->setParameter(0, 'project.types.questionnaire')
            ->setParameter(1, 'questionnaire')
            ->setParameter(2, '#999999')
            ->execute();
        $this->connection->createQueryBuilder()
            ->insert('project_type')
            ->values(['title' => '?', 'slug' => '?', 'color' => '?'])
            ->setParameter(0, 'project.types.suggestionBox')
            ->setParameter(1, 'suggestion-box')
            ->setParameter(2, '#f0ad4e')
            ->execute();
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EE535280F6');
        $this->addSql('DROP TABLE project_type');
        $this->addSql('DROP INDEX IDX_2FB3D0EE535280F6 ON project');
        $this->addSql('ALTER TABLE project DROP project_type_id');
    }
}
