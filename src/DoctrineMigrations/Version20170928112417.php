<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20170928112417 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal ADD reference INT');
        $this->addSql('ALTER TABLE proposal_form ADD reference INT');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal DROP reference');
        $this->addSql('ALTER TABLE proposal_form DROP reference');
    }

    public function postUp(Schema $schema): void
    {
        // Update reference on each proposal forms
        $proposalForms = $this->connection->fetchAllAssociative('SELECT * FROM proposal_form');

        $count = 0;
        $reference = 1;
        foreach ($proposalForms as $proposalForm) {
            $this->connection->update(
                'proposal_form',
                ['reference' => $reference],
                ['id' => $proposalForm['id']]
            );

            ++$reference;

            // Update reference on each proposals in proposal form
            $proposals = $this->connection->fetchAllAssociative(
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
