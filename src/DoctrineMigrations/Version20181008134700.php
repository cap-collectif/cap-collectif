<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20181008134700 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $colorsToChange = [
            '#5cb85c' => '#5bc0de',
            '#d9534f' => '#5cb85c',
            '#d953f9' => '#5cb85c',
            '#FFF600' => '#fffff',
            '#FF000' => '#fffff',
        ];
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        foreach ($colorsToChange as $oldColor => $newColor) {
            $this->addSql(
                'UPDATE question_choice SET color = "' .
                    $newColor .
                    '" WHERE color = "' .
                    $oldColor .
                    '"'
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE fos_user DROP reset_password_token');
    }
}
