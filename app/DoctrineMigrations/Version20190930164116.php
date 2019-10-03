<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Repository\SiteParameterRepository;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190930164116 extends AbstractMigration
{
    protected $siteCustomCode = [
        'keyname' => SiteParameterRepository::REGISTRATION_PAGE_CODE_KEYNAME,
        'category' => 'pages.registration',
        'value' => '',
        'position' => 0,
        'is_enabled' => true,
        'type' => 3
    ];

    public function postUp(Schema $schema)
    {
        $this->connection->insert('site_parameter', $this->siteCustomCode);
        $id = $this->connection->lastInsertId();
        $this->connection->update(
            'site_parameter',
            [
                'created_at' => (new \DateTime())->format('Y-m-d H:i:s'),
                'updated_at' => (new \DateTime())->format('Y-m-d H:i:s')
            ],
            ['id' => $id]
        );
        $this->write(
            '-> Added ' . $this->siteCustomCode['keyname'] . ' custom code pages.registration'
        );
    }

    public function postDown(Schema $schema)
    {
        foreach ($this->siteCustomCode as $property => $value) {
            if ('keyname' === $property) {
                $this->connection->delete('site_parameter', ['keyname' => $value]);

                break;
            }
        }
        $this->write('-> Removed ' . $this->siteCustomCode['keyname'] . ' from site_parameter ');
    }

    public function up(Schema $schema)
    {
    }

    public function down(Schema $schema)
    {
    }
}
