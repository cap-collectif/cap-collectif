<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20201013102941 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'ip_adress and navigator in reply';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE reply ADD ip_address VARCHAR(255) DEFAULT NULL, ADD navigator LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE user_connection CHANGE ip_address ip_address VARCHAR(255) DEFAULT NULL, CHANGE navigator navigator LONGTEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE reply DROP ip_address, DROP navigator');
    }
}
