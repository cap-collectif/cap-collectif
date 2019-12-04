<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170317131656 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE registration_form ADD bottom_text_displayed TINYINT(1) NOT NULL, ADD top_text_displayed TINYINT(1) NOT NULL, ADD top_text LONGTEXT NOT NULL, ADD bottom_text LONGTEXT NOT NULL'
        );
    }

    public function postUp(Schema $schema): void{
        $form = $this->connection->fetchColumn('SELECT id FROM registration_form');
        $bottomText = $this->connection->fetchColumn(
            'SELECT value FROM site_parameter WHERE keyname = "signin.text.bottom"'
        );
        $topText = $this->connection->fetchColumn(
            'SELECT value FROM site_parameter WHERE keyname = "signin.text.top"'
        );

        if (is_array($form)) {
            $this->connection->update(
                'registration_form',
                [
                    'bottom_text_displayed' => count($bottomText) > 0,
                    'top_text_displayed' => count($topText) > 0,
                    'top_text' => $topText,
                    'bottom_text' => $bottomText,
                ],
                ['id' => $form[0]]
            );
        }

        $this->connection->delete('site_parameter', ['keyname' => 'signin.text.top']);
        $this->connection->delete('site_parameter', ['keyname' => 'signin.text.bottom']);
    }

    public function down(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE registration_form DROP bottom_text_displayed, DROP top_text_displayed, DROP top_text, DROP bottom_text'
        );
    }
}
