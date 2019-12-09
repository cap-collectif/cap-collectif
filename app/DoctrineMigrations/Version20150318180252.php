<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150318180252 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;

    /**
     * Sets the Container.
     *
     * @param ContainerInterface|null $container A ContainerInterface instance or null
     *
     * @api
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE consultation_types (consultation_id INT NOT NULL, opiniontype_id INT NOT NULL, INDEX IDX_22AA6B1E62FF6CDF (consultation_id), INDEX IDX_22AA6B1E35365590 (opiniontype_id), PRIMARY KEY(consultation_id, opiniontype_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE consultation_type (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(100) NOT NULL, enabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE consultation_type_types (consultationtype_id INT NOT NULL, opiniontype_id INT NOT NULL, INDEX IDX_69F48B0AE0D2FC3D (consultationtype_id), INDEX IDX_69F48B0A35365590 (opiniontype_id), PRIMARY KEY(consultationtype_id, opiniontype_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE consultation_types ADD CONSTRAINT FK_22AA6B1E62FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_types ADD CONSTRAINT FK_22AA6B1E35365590 FOREIGN KEY (opiniontype_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_type_types ADD CONSTRAINT FK_69F48B0AE0D2FC3D FOREIGN KEY (consultationtype_id) REFERENCES consultation_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_type_types ADD CONSTRAINT FK_69F48B0A35365590 FOREIGN KEY (opiniontype_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE consultation_type_types DROP FOREIGN KEY FK_69F48B0AE0D2FC3D');
        $this->addSql('DROP TABLE consultation_types');
        $this->addSql('DROP TABLE consultation_type');
        $this->addSql('DROP TABLE consultation_type_types');
    }
}
