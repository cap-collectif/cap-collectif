<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\ParameterType;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190911125714 extends AbstractMigration implements ContainerAwareInterface
{
    private $translator;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->translator = $container->get('translator');
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE contact_form CHANGE interlocutor interlocutor VARCHAR(255) DEFAULT NULL'
        );
        $this->addSql(
            'UPDATE contact_form SET confidentiality = concat(:beforeText, interlocutor, :afterText) WHERE interlocutor IS NOT NULL AND interlocutor <> \'\'',
            [
                'beforeText' => $this->translator->trans(
                    'information-for-the-contact-form-1',
                    [],
                    'SonataUserBundle'
                ),
                'afterText' => $this->translator->trans(
                    'information-for-the-contact-form-2',
                    [],
                    'SonataUserBundle'
                )
            ],
            [ParameterType::STRING, ParameterType::STRING]
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE contact_form CHANGE interlocutor interlocutor VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci'
        );
        $this->addSql(
            'UPDATE contact_form SET confidentiality = NULL WHERE interlocutor IS NOT NULL AND interlocutor <> \'\''
        );
    }
}
