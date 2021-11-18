<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class Version20211117102457 extends AbstractMigration implements ContainerAwareInterface
{
    private $generator;
    private $em;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function getDescription(): string
    {
        return 'user_identification_code_list';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'CREATE TABLE user_identification_code_list (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', owner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', name VARCHAR(255) NOT NULL, INDEX IDX_5047FF3E7E3C61F9 (owner_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE user_identification_code_list ADD CONSTRAINT FK_5047FF3E7E3C61F9 FOREIGN KEY (owner_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE user_identification_code ADD list_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE user_identification_code ADD CONSTRAINT FK_B443B13E3DAE168B FOREIGN KEY (list_id) REFERENCES user_identification_code_list (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_B443B13E3DAE168B ON user_identification_code (list_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user_identification_code DROP FOREIGN KEY FK_B443B13E3DAE168B');
        $this->addSql('DROP TABLE user_identification_code_list');
        $this->addSql('DROP INDEX IDX_B443B13E3DAE168B ON user_identification_code');
        $this->addSql('ALTER TABLE user_identification_code DROP list_id');
    }

    public function postUp(Schema $schema): void
    {
        if ($this->areThereCodes()) {
            $listId = $this->createListAndGetId();
            $this->linkAllCodesToList($listId);
        }
    }

    private function areThereCodes(): bool
    {
        return 0 < $this->connection->fetchOne('SELECT count(*) from user_identification_code');
    }

    private function createListAndGetId(): string
    {
        $id = $this->generator->generate($this->em, null);
        $this->connection->insert('user_identification_code_list', [
            'id' => $id,
            'name' => 'nouvelle liste',
            'owner_id' => null,
        ]);

        return $id;
    }

    private function linkAllCodesToList(string $listId): void
    {
        $this->connection->update(
            'user_identification_code',
            ['list_id' => $listId],
            ['list_id' => null]
        );
    }
}
