<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151208152158 extends AbstractMigration
{
    public function preUp(Schema $schema): void
    {
        $opinionTypes = $this->connection->fetchAllAssociative(
            '
          SELECT ot.id as id, parent.id as root_id, parent.consultation_step_type_id root_cst
          FROM opinion_type ot
          LEFT JOIN opinion_type parent ON parent.id = ot.root
        '
        );
        foreach ($opinionTypes as $ot) {
            $this->connection->update(
                'opinion_type',
                ['consultation_step_type_id' => $ot['root_cst']],
                ['id' => $ot['id']]
            );
        }
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE opinion_type DROP FOREIGN KEY FK_F11F2BF09637EA18');
        $this->addSql(
            'ALTER TABLE opinion_type CHANGE consultation_step_type_id consultation_step_type_id INT NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE opinion_type ADD CONSTRAINT FK_F11F2BF09637EA18 FOREIGN KEY (consultation_step_type_id) REFERENCES consultation_step_type (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE opinion_type CHANGE consultation_step_type_id consultation_step_type_id INT DEFAULT NULL'
        );
    }

    public function postDown(Schema $schema): void
    {
        $this->connection->update(
            'opinion_type',
            ['consultation_step_type_id' => null],
            ['lvl' => 0]
        );
    }
}
