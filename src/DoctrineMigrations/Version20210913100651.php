<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Fix this : https://github.com/cap-collectif/platform/issues/13285
 * The siteParameter has been turned to 'not_translatable' but its value in database has not been migrated.
 */
final class Version20210913100651 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'fix send_name as not translatable';
    }

    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        $keyname = 'admin.mail.notifications.send_name';
        $mainData = $this->getMainData($keyname);
        if (null === $mainData['value']) {
            $translatedData = $this->getTranslatedData($mainData['id']);
            if ($translatedData) {
                $this->updateMainData($mainData['id'], $translatedData);
            }
        }
    }

    private function getMainData(string $keyname): array
    {
        return $this->connection->fetchAssociative(
            'SELECT id, value FROM site_parameter WHERE keyname= "' . $keyname . '"'
        );
    }

    private function getTranslatedData(string $id)
    {
        return $this->connection->fetchOne(
            'SELECT value FROM site_parameter_translation WHERE translatable_id= "' . $id . '"'
        );
    }

    private function updateMainData(string $id, $value): void
    {
        $this->connection->update('site_parameter', ['value' => $value], ['id' => $id]);
    }
}
