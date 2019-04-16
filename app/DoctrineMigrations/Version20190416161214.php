<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20190416161214 extends AbstractMigration
{
    public function preUp(Schema $schema): void
    {
        foreach (['project', 'theme', 'page'] as $table) {
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
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE UNIQUE INDEX UNIQ_2FB3D0EE989D9B62 ON project (slug)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_9775E708989D9B62 ON theme (slug)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_140AB620989D9B62 ON page (slug)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_140AB620989D9B62 ON page');
        $this->addSql('DROP INDEX UNIQ_2FB3D0EE989D9B62 ON project');
        $this->addSql('DROP INDEX UNIQ_9775E708989D9B62 ON theme');
    }
}
