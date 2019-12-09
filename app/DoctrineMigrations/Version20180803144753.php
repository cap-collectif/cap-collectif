<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20180803144753 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE opinion DROP trashed');
        $this->addSql('ALTER TABLE source DROP is_trashed');
        $this->addSql('ALTER TABLE argument DROP is_trashed');
        $this->addSql('ALTER TABLE opinion_version DROP trashed');
        $this->addSql('ALTER TABLE proposal DROP trashed');
        $this->addSql('ALTER TABLE comment DROP is_trashed');
    }

    public function down(Schema $schema): void
    {
    }
}
