<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Process\Process;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200302163542 extends AbstractMigration implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        // Delete all sessions because the format changed with sf4
        $redis_host = $this->container->getParameter('redis_dsn');

        $job = Process::fromShellCommandline(
            'redis-cli -h ' .
                $redis_host .
                ' keys session* | xargs redis-cli -h ' .
                $redis_host .
                ' del'
        );
        echo $job->getCommandLine() . \PHP_EOL;
        $job->mustRun();
    }

    public function down(Schema $schema): void
    {
    }
}
