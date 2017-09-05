<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170905121057 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql('ALTER TABLE district ADD form_id INT');
        $this->addSql('ALTER TABLE district ADD CONSTRAINT FK_31C154875FF69B7D FOREIGN KEY (form_id) REFERENCES proposal_form (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_31C154875FF69B7D ON district (form_id)');
    }

    public function postUp(Schema $schema)
    {
        $proposalForms = $this->connection->fetchAll('SELECT * from proposal_form');
        $districts = $this->connection->fetchAll('SELECT * from district');
        if (count($proposalForms) === 0) {
          foreach($districts as $district) {
              $this->connection->remove('district', ['id' => $district['id']]);
          }
          return;
        }
        // We just need to se the corresponding district for the first form
        $formId = $proposalForms[0]['id'];
        foreach ($districts as $district) {
          $this->connection->update('district', ['form_id' => $formId], ['id' => $district['id']]);
        }
        if (count($proposalForms) === 1) {
          return;
        }

        // If there is more than one proposal forms, we link districts to each of them
        unset($proposalsForms[0]);
        foreach ($proposalsForms as $form) {
          foreach ($districts as $district) {
            $district['form_id' => $form['id']];
            unset($district['id']);
            $this->connection->insert('district', $district);
            // We must update proposal district... :(
          }
        }
    }

    public function down(Schema $schema)
    {
        $this->addSql('ALTER TABLE district DROP FOREIGN KEY FK_31C154875FF69B7D');
        $this->addSql('DROP INDEX IDX_31C154875FF69B7D ON district');
        $this->addSql('ALTER TABLE district DROP form_id');
    }
}
