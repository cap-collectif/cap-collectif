<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150908152936 extends AbstractMigration
{
    protected $opinionsForSteps;
    protected $opinionsForTypes;
    protected $typesForSteps;


    public function preUp(Schema $schema)
    {
        $consultationsOpinions = $this->connection->fetchAll('
          SELECT consultationstep_id as step, opiniontype_id as ot FROM consultationstep_opiniontypes
        ');

        $this->opinionsForSteps = [];
        foreach ($consultationsOpinions as $co) {
            $this->opinionsForSteps[$co['step']][] = $co['ot'];
        }

        $consultationTypes = $this->connection->fetchAll('
            SELECT consultationtype_id as type, opiniontype_id as ot FROM consultationtype_opiniontypes
        ');

        $this->opinionsForTypes = [];
        foreach ($consultationTypes as $ct) {
            $this->opinionsForTypes[$ct['type']][] = $ct['ot'];
        }
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE consultationstep_opiniontypes');
        $this->addSql('ALTER TABLE step ADD consultation_type_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE step ADD CONSTRAINT FK_43B9FE3C804F7D71 FOREIGN KEY (consultation_type_id) REFERENCES consultation_type (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_43B9FE3C804F7D71 ON step (consultation_type_id)');
        $this->addSql('ALTER TABLE consultation_type DROP enabled');
        $this->addSql('ALTER TABLE opinion_type ADD parent_id INT DEFAULT NULL, ADD lft INT NOT NULL, ADD rgt INT NOT NULL, ADD root INT DEFAULT NULL, ADD lvl INT NOT NULL');
        $this->addSql('ALTER TABLE opinion_type ADD CONSTRAINT FK_F11F2BF0727ACA70 FOREIGN KEY (parent_id) REFERENCES opinion_type (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_F11F2BF0727ACA70 ON opinion_type (parent_id)');
    }

    public function postUp(Schema $schema)
    {
        $countNew = 1;
        foreach ($this->opinionsForSteps as $step => $ots) {
            $typeFound = null;
            foreach ($this->opinionsForTypes as $type => $tots) {
                if($this->isSame($ots, $tots)) {
                    $typeFound = $type;
                    break;
                };
            }
            if ($typeFound === null) {
                $this->connection->insert('consultation_type', ['title' => 'Défaut '.$countNew]);
                $typeFound = $this->connection->lastInsertId();
                $countNew++;
                foreach ($ots as $ot) {
                    $this->connection->insert('consultationtype_opiniontypes', ['consultationtype_id' => $typeFound, 'opiniontype_id' => $ot]);
                }
                $this->opinionsForTypes[$typeFound] = $ots;
            }
            $this->connection->update('step', ['consultation_type_id' => $typeFound], ['id' => $step]);
        }
    }

    public function preDown(Schema $schema)
    {
        $consultationTypes = $this->connection->fetchAll('
            SELECT consultationtype_id as type, opiniontype_id as ot FROM consultationtype_opiniontypes
        ');

        $this->opinionsForTypes = [];
        foreach ($consultationTypes as $ct) {
            $this->opinionsForTypes[$ct['type']][] = $ct['ot'];
        }

        $this->typesForSteps = $this->connection->fetchAll('
            SELECT id as step, consultation_type_id as type FROM step WHERE step_type = ?
        ', ['consultation']);

    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE consultationstep_opiniontypes (consultationstep_id INT NOT NULL, opiniontype_id INT NOT NULL, INDEX IDX_A2063B6F562C6E32 (consultationstep_id), INDEX IDX_A2063B6F35365590 (opiniontype_id), PRIMARY KEY(consultationstep_id, opiniontype_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE consultationstep_opiniontypes ADD CONSTRAINT FK_4D64269135365590 FOREIGN KEY (opiniontype_id) REFERENCES opinion_type (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE consultationstep_opiniontypes ADD CONSTRAINT FK_4D642691562C6E32 FOREIGN KEY (consultationstep_id) REFERENCES step (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE consultation_type ADD enabled TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE opinion_type DROP FOREIGN KEY FK_F11F2BF0727ACA70');
        $this->addSql('DROP INDEX IDX_F11F2BF0727ACA70 ON opinion_type');
        $this->addSql('ALTER TABLE opinion_type DROP parent_id, DROP lft, DROP rgt, DROP root, DROP lvl');
        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3C804F7D71');
        $this->addSql('DROP INDEX IDX_43B9FE3C804F7D71 ON step');
        $this->addSql('ALTER TABLE step DROP consultation_type_id');
    }

    public function postDown(Schema $schema)
    {
        foreach ($this->typesForSteps as $ts) {
            $ots = $this->opinionsForTypes[$ts['type']];
            foreach ($ots as $ot) {
                $this->connection->insert('consultationstep_opiniontypes', ['consultationstep_id' => $ts['step'], 'opiniontype_id' => $ot]);
            }
        }
    }


    private function isSame($array1, $array2) {
        $passed = true;
        if (count($array1) !== count($array2)) {
            return false;
        }

        for ($i = 0; $i < count($array1); $i++) {
            if ($array1[$i] !== $array2[$i]) {
                $passed = false;
                break;
            }
        }
        return $passed;
    }
}
