<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170928112417 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql('ALTER TABLE proposal ADD reference INT');
        $this->addSql('ALTER TABLE proposal_form ADD reference INT');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->addSql('ALTER TABLE proposal DROP reference');
        $this->addSql('ALTER TABLE proposal_form DROP reference');
    }

    public function postUp(Schema $schema)
    {
        // Update reference on each proposal forms
        $proposalForms = $this->connection->fetchAll('SELECT * FROM proposal_form');

        $count = 0;
        $reference = 1;
        foreach ($proposalForms as $proposalForm) {
            $this->connection->update(
                'proposal_form',
                ['reference' => $reference],
                ['id' => $proposalForm['id']]
            );

            $reference++;

            // Update reference on each proposals in proposal form
            $proposals = $this->connection->fetchAll(
                'SELECT * FROM proposal WHERE proposal_form_id = "' . $proposalForm['id'] . '"'
            );

            $proposalReference = 1;
            foreach ($proposals as $proposal) {
                $this->connection->update(
                    'proposal',
                    ['reference' => $proposalReference],
                    ['id' => $proposal['id']]
                );

                ++$proposalReference;
                ++$count;
            }
        }

        echo $count . ' proposals were updated.';
    }
}
