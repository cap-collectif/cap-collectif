<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20181203164324 extends AbstractMigration implements ContainerAwareInterface
{
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
            'CREATE TABLE project_district (project_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', projectdistrict_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_C8FDF5C166D1F9C (project_id), INDEX IDX_C8FDF5CCB622938 (projectdistrict_id), PRIMARY KEY(project_id, projectdistrict_id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE style (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', opacity DOUBLE PRECISION NOT NULL, enabled TINYINT(1) NOT NULL, color VARCHAR(255) NOT NULL, style_type VARCHAR(255) NOT NULL, size INT DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE project_district ADD CONSTRAINT FK_C8FDF5C166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE project_district ADD CONSTRAINT FK_C8FDF5CCB622938 FOREIGN KEY (projectdistrict_id) REFERENCES district (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE district ADD border_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', ADD background_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', ADD district_type VARCHAR(255) NOT NULL, CHANGE form_id form_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE district ADD CONSTRAINT FK_31C154877C210FDD FOREIGN KEY (border_id) REFERENCES style (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE district ADD CONSTRAINT FK_31C15487C93D69EA FOREIGN KEY (background_id) REFERENCES style (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_31C154877C210FDD ON district (border_id)');
        $this->addSql('CREATE INDEX IDX_31C15487C93D69EA ON district (background_id)');
    }

    public function postUp(Schema $schema): void
    {
        $districts = $this->connection->fetchAll('SELECT id, geojson_style FROM district');

        foreach ($districts as $district) {
            if (isset($district['geojson_style'])) {
                $jsonStyle = json_decode($district['geojson_style']);

                $uuidBorderStyle = $this->generator->generate($this->em, null);
                $uuidBackgroundStyle = $this->generator->generate($this->em, null);

                $style = $this->connection->insert('style', [
                    'style_type' => 'border',
                    'color' => isset($jsonStyle->color) ? $jsonStyle->color : null,
                    'opacity' => isset($jsonStyle->opacity) ? $jsonStyle->opacity : null,
                    'size' => isset($jsonStyle->weight) ? $jsonStyle->weight : null,
                    'enabled' => 1,
                    'id' => $uuidBorderStyle
                ]);
                $style = $this->connection->insert('style', [
                    'style_type' => 'background',
                    'color' => isset($jsonStyle->color) ? $jsonStyle->color : null,
                    'opacity' => 0.2,
                    'enabled' => 1,
                    'id' => $uuidBackgroundStyle
                ]);
            } else {
                if (isset($uuidBorderStyle)) {
                    unset($uuidBorderStyle);
                }
                if (isset($uuidBackgroundStyle)) {
                    unset($uuidBackgroundStyle);
                }
            }

            $updateData = [];

            $updateData['district_type'] = 'proposal';

            if (isset($uuidBorderStyle)) {
                $updateData['border_id'] = $uuidBorderStyle;
            }
            if (isset($uuidBackgroundStyle)) {
                $updateData['background_id'] = $uuidBackgroundStyle;
            }

            $this->connection->update('district', $updateData, ['id' => $district['id']]);
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE district DROP FOREIGN KEY FK_31C154877C210FDD');
        $this->addSql('ALTER TABLE district DROP FOREIGN KEY FK_31C15487C93D69EA');
        $this->addSql('DROP TABLE project_district');
        $this->addSql('DROP TABLE style');
        $this->addSql('DROP INDEX IDX_31C154877C210FDD ON district');
        $this->addSql('DROP INDEX IDX_31C15487C93D69EA ON district');
        $this->addSql(
            'ALTER TABLE district DROP border_id, DROP background_id, DROP district_type, CHANGE form_id form_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\''
        );
    }
}
