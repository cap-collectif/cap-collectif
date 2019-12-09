<?php declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20180828182209 extends AbstractMigration implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );
        $this->addSql(
            'ALTER TABLE fos_user ADD openid_id VARCHAR(255) DEFAULT NULL, ADD openid_access_token VARCHAR(255) DEFAULT NULL'
        );
        $this->container->get(Manager::class)->deactivate('login_openid');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );
        $this->addSql('ALTER TABLE fos_user DROP openid_id, DROP openid_access_token');
    }
}
