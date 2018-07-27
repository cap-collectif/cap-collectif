<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170208093425 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $parameter = $this->connection->executeQuery(
            "SELECT keyname FROM site_parameter WHERE keyname = 'homepage.jumbotron.margin'"
        );

        if ($parameter->rowCount() === 0) {
            $this->addSql(
                "INSERT INTO `site_parameter` (`keyname`, `value`, `created_at`, `is_enabled`, `position`, `type`, `category`) VALUES ('homepage.jumbotron.margin', '0', NOW(), 1, 0, 9, 'pages.homepage')"
            );
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql("DELETE FROM site_parameter WHERE keyname = 'homepage.jumbotron.margin'");
    }
}
