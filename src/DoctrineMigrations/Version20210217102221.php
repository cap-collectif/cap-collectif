<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class Version20210217102221 extends AbstractMigration implements ContainerAwareInterface
{
    private ?ContainerInterface $container;
    private EntityManagerInterface $em;
    private UuidGenerator $generator;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
        $this->em = $this->container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function getDescription(): string
    {
        return 'AnalysisConfigurationProcess';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE analysis_configuration_process (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', created_at DATETIME NOT NULL, analysisConfiguration_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_8515ED895D1EF6F5 (analysisConfiguration_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE analysisconfigurationprocess_proposaldecision (analysisconfigurationprocess_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', proposaldecision_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_19FC99D2FD851B79 (analysisconfigurationprocess_id), INDEX IDX_19FC99D2AC97B637 (proposaldecision_id), PRIMARY KEY(analysisconfigurationprocess_id, proposaldecision_id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE analysis_configuration_process ADD CONSTRAINT FK_8515ED895D1EF6F5 FOREIGN KEY (analysisConfiguration_id) REFERENCES analysis_configuration (id)'
        );
        $this->addSql(
            'ALTER TABLE analysisconfigurationprocess_proposaldecision ADD CONSTRAINT FK_19FC99D2FD851B79 FOREIGN KEY (analysisconfigurationprocess_id) REFERENCES analysis_configuration_process (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE analysisconfigurationprocess_proposaldecision ADD CONSTRAINT FK_19FC99D2AC97B637 FOREIGN KEY (proposaldecision_id) REFERENCES proposal_decision (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE analysisconfigurationprocess_proposaldecision DROP FOREIGN KEY FK_19FC99D2FD851B79'
        );
        $this->addSql('DROP TABLE analysis_configuration_process');
        $this->addSql('DROP TABLE analysisconfigurationprocess_proposaldecision');
    }

    public function postUp(Schema $schema): void
    {
        $processedConfigurations = $this->getProcessedConfigurations();
        foreach ($processedConfigurations as $processedConfiguration) {
            $this->createProcess($processedConfiguration);
        }
    }

    private function createProcess(array $processedConfiguration): void
    {
        $date = $processedConfiguration['effective_date'] ?? $processedConfiguration['updated_at'];
        $this->connection->insert('analysis_configuration_process', [
            'id' => $this->generator->generate($this->em, null),
            'analysisConfiguration_id' => $processedConfiguration['id'],
            'created_at' => $date,
        ]);
    }

    private function getProcessedConfigurations(): array
    {
        return $this->connection->fetchAllAssociative('
            SELECT
                ac.id, ac.effective_date, ac.updated_at
            FROM
                analysis_configuration ac
            WHERE
                ac.effective_date_processed = false
        ');
    }
}
