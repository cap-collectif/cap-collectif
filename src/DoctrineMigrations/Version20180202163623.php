<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class Version20180202163623 extends AbstractMigration implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE opinion ADD moderation_token VARCHAR(255)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_AB02B027AC6D46AF ON opinion (moderation_token)');
        $this->addSql('ALTER TABLE argument ADD moderation_token VARCHAR(255)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D113B0AAC6D46AF ON argument (moderation_token)');
        $this->addSql(
            'ALTER TABLE step ADD moderating_on_create TINYINT(1) DEFAULT \'0\', ADD moderating_on_update TINYINT(1) DEFAULT \'0\''
        );
        $this->addSql('ALTER TABLE opinion_version ADD moderation_token VARCHAR(255)');
        $this->addSql(
            'CREATE UNIQUE INDEX UNIQ_52AD19DDAC6D46AF ON opinion_version (moderation_token)'
        );
    }

    public function postUp(Schema $schema): void
    {
        $this->write('-> Adding moderation token for existing opinions...');
        $opinions = $this->connection->fetchAll('SELECT id from opinion');
        foreach ($opinions as $opinion) {
            $token = $this->container->get('fos_user.util.token_generator')->generateToken();
            $this->connection->update(
                'opinion',
                ['moderation_token' => $token],
                ['id' => $opinion['id']]
            );
        }

        $this->write('-> Adding moderation token for existing versions...');
        $versions = $this->connection->fetchAll('SELECT id from opinion_version');
        foreach ($versions as $version) {
            $token = $this->container->get('fos_user.util.token_generator')->generateToken();
            $this->connection->update(
                'opinion_version',
                ['moderation_token' => $token],
                ['id' => $version['id']]
            );
        }

        $this->write('-> Adding moderation token for existing arguments...');
        $arguments = $this->connection->fetchAll('SELECT id from argument');
        foreach ($arguments as $argument) {
            $token = $this->container->get('fos_user.util.token_generator')->generateToken();
            $this->connection->update(
                'argument',
                ['moderation_token' => $token],
                ['id' => $argument['id']]
            );
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_D113B0AAC6D46AF ON argument');
        $this->addSql('ALTER TABLE argument DROP moderation_token');
        $this->addSql('DROP INDEX UNIQ_AB02B027AC6D46AF ON opinion');
        $this->addSql('ALTER TABLE opinion DROP moderation_token');
        $this->addSql('DROP INDEX UNIQ_52AD19DDAC6D46AF ON opinion_version');
        $this->addSql('ALTER TABLE opinion_version DROP moderation_token');
        $this->addSql('ALTER TABLE step DROP moderating_on_create, DROP moderating_on_update');
    }
}
