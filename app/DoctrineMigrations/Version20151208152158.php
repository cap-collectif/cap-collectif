<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151208152158 extends AbstractMigration
{
    public function preUp(Schema $schema)
    {
        $opinionTypes = $this->connection->fetchAll(
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

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
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

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE opinion_type CHANGE consultation_step_type_id consultation_step_type_id INT DEFAULT NULL'
        );
    }

    public function postDown(Schema $schema)
    {
        $this->connection->update(
            'opinion_type',
            ['consultation_step_type_id' => null],
            ['lvl' => 0]
        );
    }
}
