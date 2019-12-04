<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151209165616 extends AbstractMigration
{
    private $links = [];

    public function preUp(Schema $schema): void{
        $this->links = $this->connection->fetchAll(
            '
            SELECT id, link_id
            FROM opinion
            WHERE link_id IS NOT NULL
        '
        );
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE opinion_relation (opinion_source INT NOT NULL, opinion_target INT NOT NULL, INDEX IDX_986BCBE056C341F3 (opinion_source), INDEX IDX_986BCBE04F26117C (opinion_target), PRIMARY KEY(opinion_source, opinion_target)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE opinion_relation ADD CONSTRAINT FK_986BCBE056C341F3 FOREIGN KEY (opinion_source) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE opinion_relation ADD CONSTRAINT FK_986BCBE04F26117C FOREIGN KEY (opinion_target) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B027ADA40271');
        $this->addSql('DROP INDEX IDX_AB02B027ADA40271 ON opinion');
        $this->addSql('ALTER TABLE opinion DROP link_id');
    }

    public function postUp(Schema $schema): void
    {
        foreach ($this->links as $link) {
            $this->connection->insert('opinion_relation', [
                'opinion_source' => $link['link_id'],
                'opinion_target' => $link['id'],
            ]);
        }
    }

    public function preDown(Schema $schema): void{
        $this->links = $this->connection->fetchAll(
            '
            SELECT *
            FROM opinion_relation
        '
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE opinion_relation');
        $this->addSql('ALTER TABLE opinion ADD link_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE opinion ADD CONSTRAINT FK_AB02B027ADA40271 FOREIGN KEY (link_id) REFERENCES opinion (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_AB02B027ADA40271 ON opinion (link_id)');
    }

    public function postDown(Schema $schema): void
    {
        foreach ($this->links as $link) {
            $this->connection->update(
                'opinion',
                ['link_id' => $link['opinion_source']],
                ['id' => $link['opinion_target']]
            );
        }
    }
}
