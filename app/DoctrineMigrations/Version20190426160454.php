<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190426160454 extends AbstractMigration
{
    public function preUp(Schema $schema): void
    {
        $table = 'proposal';
        $data = $this->connection->fetchAll('SELECT * FROM ' . $table);
        $slugs = array_map(function ($d) {
            return $d['slug'];
        }, $data);
        $duplicates = array_diff_assoc($slugs, array_unique($slugs));
        foreach ($duplicates as $key => $duplicate) {
            echo 'Updating slug : ' . $duplicate;
            $this->connection->update(
                $table,
                ['slug' => $duplicate . '-' . $key],
                ['id' => $data[$key]['id']]
            );
        }
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('CREATE UNIQUE INDEX UNIQ_BFE59472989D9B62 ON proposal (slug)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP INDEX UNIQ_BFE59472989D9B62 ON proposal');
    }
}
