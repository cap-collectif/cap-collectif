<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150615174101 extends AbstractMigration
{
    protected $items;
    protected $menus;

    public function preUp(Schema $schema): void
    {
        $this->items = $this->connection->fetchAll('SELECT * FROM menu_item');
        $this->menus = $this->connection->fetchAll('SELECT * FROM menu');

        foreach ($this->items as &$mi) {
            foreach ($this->menus as $m) {
                if ($m['id'] == $mi['menu_id']) {
                    $mi['menu'] = $m['type'];
                }
            }
        }
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE menu_item DROP FOREIGN KEY FK_D754D550CCD7E912');
        $this->addSql('DROP TABLE menu');
        $this->addSql('DROP INDEX IDX_D754D550CCD7E912 ON menu_item');
        $this->addSql('ALTER TABLE menu_item ADD menu INT NOT NULL, DROP menu_id');
    }

    public function postUp(Schema $schema): void
    {
        foreach ($this->items as $mi) {
            $this->connection->update('menu_item', ['menu' => $mi['menu']], ['id' => $mi['id']]);
        }
    }

    public function preDown(Schema $schema): void
    {
        $this->items = $this->connection->fetchAll('SELECT * FROM menu_item');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE menu (id INT AUTO_INCREMENT NOT NULL, type INT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql('ALTER TABLE menu_item ADD menu_id INT DEFAULT NULL, DROP menu');
        $this->addSql(
            'ALTER TABLE menu_item ADD CONSTRAINT FK_D754D550CCD7E912 FOREIGN KEY (menu_id) REFERENCES menu (id)'
        );
        $this->addSql('CREATE INDEX IDX_D754D550CCD7E912 ON menu_item (menu_id)');
    }

    public function postDown(Schema $schema): void
    {
        $this->connection->insert('menu', ['type' => 1]);
        $this->connection->insert('menu', ['type' => 2]);

        $this->menus = $this->connection->fetchAll('SELECT * FROM menu');

        foreach ($this->items as $mi) {
            foreach ($this->menus as $m) {
                if ($m['type'] == $mi['menu']) {
                    $this->connection->update(
                        'menu_item',
                        ['menu_id' => $m['id']],
                        ['id' => $mi['id']]
                    );
                }
            }
        }
    }
}
