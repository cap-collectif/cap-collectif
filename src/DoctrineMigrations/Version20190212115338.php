<?php
declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190212115338 extends AbstractMigration
{
    public function postUp(Schema $schema): void
    {
        $cookiesList = $this->connection->fetchAll('SELECT id FROM site_parameter where keyname = "cookies-list"');
        if (count($cookiesList) === 0) {
            $this->connection->insert(
                'site_parameter',
                [
                    'keyname' => 'cookies-list',
                    'category' => 'pages.cookies',
                    'position' => 3,
                    'type' => 1,
                    'is_enabled' => true,
                ]
            );
        } else {
            $this->connection->update(
                'site_parameter',
                [
                    'category' => 'pages.cookies',
                    'position' => 3,
                    'type' => 1,
                ],
                $cookiesList['id']
            );
        }
    }

    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void{
    }
}
