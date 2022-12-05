<?php

declare(strict_types=1);

namespace Application\Migrations;

use Cocur\Slugify\Slugify;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20221202104928 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'district_translation.slug';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE district_translation ADD slug VARCHAR(255) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE district_translation DROP slug');
    }

    public function postUp(Schema $schema): void
    {
        $this->addSlugsInDatabase(
            $this->generateSlugs(
                $this->connection->fetchAllAssociative(
                    'SELECT id, name from district_translation'
                )
            )
        );
    }

    private function generateSlugs(array $data): array
    {
        $slugify = new Slugify();
        $slugs = [];
        foreach ($data as $datum) {
            $slug = $slugify->slugify($datum['name']);
            while (in_array($slug, $slugs)) {
                $slug .= '-'.rand(1, 9);
            }
            $slugs[$datum['id']] = $slug;
        }

        return $slugs;
    }

    private function addSlugsInDatabase(array $slugs): void
    {
        foreach ($slugs as $id => $slug) {
            $this->connection->update(
                'district_translation',
                ['slug' => $slug],
                ['id' => $id]
            );
        }
    }
}
