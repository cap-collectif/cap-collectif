<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class Version20171011142014 extends AbstractMigration implements ContainerAwareInterface
{
    public function setContainer(ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
    }

    public function up(Schema $schema)
    {

    }

    public function postUp(Schema $schema)
    {
      $proposalForms = $this->connection->fetchAll('SELECT * from proposal_form');
      foreach ($proposalForms as $proposalForm) {
        if (!$proposalForm['notification_configuration_id']) {
          $this->connection->insert('notifications_configuration', ['entity' => 'proposalForm', 'on_create' => 0, 'on_update' => 0, 'on_delete' => 0]);
          $id = $this->connection->getLastInsertedId();
          $this->connection->update('proposal_form', ['notification_configuration_id' => $id], ['id' => $proposalForm['id']]);
        }
      }
    }

    public function down(Schema $schema)
    {
    }
}
