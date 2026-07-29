<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

final class Version20260729120000 extends AbstractMigration implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function getDescription(): string
    {
        return 'Replace email verification requirements with SSO requirements on collect steps when SSO bypass authentication is enabled';
    }

    public function up(Schema $schema): void
    {
        if (!$this->container->get(Manager::class)->isActive(Manager::sso_by_pass_auth)) {
            return;
        }

        $this->addSql(<<<'SQL'
            UPDATE requirement r
            INNER JOIN step s ON s.id = r.step_id
            SET r.type = 'SSO'
            WHERE s.step_type = 'collect'
                AND r.type = 'EMAIL_VERIFIED'
            SQL);
    }

    public function down(Schema $schema): void
    {
    }
}
