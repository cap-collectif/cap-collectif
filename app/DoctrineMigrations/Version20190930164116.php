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
    public function postUp(Schema $schema)
    {
        $siteCustomCode = [
            'keyname' => SiteParameterRepository::REGISTRATION_PAGE_CODE_KEYNAME,
            'category' => 'pages.registration',
            'value' => '',
            'position' => 0,
            'created_at' => (new \DateTime())->format('Y-m-d H:i:s'),
            'updated_at' => (new \DateTime())->format('Y-m-d H:i:s'),
            'is_enabled' => 1,
            'is_social_network_description' => 0,
            'type' => 3
        ];
        $this->connection->insert('site_parameter', $siteCustomCode);
        $this->write('-> Added ' . $siteCustomCode['keyname'] . ' custom code pages.registration');
    }

    public function up(Schema $schema)
    {
    }

    public function down(Schema $schema)
    {
    }
}
