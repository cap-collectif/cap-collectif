<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151026194744 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE synthesis_element ADD subtitle VARCHAR(255) DEFAULT NULL, ADD published_children_count INT NOT NULL, ADD linked_data_url VARCHAR(255) DEFAULT NULL'
        );
    }

    public function postUp(Schema $schema): void
    {
        $elements = $this->connection->fetchAllAssociative(
            '
            SELECT se.id, se.linked_data_id, se.linked_data_class
            FROM synthesis_element se
            WHERE se.linked_data_class LIKE ?',
            ['%OpinionType']
        );

        foreach ($elements as $el) {
            $ot = $this->connection->fetchAllAssociative(
                '
                SELECT ot.id as id, ot.subtitle as subtitle
                FROM opinion_type ot
                WHERE ot.id = ?',
                [$el['linked_data_id']]
            );

            $this->connection->update(
                'synthesis_element',
                ['subtitle' => $ot[0]['subtitle']],
                ['id' => $el['id']]
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE synthesis_element DROP subtitle, DROP total_children_count, DROP linked_data_url'
        );
    }
}
