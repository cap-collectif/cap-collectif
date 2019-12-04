<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20171011142014 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        // We need every proposal form to have a notification configuration
        $proposalForms = $this->connection->fetchAll('SELECT * from proposal_form');
        foreach ($proposalForms as $proposalForm) {
            if (!$proposalForm['notification_configuration_id']) {
                $this->connection->insert('notifications_configuration', [
                    'entity' => 'proposalForm',
                    'on_create' => 0,
                    'on_update' => 0,
                    'on_delete' => 0,
                ]);
                $id = $this->connection->lastInsertId();
                $this->connection->update(
                    'proposal_form',
                    ['notification_configuration_id' => $id],
                    ['id' => $proposalForm['id']]
                );
            }
        }

        // Make sure blog post slug is unique
        $posts = $this->connection->fetchAll('SELECT * from blog_post');
        $count = 0;
        foreach ($posts as $post) {
            if ($post['slug'] === 'reponse-officielle') {
                $this->connection->update(
                    'blog_post',
                    ['slug' => 'reponse-officielle-' . $count],
                    ['id' => $post['id']]
                );
                $count++;
            }
        }
    }

    public function down(Schema $schema): void
    {
    }
}
