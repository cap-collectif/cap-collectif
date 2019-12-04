<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150427184111 extends AbstractMigration
{
    protected $steps;
    protected $types;
    protected $consultationAbstractSteps;
    protected $consultationTypeOpinionTypes;
    protected $opinions;

    public function preUp(Schema $schema): void{
        $this->steps = $this->connection->fetchAll('SELECT * FROM step');
        $this->types = $this->connection->fetchAll('SELECT * FROM consultation_types');
        $this->consultationTypeOpinionTypes = $this->connection->fetchAll(
            'SELECT * FROM consultation_type_types'
        );
        $this->opinions = $this->connection->fetchAll('SELECT * FROM opinion');

        foreach ($this->steps as &$step) {
            switch ($step['type']) {
                case 0:
                    $step['step_type'] = 'other';
                    break;
                case 1:
                    $step['step_type'] = 'consultation';
                    break;
                case 2:
                    $step['step_type'] = 'presentation';
                    break;
                default:
                    die('unknown step type for step : ' . $step['id']);
            }
        }

        foreach ($this->types as &$type) {
            foreach ($this->steps as &$step) {
                if (
                    $step['consultation_id'] === $type['consultation_id'] &&
                    $step['step_type'] === 'consultation'
                ) {
                    $type['step_id'] = $step['id'];
                }
            }
        }

        foreach ($this->opinions as &$opinion) {
            foreach ($this->steps as &$step) {
                if (
                    $step['consultation_id'] === $opinion['Consultation_id'] &&
                    $step['step_type'] === 'consultation'
                ) {
                    $opinion['step_id'] = $step['id'];
                }
            }
        }
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void{
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE consultationstep_opiniontypes (consultationstep_id INT NOT NULL, opiniontype_id INT NOT NULL, INDEX IDX_4D642691562C6E32 (consultationstep_id), INDEX IDX_4D64269135365590 (opiniontype_id), PRIMARY KEY(consultationstep_id, opiniontype_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE consultation_abstractstep (id INT AUTO_INCREMENT NOT NULL, consultation_id INT NOT NULL, step_id INT NOT NULL, position INT NOT NULL, INDEX IDX_1064E18E62FF6CDF (consultation_id), UNIQUE INDEX UNIQ_1064E18E73B21E9C (step_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE consultationtype_opiniontypes (consultationtype_id INT NOT NULL, opiniontype_id INT NOT NULL, INDEX IDX_93E37484E0D2FC3D (consultationtype_id), INDEX IDX_93E3748435365590 (opiniontype_id), PRIMARY KEY(consultationtype_id, opiniontype_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE consultationstep_opiniontypes ADD CONSTRAINT FK_4D642691562C6E32 FOREIGN KEY (consultationstep_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultationstep_opiniontypes ADD CONSTRAINT FK_4D64269135365590 FOREIGN KEY (opiniontype_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_abstractstep ADD CONSTRAINT FK_1064E18E62FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_abstractstep ADD CONSTRAINT FK_1064E18E73B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultationtype_opiniontypes ADD CONSTRAINT FK_93E37484E0D2FC3D FOREIGN KEY (consultationtype_id) REFERENCES consultation_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultationtype_opiniontypes ADD CONSTRAINT FK_93E3748435365590 FOREIGN KEY (opiniontype_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
        $this->addSql('DROP TABLE consultation_type_types');
        $this->addSql('DROP TABLE consultation_types');
        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B027EA3A5241');
        $this->addSql('DROP INDEX IDX_AB02B027EA3A5241 ON opinion');
        $this->addSql('ALTER TABLE opinion DROP consultation_id');
        $this->addSql('ALTER TABLE opinion ADD step_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE opinion ADD CONSTRAINT FK_AB02B02773B21E9C FOREIGN KEY (step_id) REFERENCES step (id)'
        );
        $this->addSql('CREATE INDEX IDX_AB02B02773B21E9C ON opinion (step_id)');
        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3C62FF6CDF');
        $this->addSql('DROP INDEX IDX_43B9FE3C62FF6CDF ON step');
        $this->addSql(
            'ALTER TABLE step ADD step_type VARCHAR(255) NOT NULL, ADD trashed_opinion_count INT DEFAULT NULL, ADD argument_count INT DEFAULT NULL, ADD trashed_argument_count INT DEFAULT NULL, ADD sources_count INT DEFAULT NULL, ADD trashed_sources_count INT DEFAULT NULL, DROP position, DROP type, CHANGE consultation_id opinion_count INT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE consultation DROP opinion_count, DROP trashed_opinion_count, DROP argument_count, DROP trashed_argument_count, DROP sources_count, DROP trashed_sources_count'
        );
    }

    public function postUp(Schema $schema): void
    {
        foreach ($this->steps as $step) {
            if ($step['consultation_id'] != null) {
                $this->connection->insert('consultation_abstractstep', array(
                    'consultation_id' => $step['consultation_id'],
                    'step_id' => $step['id'],
                    'position' => $step['position'],
                ));
            }
            $this->connection->update(
                'step',
                ['step_type' => $step['step_type']],
                ['id' => $step['id']]
            );
        }

        foreach ($this->types as $type) {
            if (isset($type['step_id'])) {
                $this->connection->insert('consultationstep_opiniontypes', [
                    'consultationstep_id' => $type['step_id'],
                    'opiniontype_id' => $type['opiniontype_id'],
                ]);
            } else {
                $this->connection->delete('consultationstep_opiniontypes', [
                    'consultationstep_id' => $type['consultation_id'],
                    'opiniontype_id' => $type['opiniontype_id'],
                ]);
            }
        }

        foreach ($this->opinions as $opinion) {
            if (isset($opinion['step_id'])) {
                $this->connection->update(
                    'opinion',
                    ['step_id' => $opinion['step_id']],
                    ['id' => $opinion['id']]
                );
            } else {
                $this->connection->delete('opinion', ['id' => $opinion['id']]);
            }
        }

        foreach ($this->consultationTypeOpinionTypes as $ctot) {
            $this->connection->insert('consultationtype_opiniontypes', array(
                'consultationtype_id' => $ctot['consultationtype_id'],
                'opiniontype_id' => $ctot['opiniontype_id'],
            ));
        }
    }

    public function preDown(Schema $schema): void{
        $this->steps = $this->connection->fetchAll('SELECT * FROM step');
        $this->consultationAbstractSteps = $this->connection->fetchAll(
            'SELECT * FROM consultation_abstractstep'
        );
        $this->types = $this->connection->fetchAll('SELECT * FROM consultationstep_opiniontypes');
        $this->consultationTypeOpinionTypes = $this->connection->fetchAll(
            'SELECT * FROM consultationtype_opiniontypes'
        );
        $this->opinions = $this->connection->fetchAll('SELECT * FROM opinion');

        foreach ($this->steps as &$step) {
            switch ($step['step_type']) {
                case 'other':
                    $step['type'] = 0;
                    break;
                case 'consultation':
                    $step['type'] = 1;
                    break;
                case 'presentation':
                    $step['type'] = 2;
                    break;
                default:
                    die('unknown step type for step : ' . $step['id']);
            }
        }

        foreach ($this->consultationAbstractSteps as &$cas) {
            foreach ($this->steps as &$step) {
                if ($step['id'] === $cas['step_id']) {
                    $step['consultation_id'] = $cas['consultation_id'];
                    $step['position'] = $cas['position'];
                }
            }
        }

        foreach ($this->types as &$type) {
            foreach ($this->steps as &$step) {
                if ($step['id'] === $type['consultationstep_id']) {
                    $type['consultation_id'] = $step['consultation_id'];
                }
            }
        }

        foreach ($this->opinions as &$opinion) {
            foreach ($this->steps as &$step) {
                if ($step['id'] === $opinion['step_id']) {
                    $opinion['Consultation_id'] = $step['consultation_id'];
                }
            }
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void{
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE consultation_type_types (consultationtype_id INT NOT NULL, opiniontype_id INT NOT NULL, INDEX IDX_69F48B0AE0D2FC3D (consultationtype_id), INDEX IDX_69F48B0A35365590 (opiniontype_id), PRIMARY KEY(consultationtype_id, opiniontype_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE consultation_types (consultation_id INT NOT NULL, opiniontype_id INT NOT NULL, INDEX IDX_22AA6B1E62FF6CDF (consultation_id), INDEX IDX_22AA6B1E35365590 (opiniontype_id), PRIMARY KEY(consultation_id, opiniontype_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE consultation_type_types ADD CONSTRAINT FK_69F48B0A35365590 FOREIGN KEY (opiniontype_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_type_types ADD CONSTRAINT FK_69F48B0AE0D2FC3D FOREIGN KEY (consultationtype_id) REFERENCES consultation_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_types ADD CONSTRAINT FK_22AA6B1E35365590 FOREIGN KEY (opiniontype_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultation_types ADD CONSTRAINT FK_22AA6B1E62FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE'
        );
        $this->addSql('DROP TABLE consultationstep_opiniontypes');
        $this->addSql('DROP TABLE consultation_abstractstep');
        $this->addSql('DROP TABLE consultationtype_opiniontypes');
        $this->addSql(
            'ALTER TABLE consultation ADD opinion_count INT NOT NULL, ADD trashed_opinion_count INT NOT NULL, ADD argument_count INT NOT NULL, ADD trashed_argument_count INT NOT NULL, ADD sources_count INT NOT NULL, ADD trashed_sources_count INT NOT NULL'
        );
        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B02773B21E9C');
        $this->addSql('DROP INDEX IDX_AB02B02773B21E9C ON opinion');
        $this->addSql('ALTER TABLE opinion DROP step_id');
        $this->addSql('ALTER TABLE opinion ADD Consultation_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE opinion ADD CONSTRAINT FK_AB02B027EA3A5241 FOREIGN KEY (Consultation_id) REFERENCES consultation (id)'
        );
        $this->addSql('CREATE INDEX IDX_AB02B027EA3A5241 ON opinion (Consultation_id)');
        $this->addSql(
            'ALTER TABLE step ADD consultation_id INT DEFAULT NULL, ADD position INT NOT NULL, ADD type INT NOT NULL, DROP step_type, DROP opinion_count, DROP trashed_opinion_count, DROP argument_count, DROP trashed_argument_count, DROP sources_count, DROP trashed_sources_count'
        );
        $this->addSql(
            'ALTER TABLE step ADD CONSTRAINT FK_43B9FE3C62FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id)'
        );
        $this->addSql('CREATE INDEX IDX_43B9FE3C62FF6CDF ON step (consultation_id)');
    }

    public function postDown(Schema $schema): void
    {
        foreach ($this->steps as $step) {
            if (isset($step['consultation_id'])) {
                $this->connection->update(
                    'step',
                    [
                        'type' => $step['type'],
                        'position' => $step['position'],
                        'consultation_id' => $step['consultation_id'],
                    ],
                    ['id' => $step['id']]
                );
            } else {
                $this->connection->delete('step', ['id' => $step['id']]);
            }
        }

        foreach ($this->types as $type) {
            $this->connection->insert('consultation_types', [
                'consultation_id' => $type['consultation_id'],
                'opiniontype_id' => $type['opiniontype_id'],
            ]);
        }

        foreach ($this->opinions as $opinion) {
            $this->connection->update(
                'opinion',
                ['Consultation_id' => $opinion['Consultation_id']],
                ['id' => $opinion['id']]
            );
        }

        foreach ($this->consultationTypeOpinionTypes as $ctot) {
            $this->connection->insert('consultation_type_types', array(
                'consultationtype_id' => $ctot['consultationtype_id'],
                'opiniontype_id' => $ctot['opiniontype_id'],
            ));
        }
    }
}
