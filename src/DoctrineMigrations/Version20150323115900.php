<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150323115900 extends AbstractMigration
{
    public function up(Schema $schema): void{
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->update(
            'section',
            array(
                'teaser' =>
                    "Inscrivez-vous à la lettre d'information pour rester informé de l'actualité.",
            ),
            array('type' => 'newsletter')
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
