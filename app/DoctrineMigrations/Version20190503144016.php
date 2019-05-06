<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190503144016 extends AbstractMigration
{
    public function preUp(Schema $schema): void
    {
        $table = 'event';
        $data = $this->connection->fetchAll('SELECT id, slug FROM ' . $table);
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

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE UNIQUE INDEX UNIQ_3BAE0AA7989D9B62 ON event (slug)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP INDEX UNIQ_3BAE0AA7989D9B62 ON event');
    }
}
