<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210422121446 extends AbstractMigration
{
    public function getDescription() : string
    {
        return 'create external_service_configuration';
    }

    public function up(Schema $schema) : void
    {
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE external_service_configuration (type VARCHAR(255) NOT NULL, value VARCHAR(255) NOT NULL, PRIMARY KEY(type)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->defaultConfiguration();
    }

    public function down(Schema $schema) : void
    {
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE external_service_configuration');
    }

    private function defaultConfiguration(): void
    {
        $this->addSql(
            'INSERT INTO external_service_configuration VALUES ("mailer", "mandrill")'
        );
    }
}
