<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20180803144545 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE opinion ADD trashed_status ENUM(\'visible\', \'invisible\')');
        $this->addSql('ALTER TABLE source ADD trashed_status ENUM(\'visible\', \'invisible\')');
        $this->addSql('ALTER TABLE argument ADD trashed_status ENUM(\'visible\', \'invisible\')');
        $this->addSql(
            'ALTER TABLE opinion_version ADD trashed_status ENUM(\'visible\', \'invisible\')'
        );
        $this->addSql('ALTER TABLE proposal ADD trashed_status ENUM(\'visible\', \'invisible\')');
        $this->addSql('ALTER TABLE comment ADD trashed_status ENUM(\'visible\', \'invisible\')');
    }

    public function postUp(Schema $schema)
    {
        $tables = [
            ['key' => 'opinion', 'trashed' => 'trashed', 'enabled' => 'enabled'],
            ['key' => 'source', 'trashed' => 'is_trashed', 'enabled' => 'is_enabled'],
            ['key' => 'argument', 'trashed' => 'is_trashed', 'enabled' => 'is_enabled'],
            ['key' => 'opinion_version', 'trashed' => 'trashed', 'enabled' => 'enabled'],
            ['key' => 'proposal', 'trashed' => 'trashed', 'enabled' => 'enabled'],
            ['key' => 'comment', 'trashed' => 'is_trashed', 'enabled' => 'is_enabled'],
        ];
        foreach ($tables as $table) {
            $this->connection->executeQuery(
                'UPDATE ' .
                    $table['key'] .
                    ' o SET o.trashed_status = "visible" WHERE o.' .
                    $table['trashed'] .
                    ' = 1 AND o.' .
                    $table['enabled'] .
                    ' = 1'
            );
            $this->connection->executeQuery(
                'UPDATE ' .
                    $table['key'] .
                    ' o SET o.trashed_status = "invisible" WHERE o.' .
                    $table['trashed'] .
                    ' = 1 AND o.' .
                    $table['enabled'] .
                    ' = 0'
            );
        }
    }

    public function down(Schema $schema): void
    {
    }
}
