<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210329112259 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function postUp(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
        $allowedData =
            'a:8:{s:10:"given_name";b:1;s:11:"family_name";b:1;s:9:"birthdate";b:0;s:6:"gender";b:0;s:10:"birthplace";b:0;s:12:"birthcountry";b:0;s:5:"email";b:1;s:18:"preferred_username";b:0;}';
        $fc = $this->connection->fetchAssociative(
            'SELECT id, allowed_data FROM sso_configuration WHERE ssoType = "franceconnect"'
        );
        if (empty($fc['allowed_data'])) {
            $this->connection->executeQuery(
                "UPDATE sso_configuration SET allowed_data = ? WHERE ssoType = 'franceconnect'",
                ["${allowedData}"]
            );
        }
    }

    public function down(Schema $schema): void
    {
    }

    public function up(Schema $schema): void
    {
        // TODO: Implement up() method.
    }
}
