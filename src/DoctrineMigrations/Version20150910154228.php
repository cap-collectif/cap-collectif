<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150910154228 extends AbstractMigration
{
    protected $steps;
    protected $ots;
    protected $cts;

    public function preUp(Schema $schema): void
    {
        $consultationsOpinions = $this->connection->fetchAll(
            '
          SELECT consultationstep_id as step, opiniontype_id as ot FROM consultationstep_opiniontypes
        '
        );

        $this->steps = [];
        foreach ($consultationsOpinions as $co) {
            $this->steps[$co['step']]['ots'][] = $co['ot'];
        }

        $consultationTypes = $this->connection->fetchAll(
            '
            SELECT ctot.consultationtype_id as ct, ctot.opiniontype_id as ot, ct.title as ct_title
            FROM consultationtype_opiniontypes ctot
            LEFT JOIN consultation_type ct ON ct.id = ctot.consultationtype_id
        '
        );

        // We want every opinion type to have only one consultation type

        $this->ots = [];
        foreach ($consultationTypes as $ct) {
            $this->ots[$ct['ot']]['cts'][] = $ct['ct'];
        }

        $this->cts = [];
        foreach ($consultationTypes as $ct) {
            $this->cts[$ct['ct']]['title'] = $ct['ct_title'];
            $this->cts[$ct['ct']]['ots'][] = $ct['ot'];
        }
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE consultationstep_opiniontypes');
        $this->addSql('DROP TABLE consultationtype_opiniontypes');
        $this->addSql('ALTER TABLE step ADD consultation_type_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE step ADD CONSTRAINT FK_43B9FE3C804F7D71 FOREIGN KEY (consultation_type_id) REFERENCES consultation_type (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_43B9FE3C804F7D71 ON step (consultation_type_id)');
        $this->addSql('ALTER TABLE consultation_type DROP enabled');
        $this->addSql(
            'ALTER TABLE opinion_type ADD parent_id INT DEFAULT NULL, ADD consultation_type_id INT DEFAULT NULL, ADD lft INT NOT NULL, ADD rgt INT NOT NULL, ADD root INT DEFAULT NULL, ADD lvl INT NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE opinion_type ADD CONSTRAINT FK_F11F2BF0727ACA70 FOREIGN KEY (parent_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE opinion_type ADD CONSTRAINT FK_F11F2BF0804F7D71 FOREIGN KEY (consultation_type_id) REFERENCES consultation_type (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_F11F2BF0727ACA70 ON opinion_type (parent_id)');
        $this->addSql('CREATE INDEX IDX_F11F2BF0804F7D71 ON opinion_type (consultation_type_id)');
    }

    public function postUp(Schema $schema): void
    {
        // We create missing consultation types and update all steps to set the consultation type
        $countNew = 1;
        foreach ($this->steps as $sid => $step) {
            $typeFound = null;
            foreach ($this->cts as $ctid => $ct) {
                if ($this->isSame($step['ots'], $ct['ots'])) {
                    $typeFound = $ctid;

                    break;
                }
            }
            if (null === $typeFound) {
                $title = 'Défaut' . ' ' . $countNew;
                $this->connection->insert('consultation_type', ['title' => $title]);
                $typeFound = $this->connection->lastInsertId();
                ++$countNew;
                foreach ($step['ots'] as $ot) {
                    $this->ots[$ot]['cts'][] = $typeFound;
                }
                $this->cts[$typeFound]['ots'] = $step['ots'];
            }
            $this->connection->update(
                'step',
                ['consultation_type_id' => $typeFound],
                ['id' => $sid]
            );
        }

        // If an opinion type is linked to more than one consultation type, we will duplicate the opinion type
        foreach ($this->ots as $otid => $ot) {
            foreach ($ot['cts'] as $key => $ctid) {
                if (0 === $key) {
                    $this->connection->update(
                        'opinion_type',
                        ['consultation_type_id' => $ctid],
                        ['id' => $otid]
                    );
                } else {
                    $values = $this->connection->fetchAll(
                        'SELECT * from opinion_type WHERE id = ?',
                        [$otid]
                    )[0];
                    $values['consultation_type_id'] = $ctid;
                    unset($values['id']);
                    $this->connection->insert('opinion_type', $values);
                    $newOt = $this->connection->lastInsertId();
                    $q = $this->connection->prepare(
                        '
                        UPDATE opinion SET opinion_type_id = ?
                        WHERE id IN (
                            SELECT o2.id
                            FROM (SELECT * FROM opinion) as o2
                            LEFT JOIN step s ON s.id = o2.step_id
                            WHERE o2.opinion_type_id = ?
                            AND s.consultation_type_id = ?
                        )
                    '
                    );
                    $q->bindValue(1, $newOt);
                    $q->bindValue(2, $otid);
                    $q->bindValue(3, $ctid);
                    $q->execute();
                }
            }
        }
    }

    public function preDown(Schema $schema): void
    {
        $consultationTypes = $this->connection->fetchAll(
            '
            SELECT id as ot, consultation_type_id as type FROM opinion_type
        '
        );

        $this->cts = [];
        foreach ($consultationTypes as $ct) {
            $this->cts[$ct['type']][] = $ct['ot'];
        }

        $this->steps = $this->connection->fetchAll(
            '
            SELECT id as step, consultation_type_id as type FROM step WHERE step_type = ?
        ',
            ['consultation']
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
            'CREATE TABLE consultationstep_opiniontypes (consultationstep_id INT NOT NULL, opiniontype_id INT NOT NULL, INDEX IDX_A2063B6F562C6E32 (consultationstep_id), INDEX IDX_A2063B6F35365590 (opiniontype_id), PRIMARY KEY(consultationstep_id, opiniontype_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE consultationtype_opiniontypes (consultationtype_id INT NOT NULL, opiniontype_id INT NOT NULL, INDEX IDX_1E2A76B8E0D2FC3D (consultationtype_id), INDEX IDX_1E2A76B835365590 (opiniontype_id), PRIMARY KEY(consultationtype_id, opiniontype_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE consultationstep_opiniontypes ADD CONSTRAINT FK_4D64269135365590 FOREIGN KEY (opiniontype_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultationstep_opiniontypes ADD CONSTRAINT FK_4D642691562C6E32 FOREIGN KEY (consultationstep_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultationtype_opiniontypes ADD CONSTRAINT FK_93E3748435365590 FOREIGN KEY (opiniontype_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE consultationtype_opiniontypes ADD CONSTRAINT FK_93E37484E0D2FC3D FOREIGN KEY (consultationtype_id) REFERENCES consultation_type (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE consultation_type ADD enabled TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE opinion_type DROP FOREIGN KEY FK_F11F2BF0727ACA70');
        $this->addSql('ALTER TABLE opinion_type DROP FOREIGN KEY FK_F11F2BF0804F7D71');
        $this->addSql('DROP INDEX IDX_F11F2BF0727ACA70 ON opinion_type');
        $this->addSql('DROP INDEX IDX_F11F2BF0804F7D71 ON opinion_type');
        $this->addSql(
            'ALTER TABLE opinion_type DROP parent_id, DROP consultation_type_id, DROP lft, DROP rgt, DROP root, DROP lvl'
        );
        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3C804F7D71');
        $this->addSql('DROP INDEX IDX_43B9FE3C804F7D71 ON step');
        $this->addSql('ALTER TABLE step DROP consultation_type_id');
    }

    public function postDown(Schema $schema): void
    {
        foreach ($this->steps as $s) {
            $ots = $this->cts[$s['type']];
            foreach ($ots as $ot) {
                $this->connection->insert('consultationstep_opiniontypes', [
                    'consultationstep_id' => $s['step'],
                    'opiniontype_id' => $ot
                ]);
            }
        }

        foreach ($this->cts as $ct => $ots) {
            foreach ($ots as $ot) {
                $this->connection->insert('consultationtype_opiniontypes', [
                    'consultationtype_id' => $ct,
                    'opiniontype_id' => $ot
                ]);
            }
        }
    }

    private function isSame($array1, $array2)
    {
        $passed = true;
        if (\count($array1) !== \count($array2)) {
            return false;
        }

        for ($i = 0; $i < \count($array1); ++$i) {
            if ($array1[$i] !== $array2[$i]) {
                $passed = false;

                break;
            }
        }

        return $passed;
    }
}
