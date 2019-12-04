<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\DBALException;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191029084429 extends AbstractMigration implements ContainerAwareInterface
{
    private $generator;
    private $em;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE project_district_positioner (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', district_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', project_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', position INT NOT NULL, INDEX IDX_78425936B08FA272 (district_id), INDEX IDX_78425936166D1F9C (project_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE project_district_positioner ADD CONSTRAINT FK_78425936B08FA272 FOREIGN KEY (district_id) REFERENCES district (id)'
        );
        $this->addSql(
            'ALTER TABLE project_district_positioner ADD CONSTRAINT FK_78425936166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)'
        );

        $this->addSql(
            'CREATE UNIQUE INDEX project_district_position_unique ON project_district_positioner (project_id, district_id, position)'
        );

        $this->addSql('ALTER TABLE project_district_positioner ADD created_at DATETIME NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE project_district (project_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\', projectdistrict_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\', INDEX IDX_C8FDF5C166D1F9C (project_id), INDEX IDX_C8FDF5CCB622938 (projectdistrict_id), PRIMARY KEY(project_id, projectdistrict_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB COMMENT = \'\' '
        );
        $this->addSql(
            'ALTER TABLE project_district ADD CONSTRAINT FK_C8FDF5C166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE project_district ADD CONSTRAINT FK_C8FDF5CCB622938 FOREIGN KEY (projectdistrict_id) REFERENCES district (id) ON DELETE CASCADE'
        );

        $this->addSql('ALTER TABLE project_district_positioner DROP created_at');
    }

    public function postUp(Schema $schema): void
    {
        $districts = $this->connection->fetchAll(
            'SELECT project_district.project_id, project_district.projectdistrict_id FROM project_district'
        );
        foreach ($districts as $position => $district) {
            $uuid = $this->generator->generate($this->em, null);
            $positioner = [
                'id' => $uuid,
                'district_id' => $district['projectdistrict_id'],
                'project_id' => $district['project_id'],
                'position' => $position,
            ];

            try {
                $this->connection->insert('project_district_positioner', $positioner);
            } catch (DBALException $e) {
//                $this->logger->error('Error while inserting in postUp : '.$e->getMessage());
            }
        }

        try {
            $this->connection->exec('DROP TABLE project_district');
        } catch (DBALException $e) {
//            $this->logger->error(
//                'Error while deleting project_district in postDown : '.$e->getMessage()
//            );
        }
    }

    public function postDown(Schema $schema): void
    {
        $districts = $this->connection->fetchAll(
            'SELECT project_district_positioner.project_id, project_district_positioner.district_id FROM project_district_positioner'
        );
        foreach ($districts as $district) {
            $projectDistrict = [
                'projectdistrict_id' => $district['district_id'],
                'project_id' => $district['project_id'],
            ];

            try {
                $this->connection->insert('project_district', $projectDistrict);
            } catch (DBALException $e) {
//                $this->logger->error('Error while inserting in postDown : '.$e->getMessage());
            }
        }

        try {
            $this->connection->exec('DROP TABLE project_district_positioner');
        } catch (DBALException $e) {
//            $this->logger->error(
//                'Error while deleting project_district_positioner in postDown : '.$e->getMessage()
//            );
        }
    }
}
