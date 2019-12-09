<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20180810135032 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $tables = [
            ['key' => 'opinion'],
            ['key' => 'source'],
            ['key' => 'argument'],
            ['key' => 'opinion_version'],
            ['key' => 'votes'],
            ['key' => 'proposal'],
            ['key' => 'comment'],
            ['key' => 'reply'],
        ];
        foreach ($tables as $table) {
            $this->addSql(
                'UPDATE ' .
                    $table['key'] .
                    ' o SET o.published = true, o.publishedAt = o.created_at WHERE o.expired = false'
            );
        }
        $this->addSql('DROP INDEX idx_enabled ON opinion');
        $this->addSql('ALTER TABLE opinion DROP enabled, DROP expired');
        $this->addSql('CREATE INDEX idx_enabled ON opinion (id, published)');
        $this->addSql('ALTER TABLE source DROP is_enabled, DROP expired');
        $this->addSql('ALTER TABLE argument DROP is_enabled, DROP expired');
        $this->addSql('ALTER TABLE opinion_version DROP enabled, DROP expired');
        $this->addSql('ALTER TABLE votes DROP expired');
        $this->addSql('ALTER TABLE proposal DROP enabled, DROP expired');
        $this->addSql('ALTER TABLE comment DROP is_enabled, DROP expired');
        $this->addSql('ALTER TABLE reply DROP enabled, DROP expired');
        $this->addSql('ALTER TABLE fos_user DROP expired, DROP expires_at');
    }

    public function down(Schema $schema): void
    {
    }
}
