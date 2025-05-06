<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210806153553 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'emailingCampaign.unlayerConf';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE emailing_campaign ADD unlayer_conf LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:json)\''
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE emailing_campaign DROP unlayer_conf');
    }
}
