<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150330151346 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE argument_vote');
        $this->addSql('DROP TABLE comment_vote');
        $this->addSql('DROP TABLE idea_vote');
        $this->addSql('DROP TABLE opinion_vote');
        $this->addSql('DROP TABLE source_vote');
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE argument_vote (id INT AUTO_INCREMENT NOT NULL, argument_id INT DEFAULT NULL, voter_id INT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_C2E525743DD48F21 (argument_id), INDEX IDX_C2E52574EBB4B8AD (voter_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE comment_vote (id INT AUTO_INCREMENT NOT NULL, voter_id INT DEFAULT NULL, comment_id INT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_7C262788F8697D13 (comment_id), INDEX IDX_7C262788EBB4B8AD (voter_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE idea_vote (id INT AUTO_INCREMENT NOT NULL, idea_id INT DEFAULT NULL, voter_id INT DEFAULT NULL, created_at DATETIME NOT NULL, confirmed TINYINT(1) NOT NULL, username VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci, email VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci, ip_address VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci, private TINYINT(1) NOT NULL, INDEX IDX_995930CF5B6FEF7D (idea_id), INDEX IDX_995930CFEBB4B8AD (voter_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE opinion_vote (id INT AUTO_INCREMENT NOT NULL, opinion_id INT DEFAULT NULL, voter_id INT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, value INT NOT NULL, INDEX IDX_27D1F9BD51885A6A (opinion_id), INDEX IDX_27D1F9BDEBB4B8AD (voter_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE source_vote (id INT AUTO_INCREMENT NOT NULL, source_id INT DEFAULT NULL, voter_id INT DEFAULT NULL, created_at DATETIME NOT NULL, INDEX IDX_5B9A0067953C1C61 (source_id), INDEX IDX_5B9A0067EBB4B8AD (voter_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
    }

    public function postDown(Schema $schema)
    {
        $votes = $this->connection->fetchAll('SELECT * FROM votes');

        foreach ($votes as $vote) {
            $type = $vote['voteType'];
            $data = [];

            $data['voter_id'] = $vote['voter_id'];
            $data[$type . '_id'] = $vote[$type . '_id'];
            $data['created_at'] = $vote['created_at'];

            if ($type == 'comment') {
                $data['updated_at'] = $vote['updated_at'];
            }

            if ($type == 'idea') {
                $data['confirmed'] = $vote['confirmed'];
                $data['username'] = $vote['username'];
                $data['email'] = $vote['email'];
                $data['ip_address'] = $vote['ip_address'];
                $data['private'] = $vote['private'];
            }

            if ($type == 'opinion') {
                $data['updated_at'] = $vote['updated_at'];
                $data['value'] = $vote['value'];
            }

            $this->connection->insert($type . '_vote', $data);
        }
    }
}
