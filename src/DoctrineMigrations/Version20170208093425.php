<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170208093425 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $parameter = $this->connection->executeQuery(
            "SELECT keyname FROM site_parameter WHERE keyname = 'homepage.jumbotron.margin'"
        );

        if (0 === $parameter->rowCount()) {
            $this->addSql(
                "INSERT INTO `site_parameter` (`keyname`, `value`, `created_at`, `is_enabled`, `position`, `type`, `category`) VALUES ('homepage.jumbotron.margin', '0', NOW(), 1, 0, 9, 'pages.homepage')"
            );
        }
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql("DELETE FROM site_parameter WHERE keyname = 'homepage.jumbotron.margin'");
    }
}
